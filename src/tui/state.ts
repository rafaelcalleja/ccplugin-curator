import type { NormalizedPlugin } from '../types/normalized';

export interface TuiState {
  // Loaded plugins
  plugins: NormalizedPlugin[];

  // Current selections per plugin
  selections: Map<string, PluginSelection>;

  // Current focus
  focus: {
    panel: 'plugins' | 'components' | 'preview';
    pluginIndex: number;
    componentIndex: number;
  };
}

export interface PluginSelection {
  pluginName: string;
  commands: Set<string>;
  agents: Set<string>;
  skills: Set<string>;
  hooks: Set<number>;  // Indices in the hooks array
  mcps: Set<number>;   // Indices in the mcps array
}

/**
 * Creates initial empty state
 */
export function createState(plugins: NormalizedPlugin[]): TuiState {
  const selections = new Map<string, PluginSelection>();

  for (const plugin of plugins) {
    selections.set(plugin.name, {
      pluginName: plugin.name,
      commands: new Set(),
      agents: new Set(),
      skills: new Set(),
      hooks: new Set(),
      mcps: new Set()
    });
  }

  return {
    plugins,
    selections,
    focus: {
      panel: 'plugins',
      pluginIndex: 0,
      componentIndex: 0
    }
  };
}

/**
 * Toggles selection of a command
 */
export function toggleCommand(state: TuiState, pluginName: string, command: string): void {
  const selection = state.selections.get(pluginName);
  if (!selection) return;

  if (selection.commands.has(command)) {
    selection.commands.delete(command);
  } else {
    selection.commands.add(command);
  }
}

/**
 * Toggles selection of an agent
 */
export function toggleAgent(state: TuiState, pluginName: string, agent: string): void {
  const selection = state.selections.get(pluginName);
  if (!selection) return;

  if (selection.agents.has(agent)) {
    selection.agents.delete(agent);
  } else {
    selection.agents.add(agent);
  }
}

/**
 * Toggles selection of a skill
 */
export function toggleSkill(state: TuiState, pluginName: string, skill: string): void {
  const selection = state.selections.get(pluginName);
  if (!selection) return;

  if (selection.skills.has(skill)) {
    selection.skills.delete(skill);
  } else {
    selection.skills.add(skill);
  }
}

/**
 * Toggles selection of a hook
 */
export function toggleHook(state: TuiState, pluginName: string, hookIndex: number): void {
  const selection = state.selections.get(pluginName);
  if (!selection) return;

  if (selection.hooks.has(hookIndex)) {
    selection.hooks.delete(hookIndex);
  } else {
    selection.hooks.add(hookIndex);
  }
}

/**
 * Toggles selection of an MCP
 */
export function toggleMcp(state: TuiState, pluginName: string, mcpIndex: number): void {
  const selection = state.selections.get(pluginName);
  if (!selection) return;

  if (selection.mcps.has(mcpIndex)) {
    selection.mcps.delete(mcpIndex);
  } else {
    selection.mcps.add(mcpIndex);
  }
}

/**
 * Selects all components for a plugin
 */
export function selectAll(state: TuiState, pluginName: string): void {
  const plugin = state.plugins.find(p => p.name === pluginName);
  const selection = state.selections.get(pluginName);
  if (!plugin || !selection) return;

  selection.commands = new Set(plugin.commands);
  selection.agents = new Set(plugin.agents);
  selection.skills = new Set(plugin.skills);
  selection.hooks = new Set(plugin.hooks.map((_, i) => i));
  selection.mcps = new Set(plugin.mcps.map((_, i) => i));
}

/**
 * Deselects all components for a plugin
 */
export function deselectAll(state: TuiState, pluginName: string): void {
  const selection = state.selections.get(pluginName);
  if (!selection) return;

  selection.commands.clear();
  selection.agents.clear();
  selection.skills.clear();
  selection.hooks.clear();
  selection.mcps.clear();
}

/**
 * Generates preview JSON from current selections
 */
export function generatePreview(state: TuiState): any {
  const result: any = {
    selections: []
  };

  for (const [pluginName, selection] of state.selections.entries()) {
    const plugin = state.plugins.find(p => p.name === pluginName);
    if (!plugin) continue;

    const hasSelections =
      selection.commands.size > 0 ||
      selection.agents.size > 0 ||
      selection.skills.size > 0 ||
      selection.hooks.size > 0 ||
      selection.mcps.size > 0;

    if (!hasSelections) continue;

    const pluginSelection: any = {
      plugin: pluginName,
      components: {}
    };

    if (selection.commands.size > 0) {
      pluginSelection.components.commands = Array.from(selection.commands);
    }

    if (selection.agents.size > 0) {
      pluginSelection.components.agents = Array.from(selection.agents);
    }

    if (selection.skills.size > 0) {
      pluginSelection.components.skills = Array.from(selection.skills);
    }

    if (selection.hooks.size > 0) {
      pluginSelection.components.hooks = Array.from(selection.hooks).map(i => plugin.hooks[i]);
    }

    if (selection.mcps.size > 0) {
      pluginSelection.components.mcps = Array.from(selection.mcps).map(i => plugin.mcps[i]);
    }

    result.selections.push(pluginSelection);
  }

  return result;
}

/**
 * Gets total count of selected components across all plugins
 */
export function getSelectionCount(state: TuiState): number {
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
