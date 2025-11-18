import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * MCP transformation for forward direction (Official → Normalized)
 *
 * Implements rules from Spec 005:
 * - Convert object (with names as keys) to array
 * - Extract name from key and add as field
 * - Preserve all config fields
 * - Add empty env object if not present
 */

export interface NormalizedMcp {
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

interface McpServersConfig {
  mcpServers?: {
    [name: string]: McpConfig;
  };
  [key: string]: unknown;
}

/**
 * Transform MCP servers from official to normalized format
 *
 * Handles both:
 * - File path: loads and parses JSON file
 * - Inline object: transforms directly
 *
 * @param mcpServers - MCP servers configuration (string path or inline object)
 * @param pluginDir - Absolute path to plugin directory
 * @returns Array of normalized MCP servers
 */
export async function transformMcps(
  mcpServers: string | object | undefined,
  pluginDir: string
): Promise<NormalizedMcp[]> {
  if (!mcpServers) {
    return []; // No MCPs defined
  }

  let mcpsConfig: McpServersConfig;

  if (typeof mcpServers === 'string') {
    // Load from file
    const mcpPath = path.join(pluginDir, mcpServers);
    try {
      const content = await fs.readFile(mcpPath, 'utf-8');
      mcpsConfig = JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load MCP servers from ${mcpPath}: ${(error as Error).message}`);
      return [];
    }
  } else {
    // Inline object
    mcpsConfig = { mcpServers: mcpServers as Record<string, McpConfig> };
  }

  // Convert object to array
  return objectToArray(mcpsConfig);
}

/**
 * Convert MCP servers from object to array
 *
 * Object structure:
 * {
 *   "mcpServers": {
 *     "server-name": {
 *       "command": "...",
 *       "args": [...],
 *       "env": {...}
 *     }
 *   }
 * }
 *
 * Array structure:
 * [
 *   {
 *     "name": "server-name",
 *     "command": "...",
 *     "args": [...],
 *     "env": {...}
 *   }
 * ]
 *
 * @param config - MCP servers configuration object
 * @returns Array of normalized MCP servers
 */
function objectToArray(config: McpServersConfig): NormalizedMcp[] {
  const result: NormalizedMcp[] = [];

  const servers = config.mcpServers || {};

  for (const [name, serverConfig] of Object.entries(servers)) {
    const normalized: NormalizedMcp = {
      ...serverConfig, // Preserve additional fields
      name,
      command: serverConfig.command
    };

    // Ensure env exists (default to empty object)
    if (!normalized.env) {
      normalized.env = {};
    }

    result.push(normalized);
  }

  return result;
}
