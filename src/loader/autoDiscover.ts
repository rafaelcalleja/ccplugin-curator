import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Auto-discovery logic for plugin components
 *
 * Implements default discovery rules from Spec 001:
 * - commands: "./commands/**\/*.md"
 * - agents: "./agents/**\/*.md"
 * - skills: "./skills/*\/SKILL.md" (returns parent dirs)
 * - hooks: "./hooks/hooks.json" OR "./settings.json"
 * - mcpServers: "./.mcp.json"
 */

/**
 * Auto-discover command files
 *
 * Default pattern: ./commands/**\/*.md
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Array of command file paths relative to plugin directory
 */
export async function discoverCommands(pluginDir: string): Promise<string[]> {
  const pattern = path.join(pluginDir, 'commands/**/*.md');
  const files = await glob(pattern, { nodir: true });
  return files.map(f => path.relative(pluginDir, f));
}

/**
 * Auto-discover agent files
 *
 * Default pattern: ./agents/**\/*.md
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Array of agent file paths relative to plugin directory
 */
export async function discoverAgents(pluginDir: string): Promise<string[]> {
  const pattern = path.join(pluginDir, 'agents/**/*.md');
  const files = await glob(pattern, { nodir: true });
  return files.map(f => path.relative(pluginDir, f));
}

/**
 * Auto-discover skill directories
 *
 * Default pattern: ./skills/*\/SKILL.md → return parent dirs
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Array of skill directory paths relative to plugin directory
 */
export async function discoverSkills(pluginDir: string): Promise<string[]> {
  const pattern = path.join(pluginDir, 'skills/*/SKILL.md');
  const files = await glob(pattern, { nodir: true });

  // Return parent directories (the skill dirs, not SKILL.md files)
  return files.map(f => {
    const skillFile = path.relative(pluginDir, f);
    return path.dirname(skillFile); // e.g., "skills/my-skill" from "skills/my-skill/SKILL.md"
  });
}

/**
 * Auto-discover hooks configuration
 *
 * Default: ./hooks/hooks.json OR ./settings.json
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Path to hooks file (relative to plugin dir) or undefined if not found
 */
export async function discoverHooks(pluginDir: string): Promise<string | undefined> {
  const candidates = [
    'hooks/hooks.json',
    'settings.json'
  ];

  for (const candidate of candidates) {
    const fullPath = path.join(pluginDir, candidate);
    try {
      await fs.access(fullPath);
      return candidate; // Return first file that exists
    } catch {
      // File doesn't exist, try next
    }
  }

  return undefined; // No hooks file found
}

/**
 * Auto-discover MCP servers configuration
 *
 * Default: ./.mcp.json
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Path to MCP file (relative to plugin dir) or undefined if not found
 */
export async function discoverMcpServers(pluginDir: string): Promise<string | undefined> {
  const mcpPath = '.mcp.json';
  const fullPath = path.join(pluginDir, mcpPath);

  try {
    await fs.access(fullPath);
    return mcpPath;
  } catch {
    return undefined; // File doesn't exist
  }
}

/**
 * Expand a glob pattern to file paths
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param pattern - Glob pattern (may include **\/ wildcards)
 * @returns Array of file paths relative to plugin directory
 */
export async function expandGlob(pluginDir: string, pattern: string): Promise<string[]> {
  // Remove leading ./ if present
  const cleanPattern = pattern.startsWith('./') ? pattern.slice(2) : pattern;
  const fullPattern = path.join(pluginDir, cleanPattern);

  const files = await glob(fullPattern, { nodir: true });
  return files.map(f => path.relative(pluginDir, f));
}
