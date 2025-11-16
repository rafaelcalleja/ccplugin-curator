/**
 * Plugin Normalization Module
 * Transforms official Claude Code plugin format to internal normalized format
 * Implements: docs/spec/001-normalization-protocol.md
 * Implements: docs/spec/005-transformation-rules.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import type { PluginJson } from '../types/plugin';
import type { NormalizedPlugin, Hook, Mcp } from '../types/normalized';

/**
 * Normalize a plugin from official format to internal format
 */
export async function normalizePlugin(
  pluginDir: string,
  pluginJson: PluginJson
): Promise<NormalizedPlugin> {
  const absolutePluginDir = path.resolve(pluginDir);

  // Start with defaults
  const normalized: NormalizedPlugin = {
    name: pluginJson.name || path.basename(absolutePluginDir),
    source: absolutePluginDir,
    version: pluginJson.version || '0.0.0',
    description: pluginJson.description || '',
    author: {
      name: pluginJson.author?.name || '',
      email: pluginJson.author?.email || '',
      url: pluginJson.author?.url || '',
    },
    homepage: pluginJson.homepage || '',
    repository: pluginJson.repository || '',
    license: pluginJson.license || '',
    keywords: pluginJson.keywords || [],
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcps: [],
  };

  // Normalize commands
  normalized.commands = await normalizeComponentPaths(
    pluginDir,
    pluginJson.commands,
    'commands',
    '**/*.md'
  );

  // Normalize agents
  normalized.agents = await normalizeComponentPaths(
    pluginDir,
    pluginJson.agents,
    'agents',
    '**/*.md'
  );

  // Normalize skills
  normalized.skills = await normalizeSkills(pluginDir, pluginJson.skills);

  // Normalize hooks
  normalized.hooks = await normalizeHooks(pluginDir, pluginJson.hooks);

  // Normalize MCPs
  normalized.mcps = await normalizeMcps(pluginDir, pluginJson.mcpServers);

  return normalized;
}

/**
 * Normalize component paths (commands/agents)
 * Custom paths COMPLEMENT auto-discovery (not replace)
 */
async function normalizeComponentPaths(
  pluginDir: string,
  configValue: string | string[] | undefined,
  defaultDir: string,
  pattern: string
): Promise<string[]> {
  const results = new Set<string>();

  // Auto-discovery ALWAYS happens if default directory exists
  const defaultPath = path.join(pluginDir, defaultDir);
  if (fs.existsSync(defaultPath)) {
    const discovered = await glob(pattern, {
      cwd: defaultPath,
      absolute: false,
    });
    discovered.forEach((file) => {
      results.add(normalizePath(path.join(defaultDir, file)));
    });
  }

  // Add custom paths (COMPLEMENT auto-discovery)
  if (configValue) {
    const customPaths = Array.isArray(configValue) ? configValue : [configValue];
    for (const customPath of customPaths) {
      const resolved = normalizePath(customPath);
      const absolutePath = path.join(pluginDir, resolved);

      if (fs.existsSync(absolutePath)) {
        const stats = fs.statSync(absolutePath);
        if (stats.isDirectory()) {
          // Directory: glob for files
          const files = await glob(pattern, {
            cwd: absolutePath,
            absolute: false,
          });
          files.forEach((file) => {
            results.add(normalizePath(path.join(resolved, file)));
          });
        } else if (stats.isFile()) {
          // File: add directly
          results.add(resolved);
        }
      }
    }
  }

  return Array.from(results).sort();
}

/**
 * Normalize skills
 * Discovery pattern: skills/STAR/SKILL.md -> return parent directory paths
 * (where STAR means any directory name)
 */
