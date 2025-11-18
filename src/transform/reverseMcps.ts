/**
 * MCP grouping for reverse direction (Normalized → Official)
 *
 * Implements rules from Spec 006:
 * - Extract name field to use as object key
 * - Remove name field from config object
 * - Create nested structure { "serverName": {config} }
 * - Omit empty env objects
 */

interface NormalizedMcp {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  [key: string]: unknown;
}

interface McpConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  [key: string]: unknown;
}

type McpServers = {
  [name: string]: McpConfig;
};

/**
 * Group MCPs from array to object
 *
 * Array:
 * [
 *   { name: "server", command: "...", args: [...], env: {...} }
 * ]
 *
 * Object:
 * {
 *   "server": {
 *     command: "...",
 *     args: [...],
 *     env: {...}  // Omitted if empty
 *   }
 * }
 *
 * @param mcps - Array of normalized MCPs
 * @returns MCPs as object or undefined if empty
 */
export function groupMcps(mcps: NormalizedMcp[]): McpServers | undefined {
  if (mcps.length === 0) {
    return undefined; // Omit empty MCPs
  }

  const result: McpServers = {};

  for (const mcp of mcps) {
    // Remove name field
    const { name, ...config } = mcp;

    // Omit empty env object
    if (config.env && Object.keys(config.env).length === 0) {
      delete config.env;
    }

    result[name] = config as McpConfig;
  }

  return result;
}
