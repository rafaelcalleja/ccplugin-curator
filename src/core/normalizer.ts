import * as path from 'path';
import { NormalizedPlugin } from '../types/normalized';
import { PluginDiscovery } from './scanner';

/**
 * Transform plugin discovery into normalized format
 */
export function normalizePlugin(discovery: PluginDiscovery): NormalizedPlugin {
  const { pluginPath, pluginJson, discoveredCommands, discoveredAgents, discoveredSkills, discoveredHooks, discoveredMcps } = discovery;

  // Extract plugin name (required field, fallback to directory basename)
  const name = pluginJson.name || path.basename(pluginPath);

  // Normalize hooks with stable IDs
  const hooks = discoveredHooks.map((hook, index) => ({
    id: `${name}:${hook.event}:${index}`,
    event: hook.event,
    ...(hook.matcher && { matcher: hook.matcher }),
    config: {
      type: hook.type,
      ...(hook.command && { command: hook.command }),
      ...(hook.agent && { agent: hook.agent }),
      ...(hook.args && { args: hook.args }),
    },
  }));

  // Normalize MCPs with stable IDs
  const mcps = discoveredMcps.map((mcp) => ({
    id: `${name}:${mcp.name}`,
    name: mcp.name,
    config: {
      command: mcp.config.command,
      ...(mcp.config.args && { args: mcp.config.args }),
      ...(mcp.config.env && { env: mcp.config.env }),
    },
  }));

  // Build normalized plugin
  const normalized: NormalizedPlugin = {
    name,
    source: pluginPath,
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
    commands: discoveredCommands,
    agents: discoveredAgents,
    skills: discoveredSkills,
    hooks,
    mcps,
  };

  return normalized;
}

/**
 * Normalize all discovered plugins
 */
export function normalizePlugins(discoveries: PluginDiscovery[]): NormalizedPlugin[] {
  return discoveries.map(normalizePlugin);
}
