import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { ClaudeCodePlugin } from '../types/plugin';

export interface PluginDiscovery {
  pluginPath: string;
  pluginJson: ClaudeCodePlugin;
  discoveredCommands: string[];
  discoveredAgents: string[];
  discoveredSkills: string[];
  discoveredHooks: any[];
  discoveredMcps: any[];
}

/**
 * Scan a directory for Claude Code plugins
 */
export async function scanPluginDirectory(dir: string): Promise<PluginDiscovery[]> {
  const absoluteDir = path.resolve(dir);
  const plugins: PluginDiscovery[] = [];

  if (!fs.existsSync(absoluteDir)) {
    throw new Error(`Directory not found: ${absoluteDir}`);
  }

  // Find all .claude-plugin/plugin.json files
  const pluginFiles = await glob('**/.claude-plugin/plugin.json', {
    cwd: absoluteDir,
    absolute: false,
  });

  for (const pluginFile of pluginFiles) {
    const pluginPath = path.join(absoluteDir, path.dirname(path.dirname(pluginFile)));
    const pluginJsonPath = path.join(absoluteDir, pluginFile);

    try {
      const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8')) as ClaudeCodePlugin;

      // Perform auto-discovery
      const discovery = await discoverPluginComponents(pluginPath, pluginJson);

      plugins.push({
        pluginPath,
        pluginJson,
        ...discovery,
      });
    } catch (error) {
      console.error(`Error reading plugin at ${pluginPath}:`, error);
    }
  }

  return plugins;
}

/**
 * Discover plugin components (commands, agents, skills, hooks, MCPs)
 */
async function discoverPluginComponents(
  pluginPath: string,
  pluginJson: ClaudeCodePlugin
): Promise<Omit<PluginDiscovery, 'pluginPath' | 'pluginJson'>> {
  const commands = await discoverCommands(pluginPath, pluginJson.commands);
  const agents = await discoverAgents(pluginPath, pluginJson.agents);
  const skills = await discoverSkills(pluginPath);
  const hooks = await discoverHooks(pluginPath, pluginJson.hooks);
  const mcps = await discoverMcps(pluginPath, pluginJson.mcpServers);

  return {
    discoveredCommands: commands,
    discoveredAgents: agents,
    discoveredSkills: skills,
    discoveredHooks: hooks,
    discoveredMcps: mcps,
  };
}

/**
 * Discover commands: custom paths + auto-discovery from commands/
 */
async function discoverCommands(
  pluginPath: string,
  customPaths?: string | string[]
): Promise<string[]> {
  const discovered: string[] = [];

  // Auto-discovery: commands/**/*.md
  const defaultPattern = 'commands/**/*.md';
  const defaultCommands = await glob(defaultPattern, { cwd: pluginPath });
  discovered.push(...defaultCommands);

  // Custom paths (SUPPLEMENT, not replace)
  if (customPaths) {
    const paths = Array.isArray(customPaths) ? customPaths : [customPaths];
    for (const p of paths) {
      const normalized = p.replace(/^\.\//, '');
      const stats = await fs.promises.stat(path.join(pluginPath, normalized)).catch(() => null);

      if (stats?.isDirectory()) {
        // It's a directory, glob it
        const files = await glob(`${normalized}/**/*.md`, { cwd: pluginPath });
        discovered.push(...files);
      } else if (stats?.isFile()) {
        // It's a file
        discovered.push(normalized);
      }
    }
  }

  return [...new Set(discovered)]; // Remove duplicates
}

/**
 * Discover agents: custom paths + auto-discovery from agents/
 */
async function discoverAgents(
  pluginPath: string,
  customPaths?: string | string[]
): Promise<string[]> {
  const discovered: string[] = [];

  // Auto-discovery: agents/**/*.md
  const defaultPattern = 'agents/**/*.md';
  const defaultAgents = await glob(defaultPattern, { cwd: pluginPath });
  discovered.push(...defaultAgents);

  // Custom paths (SUPPLEMENT, not replace)
  if (customPaths) {
    const paths = Array.isArray(customPaths) ? customPaths : [customPaths];
    for (const p of paths) {
      const normalized = p.replace(/^\.\//, '');
      const stats = await fs.promises.stat(path.join(pluginPath, normalized)).catch(() => null);

      if (stats?.isDirectory()) {
        const files = await glob(`${normalized}/**/*.md`, { cwd: pluginPath });
        discovered.push(...files);
      } else if (stats?.isFile()) {
        discovered.push(normalized);
      }
    }
  }

  return [...new Set(discovered)];
}

/**
 * Discover skills: ALWAYS from skills/STAR/SKILL.md pattern (STAR = wildcard)
 * Skills are NEVER defined in plugin.json
 */
async function discoverSkills(pluginPath: string): Promise<string[]> {
  const skillFiles = await glob('skills/*/SKILL.md', { cwd: pluginPath });

  // Return directory paths (not file paths)
  return skillFiles.map(f => path.dirname(f));
}

/**
 * Discover hooks: from hooks/hooks.json or settings.json
 */
async function discoverHooks(
  pluginPath: string,
  hooksConfig?: string | object
): Promise<any[]> {
  if (typeof hooksConfig === 'object') {
    // Inline configuration
    return parseHooksObject(hooksConfig);
  }

  // File path
  const hooksPath = hooksConfig || 'hooks/hooks.json';
  const fullPath = path.join(pluginPath, hooksPath.replace(/^\.\//, ''));

  if (!fs.existsSync(fullPath)) {
    // Try fallback to settings.json
    const settingsPath = path.join(pluginPath, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      return parseHooksObject(settings.hooks || {});
    }
    return [];
  }

  const hooksData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  return parseHooksObject(hooksData.hooks || hooksData);
}

/**
 * Parse hooks object into flat array
 */
function parseHooksObject(hooksObj: any): any[] {
  const hooks: any[] = [];

  for (const [event, eventHooks] of Object.entries(hooksObj)) {
    if (!Array.isArray(eventHooks)) continue;

    for (const hookEntry of eventHooks) {
      if (hookEntry.hooks && Array.isArray(hookEntry.hooks)) {
        // Nested structure with matcher
        for (const hook of hookEntry.hooks) {
          hooks.push({
            event,
            matcher: hookEntry.matcher,
            ...hook,
          });
        }
      } else if (hookEntry.type) {
        // Direct hook entry
        hooks.push({
          event,
          ...hookEntry,
        });
      }
    }
  }

  return hooks;
}

/**
 * Discover MCP servers: from .mcp.json
 */
async function discoverMcps(
  pluginPath: string,
  mcpConfig?: string | object
): Promise<any[]> {
  if (typeof mcpConfig === 'object') {
    // Inline configuration
    return parseMcpObject(mcpConfig);
  }

  // File path
  const mcpPath = mcpConfig || '.mcp.json';
  const fullPath = path.join(pluginPath, mcpPath.replace(/^\.\//, ''));

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const mcpData = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  return parseMcpObject(mcpData.mcpServers || mcpData);
}

/**
 * Parse MCP object into array
 */
function parseMcpObject(mcpObj: any): any[] {
  const mcps: any[] = [];

  for (const [name, config] of Object.entries(mcpObj)) {
    mcps.push({
      name,
      config,
    });
  }

  return mcps;
}
