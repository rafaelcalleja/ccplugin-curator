/**
 * MCP Loader
 *
 * Loads MCP server configurations from file paths or inline objects.
 * Transforms nested MCP structure into flat array format.
 *
 * Spec: docs/spec/001-normalization-protocol.md (Section 3, MCPs)
 * Spec: docs/spec/005-transformation-rules.md (Section 2.4)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Normalized MCP format (flat array)
 */
export interface NormalizedMcp {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  [key: string]: any; // Preserve additional fields
}

/**
 * Official MCP servers format (nested object)
 */
interface OfficialMcpServers {
  [serverName: string]: {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    [key: string]: any;
  };
}

/**
 * Load MCP servers from file path
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param filePath - Relative path to MCP file (e.g., "./.mcp.json")
 * @returns Normalized MCPs array
 * @throws Error if file not found or invalid JSON
 */
export function loadMcpsFromFile(
  pluginDir: string,
  filePath: string
): NormalizedMcp[] {
  // Remove leading "./"
  const cleanPath = filePath.replace(/^\.\//, '');
  const fullPath = join(pluginDir, cleanPath);

  if (!existsSync(fullPath)) {
    throw new Error(`MCP file not found: ${fullPath}`);
  }

  let content: any;
  try {
    const fileContent = readFileSync(fullPath, 'utf-8');
    content = JSON.parse(fileContent);
  } catch (err: any) {
    throw new Error(`Failed to parse MCP file: ${err.message}`);
  }

  // Extract mcpServers from wrapper or use directly
  const mcpServers = content.mcpServers || content;

  return normalizeMcps(mcpServers);
}

/**
 * Normalize MCPs from nested object to flat array
 *
 * Transformation:
 * {
 *   "tavily": { command: "npx", args: [...], env: {...} },
 *   "filesystem": { command: "npx", args: [...] }
 * }
 * →
 * [
 *   { name: "tavily", command: "npx", args: [...], env: {...} },
 *   { name: "filesystem", command: "npx", args: [...], env: {} }
 * ]
 *
 * @param mcpServers - Nested MCP servers configuration
 * @returns Flat array of normalized MCPs
 */
export function normalizeMcps(
  mcpServers: OfficialMcpServers
): NormalizedMcp[] {
  const normalized: NormalizedMcp[] = [];

  for (const [serverName, config] of Object.entries(mcpServers)) {
    const normalizedMcp: NormalizedMcp = {
      ...config, // Preserve all additional fields first
      name: serverName, // Override with name
    };

    // Ensure env exists (default to empty object)
    if (!normalizedMcp.env) {
      normalizedMcp.env = {};
    }

    // Ensure args exists (default to empty array) if not present
    if (!normalizedMcp.args) {
      normalizedMcp.args = [];
    }

    normalized.push(normalizedMcp);
  }

  return normalized;
}

/**
 * Load MCPs from plugin.json value
 *
 * Handles:
 * - String: file path to .mcp.json
 * - Object: inline MCP servers configuration
 * - Undefined: try default location (.mcp.json)
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param mcpValue - Value from plugin.json
 * @returns Normalized MCPs array
 */
export function loadMcps(
  pluginDir: string,
  mcpValue?: string | object
): NormalizedMcp[] {
  // String → load from file
  if (typeof mcpValue === 'string') {
    return loadMcpsFromFile(pluginDir, mcpValue);
  }

  // Object → normalize inline config
  if (typeof mcpValue === 'object' && mcpValue !== null) {
    return normalizeMcps(mcpValue as OfficialMcpServers);
  }

  // Undefined → try default location
  const defaultPath = join(pluginDir, '.mcp.json');
  if (existsSync(defaultPath)) {
    try {
      return loadMcpsFromFile(pluginDir, './.mcp.json');
    } catch (err) {
      // Ignore error, return empty array
    }
  }

  // No MCPs found
  return [];
}
