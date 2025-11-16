import { ClaudeCodeNormalizedPlugin } from '../types/normalized';
import { PluginComponents, ComponentItem, HookItem, McpItem } from '../scanner/plugin-scanner';

/**
 * Manages selection state across multiple plugins
 */
export class SelectionState {
  private plugins: Map<string, ClaudeCodeNormalizedPlugin> = new Map();
  private components: Map<string, PluginComponents> = new Map();
  private selectedIds: Set<string> = new Set();

  constructor(plugins: ClaudeCodeNormalizedPlugin[], allComponents: Map<string, PluginComponents>) {
    plugins.forEach(p => this.plugins.set(p.name, p));
    this.components = allComponents;
  }

  /**
   * Toggle selection for a component by ID
   */
  toggleSelection(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  /**
   * Check if an item is selected
   */
  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  /**
   * Select all components from a plugin
   */
  selectAll(pluginName: string): void {
    const components = this.components.get(pluginName);
    if (!components) return;

    components.commands.forEach(c => this.selectedIds.add(c.id));
    components.agents.forEach(a => this.selectedIds.add(a.id));
    components.skills.forEach(s => this.selectedIds.add(s.id));
    components.hooks.forEach(h => this.selectedIds.add(h.id));
    components.mcps.forEach(m => this.selectedIds.add(m.id));
  }

  /**
   * Deselect all components from a plugin
   */
  selectNone(pluginName: string): void {
    const components = this.components.get(pluginName);
    if (!components) return;

    components.commands.forEach(c => this.selectedIds.delete(c.id));
    components.agents.forEach(a => this.selectedIds.delete(a.id));
    components.skills.forEach(s => this.selectedIds.delete(s.id));
    components.hooks.forEach(h => this.selectedIds.delete(h.id));
    components.mcps.forEach(m => this.selectedIds.delete(m.id));
  }

  /**
   * Get all selected items grouped by type
   */
  getSelection(): Selection {
    const selection: Selection = {
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: []
    };

    for (const [pluginName, components] of this.components.entries()) {
      const plugin = this.plugins.get(pluginName)!;

      components.commands.forEach(c => {
        if (this.selectedIds.has(c.id)) {
          selection.commands.push({ plugin, component: c });
        }
      });

      components.agents.forEach(a => {
        if (this.selectedIds.has(a.id)) {
          selection.agents.push({ plugin, component: a });
        }
      });

      components.skills.forEach(s => {
        if (this.selectedIds.has(s.id)) {
          selection.skills.push({ plugin, component: s });
        }
      });

      components.hooks.forEach(h => {
        if (this.selectedIds.has(h.id)) {
          selection.hooks.push({ plugin, hook: h });
        }
      });

      components.mcps.forEach(m => {
        if (this.selectedIds.has(m.id)) {
          selection.mcps.push({ plugin, mcp: m });
        }
      });
    }

    return selection;
  }

  /**
   * Check if any items are selected
   */
  hasSelection(): boolean {
    return this.selectedIds.size > 0;
  }

  /**
   * Get selection count
   */
  getSelectionCount(): number {
    return this.selectedIds.size;
  }

  /**
   * Generate preview JSON for current selection
   */
  getPreviewJson(): any {
    const selection = this.getSelection();

    return {
      commands: selection.commands.map(s => s.component.name),
      agents: selection.agents.map(s => s.component.name),
      skills: selection.skills.map(s => s.component.name),
      hooks: selection.hooks.map(s => s.hook.displayName),
      mcp: {
        servers: Object.fromEntries(
          selection.mcps.map(s => [s.mcp.name, s.mcp.config])
        )
      }
    };
  }
}

export interface Selection {
  commands: Array<{ plugin: ClaudeCodeNormalizedPlugin; component: ComponentItem }>;
  agents: Array<{ plugin: ClaudeCodeNormalizedPlugin; component: ComponentItem }>;
  skills: Array<{ plugin: ClaudeCodeNormalizedPlugin; component: ComponentItem }>;
  hooks: Array<{ plugin: ClaudeCodeNormalizedPlugin; hook: HookItem }>;
  mcps: Array<{ plugin: ClaudeCodeNormalizedPlugin; mcp: McpItem }>;
}
