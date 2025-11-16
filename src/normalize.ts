/**
 * Plugin normalization implementation
 * Based on docs/spec/001-normalization-protocol.md
 */

import * as path from 'path';
import * as fs from 'fs';
import { glob } from 'glob';
import {
  PluginJson,
  NormalizedPlugin,
  Author,
  Hook,
  Mcp,
  HooksConfig,
  McpServersConfig,
} from './types';

/**
 * Default values for normalized plugin fields
 */
const DEFAULTS = {
  version: '0.0.0',
  description: '',
  author: { name: '', email: '', url: '' } as Author,
  homepage: '',
  repository: '',
  license: '',
  keywords: [] as string[],
  commands: [] as string[],
  agents: [] as string[],
  skills: [] as string[],
  hooks: [] as Hook[],
  mcps: [] as Mcp[],
};

/**
 * Normalize a plugin from official Claude Code format to internal format
 *
 * Implements invariants:
 * - 001::Invariant::1: All normalized plugins MUST have all fields defined
 * - 001::Invariant::2: All array fields MUST be arrays
 * - 001::Invariant::3: All component paths MUST be relative to plugin source directory
 * - 001::Invariant::5: source field MUST be absolute path to plugin directory
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param pluginJson - Optional plugin.json content (will be read from file if not provided)
 * @returns Normalized plugin with all fields defined
 */
export function normalize(
  pluginDir: string,
  pluginJson?: PluginJson
): NormalizedPlugin {
  // Ensure pluginDir is absolute
  const absolutePluginDir = path.isAbsolute(pluginDir)
    ? pluginDir
    : path.resolve(pluginDir);

  // Read plugin.json if not provided
  let plugin: PluginJson;
  if (!pluginJson) {
    const pluginJsonPath = path.join(absolutePluginDir, '.claude-plugin', 'plugin.json');
    if (fs.existsSync(pluginJsonPath)) {
      const content = fs.readFileSync(pluginJsonPath, 'utf-8');
      plugin = JSON.parse(content);
    } else {
      plugin = {};
    }
  } else {
    plugin = pluginJson;
  }

  // Build normalized plugin
  const normalized: NormalizedPlugin = {
    // Name: required field, default to directory basename
    name: plugin.name ?? path.basename(absolutePluginDir),

    // Source: always absolute path
    source: absolutePluginDir,

    // Metadata fields with defaults
    version: plugin.version ?? DEFAULTS.version,
    description: plugin.description ?? DEFAULTS.description,
    author: normalizeAuthor(plugin.author),
    homepage: plugin.homepage ?? DEFAULTS.homepage,
    repository: plugin.repository ?? DEFAULTS.repository,
    license: plugin.license ?? DEFAULTS.license,
    keywords: plugin.keywords ?? DEFAULTS.keywords,

    // Component paths (arrays)
    commands: normalizeComponentPaths(
      plugin.commands,
      absolutePluginDir,
      'commands/**/*.md'
    ),
    agents: normalizeComponentPaths(
      plugin.agents,
      absolutePluginDir,
      'agents/**/*.md'
    ),
    skills: normalizeSkillPaths(plugin.skills, absolutePluginDir),

    // Hooks and MCPs (normalized to flat arrays)
    hooks: normalizeHooks(plugin.hooks, absolutePluginDir),
    mcps: normalizeMcps(plugin.mcpServers, absolutePluginDir),
  };

  return normalized;
}

/**
 * Normalize author field to ensure all subfields are defined
 */
function normalizeAuthor(author?: Author | Partial<Author>): Author {
  if (!author) {
    return DEFAULTS.author;
  }

  return {
    name: author.name ?? '',
    email: author.email ?? '',
    url: author.url ?? '',
  };
}

/**
 * Normalize component paths (commands/agents)
 * Handles both string paths and arrays, performs auto-discovery
 *
 * Implements:
 * - 001::Invariant::8: Custom paths COMPLEMENT auto-discovery
 * - 001::Invariant::9: Auto-discovery ALWAYS occurs if default directories exist
 */
function normalizeComponentPaths(
  pathSpec: string | string[] | undefined,
  pluginDir: string,
  defaultGlob: string
): string[] {
  const paths: string[] = [];

  // Auto-discovery (always happens if directory exists)
  const defaultDir = defaultGlob.split('/')[0]; // Extract 'commands' or 'agents'
  const defaultDirPath = path.join(pluginDir, defaultDir);

  if (fs.existsSync(defaultDirPath)) {
    const autoDiscovered = glob.sync(defaultGlob, {
      cwd: pluginDir,
      nodir: true,
    });
    paths.push(...autoDiscovered);
  }

  // Custom paths (complement auto-discovery)
  if (pathSpec) {
    const customPaths = typeof pathSpec === 'string' ? [pathSpec] : pathSpec;

    for (const customPath of customPaths) {
      const normalized = normalizePath(customPath);

      // Check if it's a directory or file
      const fullPath = path.join(pluginDir, normalized);
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Glob for files in directory
          const files = glob.sync(`${normalized}/**/*.md`, {
            cwd: pluginDir,
            nodir: true,
          });
          paths.push(...files);
        } else {
          // Single file
          paths.push(normalized);
        }
      } else {
        // Path doesn't exist, add as-is (will be handled by validation later)
        paths.push(normalized);
      }
    }
  }

  // Remove duplicates and return
  return [...new Set(paths)];
}

