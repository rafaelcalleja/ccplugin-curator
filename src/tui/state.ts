/**
 * TUI State Management
 *
 * Manages the application state for the TUI:
 * - Loaded plugins
 * - Current selection
 * - Active plugin/panel
 * - Cursor positions
 *
 * Spec: docs/spec/004-user-workflows.md (navigation and selection)
 */

import type { NormalizedPluginFormatInternal } from '../types/normalized.js';

/**
 * Component selection state
 */
export interface ComponentSelection {
  commands: Set<string>;
  agents: Set<string>;
  skills: Set<string>;
  hooks: Set<number>; // Index in hooks array
  mcps: Set<number>; // Index in mcps array
}

/**
 * Panel types
 */
export type Panel = 'plugins' | 'components' | 'preview';

/**
 * Application state
 */
export interface TuiState {
  /** Loaded plugins */
  plugins: NormalizedPluginFormatInternal[];

  /** Index of currently active plugin */
  activePluginIndex: number;

  /** Currently focused panel */
  activePanel: Panel;

  /** Cursor position in components panel */
  componentCursor: number;

  /** Selection state per plugin */
  selections: Map<string, ComponentSelection>;
}

/**
 * Create initial state
 */
export function createInitialState(plugins: NormalizedPluginFormatInternal[]): TuiState {
  return {
    plugins,
    activePluginIndex: 0,
    activePanel: 'components',
    componentCursor: 0,
    selections: new Map(),
  };
}

/**
 * Get selection for a plugin (create if doesn't exist)
 */
export function getSelection(state: TuiState, pluginName: string): ComponentSelection {
  if (!state.selections.has(pluginName)) {
    state.selections.set(pluginName, {
      commands: new Set(),
      agents: new Set(),
      skills: new Set(),
      hooks: new Set(),
      mcps: new Set(),
    });
  }
  return state.selections.get(pluginName)!;
}

/**
 * Get currently active plugin
 */
export function getActivePlugin(state: TuiState): NormalizedPluginFormatInternal | undefined {
  return state.plugins[state.activePluginIndex];
}

/**
 * Get all items in components panel (flat list)
 */
export interface ComponentItem {
  type: 'command' | 'agent' | 'skill' | 'hook' | 'mcp';
  index: number; // Index within type array
  label: string; // Display label
  value: string | number; // Value for selection (path or index)
}

export function getComponentItems(plugin: NormalizedPluginFormatInternal): ComponentItem[] {
  const items: ComponentItem[] = [];

  // Commands
  plugin.commands.forEach((cmd, index) => {
    items.push({
      type: 'command',
      index,
      label: cmd,
      value: cmd,
    });
  });

  // Agents
  plugin.agents.forEach((agent, index) => {
    items.push({
      type: 'agent',
      index,
      label: agent,
      value: agent,
    });
  });

  // Skills
  plugin.skills.forEach((skill, index) => {
    items.push({
      type: 'skill',
      index,
      label: skill,
      value: skill,
    });
  });

  // Hooks
  plugin.hooks.forEach((hook, index) => {
    const label = hook.matcher
      ? `${hook.event}:${hook.matcher} → ${hook.command}`
      : `${hook.event} → ${hook.command}`;
    items.push({
      type: 'hook',
      index,
      label,
      value: index,
    });
  });

  // MCPs
  plugin.mcps.forEach((mcp, index) => {
    items.push({
      type: 'mcp',
      index,
      label: `${mcp.name} (${mcp.command})`,
      value: index,
    });
  });

  return items;
}

/**
 * Toggle selection for a component
 */
export function toggleSelection(
  state: TuiState,
  pluginName: string,
  item: ComponentItem
): void {
  const selection = getSelection(state, pluginName);

  switch (item.type) {
    case 'command':
      if (selection.commands.has(item.value as string)) {
        selection.commands.delete(item.value as string);
      } else {
        selection.commands.add(item.value as string);
      }
      break;
    case 'agent':
      if (selection.agents.has(item.value as string)) {
        selection.agents.delete(item.value as string);
      } else {
        selection.agents.add(item.value as string);
      }
      break;
    case 'skill':
      if (selection.skills.has(item.value as string)) {
        selection.skills.delete(item.value as string);
      } else {
        selection.skills.add(item.value as string);
      }
      break;
    case 'hook':
      if (selection.hooks.has(item.value as number)) {
        selection.hooks.delete(item.value as number);
      } else {
        selection.hooks.add(item.value as number);
      }
      break;
    case 'mcp':
      if (selection.mcps.has(item.value as number)) {
        selection.mcps.delete(item.value as number);
      } else {
        selection.mcps.add(item.value as number);
      }
      break;
  }
}

/**
 * Check if component is selected
 */
export function isSelected(
  state: TuiState,
  pluginName: string,
  item: ComponentItem
): boolean {
  const selection = getSelection(state, pluginName);

  switch (item.type) {
    case 'command':
      return selection.commands.has(item.value as string);
    case 'agent':
      return selection.agents.has(item.value as string);
    case 'skill':
      return selection.skills.has(item.value as string);
    case 'hook':
      return selection.hooks.has(item.value as number);
    case 'mcp':
      return selection.mcps.has(item.value as number);
  }
}

/**
 * Select all components for current plugin
 */
export function selectAll(state: TuiState): void {
  const plugin = getActivePlugin(state);
  if (!plugin) return;

  const selection = getSelection(state, plugin.name);

  // Add all commands
  plugin.commands.forEach((cmd) => selection.commands.add(cmd));

  // Add all agents
  plugin.agents.forEach((agent) => selection.agents.add(agent));

  // Add all skills
  plugin.skills.forEach((skill) => selection.skills.add(skill));

  // Add all hooks
  plugin.hooks.forEach((_, index) => selection.hooks.add(index));

  // Add all mcps
  plugin.mcps.forEach((_, index) => selection.mcps.add(index));
}

/**
 * Deselect all components for current plugin
 */
export function selectNone(state: TuiState): void {
  const plugin = getActivePlugin(state);
  if (!plugin) return;

  const selection = getSelection(state, plugin.name);

  selection.commands.clear();
  selection.agents.clear();
  selection.skills.clear();
  selection.hooks.clear();
  selection.mcps.clear();
}

/**
 * Get total selection count across all plugins
 */
export function getTotalSelectionCount(state: TuiState): number {
  let count = 0;

  for (const selection of state.selections.values()) {
    count += selection.commands.size;
    count += selection.agents.size;
    count += selection.skills.size;
    count += selection.hooks.size;
    count += selection.mcps.size;
  }

  return count;
}
