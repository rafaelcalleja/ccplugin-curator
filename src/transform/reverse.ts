import { ClaudeCodePluginConfiguration } from '../types/plugin';
import { NormalizedPluginConfiguration } from '../types/normalized';
import { addPathPrefix } from '../loader/pathResolver';
import { groupHooks } from './reverseHooks';
import { groupMcps } from './reverseMcps';

/**
 * Reverse transformation: Normalized → Official
 *
 * Implements transformation rules from Spec 006:
 * - Omit default values (minimalism approach)
 * - Add ./ prefix to paths
 * - Group hooks by event and matcher
 * - Group MCPs as object with name as key
 * - Omit empty arrays
 */

/**
 * Transform plugin from normalized to official format
 *
 * @param normalized - Normalized plugin configuration
 * @returns Official plugin configuration (minimal)
 */
export function transformToOfficial(
  normalized: NormalizedPluginConfiguration
): ClaudeCodePluginConfiguration {
  const official: ClaudeCodePluginConfiguration = {};

  // Name - always include
  official.name = normalized.name;

  // Commands - omit if empty, add ./ prefix
  if (normalized.commands.length > 0) {
    official.commands = normalized.commands.map(addPathPrefix);
  }

  // Agents - omit if empty, add ./ prefix
  if (normalized.agents.length > 0) {
    official.agents = normalized.agents.map(addPathPrefix);
  }

  // Skills - omit if empty, add ./ prefix
  if (normalized.skills.length > 0) {
    official.skills = normalized.skills.map(addPathPrefix);
  }

  // Hooks - group and omit if empty
  const groupedHooks = groupHooks(normalized.hooks);
  if (groupedHooks) {
    official.hooks = groupedHooks;
  }

  // MCPs - group and omit if empty
  const groupedMcps = groupMcps(normalized.mcps);
  if (groupedMcps) {
    official.mcpServers = groupedMcps;
  }

  // Metadata fields - only include if non-default
  if (normalized.version !== '0.0.0') {
    (official as any).version = normalized.version;
  }

  if (normalized.description !== '') {
    (official as any).description = normalized.description;
  }

  if (
    normalized.author.name !== '' ||
    normalized.author.email !== '' ||
    normalized.author.url !== ''
  ) {
    (official as any).author = normalized.author;
  }

  if (normalized.homepage !== '') {
    (official as any).homepage = normalized.homepage;
  }

  if (normalized.repository !== '') {
    (official as any).repository = normalized.repository;
  }

  if (normalized.license !== '') {
    (official as any).license = normalized.license;
  }

  if (normalized.keywords.length > 0) {
    (official as any).keywords = normalized.keywords;
  }

  return official;
}

/**
 * Check if a value is the default value
 *
 * Used to determine whether to include a field in the official format
 */
function isDefaultValue(key: string, value: any): boolean {
  const defaults: Record<string, any> = {
    version: '0.0.0',
    description: '',
    homepage: '',
    repository: '',
    license: '',
    keywords: [],
    author: { name: '', email: '', url: '' }
  };

  if (!(key in defaults)) {
    return false;
  }

  const defaultVal = defaults[key];

  // Deep equality for objects
  if (typeof defaultVal === 'object' && !Array.isArray(defaultVal)) {
    return JSON.stringify(value) === JSON.stringify(defaultVal);
  }

  // Array equality
  if (Array.isArray(defaultVal)) {
    return Array.isArray(value) && value.length === 0;
  }

  // Primitive equality
  return value === defaultVal;
}
