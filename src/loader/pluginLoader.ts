import * as path from 'path';
import * as fs from 'fs/promises';
import { ClaudeCodePluginConfiguration } from '../types/plugin';
import {
  discoverCommands,
  discoverAgents,
  discoverSkills,
  discoverHooks,
  discoverMcpServers,
  expandGlob,
  expandSkillsGlob
} from './autoDiscover';

/**
 * Plugin loader module
 *
 * Reads .claude-plugin/plugin.json and applies auto-discovery
 * for undefined fields per Spec 001.
 */

export interface LoadedPlugin {
  /**
   * Plugin configuration (with auto-discovery applied)
   */
  config: ClaudeCodePluginConfiguration;

  /**
   * Absolute path to plugin directory
   */
  pluginDir: string;
}

/**
 * Load a plugin from a directory
 *
 * Reads .claude-plugin/plugin.json and applies auto-discovery for
 * undefined fields according to Spec 001.
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Loaded plugin with auto-discovery applied
 * @throws Error if plugin.json is invalid or directory doesn't exist
 *
 * @example
 * const plugin = await loadPlugin('/path/to/my-plugin');
 * console.log(plugin.config.name); // Plugin name
 * console.log(plugin.config.commands); // Commands (auto-discovered if undefined)
 */
export async function loadPlugin(pluginDir: string): Promise<LoadedPlugin> {
  // Read plugin.json
  const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');

  let config: ClaudeCodePluginConfiguration;
  try {
    const content = await fs.readFile(pluginJsonPath, 'utf-8');
    config = JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Plugin not found: ${pluginJsonPath} does not exist`);
    }
    throw new Error(`Failed to parse plugin.json: ${(error as Error).message}`);
  }

  // Apply auto-discovery for undefined fields
  const resolvedConfig = await applyAutoDiscovery(pluginDir, config);

  return {
    config: resolvedConfig,
    pluginDir
  };
}

/**
 * Apply auto-discovery rules for undefined fields
 *
 * Per Spec 001:
 * - name: undefined → basename(pluginDir)
 * - commands: undefined → auto-discover ./commands/**\/*.md
 * - agents: undefined → auto-discover ./agents/**\/*.md
 * - skills: undefined → auto-discover ./skills/*\/SKILL.md parent dirs
 * - hooks: undefined → auto-discover ./hooks/hooks.json OR ./settings.json
 * - mcpServers: undefined → auto-discover ./.mcp.json
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param config - Raw plugin configuration
 * @returns Configuration with auto-discovery applied
 */
async function applyAutoDiscovery(
  pluginDir: string,
  config: ClaudeCodePluginConfiguration
): Promise<ClaudeCodePluginConfiguration> {
  const resolved: ClaudeCodePluginConfiguration = { ...config };

  // Name: default to directory basename
  if (!resolved.name) {
    resolved.name = path.basename(pluginDir);
  }

  // Commands: auto-discover if undefined
  if (resolved.commands === undefined) {
    const discovered = await discoverCommands(pluginDir);
    if (discovered.length > 0) {
      resolved.commands = discovered;
    }
  } else if (typeof resolved.commands === 'string') {
    // String: treat as glob pattern
    resolved.commands = await expandGlob(pluginDir, resolved.commands);
  }

  // Agents: auto-discover if undefined
  if (resolved.agents === undefined) {
    const discovered = await discoverAgents(pluginDir);
    if (discovered.length > 0) {
      resolved.agents = discovered;
    }
  } else if (typeof resolved.agents === 'string') {
    // String: treat as glob pattern
    resolved.agents = await expandGlob(pluginDir, resolved.agents);
  }

  // Skills: auto-discover if undefined
  if (resolved.skills === undefined) {
    const discovered = await discoverSkills(pluginDir);
    if (discovered.length > 0) {
      resolved.skills = discovered;
    }
  } else if (typeof resolved.skills === 'string') {
    // String: treat as glob pattern for skill directories
    resolved.skills = await expandSkillsGlob(pluginDir, resolved.skills);
  }

  // Hooks: auto-discover if undefined
  if (resolved.hooks === undefined) {
    const discovered = await discoverHooks(pluginDir);
    if (discovered) {
      resolved.hooks = discovered;
    }
  }

  // MCP Servers: auto-discover if undefined
  if (resolved.mcpServers === undefined) {
    const discovered = await discoverMcpServers(pluginDir);
    if (discovered) {
      resolved.mcpServers = discovered;
    }
  }

  return resolved;
}

/**
 * Load multiple plugins from directories
 *
 * @param pluginDirs - Array of absolute paths to plugin directories
 * @returns Array of loaded plugins
 * @throws Error if any plugin fails to load
 */
export async function loadPlugins(pluginDirs: string[]): Promise<LoadedPlugin[]> {
  const promises = pluginDirs.map(dir => loadPlugin(dir));
  return Promise.all(promises);
}
