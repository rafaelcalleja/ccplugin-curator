import * as path from 'path';
import { ClaudeCodePlugin } from '../types/plugin.js';
import { NormalizedPlugin } from '../types/normalized.js';
import {
  discoverCommands,
  discoverAgents,
  discoverSkills,
  loadHooks,
  loadMcpServers,
  resolveCustomPaths,
  normalizePath,
} from './discovery.js';

/**
 * Transform official plugin format to normalized format
 * Applies all rules from docs/spec/005-transformation-rules.md
 */
export async function normalizePlugin(
  pluginRoot: string,
  pluginJson: ClaudeCodePlugin,
): Promise<NormalizedPlugin> {
  const absoluteRoot = path.resolve(pluginRoot);

  // 1. Auto-discovery (always happens if default directories exist)
  const autoCommands = await discoverCommands(absoluteRoot);
  const autoAgents = await discoverAgents(absoluteRoot);
  const autoSkills = await discoverSkills(absoluteRoot);

  // 2. Resolve custom paths (if defined)
  const customCommands = await resolveCustomPaths(
    absoluteRoot,
    pluginJson.commands,
    '**/*.md',
  );
  const customAgents = await resolveCustomPaths(
    absoluteRoot,
    pluginJson.agents,
    '**/*.md',
  );
  const customSkills = await resolveCustomPaths(
    absoluteRoot,
    pluginJson.skills,
    '',
  );

  // 3. COMPLEMENT: custom paths COMPLEMENT auto-discovery (not replace)
  const allCommands = [...new Set([...customCommands, ...autoCommands])];
  const allAgents = [...new Set([...customAgents, ...autoAgents])];
  const allSkills = [...new Set([...customSkills, ...autoSkills])];

  // 4. Load hooks and MCPs
  const hooks = await loadHooks(
    absoluteRoot,
    typeof pluginJson.hooks === 'string' ? pluginJson.hooks : undefined,
  );
  const mcps = await loadMcpServers(
    absoluteRoot,
    typeof pluginJson.mcpServers === 'string' ? pluginJson.mcpServers : undefined,
  );

  // 5. Handle inline hooks/mcps
  if (typeof pluginJson.hooks === 'object' && pluginJson.hooks !== null) {
    // Inline hooks object → normalize
    const inlineHooks = normalizeHooksObject(pluginJson.hooks);
    hooks.push(...inlineHooks);
  }

  if (typeof pluginJson.mcpServers === 'object' && pluginJson.mcpServers !== null) {
    // Inline MCP object → normalize
    const inlineMcps = normalizeMcpsObject(pluginJson.mcpServers);
    mcps.push(...inlineMcps);
  }

  // 6. Construct normalized format
  const normalized: NormalizedPlugin = {
    name: pluginJson.name || path.basename(absoluteRoot),
    source: absoluteRoot,
    version: pluginJson.version || '0.0.0',
    description: pluginJson.description || '',
    author: {
      name: pluginJson.author?.name || '',
      email: pluginJson.author?.email || '',
      url: pluginJson.author?.url || '',
    },
    homepage: pluginJson.homepage || '',
    repository: pluginJson.repository || '',
    license: pluginJson.license || '',
    keywords: pluginJson.keywords || [],
    commands: allCommands.map(normalizePath),
    agents: allAgents.map(normalizePath),
    skills: allSkills.map(normalizePath),
    hooks: hooks,
    mcps: mcps,
  };

  return normalized;
}

/**
 * Normalize inline hooks object to flat array
 */
function normalizeHooksObject(hooksObj: Record<string, any>): any[] {
  const result: any[] = [];

  for (const [event, configs] of Object.entries(hooksObj)) {
    if (!Array.isArray(configs)) continue;

    for (const config of configs) {
      const matcher = config.matcher;
      const hooks = config.hooks || [];

      for (const hook of hooks) {
        result.push({
          event,
          ...(matcher && { matcher }),
          ...hook,
        });
      }
    }
  }

  return result;
}

/**
 * Normalize inline MCPs object to flat array
 */
function normalizeMcpsObject(mcpsObj: Record<string, any>): any[] {
  const result: any[] = [];

  for (const [name, config] of Object.entries(mcpsObj)) {
    result.push({
      name,
      ...config,
      env: config.env || {},
    });
  }

  return result;
}
