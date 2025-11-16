/**
 * Plugin Denormalization Module
 * Transforms internal normalized format back to official Claude Code plugin format
 * Implements: docs/spec/006-reverse-transformation-rules.md
 */

import type { PluginJson } from '../types/plugin';
import type { NormalizedPlugin, Hook, Mcp } from '../types/normalized';

/**
 * Denormalize a plugin from internal format to official format
 */
export function denormalizePlugin(normalized: NormalizedPlugin): PluginJson {
  const output: PluginJson = {};

  // Name (required)
  output.name = normalized.name;

  // Metadata (only if non-default)
  if (normalized.version !== '0.0.0') {
    output.version = normalized.version;
  }

  if (normalized.description !== '') {
    output.description = normalized.description;
  }

  if (!isEmptyAuthor(normalized.author)) {
    output.author = removeEmptyAuthorFields(normalized.author);
  }

  if (normalized.homepage !== '') {
    output.homepage = normalized.homepage;
  }

  if (normalized.repository !== '') {
    output.repository = normalized.repository;
  }

  if (normalized.license !== '') {
    output.license = normalized.license;
  }

  if (normalized.keywords.length > 0) {
    output.keywords = normalized.keywords;
  }

  // Commands (add "./" prefix, omit if empty)
  if (normalized.commands.length > 0) {
    output.commands = normalized.commands.map(addDotSlashPrefix);
  }

  // Agents (add "./" prefix, omit if empty)
  if (normalized.agents.length > 0) {
    output.agents = normalized.agents.map(addDotSlashPrefix);
  }

  // Skills (add "./" prefix, omit if empty)
  if (normalized.skills.length > 0) {
    output.skills = normalized.skills.map(addDotSlashPrefix);
  }

  // Hooks (group by event, omit if empty)
  if (normalized.hooks.length > 0) {
    output.hooks = groupHooksByEvent(normalized.hooks);
  }

  // MCPs (use name as key, omit if empty)
  if (normalized.mcps.length > 0) {
    output.mcpServers = mcpsToObject(normalized.mcps);
  }

  return output;
}

/**
 * Check if author object is empty
 */
function isEmptyAuthor(author: { name: string; email: string; url: string }): boolean {
  return author.name === '' && author.email === '' && author.url === '';
}

/**
 * Remove empty fields from author object
 */
function removeEmptyAuthorFields(author: {
  name: string;
  email: string;
  url: string;
}): Partial<{ name: string; email: string; url: string }> {
  const result: Partial<{ name: string; email: string; url: string }> = {};

  if (author.name !== '') result.name = author.name;
  if (author.email !== '') result.email = author.email;
  if (author.url !== '') result.url = author.url;

  return result;
}

/**
 * Add "./" prefix to path if not already present
 */
function addDotSlashPrefix(p: string): string {
  return p.startsWith('./') ? p : `./${p}`;
}

/**
 * Group hooks by event field
 */
function groupHooksByEvent(hooks: Hook[]): Record<string, any[]> {
  const grouped: Record<string, Map<string, any[]>> = {};

  for (const hook of hooks) {
    const event = hook.event;
    const matcher = hook.matcher || '__no_matcher__';

    // Remove event and matcher from config
    const { event: _, matcher: __, ...config } = hook;

    // Initialize event group
    if (!grouped[event]) {
      grouped[event] = new Map();
    }

    // Initialize matcher group
    if (!grouped[event].has(matcher)) {
      grouped[event].set(matcher, []);
    }

    // Add hook to group
    grouped[event].get(matcher)!.push(config);
  }

  // Convert to output format
  const result: Record<string, any[]> = {};

  for (const [event, matcherMap] of Object.entries(grouped)) {
    result[event] = [];

    for (const [matcher, hooksList] of matcherMap.entries()) {
      const entry: any = {
        hooks: hooksList,
      };

      if (matcher !== '__no_matcher__') {
        entry.matcher = matcher;
      }

      result[event].push(entry);
    }
  }

  return result;
}

/**
 * Convert MCP array to object with name as key
 */
function mcpsToObject(mcps: Mcp[]): Record<string, any> {
  const result: Record<string, any> = {};

  for (const mcp of mcps) {
    const { name, ...config } = mcp;

    // Omit empty env objects
    if (config.env && Object.keys(config.env).length === 0) {
      delete config.env;
    }

    result[name] = config;
  }

  return result;
}
