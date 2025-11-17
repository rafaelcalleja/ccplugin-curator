/**
 * Plugin Normalizer
 *
 * Transforms official plugin format to normalized internal format.
 * Integrates all loaders and auto-discovery to produce complete normalized plugin.
 *
 * Spec: docs/spec/001-normalization-protocol.md
 * Spec: docs/spec/005-transformation-rules.md
 */

import { basename } from 'path';
import { getAllCommands, getAllAgents, getAllSkills } from './auto-discovery.js';
import { loadHooks, NormalizedHook } from './hooks-loader.js';
import { loadMcps, NormalizedMcp } from './mcp-loader.js';
import type { NormalizedPluginFormatInternal } from '../types/normalized.js';

/**
 * Author information (normalized)
 */
interface Author {
  name: string;
  email: string;
  url: string;
}

/**
 * Normalize plugin from official format to internal format
 *
 * Applies all transformation rules:
 * - Metadata defaults
 * - Auto-discovery + custom paths merging
 * - Hooks normalization
 * - MCPs normalization
 * - Path normalization
 *
 * @param pluginData - Official plugin.json data
 * @param pluginDir - Absolute path to plugin directory
 * @returns Normalized plugin
 */
export async function normalizePlugin(
  pluginData: any,
  pluginDir: string
): Promise<NormalizedPluginFormatInternal> {
  // Name: use provided or directory basename
  const name = pluginData.name || basename(pluginDir);

  // Version: default to "0.0.0"
  const version = pluginData.version || '0.0.0';

  // Description: default to empty string
  const description = pluginData.description || '';

  // Author: normalize to object with all fields
  const author: Author = {
    name: pluginData.author?.name || '',
    email: pluginData.author?.email || '',
    url: pluginData.author?.url || '',
  };

  // Homepage: default to empty string
  const homepage = pluginData.homepage || '';

  // Repository: default to empty string
  const repository = pluginData.repository || '';

  // License: default to empty string
  const license = pluginData.license || '';

  // Keywords: default to empty array
  const keywords = pluginData.keywords || [];

  // Commands: auto-discovery + custom paths
  const commands = await getAllCommands(pluginDir, pluginData.commands);

  // Agents: auto-discovery + custom paths
  const agents = await getAllAgents(pluginDir, pluginData.agents);

  // Skills: auto-discovery + custom paths
  const skills = await getAllSkills(pluginDir, pluginData.skills);

  // Hooks: load and normalize
  const hooks: NormalizedHook[] = loadHooks(pluginDir, pluginData.hooks);

  // MCPs: load and normalize
  const mcps: NormalizedMcp[] = loadMcps(pluginDir, pluginData.mcpServers);

  return {
    name,
    source: pluginDir,
    version,
    description,
    author,
    homepage,
    repository,
    license,
    keywords,
    commands,
    agents,
    skills,
    hooks,
    mcps,
  };
}

/**
 * Normalize multiple plugins
 *
 * @param pluginsData - Array of { data, pluginDir } objects
 * @returns Array of normalized plugins
 */
export async function normalizePlugins(
  pluginsData: Array<{ data: any; pluginDir: string }>
): Promise<NormalizedPluginFormatInternal[]> {
  const normalized: NormalizedPluginFormatInternal[] = [];

  for (const { data, pluginDir } of pluginsData) {
    const normalizedPlugin = await normalizePlugin(data, pluginDir);
    normalized.push(normalizedPlugin);
  }

  return normalized;
}
