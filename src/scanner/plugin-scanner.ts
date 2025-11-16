import * as fs from 'fs';
import * as path from 'path';
import { ClaudeCodePluginManifest } from '../types/plugin';
import { ClaudeCodeNormalizedPlugin } from '../types/normalized';
import { normalizePlugin } from '../transformation/normalize';

/**
 * Scans a directory for Claude Code plugins and normalizes them
 * Looks for .claude-plugin/plugin.json in subdirectories
 */
export async function scanPlugins(directory: string): Promise<ClaudeCodeNormalizedPlugin[]> {
  const absoluteDir = path.resolve(directory);

  if (!fs.existsSync(absoluteDir)) {
    throw new Error(`Directory does not exist: ${absoluteDir}`);
  }

  const stats = fs.statSync(absoluteDir);
  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${absoluteDir}`);
  }

  const plugins: ClaudeCodeNormalizedPlugin[] = [];

  // Read all subdirectories
  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginDir = path.join(absoluteDir, entry.name);
    const pluginJsonPath = path.join(pluginDir, '.claude-plugin/plugin.json');

    // Check if this directory has a plugin.json
    if (fs.existsSync(pluginJsonPath)) {
      try {
        const plugin = await loadPlugin(pluginDir);
        plugins.push(plugin);
      } catch (error) {
        console.error(`Error loading plugin from ${pluginDir}:`, error);
        // Continue scanning other plugins
      }
    }
  }

  return plugins;
}

/**
 * Loads a single plugin from a directory
 */
export async function loadPlugin(pluginDir: string): Promise<ClaudeCodeNormalizedPlugin> {
  const pluginJsonPath = path.join(pluginDir, '.claude-plugin/plugin.json');

  if (!fs.existsSync(pluginJsonPath)) {
    throw new Error(`Plugin manifest not found: ${pluginJsonPath}`);
  }

  // Read and parse plugin.json
  const content = fs.readFileSync(pluginJsonPath, 'utf-8');
  const pluginJson: ClaudeCodePluginManifest = JSON.parse(content);

  // Validate required fields
  if (!pluginJson.name) {
    // If no name, use directory basename
    pluginJson.name = path.basename(pluginDir);
  }

  // Normalize to internal format
  const normalized = await normalizePlugin(pluginJson, pluginDir);

  return normalized;
}

/**
 * Get all components from a normalized plugin
 */
export interface PluginComponents {
  commands: ComponentItem[];
  agents: ComponentItem[];
  skills: ComponentItem[];
  hooks: HookItem[];
  mcps: McpItem[];
}

export interface ComponentItem {
  id: string;
  type: 'command' | 'agent' | 'skill';
  path: string;
  name: string;
  selected: boolean;
}

export interface HookItem {
  id: string;
  event: string;
  matcher?: string;
  config: any;
  displayName: string;
  selected: boolean;
}

export interface McpItem {
  id: string;
  name: string;
  config: any;
  displayName: string;
  details?: string;
  selected: boolean;
}

export function getPluginComponents(plugin: ClaudeCodeNormalizedPlugin): PluginComponents {
  return {
    commands: plugin.commands.map((p, idx) => ({
      id: `${plugin.name}:command:${idx}`,
      type: 'command',
      path: p,
      name: path.basename(p, '.md'),
      selected: false
    })),
    agents: plugin.agents.map((p, idx) => ({
      id: `${plugin.name}:agent:${idx}`,
      type: 'agent',
      path: p,
      name: path.basename(p, '.md'),
      selected: false
    })),
    skills: plugin.skills.map((p, idx) => ({
      id: `${plugin.name}:skill:${idx}`,
      type: 'skill',
      path: p,
      name: path.basename(p),
      selected: false
    })),
    hooks: plugin.hooks.map((h: any) => ({
      id: h.id,
      event: h.event,
      matcher: h.matcher,
      config: h.config,
      displayName: formatHookDisplay(h),
      selected: false
    })),
    mcps: plugin.mcps.map((m: any) => ({
      id: m.id,
      name: m.name,
      config: m.config,
      displayName: m.name,
      details: formatMcpDetails(m.config),
      selected: false
    }))
  };
}

/**
 * Format hook display string
 */
function formatHookDisplay(hook: any): string {
  const matcher = hook.matcher ? `:${hook.matcher}` : ':*';
  const action = hook.config.command || hook.config.agent || '';
  const actionName = action.split('/').pop()?.split('.')[0] || action;
  return `${hook.event}${matcher} → ${actionName}`;
}

/**
 * Format MCP details string
 */
function formatMcpDetails(config: any): string {
  const parts: string[] = [];
  // For now, keep it simple
  if (config.command) {
    parts.push(`cmd: ${config.command}`);
  }
  return parts.join(', ');
}
