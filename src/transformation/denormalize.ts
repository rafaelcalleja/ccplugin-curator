import { ClaudeCodePluginManifest } from '../types/plugin';
import { ClaudeCodeNormalizedPlugin } from '../types/normalized';

/**
 * Transforms a plugin from normalized internal format to official Claude Code format
 * Following spec: 006-reverse-transformation-rules.md
 */
export function denormalizePlugin(
  normalized: ClaudeCodeNormalizedPlugin
): ClaudeCodePluginManifest {
  const output: ClaudeCodePluginManifest = {
    name: normalized.name
  };

  // Metadata - only include if non-default
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
    output.keywords = normalized.keywords as any;
  }

  // Commands - only if non-empty, add "./" prefix
  if (normalized.commands.length > 0) {
    output.commands = normalized.commands.map(p => addDotSlash(p));
  }

  // Agents - only if non-empty, add "./" prefix
  if (normalized.agents.length > 0) {
    output.agents = normalized.agents.map(p => addDotSlash(p));
  }

  // Note: Skills are not part of official plugin.json schema (auto-discovery only)
  // So we don't include them in the output

  // Hooks - group by event
  if (normalized.hooks.length > 0) {
    output.hooks = denormalizeHooks(normalized.hooks);
  }

  // MCPs - use name as key
  if (normalized.mcps.length > 0) {
    output.mcpServers = denormalizeMcps(normalized.mcps);
  }

  return output;
}

/**
 * Check if author object has all empty fields
 */
function isEmptyAuthor(author: { name: string; email: string; url: string }): boolean {
  return author.name === '' && author.email === '' && author.url === '';
}

/**
 * Remove empty fields from author object
 */
function removeEmptyAuthorFields(author: { name: string; email: string; url: string }): any {
  const result: any = {};
  if (author.name !== '') result.name = author.name;
  if (author.email !== '') result.email = author.email;
  if (author.url !== '') result.url = author.url;
  return result;
}

/**
 * Add leading "./" to path if not present
 */
function addDotSlash(p: string): string {
  return p.startsWith('./') ? p : `./${p}`;
}

/**
 * Denormalize hooks: array → nested object by event
 */
function denormalizeHooks(hooks: any[]): Record<string, any> {
  const grouped: Record<string, Map<string, any[]>> = {};

  for (const hook of hooks) {
    const event = hook.event;
    const matcher = hook.matcher || '__NO_MATCHER__';

    if (!grouped[event]) {
      grouped[event] = new Map();
    }

    if (!grouped[event].has(matcher)) {
      grouped[event].set(matcher, []);
    }

    // Extract config without event/matcher/id
    const config = { ...hook.config };
    grouped[event].get(matcher)!.push(config);
  }

  // Convert to official format
  const result: Record<string, any> = {};

  for (const [event, matcherMap] of Object.entries(grouped)) {
    result[event] = [];

    for (const [matcher, hookConfigs] of matcherMap.entries()) {
      const entry: any = {
        hooks: hookConfigs
      };

      if (matcher !== '__NO_MATCHER__') {
        entry.matcher = matcher;
      }

      result[event].push(entry);
    }
  }

  return result;
}

/**
 * Denormalize MCPs: array → object with name as key
 */
function denormalizeMcps(mcps: any[]): Record<string, any> {
  const result: Record<string, any> = {};

  for (const mcp of mcps) {
    const config = { ...mcp.config };

    // Omit empty env objects
    if (config.env && Object.keys(config.env).length === 0) {
      delete config.env;
    }

    result[mcp.name] = config;
  }

  return result;
}