/**
 * Normalize skill paths
 * Skills are discovered via skills slash star slash SKILL.md pattern
 */
function normalizeSkillPaths(
  pathSpec: string | string[] | undefined,
  pluginDir: string
): string[] {
  const skillDirs: string[] = [];

  // Auto-discovery: skills/*/SKILL.md
  const skillsDir = path.join(pluginDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    const skillFiles = glob.sync('skills/*/SKILL.md', {
      cwd: pluginDir,
      nodir: false,
    });

    // Extract parent directories
    for (const skillFile of skillFiles) {
      const skillDir = path.dirname(skillFile);
      skillDirs.push(skillDir);
    }
  }

  // Custom paths (complement auto-discovery)
  if (pathSpec) {
    const customPaths = typeof pathSpec === 'string' ? [pathSpec] : pathSpec;

    for (const customPath of customPaths) {
      const normalized = normalizePath(customPath);
      skillDirs.push(normalized);
    }
  }

  // Remove duplicates
  return [...new Set(skillDirs)];
}

/**
 * Normalize hooks configuration
 * Converts nested hooks.json format to flat array
 */
function normalizeHooks(
  hooksSpec: string | HooksConfig | undefined,
  pluginDir: string
): Hook[] {
  const hooks: Hook[] = [];

  let hooksConfig: HooksConfig | undefined;

  // Load from file if string path
  if (typeof hooksSpec === 'string') {
    const hooksPath = path.join(pluginDir, normalizePath(hooksSpec));
    if (fs.existsSync(hooksPath)) {
      const content = fs.readFileSync(hooksPath, 'utf-8');
      const parsed = JSON.parse(content);
      hooksConfig = parsed.hooks || parsed;
    }
  } else if (hooksSpec) {
    // Inline configuration
    hooksConfig = hooksSpec;
  } else {
    // Try default locations
    const defaultPaths = [
      path.join(pluginDir, 'hooks', 'hooks.json'),
      path.join(pluginDir, 'settings.json'),
    ];

    for (const defaultPath of defaultPaths) {
      if (fs.existsSync(defaultPath)) {
        const content = fs.readFileSync(defaultPath, 'utf-8');
        const parsed = JSON.parse(content);
        hooksConfig = parsed.hooks || parsed;
        break;
      }
    }
  }

  if (!hooksConfig) {
    return hooks;
  }

  // Flatten nested structure
  for (const [eventName, eventConfigs] of Object.entries(hooksConfig)) {
    for (const eventConfig of eventConfigs) {
      const { matcher, hooks: hookActions } = eventConfig;

      for (const hookAction of hookActions) {
        const hook: Hook = {
          ...hookAction,
          event: eventName,
          type: hookAction.type,
          command: hookAction.command,
        };

        // Add matcher if present
        if (matcher) {
          hook.matcher = matcher;
        }

        hooks.push(hook);
      }
    }
  }

  return hooks;
}

/**
 * Normalize MCP servers configuration
 * Converts object format to flat array with name extracted
 */
function normalizeMcps(
  mcpSpec: string | McpServersConfig | undefined,
  pluginDir: string
): Mcp[] {
  const mcps: Mcp[] = [];

  let mcpConfig: McpServersConfig | undefined;

  // Load from file if string path
  if (typeof mcpSpec === 'string') {
    const mcpPath = path.join(pluginDir, normalizePath(mcpSpec));
    if (fs.existsSync(mcpPath)) {
      const content = fs.readFileSync(mcpPath, 'utf-8');
      const parsed = JSON.parse(content);
      mcpConfig = parsed.mcpServers || parsed;
    }
  } else if (mcpSpec) {
    // Inline configuration
    mcpConfig = mcpSpec;
  } else {
    // Try default location
    const defaultPath = path.join(pluginDir, '.mcp.json');
    if (fs.existsSync(defaultPath)) {
      const content = fs.readFileSync(defaultPath, 'utf-8');
      const parsed = JSON.parse(content);
      mcpConfig = parsed.mcpServers || parsed;
    }
  }

  if (!mcpConfig) {
    return mcps;
  }

  // Convert to array with name extracted
  for (const [name, config] of Object.entries(mcpConfig)) {
    const mcp: Mcp = {
      ...config,
      name,
      command: config.command,
    };

    // Ensure env is defined
    if (!mcp.env) {
      mcp.env = {};
    }

    mcps.push(mcp);
  }

  return mcps;
}

/**
 * Normalize a path by removing leading ./
 */
function normalizePath(p: string): string {
  return p.replace(/^\.\//, '');
}
