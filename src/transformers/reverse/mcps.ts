/**
 * Reverse MCPs Transformer
 *
 * Transforms normalized MCPs (flat array) back to official format (nested object).
 * Uses name as key, omits empty env objects.
 *
 * Spec: docs/spec/006-reverse-transformation-rules.md (Section 3.6)
 */

import type { NormalizedMcp } from '../../core/mcp-loader.js';

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
 * Transform MCPs from flat array to nested object
 *
 * Transformation steps:
 * 1. Extract 'name' field to use as object key
 * 2. Remove 'name' field from config
 * 3. Omit empty env objects
 * 4. Create nested structure
 *
 * Example:
 * [
 *   { name: "tavily", command: "npx", args: [...], env: {...} },
 *   { name: "filesystem", command: "npx", args: [...], env: {} }
 * ]
 * →
 * {
 *   "tavily": { command: "npx", args: [...], env: {...} },
 *   "filesystem": { command: "npx", args: [...] }
 * }
 *
 * @param mcps - Normalized MCPs array
 * @returns Official MCP servers configuration or undefined if empty
 */
export function transformMcps(mcps: NormalizedMcp[]): OfficialMcpServers | undefined {
  if (mcps.length === 0) {
    return undefined;
  }

  const result: OfficialMcpServers = {};

  for (const mcp of mcps) {
    const { name, ...config } = mcp;

    // Omit empty env objects
    if (config.env && Object.keys(config.env).length === 0) {
      delete config.env;
    }

    // Omit empty args arrays
    if (config.args && config.args.length === 0) {
      delete config.args;
    }

    result[name] = config;
  }

  return result;
}
