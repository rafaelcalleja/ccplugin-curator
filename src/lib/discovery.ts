import * as path from 'path';
import * as fs from 'fs/promises';
import fg from 'fast-glob';

/**
 * Auto-discover commands in a plugin directory
 * Scans: commands glob pattern for .md files
 */
export async function discoverCommands(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'commands/**/*.md');
  const files = await fg(pattern, { onlyFiles: true });
  return files.map((f) => path.relative(pluginRoot, f));
}

/**
 * Auto-discover agents in a plugin directory
 * Scans: agents glob pattern for .md files
 */
export async function discoverAgents(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'agents/**/*.md');
  const files = await fg(pattern, { onlyFiles: true });
  return files.map((f) => path.relative(pluginRoot, f));
}

/**
 * Auto-discover skills in a plugin directory
 * Scans: skills directories for SKILL.md (returns parent directories only)
 */
export async function discoverSkills(pluginRoot: string): Promise<string[]> {
  const pattern = path.join(pluginRoot, 'skills/*/SKILL.md');
  const files = await fg(pattern, { onlyFiles: true });
  // Return parent directories (skills/skill-a, skills/skill-b)
  return files.map((f) => {
    const rel = path.relative(pluginRoot, f);
    return path.dirname(rel); // Remove /SKILL.md
  });
}

/**
 * Load hooks from hooks.json or settings.json
 */
export async function loadHooks(pluginRoot: string, hooksPath?: string): Promise<any[]> {
  const paths = hooksPath
    ? [path.resolve(pluginRoot, hooksPath)]
    : [
        path.join(pluginRoot, 'hooks/hooks.json'),
        path.join(pluginRoot, 'settings.json'),
      ];

  for (const filePath of paths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      return normalizeHooks(data.hooks || data);
    } catch (err) {
      // File not found or invalid JSON, try next
      continue;
    }
  }

  return [];
}

/**
 * Load MCP servers from .mcp.json
 */
export async function loadMcpServers(pluginRoot: string, mcpPath?: string): Promise<any[]> {
  const filePath = mcpPath
    ? path.resolve(pluginRoot, mcpPath)
    : path.join(pluginRoot, '.mcp.json');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return normalizeMcps(data.mcpServers || data);
  } catch (err) {
    return [];
  }
}

/**
 * Normalize hooks from nested object to flat array
 * Transform: { "EventName": [{ matcher?, hooks: [...] }] } → Hook[]
 */
function normalizeHooks(hooksObj: Record<string, any[]>): any[] {
  const result: any[] = [];

  for (const [event, configs] of Object.entries(hooksObj)) {
    for (const config of configs) {
      const matcher = config.matcher;
      const hooks = config.hooks || [];

      for (const hook of hooks) {
        result.push({
          event,
          ...(matcher && { matcher }),
          ...hook,
        });
      }
    }
  }

  return result;
}

/**
 * Normalize MCPs from object to flat array
 * Transform: { "serverName": {config} } → Mcp[]
 */
function normalizeMcps(mcpsObj: Record<string, any>): any[] {
  const result: any[] = [];

  for (const [name, config] of Object.entries(mcpsObj)) {
    result.push({
      name,
      ...config,
    });
  }

  return result;
}

/**
 * Resolve custom paths (string or array)
 * - String: glob pattern (e.g., "./commands" becomes glob pattern)
 * - Array: explicit paths (returned as-is)
 */
export async function resolveCustomPaths(
  pluginRoot: string,
  customPath: string | string[] | undefined,
  pattern: string, // e.g., "**/*.md"
): Promise<string[]> {
  if (!customPath) return [];

  if (typeof customPath === 'string') {
    // String path → glob
    const fullPattern = path.join(pluginRoot, customPath, pattern);
    const files = await fg(fullPattern, { onlyFiles: true });
    return files.map((f) => path.relative(pluginRoot, f));
  } else {
    // Array → explicit paths (normalize to remove leading ./)
    return customPath.map((p) => p.replace(/^\.\//, ''));
  }
}

/**
 * Normalize path (remove leading ./)
 */
export function normalizePath(p: string): string {
  return p.replace(/^\.\//, '');
}
