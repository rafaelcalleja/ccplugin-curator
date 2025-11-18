/**
 * Reverse transformation from normalized format to official plugin format
 * Based on 006-reverse-transformation-rules.md
 */

import type { NormalizedPluginFormat } from '../types/normalized.js';
import type { OfficialPluginFormat } from './normalize.js';

/**
 * Convert normalized plugin to official plugin.json format
 * Omits default values and empty arrays for minimal output
 * @param normalized Normalized plugin data
 */
export function officialize(
  normalized: NormalizedPluginFormat
): OfficialPluginFormat {
  const output: OfficialPluginFormat = {};

  // 1. Name (required)
  output.name = normalized.name;

  // 2. Metadata (only if non-default)
  if (normalized.version !== '0.0.0') {
    output.version = normalized.version;
  }
  if (normalized.description !== '') {
    output.description = normalized.description;
  }
  if (!isEmptyAuthor(normalized.author)) {
    output.author = removeEmptyFields(normalized.author);
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

  // 3. Commands (only if non-empty, add "./" prefix)
  if (normalized.commands.length > 0) {
    output.commands = normalized.commands.map(addDotSlashPrefix);
  }

  // 4. Agents (only if non-empty, add "./" prefix)
  if (normalized.agents.length > 0) {
    output.agents = normalized.agents.map(addDotSlashPrefix);
  }

  // 5. Skills (only if non-empty, add "./" prefix)
  if (normalized.skills.length > 0) {
    output.skills = normalized.skills.map(addDotSlashPrefix);
  }

  // 6. Hooks (group by event)
  if (normalized.hooks.length > 0) {
    output.hooks = groupHooksByEvent(normalized.hooks);
  }

  // 7. MCPs (use name as key)
  if (normalized.mcps.length > 0) {
    output.mcpServers = mcpsToObject(normalized.mcps);
  }

  return output;
}

/**
 * Group hooks by event and matcher
 * Transform script paths to ${CLAUDE_PLUGIN_ROOT}/ (spec 006 lines 191-208)
 */
function groupHooksByEvent(hooks: NormalizedPluginFormat['hooks']): object {
  const grouped: Record<string, any[]> = {};

  for (const hook of hooks) {
    const event = hook.event;
    const { event: _, ...hookWithoutEvent } = hook;

    if (!grouped[event]) {
      grouped[event] = [];
    }

    // Find existing matcher group or create new one
    const matcher = hook.matcher;
    let matcherGroup = grouped[event].find(
      (g) => g.matcher === matcher || (!g.matcher && !matcher)
    );

    if (!matcherGroup) {
      matcherGroup = {
        ...(matcher ? { matcher } : {}),
        hooks: [],
      };
      grouped[event].push(matcherGroup);
    }

    // Remove event and matcher from hook config, transform command paths
    const { matcher: _m, ...hookConfig } = hookWithoutEvent;

    // Transform hook command paths to ${CLAUDE_PLUGIN_ROOT}/ (spec 006 lines 191-208)
    if (hookConfig.type === 'command' && hookConfig.command) {
      hookConfig.command = transformHookCommandPath(hookConfig.command);
    }

    matcherGroup.hooks.push(hookConfig);
  }

  return grouped;
}

/**
 * Transform hook command path to use ${CLAUDE_PLUGIN_ROOT}
 * Spec 006 lines 191-208, spec 007 lines 272-283
 */
function transformHookCommandPath(command: string): string {
  // Check if it's a script file path (relative path with script extension)
  if (command.match(/^[^/].*\.(sh|bash|py|js|ts|rb|pl)$/)) {
    // Already has ${CLAUDE_PLUGIN_ROOT}? Return as-is
    if (command.includes('${CLAUDE_PLUGIN_ROOT}')) {
      return command;
    }
    // Transform to use ${CLAUDE_PLUGIN_ROOT}/
    return `\${CLAUDE_PLUGIN_ROOT}/${command}`;
  }

  // Not a script file, return as-is
  return command;
}

/**
 * Convert MCPs array to object keyed by name
 */
function mcpsToObject(
  mcps: NormalizedPluginFormat['mcps']
): Record<string, any> {
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

/**
 * Check if author has all empty fields
 */
function isEmptyAuthor(author: {
  name: string;
  email: string;
  url: string;
}): boolean {
  return author.name === '' && author.email === '' && author.url === '';
}

/**
 * Remove empty string fields from author object
 */
function removeEmptyFields(author: {
  name: string;
  email: string;
  url: string;
}): object {
  const result: Record<string, string> = {};
  if (author.name !== '') result.name = author.name;
  if (author.email !== '') result.email = author.email;
  if (author.url !== '') result.url = author.url;
  return result;
}

/**
 * Add "./" prefix to path if not already present
 */
function addDotSlashPrefix(path: string): string {
  return path.startsWith('./') ? path : `./${path}`;
}
