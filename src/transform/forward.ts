import { ClaudeCodePluginConfiguration } from '../types/plugin';
import { NormalizedPluginConfiguration } from '../types/normalized';
import { normalizePath } from '../loader/pathResolver';
import { transformHooks } from './forwardHooks';
import { transformMcps } from './forwardMcps';

/**
 * Forward transformation: Official → Normalized
 *
 * Implements transformation rules from Spec 005:
 * - Apply metadata defaults
 * - Normalize all paths (remove leading ./)
 * - Convert hooks from nested to flat array
 * - Convert MCPs from object to array
 * - Ensure all arrays are never undefined
 */

/**
 * Transform plugin from official to normalized format
 *
 * @param official - Official plugin configuration
 * @param pluginDir - Absolute path to plugin directory
 * @returns Normalized plugin configuration
 */
export async function transformToNormalized(
  official: ClaudeCodePluginConfiguration,
  pluginDir: string
): Promise<NormalizedPluginConfiguration> {
  // Transform commands to array
  const commands = normalizeToArray(official.commands).map(normalizePath);

  // Transform agents to array
  const agents = normalizeToArray(official.agents).map(normalizePath);

  // Transform skills to array
  const skills = normalizeToArray(official.skills).map(normalizePath);

  // Transform hooks
  const hooks = await transformHooks(official.hooks, pluginDir);

  // Transform MCPs
  const mcps = await transformMcps(official.mcpServers, pluginDir);

  // Build normalized configuration with defaults
  const normalized: NormalizedPluginConfiguration = {
    name: official.name || 'unnamed-plugin',
    source: pluginDir,
    version: official.version || '0.0.0',
    description: official.description || '',
    author: {
      name: official.author?.name || '',
      email: official.author?.email || '',
      url: official.author?.url || ''
    },
    homepage: official.homepage || '',
    repository: official.repository || '',
    license: official.license || '',
    keywords: official.keywords || [],
    commands,
    agents,
    skills,
    hooks,
    mcps
  };

  return normalized;
}

/**
 * Convert a value to array
 *
 * Handles:
 * - undefined → []
 * - string → [string]
 * - array → array
 *
 * @param value - Value to normalize
 * @returns Array
 */
function normalizeToArray(value: string | string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  if (typeof value === 'string') {
    return [value];
  }
  return value;
}
