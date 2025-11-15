import path from 'path';
import fs from 'fs/promises';
import { NormalizedPluginInternalFormat } from '../types/normalized';
import {
  discoverCommands,
  discoverAgents,
  discoverSkills,
  discoverHooks,
  discoverMcpServers,
  expandPath,
  normalizePath,
} from './auto-discovery';

/**
 * Normalize hooks from nested object format to flat array format
 */
function normalizeHooks(hooks: any): NormalizedPluginInternalFormat['hooks'] {
  if (!hooks || typeof hooks !== 'object') {
    return [];
  }

  const result: NormalizedPluginInternalFormat['hooks'] = [];

  for (const [event, hookConfigs] of Object.entries(hooks)) {
    if (!Array.isArray(hookConfigs)) continue;

    for (const config of hookConfigs) {
      result.push({
        event,
        ...config,
      });
    }
  }

  return result;
}

/**
 * Normalize MCPs from object format to array format
 */
function normalizeMcps(mcpServers: any): NormalizedPluginInternalFormat['mcps'] {
  if (!mcpServers || typeof mcpServers !== 'object') {
    return [];
  }

  const result: NormalizedPluginInternalFormat['mcps'] = [];

  for (const [name, config] of Object.entries(mcpServers)) {
    if (typeof config !== 'object') continue;

    result.push({
      name,
      ...(config as any),
      env: (config as any).env || {},
    });
  }

  return result;
}

/**
 * Normalize a plugin from official format to internal format
 */
export async function normalizePlugin(
  pluginRoot: string,
  pluginJson: any
): Promise<NormalizedPluginInternalFormat> {
  const absoluteRoot = path.resolve(pluginRoot);

  // 1. Handle name (required, defaults to directory name)
  const name = pluginJson.name || path.basename(absoluteRoot);

  // 2. Auto-discover components
  const discoveredCommands = await discoverCommands(absoluteRoot);
  const discoveredAgents = await discoverAgents(absoluteRoot);
  const discoveredSkills = await discoverSkills(absoluteRoot);
  const discoveredHooksConfig = await discoverHooks(absoluteRoot);
  const discoveredMcpConfig = await discoverMcpServers(absoluteRoot);

  // 3. Handle commands (custom paths COMPLEMENT auto-discovery)
  let commands: string[] = [];
  if (pluginJson.commands) {
    const customCommands = await expandPath(absoluteRoot, pluginJson.commands);
    commands = customCommands.map(normalizePath);
  }
  commands = [...commands, ...discoveredCommands.map(normalizePath)];

  // 4. Handle agents (custom paths COMPLEMENT auto-discovery)
  let agents: string[] = [];
  if (pluginJson.agents) {
    const customAgents = await expandPath(absoluteRoot, pluginJson.agents);
    agents = customAgents.map(normalizePath);
  }
  agents = [...agents, ...discoveredAgents.map(normalizePath)];

  // 5. Handle skills (custom paths COMPLEMENT auto-discovery)
  let skills: string[] = [];
  if (pluginJson.skills) {
    if (typeof pluginJson.skills === 'string') {
      // Single path - expand it
      const customSkills = await discoverSkills(path.join(absoluteRoot, pluginJson.skills));
      skills = customSkills.map(normalizePath);
    } else if (Array.isArray(pluginJson.skills)) {
      // Array of paths
      skills = pluginJson.skills.map(normalizePath);
    }
  }
  skills = [...skills, ...discoveredSkills.map(normalizePath)];

  // 6. Handle hooks
  let hooks: NormalizedPluginInternalFormat['hooks'] = [];
  if (typeof pluginJson.hooks === 'string') {
    // Load from file
    const hooksPath = path.join(absoluteRoot, pluginJson.hooks);
    try {
      const content = await fs.readFile(hooksPath, 'utf-8');
      const hooksConfig = JSON.parse(content);
      hooks = normalizeHooks(hooksConfig.hooks || hooksConfig);
    } catch (error) {
      // Ignore file read errors
    }
  } else if (typeof pluginJson.hooks === 'object') {
    // Inline configuration
    hooks = normalizeHooks(pluginJson.hooks);
  } else if (discoveredHooksConfig) {
    // Use auto-discovered hooks
    hooks = normalizeHooks(discoveredHooksConfig.hooks || discoveredHooksConfig);
  }

  // 7. Handle MCPs
  let mcps: NormalizedPluginInternalFormat['mcps'] = [];
  if (typeof pluginJson.mcpServers === 'string') {
    // Load from file
    const mcpPath = path.join(absoluteRoot, pluginJson.mcpServers);
    try {
      const content = await fs.readFile(mcpPath, 'utf-8');
      const mcpConfig = JSON.parse(content);
      mcps = normalizeMcps(mcpConfig.mcpServers || mcpConfig);
    } catch (error) {
      // Ignore file read errors
    }
  } else if (typeof pluginJson.mcpServers === 'object') {
    // Inline configuration
    mcps = normalizeMcps(pluginJson.mcpServers);
  } else if (discoveredMcpConfig) {
    // Use auto-discovered MCPs
    mcps = normalizeMcps(discoveredMcpConfig.mcpServers || discoveredMcpConfig);
  }

  // 8. Build normalized plugin
  const normalized: NormalizedPluginInternalFormat = {
    name,
    source: absoluteRoot,
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
    commands: [...new Set(commands)], // Deduplicate
    agents: [...new Set(agents)], // Deduplicate
    skills: [...new Set(skills)], // Deduplicate
    hooks,
    mcps,
  };

  return normalized;
}

/**
 * Scan a directory for plugins and normalize them all
 */
export async function scanAndNormalizePlugins(
  pluginsDir: string
): Promise<NormalizedPluginInternalFormat[]> {
  const absolutePluginsDir = path.resolve(pluginsDir);

  // Import fast-glob dynamically
  const fastGlob = await import('fast-glob');
  const globFn = fastGlob.default || fastGlob;

  // Find all directories with .claude-plugin/plugin.json
  const pluginDirs = await globFn(path.join(absolutePluginsDir, '*/.claude-plugin/plugin.json'), {
    dot: true,
    onlyFiles: true,
  });

  const plugins: NormalizedPluginInternalFormat[] = [];

  for (const pluginJsonPath of pluginDirs) {
    const pluginRoot = path.dirname(path.dirname(pluginJsonPath));
    const pluginJsonContent = await fs.readFile(pluginJsonPath, 'utf-8');
    const pluginJson = JSON.parse(pluginJsonContent);

    const normalized = await normalizePlugin(pluginRoot, pluginJson);
    plugins.push(normalized);
  }

  return plugins;
}
