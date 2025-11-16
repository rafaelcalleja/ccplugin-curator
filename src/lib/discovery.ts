import { glob } from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Auto-discover commands in a plugin directory
 * Pattern: commands/**\/*.md
 */
export async function discoverCommands(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'commands/**/*.md');
  const files = await glob(pattern);
  return files.map(f => path.relative(pluginRoot, f));
}

/**
 * Auto-discover agents in a plugin directory
 * Pattern: agents/**\/*.md
 */
export async function discoverAgents(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'agents/**/*.md');
  const files = await glob(pattern);
  return files.map(f => path.relative(pluginRoot, f));
}

/**
 * Auto-discover skills in a plugin directory
 * Pattern: skills/*\/SKILL.md → return parent directories
 */
export async function discoverSkills(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'skills/*/SKILL.md');
  const files = await glob(pattern);
  // Return parent directories (not the SKILL.md file itself)
  return files.map(f => {
    const relativePath = path.relative(pluginRoot, f);
    return path.dirname(relativePath); // e.g., "skills/skill-a"
  });
}

/**
 * Load and parse hooks from hooks.json file
 * Returns flat array of hooks with event and matcher extracted
 */
export async function loadHooks(pluginRoot: string, hooksPath?: string): Promise<any[]> {
  const filePath = hooksPath
    ? path.join(pluginRoot, hooksPath)
    : path.join(pluginRoot, 'hooks/hooks.json');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return flattenHooks(data.hooks || data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist
    }
    throw error;
  }
}

/**
 * Flatten nested hooks structure to flat array
 * Input: { "EventName": [{ matcher?, hooks: [...] }] }
 * Output: [{ event, type, command, matcher?, ... }]
 */
function flattenHooks(hooksObj: Record<string, any[]>): any[] {
  const result: any[] = [];

  for (const [event, eventConfigs] of Object.entries(hooksObj)) {
    for (const config of eventConfigs) {
      const matcher = config.matcher;
      const hooks = config.hooks || [];

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
 * Load and parse MCPs from .mcp.json file
 * Returns array of MCPs with name extracted from keys
 */
export async function loadMCPs(pluginRoot: string, mcpPath?: string): Promise<any[]> {
  const filePath = mcpPath
    ? path.join(pluginRoot, mcpPath)
    : path.join(pluginRoot, '.mcp.json');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return mcpsToArray(data.mcpServers || data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return []; // File doesn't exist
    }
    throw error;
  }
}

/**
 * Convert MCPs object to array
 * Input: { "serverName": { command, args, env } }
 * Output: [{ name: "serverName", command, args, env }]
 */
function mcpsToArray(mcpsObj: Record<string, any>): any[] {
  return Object.entries(mcpsObj).map(([name, config]) => ({
    name,
    env: {}, // Default empty env
    ...config,
  }));
}

/**
 * Expand string path to glob pattern and return file list
 */
export async function expandPath(pluginRoot: string, pathStr: string, pattern: string): Promise<string[]> {
  const fullPath = path.join(pluginRoot, pathStr);
  const globPattern = path.join(fullPath, pattern);
  const files = await glob(globPattern);
  return files.map(f => path.relative(pluginRoot, f));
}

/**
 * Normalize path by removing leading "./"
 */
export function normalizePath(p: string): string {
  return p.replace(/^\.\//, '');
}
