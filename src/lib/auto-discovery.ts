import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';

/**
 * Auto-discover commands in plugin directory
 * Scans: commands/**\/*.md
 */
export async function discoverCommands(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'commands/**/*.md');
  const files = await glob(pattern, { nodir: true });
  return files.map(f => path.relative(pluginRoot, f));
}

/**
 * Auto-discover agents in plugin directory
 * Scans: agents/**\/*.md
 */
export async function discoverAgents(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'agents/**/*.md');
  const files = await glob(pattern, { nodir: true });
  return files.map(f => path.relative(pluginRoot, f));
}

/**
 * Auto-discover skills in plugin directory
 * Scans: skills/*\/SKILL.md and returns parent directory paths
 */
export async function discoverSkills(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'skills/*/SKILL.md');
  const files = await glob(pattern, { nodir: true });
  // Return parent directory paths (not file paths)
  return files.map(f => path.relative(pluginRoot, path.dirname(f)));
}

/**
 * Load hooks from hooks/hooks.json or settings.json
 */
export async function loadHooks(pluginRoot: string, hooksPath?: string): Promise<any | null> {
  // If explicit path provided, use it
  if (hooksPath) {
    const fullPath = path.join(pluginRoot, hooksPath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  // Try default locations
  const defaultPaths = ['hooks/hooks.json', 'settings.json'];
  for (const defaultPath of defaultPaths) {
    const fullPath = path.join(pluginRoot, defaultPath);
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Load MCP servers from .mcp.json
 */
export async function loadMcps(pluginRoot: string, mcpPath?: string): Promise<any | null> {
  const fullPath = mcpPath
    ? path.join(pluginRoot, mcpPath)
    : path.join(pluginRoot, '.mcp.json');

  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Expand path (string) to array of files using glob
 */
export async function expandPath(pluginRoot: string, pathPattern: string): Promise<string[]> {
  const fullPattern = path.join(pluginRoot, pathPattern, '**/*.md');
  const files = await glob(fullPattern, { nodir: true });
  return files.map(f => path.relative(pluginRoot, f));
}
