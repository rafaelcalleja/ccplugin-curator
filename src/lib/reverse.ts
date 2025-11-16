import type { NormalizedPluginInternalFormat } from '../types/normalized.js';
import type { ClaudeCodePluginOfficialFormat } from '../types/plugin.js';

/**
 * Transform normalized plugin back to official format
 * Implements transformation rules from 006-reverse-transformation-rules.md
 */
export function reverseTransform(
  normalized: NormalizedPluginInternalFormat
): ClaudeCodePluginOfficialFormat {
  const result: any = {};

  // 1. Name (required)
  result.name = normalized.name;

  // 2. Metadata (only if non-default)
  if (normalized.version !== '0.0.0') {
    result.version = normalized.version;
  }
  if (normalized.description !== '') {
    result.description = normalized.description;
  }
  if (!isEmptyAuthor(normalized.author)) {
    result.author = removeEmptyAuthorFields(normalized.author);
  }
  if (normalized.homepage !== '') {
    result.homepage = normalized.homepage;
  }
  if (normalized.repository !== '') {
    result.repository = normalized.repository;
  }
  if (normalized.license !== '') {
    result.license = normalized.license;
  }
  if (normalized.keywords.length > 0) {
    result.keywords = normalized.keywords;
  }

  // 3. Commands (only if non-empty, add "./" prefix)
  if (normalized.commands.length > 0) {
    result.commands = normalized.commands.map(addLeadingDot);
  }

  // 4. Agents (only if non-empty, add "./" prefix)
  if (normalized.agents.length > 0) {
    result.agents = normalized.agents.map(addLeadingDot);
  }

  // 5. Skills (only if non-empty, add "./" prefix)
  if (normalized.skills.length > 0) {
    result.skills = normalized.skills.map(addLeadingDot);
  }

  // 6. Hooks (group by event)
  if (normalized.hooks.length > 0) {
    result.hooks = groupHooksByEvent(normalized.hooks);
  }

  // 7. MCPs (use name as key)
  if (normalized.mcps.length > 0) {
    result.mcpServers = mcpsToObject(normalized.mcps);
  }

  return result as ClaudeCodePluginOfficialFormat;
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
function removeEmptyAuthorFields(author: {
  name: string;
  email: string;
  url: string;
}): any {
  const result: any = {};
  if (author.name !== '') result.name = author.name;
  if (author.email !== '') result.email = author.email;
  if (author.url !== '') result.url = author.url;
  return result;
}

/**
 * Add "./" prefix to path if not present
 */
function addLeadingDot(p: string): string {
  return p.startsWith('./') ? p : `./${p}`;
}

/**
 * Group hooks by event and matcher
 * Converts flat array to nested object structure
 */
function groupHooksByEvent(hooks: any[]): any {
  const grouped: any = {};

  for (const hook of hooks) {
    const event = hook.event;
    const matcher = hook.matcher;

    // Remove event and matcher from hook config
    const config: any = { ...hook };
    delete config.event;
    delete config.matcher;

    // Initialize event array if needed
    if (!grouped[event]) {
      grouped[event] = [];
    }

    // Find existing matcher group or create new one
    let matcherGroup = grouped[event].find((g: any) => {
      if (matcher && g.matcher === matcher) return true;
      if (!matcher && !g.matcher) return true;
      return false;
    });

    if (!matcherGroup) {
      matcherGroup = {
        ...(matcher && { matcher }),
        hooks: [],
      };
      grouped[event].push(matcherGroup);
    }

    // Add hook to group
    matcherGroup.hooks.push(config);
  }

  return grouped;
}

/**
 * Convert MCP array to object with name as key
 */
function mcpsToObject(mcps: any[]): any {
  const result: any = {};

  for (const mcp of mcps) {
    const name = mcp.name;
    const config: any = { ...mcp };
    delete config.name;

    // Omit empty env objects
    if (config.env && Object.keys(config.env).length === 0) {
      delete config.env;
    }

    result[name] = config;
  }

  return result;
}
