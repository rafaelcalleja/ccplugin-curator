import { NormalizedPluginInternalFormat } from '../types/normalized';

/**
 * Check if author is empty (all fields are empty strings)
 */
function isEmptyAuthor(author: NormalizedPluginInternalFormat['author']): boolean {
  return author.name === '' && author.email === '' && author.url === '';
}

/**
 * Remove empty fields from author object
 */
function cleanAuthor(author: NormalizedPluginInternalFormat['author']): any {
  const result: any = {};
  if (author.name !== '') result.name = author.name;
  if (author.email !== '') result.email = author.email;
  if (author.url !== '') result.url = author.url;
  return result;
}

/**
 * Group hooks by event name and matcher
 * Spec 006-reverse-transformation-rules.md:187-258
 *
 * Structure: { "EventName": [{ "matcher"?: string, "hooks": [...] }] }
 */
function groupHooksByEvent(hooks: NormalizedPluginInternalFormat['hooks']): any {
  const grouped: Record<string, any[]> = {};

  for (const hook of hooks) {
    const event = hook.event;
    const matcher = hook.matcher;

    // Remove event and matcher from the config (spec 006:192-194)
    const config: any = { ...hook };
    delete config.event;
    delete config.matcher;

    // Initialize event array if needed
    if (!grouped[event]) {
      grouped[event] = [];
    }

    // Find existing matcher group or create new one
    // Hooks with same event+matcher should be grouped together
    let matcherGroup = grouped[event].find((g: any) => {
      // Both have matcher and they match
      if (matcher !== undefined && g.matcher !== undefined) {
        return g.matcher === matcher;
      }
      // Both have no matcher
      if (matcher === undefined && g.matcher === undefined) {
        return true;
      }
      return false;
    });

    if (!matcherGroup) {
      matcherGroup = { hooks: [] };
      if (matcher !== undefined) {
        matcherGroup.matcher = matcher;
      }
      grouped[event].push(matcherGroup);
    }

    // Add hook to the matcher group's hooks array
    matcherGroup.hooks.push(config);
  }

  return grouped;
}

/**
 * Convert MCPs array to object format
 */
function mcpsToObject(mcps: NormalizedPluginInternalFormat['mcps']): any {
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

/**
 * Transform a normalized plugin back to official format
 */
export function reverseTransform(normalized: NormalizedPluginInternalFormat): any {
  const output: any = {};

  // 1. Name (always required)
  output.name = normalized.name;

  // 2. Metadata (only if non-default)
  if (normalized.version !== '0.0.0') {
    output.version = normalized.version;
  }
  if (normalized.description !== '') {
    output.description = normalized.description;
  }
  if (!isEmptyAuthor(normalized.author)) {
    output.author = cleanAuthor(normalized.author);
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
    output.commands = normalized.commands.map(p => p.startsWith('./') ? p : `./${p}`);
  }

  // 4. Agents (only if non-empty, add "./" prefix)
  if (normalized.agents.length > 0) {
    output.agents = normalized.agents.map(p => p.startsWith('./') ? p : `./${p}`);
  }

  // 5. Skills (only if non-empty, add "./" prefix)
  if (normalized.skills.length > 0) {
    output.skills = normalized.skills.map(p => p.startsWith('./') ? p : `./${p}`);
  }

  // 6. Hooks (group by event, only if non-empty)
  if (normalized.hooks.length > 0) {
    output.hooks = groupHooksByEvent(normalized.hooks);
  }

  // 7. MCPs (use name as key, only if non-empty)
  if (normalized.mcps.length > 0) {
    output.mcpServers = mcpsToObject(normalized.mcps);
  }

  return output;
}

/**
 * Merge multiple normalized plugins into a single curated plugin
 * This combines selected components from different plugins
 */
export function mergeNormalizedPlugins(
  plugins: NormalizedPluginInternalFormat[],
  name: string = 'curated-plugin'
): NormalizedPluginInternalFormat {
  const merged: NormalizedPluginInternalFormat = {
    name,
    source: '', // Not applicable for merged plugin
    version: '0.0.0',
    description: '',
    author: { name: '', email: '', url: '' },
    homepage: '',
    repository: '',
    license: '',
    keywords: [],
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcps: [],
  };

  for (const plugin of plugins) {
    merged.commands.push(...plugin.commands);
    merged.agents.push(...plugin.agents);
    merged.skills.push(...plugin.skills);
    merged.hooks.push(...plugin.hooks);
    merged.mcps.push(...plugin.mcps);
  }

  // Deduplicate arrays
  merged.commands = [...new Set(merged.commands)];
  merged.agents = [...new Set(merged.agents)];
  merged.skills = [...new Set(merged.skills)];

  // Note: hooks and mcps may have duplicates with different configs
  // This is intentional - the user may want multiple hooks for the same event

  return merged;
}
