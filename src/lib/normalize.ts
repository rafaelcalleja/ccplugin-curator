import * as path from 'path';
import * as fs from 'fs/promises';
import { NormalizedPlugin } from '../types/normalized';
import {
  discoverCommands,
  discoverAgents,
  discoverSkills,
  loadHooks,
  loadMCPs,
  expandPath,
  normalizePath,
} from './discovery';

/**
 * Normalize a plugin from official format to internal format
 *
 * Reads plugin.json and performs:
 * - Auto-discovery of components
 * - Path expansion and normalization
 * - Metadata defaults
 * - Hooks/MCPs transformation
 *
 * Based on docs/spec/001-normalization-protocol.md
 */
export async function normalizePlugin(pluginDir: string): Promise<NormalizedPlugin> {
  const pluginJsonPath = path.join(pluginDir, '.claude-plugin/plugin.json');
  const pluginJson = await readPluginJson(pluginJsonPath);
  const pluginRoot = path.resolve(pluginDir);

  // 1. Extract metadata with defaults
  const name = pluginJson.name || path.basename(pluginRoot);
  const version = pluginJson.version || '0.0.0';
  const description = pluginJson.description || '';
  const author = pluginJson.author || { name: '', email: '', url: '' };
  const authorNormalized = {
    name: author.name || '',
    email: author.email || '',
    url: author.url || '',
  };
  const homepage = pluginJson.homepage || '';
  const repository = pluginJson.repository || '';
  const license = pluginJson.license || '';
  const keywords = pluginJson.keywords || [];

  // 2. Normalize commands
  const commands = await normalizeCommands(pluginRoot, pluginJson.commands);

  // 3. Normalize agents
  const agents = await normalizeAgents(pluginRoot, pluginJson.agents);

  // 4. Normalize skills
  const skills = await normalizeSkills(pluginRoot, pluginJson.skills);

  // 5. Normalize hooks
  const hooks = await normalizeHooks(pluginRoot, pluginJson.hooks);

  // 6. Normalize MCPs
  const mcps = await normalizeMCPs(pluginRoot, pluginJson.mcpServers);

  return {
    name,
    source: pluginRoot,
    version,
    description,
    author: authorNormalized,
    homepage,
    repository,
    license,
    keywords,
    commands,
    agents,
    skills,
    hooks,
    mcps,
  };
}

/**
 * Read and parse plugin.json file
 */
async function readPluginJson(pluginJsonPath: string): Promise<any> {
  try {
    const content = await fs.readFile(pluginJsonPath, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // plugin.json doesn't exist, return minimal config
      return {};
    }
    throw error;
  }
}

/**
 * Normalize commands field
 * - Auto-discover from commands/ directory
 * - If string: expand glob
 * - If array: use as-is
 * - Result: always array, paths normalized (no ./)
 */
async function normalizeCommands(pluginRoot: string, commands?: string | string[]): Promise<string[]> {
  const discovered = await discoverCommands(pluginRoot);
  const custom = await resolveComponentPaths(pluginRoot, commands, '**/*.md');

  // Normalize paths first, then combine to remove duplicates
  const discoveredNormalized = discovered.map(normalizePath);
  const customNormalized = custom.map(normalizePath);

  // Combine discovered + custom (COMPLEMENT, not replace)
  const combined = [...new Set([...customNormalized, ...discoveredNormalized])];
  return combined;
}

/**
 * Normalize agents field (same logic as commands)
 */
async function normalizeAgents(pluginRoot: string, agents?: string | string[]): Promise<string[]> {
  const discovered = await discoverAgents(pluginRoot);
  const custom = await resolveComponentPaths(pluginRoot, agents, '**/*.md');

  // Normalize paths first, then combine to remove duplicates
  const discoveredNormalized = discovered.map(normalizePath);
  const customNormalized = custom.map(normalizePath);

  const combined = [...new Set([...customNormalized, ...discoveredNormalized])];
  return combined;
}

/**
 * Normalize skills field
 * - Auto-discover from skills/STAR/SKILL.md (where STAR is wildcard)
 * - If string: expand glob
 * - If array: use as-is
 * - Result: directory paths (not file paths)
 */
async function normalizeSkills(pluginRoot: string, skills?: string | string[]): Promise<string[]> {
  const discovered = await discoverSkills(pluginRoot);
  const custom = await resolveComponentPaths(pluginRoot, skills, '*/SKILL.md');

  // Skills are directories, so extract parent directories from SKILL.md paths
  const customDirs = custom.map(p => path.dirname(p));

  // Normalize paths first, then combine to remove duplicates
  const discoveredNormalized = discovered.map(normalizePath);
  const customNormalized = customDirs.map(normalizePath);

  const combined = [...new Set([...customNormalized, ...discoveredNormalized])];
  return combined;
}

/**
 * Normalize hooks field
 * - If string: load from file
 * - If object: parse inline config
 * - If undefined: auto-discover from hooks/hooks.json
 * - Result: flat array with event and matcher extracted
 */
async function normalizeHooks(pluginRoot: string, hooks?: string | object): Promise<any[]> {
  if (typeof hooks === 'string') {
    // Load from file path
    return await loadHooks(pluginRoot, hooks);
  } else if (typeof hooks === 'object') {
    // Inline configuration
    const hooksObj = (hooks as any).hooks || hooks;
    return flattenHooksInline(hooksObj);
  } else {
    // Auto-discover from default location
    return await loadHooks(pluginRoot);
  }
}

/**
 * Flatten inline hooks configuration
 */
function flattenHooksInline(hooksObj: Record<string, any[]>): any[] {
  const result: any[] = [];

  for (const [event, eventConfigs] of Object.entries(hooksObj)) {
    for (const config of eventConfigs) {
      const matcher = config.matcher;
      const hooks = config.hooks || [config]; // Handle both wrapped and unwrapped formats

      for (const hook of hooks) {
        const flatHook: any = {
          event,
          ...hook,
        };

        if (matcher) {
          flatHook.matcher = matcher;
        }

        result.push(flatHook);
      }
    }
  }

  return result;
}

/**
 * Normalize MCPs field
 * - If string: load from file
 * - If object: parse inline config
 * - If undefined: auto-discover from .mcp.json
 * - Result: array with name extracted
 */
async function normalizeMCPs(pluginRoot: string, mcpServers?: string | object): Promise<any[]> {
  if (typeof mcpServers === 'string') {
    // Load from file path
    return await loadMCPs(pluginRoot, mcpServers);
  } else if (typeof mcpServers === 'object') {
    // Inline configuration
    return mcpsToArray(mcpServers as Record<string, any>);
  } else {
    // Auto-discover from default location
    return await loadMCPs(pluginRoot);
  }
}

/**
 * Convert MCPs object to array (same logic as in discovery.ts)
 */
function mcpsToArray(mcpsObj: Record<string, any>): any[] {
  return Object.entries(mcpsObj).map(([name, config]) => ({
    name,
    env: {}, // Default empty env
    ...config,
  }));
}

/**
 * Resolve component paths from plugin.json field
 * - If string: expand glob pattern
 * - If array: return as-is
 * - If undefined: return empty array
 */
async function resolveComponentPaths(
  pluginRoot: string,
  value: string | string[] | undefined,
  globPattern: string
): Promise<string[]> {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    // String path: expand with glob
    return await expandPath(pluginRoot, value, globPattern);
  }

  // Array: return as-is
  return value;
}