async function normalizeSkills(
  pluginDir: string,
  configValue: string | string[] | undefined
): Promise<string[]> {
  const results = new Set<string>();

  // Auto-discovery: skills/*/SKILL.md
  const defaultPath = path.join(pluginDir, 'skills');
  if (fs.existsSync(defaultPath)) {
    const skillFiles = await glob('*/SKILL.md', {
      cwd: defaultPath,
      absolute: false,
    });
    skillFiles.forEach((file) => {
      const skillDir = path.dirname(file);
      results.add(normalizePath(path.join('skills', skillDir)));
    });
  }

  // Custom paths (COMPLEMENT auto-discovery)
  if (configValue) {
    const customPaths = Array.isArray(configValue) ? configValue : [configValue];
    for (const customPath of customPaths) {
      const resolved = normalizePath(customPath);
      const absolutePath = path.join(pluginDir, resolved);

      if (fs.existsSync(absolutePath)) {
        const stats = fs.statSync(absolutePath);
        if (stats.isDirectory()) {
          // Check if it's a skill directory (has SKILL.md)
          const skillFile = path.join(absolutePath, 'SKILL.md');
          if (fs.existsSync(skillFile)) {
            results.add(resolved);
          } else {
            // Search for skills within this directory
            const skillFiles = await glob('*/SKILL.md', {
              cwd: absolutePath,
              absolute: false,
            });
            skillFiles.forEach((file) => {
              const skillDir = path.dirname(file);
              results.add(normalizePath(path.join(resolved, skillDir)));
            });
          }
        }
      }
    }
  }

  return Array.from(results).sort();
}

/**
 * Normalize hooks
 * Transforms nested structure to flat array
 */
async function normalizeHooks(
  pluginDir: string,
  configValue: string | Record<string, any> | undefined
): Promise<Hook[]> {
  const hooks: Hook[] = [];

  if (!configValue) {
    // Try default locations
    const defaultPaths = [
      path.join(pluginDir, 'hooks', 'hooks.json'),
      path.join(pluginDir, 'settings.json'),
    ];

    for (const defaultPath of defaultPaths) {
      if (fs.existsSync(defaultPath)) {
        const content = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
        // Content is already the hooks object (not wrapped in {hooks: {...}})
        hooks.push(...flattenHooks(content));
        break;
      }
    }
  } else if (typeof configValue === 'string') {
    // File path
    const filePath = path.join(pluginDir, normalizePath(configValue));
    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      // Content is already the hooks object (not wrapped in {hooks: {...}})
      hooks.push(...flattenHooks(content));
    }
  } else {
    // Inline configuration
    hooks.push(...flattenHooks(configValue));
  }

  return hooks;
}

/**
 * Flatten hooks from nested structure to flat array
 */
function flattenHooks(hooksObj: Record<string, any>): Hook[] {
  const result: Hook[] = [];

  for (const [event, eventConfigs] of Object.entries(hooksObj)) {
    if (!Array.isArray(eventConfigs)) continue;

    for (const config of eventConfigs) {
      const matcher = config.matcher;
      const hooksList = config.hooks || [config];

      for (const hook of hooksList) {
        const normalizedHook: Hook = {
          event,
          type: hook.type || 'command',
          command: hook.command,
          ...hook,
        };

        if (matcher) {
          normalizedHook.matcher = matcher;
        }

        // Remove duplicate event/matcher if they exist
        delete (normalizedHook as any).event;
        normalizedHook.event = event;

        result.push(normalizedHook);
      }
    }
  }

  return result;
}

/**
 * Normalize MCP servers
 * Transforms object to array with name field
 */
async function normalizeMcps(
  pluginDir: string,
  configValue: string | Record<string, any> | undefined
): Promise<Mcp[]> {
  const mcps: Mcp[] = [];

  if (!configValue) {
    // Try default location
    const defaultPath = path.join(pluginDir, '.mcp.json');
    if (fs.existsSync(defaultPath)) {
      const content = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
      if (content.mcpServers) {
        mcps.push(...objectToMcpArray(content.mcpServers));
      } else {
        mcps.push(...objectToMcpArray(content));
      }
    }
  } else if (typeof configValue === 'string') {
    // File path
    const filePath = path.join(pluginDir, normalizePath(configValue));
    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (content.mcpServers) {
        mcps.push(...objectToMcpArray(content.mcpServers));
      } else {
        mcps.push(...objectToMcpArray(content));
      }
    }
  } else {
    // Inline configuration
    mcps.push(...objectToMcpArray(configValue));
  }

  return mcps;
}

/**
 * Convert MCP object to array
 */
function objectToMcpArray(obj: Record<string, any>): Mcp[] {
  return Object.entries(obj).map(([name, config]) => ({
    name,
    command: config.command,
    args: config.args || [],
    env: config.env || {},
    ...config,
  }));
}

/**
 * Normalize path: remove leading "./"
 */
function normalizePath(p: string): string {
  return p.replace(/^\.\//, '');
}
