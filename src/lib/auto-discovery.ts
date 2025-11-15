import fg from 'fast-glob';
import path from 'path';
import fs from 'fs/promises';

/**
 * Auto-discover commands in a plugin directory
 * Default pattern: commands/**\/*.md
 */
export async function discoverCommands(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'commands/**/*.md');
  const files = await fg(pattern, { dot: false });
  return files.map(file => path.relative(pluginRoot, file));
}

/**
 * Auto-discover agents in a plugin directory
 * Default pattern: agents/**\/*.md
 */
export async function discoverAgents(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'agents/**/*.md');
  const files = await fg(pattern, { dot: false });
  return files.map(file => path.relative(pluginRoot, file));
}

/**
 * Auto-discover skills in a plugin directory
 * Default pattern: skills/*\/SKILL.md (parent directories)
 */
export async function discoverSkills(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'skills/*/SKILL.md');
  const files = await fg(pattern, { dot: false });
  // Return parent directories, not the SKILL.md files
  return files.map(file => {
    const relativePath = path.relative(pluginRoot, file);
    return path.dirname(relativePath);
  });
}

/**
 * Auto-discover hooks configuration
 * Default location: hooks/hooks.json
 */
export async function discoverHooks(pluginRoot: string): Promise<any> {
  const hooksPath = path.join(pluginRoot, 'hooks/hooks.json');
  try {
    const content = await fs.readFile(hooksPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist or is invalid
    return null;
  }
}

/**
 * Auto-discover MCP servers configuration
 * Default location: .mcp.json
 */
export async function discoverMcpServers(pluginRoot: string): Promise<any> {
  const mcpPath = path.join(pluginRoot, '.mcp.json');
  try {
    const content = await fs.readFile(mcpPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist or is invalid
    return null;
  }
}

/**
 * Expand a path (string or array) to an array of files using glob
 */
export async function expandPath(pluginRoot: string, pathValue: string | string[]): Promise<string[]> {
  if (Array.isArray(pathValue)) {
    // Already an array, return as-is
    return pathValue;
  }

  // String path - use glob to expand
  const pattern = path.join(pluginRoot, pathValue, '**/*.md');
  const files = await fg(pattern, { dot: false });
  return files.map(file => path.relative(pluginRoot, file));
}

/**
 * Normalize a path by removing leading ./
 */
export function normalizePath(p: string): string {
  return p.replace(/^\.\//, '');
}
