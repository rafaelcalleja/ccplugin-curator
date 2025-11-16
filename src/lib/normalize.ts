import path from 'path';
import type { ClaudeCodePluginOfficialFormat } from '../types/plugin.js';
import type { NormalizedPluginInternalFormat } from '../types/normalized.js';
import {
  discoverCommands,
  discoverAgents,
  discoverSkills,
  loadHooks,
  loadMcps,
  expandPath,
} from './auto-discovery.js';

interface NormalizedHook {
  event: string;
  type: 'command';
  command: string;
  matcher?: string;
  timeout?: number;
  [key: string]: any;
}

interface NormalizedMcp {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  [key: string]: any;
}

/**
 * Normalize plugin from official format to internal format
 * Implements transformation rules from 005-transformation-rules.md
 */
export async function normalizePlugin(
  pluginJson: ClaudeCodePluginOfficialFormat,
  pluginRoot: string
): Promise<NormalizedPluginInternalFormat> {
  const absolutePluginRoot = path.resolve(pluginRoot);

  // 1. Name (required field, default to directory basename)
  const name = pluginJson.name || path.basename(absolutePluginRoot);

  // 2. Metadata with defaults
  const version = pluginJson.version || '0.0.0';
  const description = pluginJson.description || '';
  const author = {
    name: pluginJson.author?.name || '',
    email: pluginJson.author?.email || '',
    url: pluginJson.author?.url || '',
  };
  const homepage = pluginJson.homepage || '';
  const repository = pluginJson.repository || '';
  const license = pluginJson.license || '';
  const keywords = pluginJson.keywords || [];

  // 3. Commands (auto-discovery + custom paths)
  const commands = await normalizeCommands(pluginJson.commands, absolutePluginRoot);

  // 4. Agents (auto-discovery + custom paths)
  const agents = await normalizeAgents(pluginJson.agents, absolutePluginRoot);

  // 5. Skills (auto-discovery + custom paths)
  const skills = await normalizeSkills(pluginJson.skills, absolutePluginRoot);

  // 6. Hooks (file or inline)
  const hooks = await normalizeHooks(pluginJson.hooks, absolutePluginRoot);

  // 7. MCPs (file or inline)
  const mcps = await normalizeMcps(pluginJson.mcpServers, absolutePluginRoot);

  return {
    name,
    source: absolutePluginRoot,
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
 * Normalize commands field
 * Rules:
 * - Always run auto-discovery if commands/ exists
 * - If field is string: expand glob and ADD to auto-discovery
 * - If field is array: ADD to auto-discovery
 * - Always return array
 */
async function normalizeCommands(
  commands: string | string[] | undefined,
  pluginRoot: string
): Promise<string[]> {
  const result: string[] = [];

  // Auto-discovery (always runs)
  const discovered = await discoverCommands(pluginRoot);
  result.push(...discovered);

  // Custom paths (if defined)
  if (commands) {
    if (typeof commands === 'string') {
      // String path: expand glob
      const expanded = await expandPath(pluginRoot, commands);
      result.push(...expanded);
    } else {
      // Array: add as-is (with path normalization)
      result.push(...commands.map(p => normalizePath(p)));
    }
  }

  // Remove duplicates and sort
  return Array.from(new Set(result)).sort();
}

/**
 * Normalize agents field (same logic as commands)
 */
async function normalizeAgents(
  agents: string | string[] | undefined,
  pluginRoot: string
): Promise<string[]> {
  const result: string[] = [];

  // Auto-discovery (always runs)
  const discovered = await discoverAgents(pluginRoot);
  result.push(...discovered);

  // Custom paths (if defined)
  if (agents) {
    if (typeof agents === 'string') {
      const expanded = await expandPath(pluginRoot, agents);
      result.push(...expanded);
    } else {
      result.push(...agents.map(p => normalizePath(p)));
    }
  }

  return Array.from(new Set(result)).sort();
}

/**
 * Normalize skills field
 * Skills can be string or array in plugin.json
 */
async function normalizeSkills(
  skills: string | string[] | undefined,
  pluginRoot: string
): Promise<string[]> {
  const result: string[] = [];

  // Auto-discovery (always runs)
  const discovered = await discoverSkills(pluginRoot);
  result.push(...discovered);

  // Custom paths (if defined)
  if (skills) {
    if (typeof skills === 'string') {
      // String path: discover skills in that directory
      const pattern = path.join(pluginRoot, skills, '*/SKILL.md');
      const { glob } = await import('glob');
      const files = await glob(pattern, { nodir: true });
      const dirs = files.map(f => path.relative(pluginRoot, path.dirname(f)));
      result.push(...dirs);
    } else {
      // Array: add as-is (with path normalization)
      result.push(...skills.map(p => normalizePath(p)));
    }
  }

  return Array.from(new Set(result)).sort();
}

/**
 * Normalize hooks field
 * Input: string (file path) | object (inline config) | undefined
 * Output: NormalizedHook[] (flat array)
 */
async function normalizeHooks(
  hooks: string | object | undefined,
  pluginRoot: string
): Promise<NormalizedHook[]> {
  let hooksConfig: any = null;

  if (typeof hooks === 'string') {
    // String: load from file
    hooksConfig = await loadHooks(pluginRoot, hooks);
  } else if (typeof hooks === 'object') {
    // Object: use inline config
    hooksConfig = hooks;
  } else {
    // Undefined: try default locations
    hooksConfig = await loadHooks(pluginRoot);
  }

  if (!hooksConfig || !hooksConfig.hooks) {
    return [];
  }

  // Flatten nested structure
  const result: NormalizedHook[] = [];

  for (const [eventName, eventConfigs] of Object.entries(hooksConfig.hooks)) {
    if (!Array.isArray(eventConfigs)) continue;

    for (const config of eventConfigs) {
      const matcher = config.matcher;
      const hooksList = config.hooks || [];

      for (const hook of hooksList) {
        result.push({
          event: eventName,
          type: hook.type,
          command: hook.command,
          ...(matcher && { matcher }),
          ...(hook.timeout && { timeout: hook.timeout }),
          // Preserve other fields
          ...Object.fromEntries(
            Object.entries(hook).filter(
              ([k]) => !['type', 'command', 'timeout'].includes(k)
            )
          ),
        });
      }
    }
  }

  return result;
}

/**
 * Normalize MCPs field
 * Input: string (file path) | object (inline config) | undefined
 * Output: NormalizedMcp[] (flat array)
 */
async function normalizeMcps(
  mcpServers: string | object | undefined,
  pluginRoot: string
): Promise<NormalizedMcp[]> {
  let mcpConfig: any = null;

  if (typeof mcpServers === 'string') {
    // String: load from file
    mcpConfig = await loadMcps(pluginRoot, mcpServers);
  } else if (typeof mcpServers === 'object') {
    // Object: use inline config (wrap in mcpServers key if needed)
    mcpConfig = { mcpServers };
  } else {
    // Undefined: try default location
    mcpConfig = await loadMcps(pluginRoot);
  }

  if (!mcpConfig) {
    return [];
  }

  // Extract mcpServers object
  const servers = mcpConfig.mcpServers || mcpConfig;
  if (typeof servers !== 'object') {
    return [];
  }

  // Convert to flat array
  const result: NormalizedMcp[] = [];

  for (const [name, config] of Object.entries(servers)) {
    if (typeof config !== 'object' || config === null) continue;

    const mcpEntry = config as any;
    result.push({
      name,
      command: mcpEntry.command,
      args: mcpEntry.args || [],
      env: mcpEntry.env || {},
      // Preserve other fields
      ...Object.fromEntries(
        Object.entries(mcpEntry).filter(
          ([k]) => !['command', 'args', 'env'].includes(k)
        )
      ),
    });
  }

  return result;
}

/**
 * Normalize path (remove leading ./)
 */
function normalizePath(p: string): string {
  return p.replace(/^\.\//, '');
}
