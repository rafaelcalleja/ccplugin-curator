/**
 * Reverse Transformer
 *
 * Transforms normalized internal format back to official Claude Code plugin format.
 * Integrates all reverse transformation modules.
 *
 * Spec: docs/spec/006-reverse-transformation-rules.md
 */

import type { NormalizedPluginFormatInternal } from '../../types/normalized.js';
import { transformMetadata } from './metadata.js';
import { transformCommands, transformAgents, transformSkills } from './components.js';
import { transformHooks } from './hooks.js';
import { transformMcps } from './mcps.js';

/**
 * Official plugin.json format (output)
 */
export interface OfficialPluginJson {
  name: string;
  version?: string;
  description?: string;
  author?: {
    name?: string;
    email?: string;
    url?: string;
  };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  commands?: string[];
  agents?: string[];
  skills?: string[];
  hooks?: any; // Nested hooks object
  mcpServers?: any; // Nested MCP servers object
}

/**
 * Transform normalized plugin to official format
 *
 * Applies all reverse transformation rules:
 * - Omit metadata with default values
 * - Omit empty component arrays
 * - Add "./" prefix to component paths
 * - Transform hooks to nested object
 * - Transform MCPs to nested object
 * - Omit 'source' field (internal only)
 *
 * @param normalized - Normalized plugin format
 * @returns Official plugin.json format
 */
export function reverseTransform(normalized: NormalizedPluginFormatInternal): OfficialPluginJson {
  // Transform metadata (includes name, omits defaults)
  const metadata = transformMetadata(normalized);

  // Transform components (omit empty, add "./" prefix)
  const commands = transformCommands(normalized.commands);
  const agents = transformAgents(normalized.agents);
  const skills = transformSkills(normalized.skills);

  // Transform hooks (flat array → nested object)
  const hooks = transformHooks(normalized.hooks);

  // Transform MCPs (flat array → nested object)
  const mcpServers = transformMcps(normalized.mcps);

  // Build result object
  const result: OfficialPluginJson = {
    ...metadata,
  };

  // Add optional fields only if defined
  if (commands) result.commands = commands;
  if (agents) result.agents = agents;
  if (skills) result.skills = skills;
  if (hooks) result.hooks = hooks;
  if (mcpServers) result.mcpServers = mcpServers;

  return result;
}

/**
 * Transform multiple normalized plugins to official format
 *
 * @param normalized - Array of normalized plugins
 * @returns Array of official plugin.json formats
 */
export function reverseTransformMultiple(
  normalized: NormalizedPluginFormatInternal[]
): OfficialPluginJson[] {
  return normalized.map(reverseTransform);
}
