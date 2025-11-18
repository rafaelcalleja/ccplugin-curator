import { NormalizedPluginConfiguration } from '../../types/normalized';

/**
 * Selection state management
 *
 * Tracks which components are selected across all loaded plugins
 */

export interface ComponentSelection {
  pluginName: string;
  type: 'command' | 'agent' | 'skill' | 'hook' | 'mcp';
  path: string; // For commands/agents/skills: file path, for hooks/mcps: unique identifier
  index: number; // Index in the original array
}

export class SelectionState {
  private selections: Set<string>;
  private plugins: NormalizedPluginConfiguration[];

  constructor(plugins: NormalizedPluginConfiguration[]) {
    this.selections = new Set();
    this.plugins = plugins;
  }

  /**
   * Generate unique key for a component selection
   */
  private getKey(selection: ComponentSelection): string {
    return `${selection.pluginName}:${selection.type}:${selection.index}`;
  }

  /**
   * Toggle selection of a component
   */
  toggle(selection: ComponentSelection): void {
    const key = this.getKey(selection);
    if (this.selections.has(key)) {
      this.selections.delete(key);
    } else {
      this.selections.add(key);
    }
  }

  /**
   * Check if a component is selected
   */
  isSelected(selection: ComponentSelection): boolean {
    const key = this.getKey(selection);
    return this.selections.has(key);
  }

  /**
   * Get all selected components grouped by plugin
   */
  getSelected(): Map<string, {
    commands: string[];
    agents: string[];
    skills: string[];
    hooks: NormalizedPluginConfiguration['hooks'];
    mcps: NormalizedPluginConfiguration['mcps'];
  }> {
    const result = new Map();

    for (const plugin of this.plugins) {
      const selected = {
        commands: [] as string[],
        agents: [] as string[],
        skills: [] as string[],
        hooks: [] as NormalizedPluginConfiguration['hooks'],
        mcps: [] as NormalizedPluginConfiguration['mcps']
      };

      // Check commands
      plugin.commands.forEach((cmd, idx) => {
        if (this.isSelected({ pluginName: plugin.name, type: 'command', path: cmd, index: idx })) {
          selected.commands.push(cmd);
        }
      });

      // Check agents
      plugin.agents.forEach((agent, idx) => {
        if (this.isSelected({ pluginName: plugin.name, type: 'agent', path: agent, index: idx })) {
          selected.agents.push(agent);
        }
      });

      // Check skills
      plugin.skills.forEach((skill, idx) => {
        if (this.isSelected({ pluginName: plugin.name, type: 'skill', path: skill, index: idx })) {
          selected.skills.push(skill);
        }
      });

      // Check hooks
      plugin.hooks.forEach((hook, idx) => {
        if (this.isSelected({ pluginName: plugin.name, type: 'hook', path: hook.command, index: idx })) {
          selected.hooks.push(hook);
        }
      });

      // Check MCPs
      plugin.mcps.forEach((mcp, idx) => {
        if (this.isSelected({ pluginName: plugin.name, type: 'mcp', path: mcp.name, index: idx })) {
          selected.mcps.push(mcp);
        }
      });

      // Only add plugin to result if it has selections
      if (
        selected.commands.length > 0 ||
        selected.agents.length > 0 ||
        selected.skills.length > 0 ||
        selected.hooks.length > 0 ||
        selected.mcps.length > 0
      ) {
        result.set(plugin.name, selected);
      }
    }

    return result;
  }

  /**
   * Build merged normalized plugin from selections
   */
  buildMergedPlugin(name: string): NormalizedPluginConfiguration {
    const selected = this.getSelected();

    const merged: NormalizedPluginConfiguration = {
      name,
      source: './output/curated-plugin',
      version: '0.0.0',
      description: 'Curated plugin from multiple sources',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: []
    };

    // Merge all selections
    for (const [pluginName, components] of selected) {
      merged.commands.push(...components.commands);
      merged.agents.push(...components.agents);
      merged.skills.push(...components.skills);
      merged.hooks.push(...components.hooks);
      merged.mcps.push(...components.mcps);
    }

    return merged;
  }

  /**
   * Clear all selections
   */
  clear(): void {
    this.selections.clear();
  }

  /**
   * Get count of selected items
   */
  getCount(): number {
    return this.selections.size;
  }
}
