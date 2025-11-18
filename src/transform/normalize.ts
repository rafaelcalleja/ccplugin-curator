/**
 * Transformation from official plugin format to normalized format
 * Based on 005-transformation-rules.md
 */

import glob from 'fast-glob';
import { readFile } from 'fs/promises';
import { join, dirname, basename } from 'path';
import type { NormalizedPluginFormat } from '../types/normalized.js';

export interface OfficialPluginFormat {
  name?: string;
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
  commands?: string | string[];
  agents?: string | string[];
  skills?: string | string[];
  hooks?: string | object;
  mcpServers?: string | object;
}

/**
 * Normalize a plugin from official format to internal format
 * @param pluginPath Absolute path to plugin directory
 * @param pluginJson Content of .claude-plugin/plugin.json
 */
export async function normalize(
  pluginPath: string,
  pluginJson: OfficialPluginFormat
): Promise<NormalizedPluginFormat> {
  // 1. Name (required) - use basename if not specified
  const name = pluginJson.name ?? basename(pluginPath);

  // 2. Metadata defaults
  const version = pluginJson.version ?? '0.0.0';
  const description = pluginJson.description ?? '';
  const author = {
    name: pluginJson.author?.name ?? '',
    email: pluginJson.author?.email ?? '',
    url: pluginJson.author?.url ?? '',
  };
  const homepage = pluginJson.homepage ?? '';
  const repository = pluginJson.repository ?? '';
  const license = pluginJson.license ?? '';
  const keywords = pluginJson.keywords ?? [];

  // 3. Commands - glob expansion + auto-discovery
  const commands = await normalizeCommands(pluginPath, pluginJson.commands);

  // 4. Agents - glob expansion + auto-discovery
  const agents = await normalizeAgents(pluginPath, pluginJson.agents);

  // 5. Skills - auto-discovery (skills/*/SKILL.md pattern)
  const skills = await normalizeSkills(pluginPath, pluginJson.skills);

  // 6. Hooks - flatten nested structure
  const hooks = await normalizeHooks(pluginPath, pluginJson.hooks);

  // 7. MCPs - convert object to array with name field
  const mcps = await normalizeMCPs(pluginPath, pluginJson.mcpServers);

  return {
    name,
    source: pluginPath,
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
 * Normalize commands paths - handles string|array + auto-discovery
 */
async function normalizeCommands(
  pluginPath: string,
  commands?: string | string[]
): Promise<string[]> {
  const resultSet = new Set<string>();

  // Auto-discovery: commands/**/*.md (ALWAYS runs if directory exists)
  const autoDiscovered = await glob('commands/**/*.md', {
    cwd: pluginPath,
    onlyFiles: true,
  });
  autoDiscovered.forEach(p => resultSet.add(normalizePath(p)));

  // Custom paths (COMPLEMENT auto-discovery, don't replace)
  if (typeof commands === 'string') {
    // String path: glob it
    const customPath = normalizePath(commands);
    const custom = await glob(`${customPath}/**/*.md`, {
      cwd: pluginPath,
      onlyFiles: true,
    });
    custom.forEach(p => resultSet.add(normalizePath(p)));
  } else if (Array.isArray(commands)) {
    // Array: already explicit paths
    commands.forEach(p => resultSet.add(normalizePath(p)));
  }

  // Return unique values
  return Array.from(resultSet);
}

/**
 * Normalize agents paths - handles string|array + auto-discovery
 */
async function normalizeAgents(
  pluginPath: string,
  agents?: string | string[]
): Promise<string[]> {
  const resultSet = new Set<string>();

  // Auto-discovery: agents/**/*.md (ALWAYS runs if directory exists)
  const autoDiscovered = await glob('agents/**/*.md', {
    cwd: pluginPath,
    onlyFiles: true,
  });
  autoDiscovered.forEach(p => resultSet.add(normalizePath(p)));

  // Custom paths (COMPLEMENT auto-discovery, don't replace)
  if (typeof agents === 'string') {
    // String path: glob it
    const customPath = normalizePath(agents);
    const custom = await glob(`${customPath}/**/*.md`, {
      cwd: pluginPath,
      onlyFiles: true,
    });
    custom.forEach(p => resultSet.add(normalizePath(p)));
  } else if (Array.isArray(agents)) {
    // Array: already explicit paths
    agents.forEach(p => resultSet.add(normalizePath(p)));
  }

  // Return unique values
  return Array.from(resultSet);
}

/**
 * Normalize skills - auto-discovery of skills pattern (skills star SKILL.md)
 */
async function normalizeSkills(
  pluginPath: string,
  skills?: string | string[]
): Promise<string[]> {
  const resultSet = new Set<string>();

  // Auto-discovery: skills/*/SKILL.md (return parent directories)
  const autoDiscovered = await glob('skills/*/SKILL.md', {
    cwd: pluginPath,
    onlyFiles: true,
  });
  autoDiscovered.forEach(p => resultSet.add(normalizePath(dirname(p))));

  // Custom paths (COMPLEMENT auto-discovery)
  if (typeof skills === 'string') {
    const customPath = normalizePath(skills);
    const custom = await glob(`${customPath}/*/SKILL.md`, {
      cwd: pluginPath,
      onlyFiles: true,
    });
    custom.forEach(p => resultSet.add(normalizePath(dirname(p))));
  } else if (Array.isArray(skills)) {
    skills.forEach(p => resultSet.add(normalizePath(p)));
  }

  // Return unique values
  return Array.from(resultSet);
}

/**
 * Normalize hooks - flatten nested structure to array with event field
 * Format: { "EventName": [{ matcher?, hooks: [{type, command, ...}] }] }
 * Output: [{ event: "EventName", type, command, matcher?, ...fields }]
 */
async function normalizeHooks(
  pluginPath: string,
  hooks?: string | object
): Promise<NormalizedPluginFormat['hooks']> {
  let hooksConfig: any = {};

  if (typeof hooks === 'string') {
    // Load from file
    const hooksPath = join(pluginPath, normalizePath(hooks));
    try {
      const content = await readFile(hooksPath, 'utf-8');
      const parsed = JSON.parse(content);
      hooksConfig = parsed.hooks || parsed;
    } catch {
      // File not found or invalid - return empty array
      return [];
    }
  } else if (typeof hooks === 'object' && hooks !== null) {
    // Inline configuration
    hooksConfig = hooks;
  } else {
    // Try default locations: hooks/hooks.json then settings.json (spec 001, 002 line 36)
    const defaultPaths = ['hooks/hooks.json', 'settings.json'];

    for (const defaultFile of defaultPaths) {
      try {
        const defaultPath = join(pluginPath, defaultFile);
        const content = await readFile(defaultPath, 'utf-8');
        const parsed = JSON.parse(content);
        hooksConfig = parsed.hooks || parsed;
        break; // Found hooks, stop trying
      } catch {
        // File not found, try next
        continue;
      }
    }

    // No hooks found in any default location
    if (Object.keys(hooksConfig).length === 0) {
      return [];
    }
  }

  // Flatten structure
  const result: NormalizedPluginFormat['hooks'] = [];

  for (const [event, eventConfigs] of Object.entries(hooksConfig)) {
    if (!Array.isArray(eventConfigs)) continue;

    for (const config of eventConfigs) {
      const matcher = (config as any).matcher;
      const hooksArray = (config as any).hooks || [];

      for (const hook of hooksArray) {
        result.push({
          event,
          ...(matcher ? { matcher } : {}),
          ...hook,
        });
      }
    }
  }

  return result;
}

/**
 * Normalize MCPs - convert object to array with name field
 * Format: { "serverName": {command, args?, env?} }
 * Output: [{ name: "serverName", command, args?, env? }]
 */
async function normalizeMCPs(
  pluginPath: string,
  mcpServers?: string | object
): Promise<NormalizedPluginFormat['mcps']> {
  let mcpsConfig: any = {};

  if (typeof mcpServers === 'string') {
    // Load from file
    const mcpPath = join(pluginPath, normalizePath(mcpServers));
    try {
      const content = await readFile(mcpPath, 'utf-8');
      const parsed = JSON.parse(content);
      mcpsConfig = parsed.mcpServers || parsed;
    } catch {
      return [];
    }
  } else if (typeof mcpServers === 'object' && mcpServers !== null) {
    // Inline configuration
    mcpsConfig = mcpServers;
  } else {
    // Try default location
    try {
      const defaultPath = join(pluginPath, '.mcp.json');
      const content = await readFile(defaultPath, 'utf-8');
      const parsed = JSON.parse(content);
      mcpsConfig = parsed.mcpServers || parsed;
    } catch {
      return [];
    }
  }

  // Convert to array
  const result: NormalizedPluginFormat['mcps'] = [];

  for (const [name, config] of Object.entries(mcpsConfig)) {
    result.push({
      name,
      ...(config as any),
    });
  }

  return result;
}

/**
 * Remove leading './' from path
 */
function normalizePath(path: string): string {
  return path.replace(/^\.\//, '');
}
