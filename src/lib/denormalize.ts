import { NormalizedPlugin } from '../types/normalized.js';
import { ClaudeCodePlugin } from '../types/plugin.js';

/**
 * Transform normalized format back to official plugin format
 * Applies all rules from docs/spec/006-reverse-transformation-rules.md
 */
export function denormalizePlugin(normalized: NormalizedPlugin): ClaudeCodePlugin {
  const output: ClaudeCodePlugin = {};

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
    output.commands = normalized.commands.map((p) =>
      p.startsWith('./') ? p : `./${p}`,
    );
  }

  // 4. Agents (only if non-empty, add "./" prefix)
  if (normalized.agents.length > 0) {
    output.agents = normalized.agents.map((p) => (p.startsWith('./') ? p : `./${p}`));
  }

  // 5. Skills (only if non-empty, add "./" prefix)
  if (normalized.skills.length > 0) {
    output.skills = normalized.skills.map((p) => (p.startsWith('./') ? p : `./${p}`));
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
 */
function groupHooksByEvent(hooks: any[]): Record<string, any[]> {
  const grouped: Record<string, Map<string | undefined, any[]>> = {};

  for (const hook of hooks) {
    const event = hook.event;
    const matcher = hook.matcher;
    const hookConfig = { ...hook };
    delete hookConfig.event;
    delete hookConfig.matcher;

    if (!grouped[event]) {
      grouped[event] = new Map();
    }

    const matcherMap = grouped[event];
    if (!matcherMap.has(matcher)) {
      matcherMap.set(matcher, []);
    }
    matcherMap.get(matcher)!.push(hookConfig);
  }

  // Convert to official format
  const result: Record<string, any[]> = {};

  for (const [event, matcherMap] of Object.entries(grouped)) {
    result[event] = [];

    for (const [matcher, hooks] of matcherMap.entries()) {
      const config: any = { hooks };
      if (matcher !== undefined) {
        config.matcher = matcher;
      }
      result[event].push(config);
    }
  }

  return result;
}

/**
 * Convert MCPs array to object (name as key)
 */
function mcpsToObject(mcps: any[]): Record<string, any> {
  const result: Record<string, any> = {};

  for (const mcp of mcps) {
    const name = mcp.name;
    const config = { ...mcp };
    delete config.name;

    // Omit empty env objects
    if (config.env && Object.keys(config.env).length === 0) {
      delete config.env;
    }

    result[name] = config;
  }

  return result;
}

/**
 * Check if author is empty (all fields empty strings)
 */
function isEmptyAuthor(author: { name: string; email: string; url: string }): boolean {
  return author.name === '' && author.email === '' && author.url === '';
}

/**
 * Remove empty fields from author object
 */
function removeEmptyFields(author: {
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
