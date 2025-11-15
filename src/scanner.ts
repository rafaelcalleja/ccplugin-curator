import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import type { PluginJson, NormalizedPlugin } from './types/index.js';

/**
 * Scan directory for Claude Code plugins
 * A plugin is identified by having a .claude-plugin/plugin.json file
 */
export async function scanPlugins(pluginsDir: string): Promise<PluginJson[]> {
  const pluginsDir_abs = path.resolve(pluginsDir);

  // Check if directory exists
  if (!fs.existsSync(pluginsDir_abs)) {
    throw new Error(`Directory not found: ${pluginsDir_abs}`);
  }

  // Find all .claude-plugin/plugin.json files
  const pluginJsonPaths = await glob('**/.claude-plugin/plugin.json', {
    cwd: pluginsDir_abs,
    absolute: true,
  });

  if (pluginJsonPaths.length === 0) {
    return [];
  }

  const plugins: PluginJson[] = [];

  for (const pluginJsonPath of pluginJsonPaths) {
    try {
      const pluginDir = path.dirname(path.dirname(pluginJsonPath));
      const content = fs.readFileSync(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(content) as PluginJson;

      // Use directory basename as default name if not provided
      if (!pluginJson.name) {
        pluginJson.name = path.basename(pluginDir);
      }

      // Store source directory for later reference
      (pluginJson as any).__sourceDir = pluginDir;

      plugins.push(pluginJson);
    } catch (error) {
      console.warn(`Failed to parse plugin at ${pluginJsonPath}:`, error);
    }
  }

  return plugins;
}

/**
 * Auto-discover plugin components
 * Searches for: commands/, agents/, skills/, hooks/hooks.json, .mcp.json
 */
export async function autoDiscoverComponents(
  pluginDir: string
): Promise<{
  commands: string[];
  agents: string[];
  skills: string[];
  hooks: Record<string, any> | null;
  mcps: Record<string, any> | null;
}> {
  const components = {
    commands: [] as string[],
    agents: [] as string[],
    skills: [] as string[],
    hooks: null as Record<string, any> | null,
    mcps: null as Record<string, any> | null,
  };

  // Discover commands
  const commandsGlob = await glob('commands/**/*.md', {
    cwd: pluginDir,
  });
  components.commands = commandsGlob.map((p) => `commands/${path.basename(p)}`).filter((v, i, a) => a.indexOf(v) === i);

  // Discover agents
  const agentsGlob = await glob('agents/**/*.md', {
    cwd: pluginDir,
  });
  components.agents = agentsGlob.map((p) => `agents/${path.basename(p)}`).filter((v, i, a) => a.indexOf(v) === i);

  // Discover skills (directories with SKILL.md)
  const skillsGlob = await glob('skills/*/SKILL.md', {
    cwd: pluginDir,
  });
  components.skills = skillsGlob
    .map((p) => path.dirname(p))
    .filter((v, i, a) => a.indexOf(v) === i);

  // Load hooks configuration
  const hooksPath = path.join(pluginDir, 'hooks', 'hooks.json');
  if (fs.existsSync(hooksPath)) {
    try {
      components.hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf-8'));
    } catch (error) {
      console.warn(`Failed to parse hooks.json:`, error);
    }
  }

  // Load MCPs configuration
  const mcpsPath = path.join(pluginDir, '.mcp.json');
  if (fs.existsSync(mcpsPath)) {
    try {
      components.mcps = JSON.parse(fs.readFileSync(mcpsPath, 'utf-8'));
    } catch (error) {
      console.warn(`Failed to parse .mcp.json:`, error);
    }
  }

  return components;
}
