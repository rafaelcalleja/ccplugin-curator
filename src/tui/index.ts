import blessed from 'blessed';
import { ClaudeCodeNormalizedPlugin } from '../types/normalized';
import { PluginComponents, getPluginComponents } from '../scanner/plugin-scanner';
import { SelectionState } from '../utils/selection-state';

export class PluginCuratorTUI {
  private screen: blessed.Widgets.Screen;
  private plugins: ClaudeCodeNormalizedPlugin[];
  private allComponents: Map<string, PluginComponents>;
  private selectionState: SelectionState;
  private currentPluginIndex: number = 0;
  private currentComponentIndex: number = 0;
  private currentPanel: 'plugins' | 'components' | 'preview' = 'components';
  private onSave?: () => Promise<void>;
  private onQuit?: () => void;

  private titleBar!: blessed.Widgets.BoxElement;
  private pluginsList!: blessed.Widgets.ListElement;
  private componentsList!: blessed.Widgets.ListElement;
  private previewBox!: blessed.Widgets.BoxElement;
  private statusBar!: blessed.Widgets.BoxElement;

  constructor(plugins: ClaudeCodeNormalizedPlugin[]) {
    this.plugins = plugins;
    this.allComponents = new Map();

    // Get components for all plugins
    plugins.forEach(p => {
      this.allComponents.set(p.name, getPluginComponents(p));
    });

    this.selectionState = new SelectionState(plugins, this.allComponents);

    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Claude Plugin Curator'
    });

    this.setupUI();
    this.setupKeyBindings();
    this.render();
  }

  private setupUI(): void {
    // Main container with title
    this.titleBar = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 1,
      content: this.getTitleContent(),
      style: {
        fg: 'white',
        bg: 'blue',
        bold: true
      }
    });
    this.screen.append(this.titleBar);

    // Plugins panel (left)
    const pluginsBox = blessed.box({
      label: ' PLUGINS ',
      top: 1,
      left: 0,
      width: '25%',
      height: '100%-3',
      border: { type: 'line' },
      style: {
        border: { fg: 'white' }
      }
    });

    this.pluginsList = blessed.list({
      parent: pluginsBox,
      top: 0,
      left: 0,
      width: '100%-2',
      height: '100%',
      keys: true,
      vi: true,
      mouse: false,
      style: {
        selected: {
          bg: 'blue',
          fg: 'white',
          bold: true
        },
        item: {
          fg: 'white'
        }
      }
    });

    this.screen.append(pluginsBox);

    // Components panel (center)
    const componentsBox = blessed.box({
      label: ' COMPONENTS ',
      top: 1,
      left: '25%',
      width: '45%',
      height: '100%-3',
      border: { type: 'line' },
      style: {
        border: { fg: 'white' }
      }
    });

    this.componentsList = blessed.list({
      parent: componentsBox,
      top: 0,
      left: 0,
      width: '100%-2',
      height: '100%',
      keys: true,
      vi: true,
      mouse: false,
      tags: true,
      style: {
        selected: {
          bg: 'blue',
          fg: 'white',
          bold: true
        },
        item: {
          fg: 'white'
        }
      }
    });

    this.screen.append(componentsBox);

    // Preview panel (right)
    const previewBoxContainer = blessed.box({
      label: ' PREVIEW ',
      top: 1,
      left: '70%',
      width: '30%',
      height: '100%-3',
      border: { type: 'line' },
      style: {
        border: { fg: 'white' }
      }
    });

    this.previewBox = blessed.box({
      parent: previewBoxContainer,
      top: 0,
      left: 0,
      width: '100%-2',
      height: '100%',
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      vi: true,
      scrollbar: {
        ch: ' ',
        style: { inverse: true }
      },
      content: '',
      style: {
        fg: 'green'
      }
    });

    this.screen.append(previewBoxContainer);

    // Status bar
    this.statusBar = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      border: { type: 'line' },
      content: this.getStatusBarContent(),
      style: {
        fg: 'white',
        border: { fg: 'white' }
      }
    });
    this.screen.append(this.statusBar);
  }

  private getTitleContent(): string {
    const plugin = this.getCurrentPlugin();
    const pluginName = plugin?.name || 'None';
    const tabInfo = `[Tab ${this.currentPluginIndex + 1} of ${this.plugins.length}]`;

    // Calculate padding to right-align tab info
    const padding = 120 - pluginName.length - tabInfo.length - 10;
    const spaces = ' '.repeat(Math.max(0, padding));

    return ` PLUGIN: ${pluginName}${spaces}${tabInfo} `;
  }

  private getStatusBarContent(): string {
    if (this.plugins.length > 1) {
      return ' ←→: Switch Panel | ↑↓: Navigate | TAB: Next Plugin | SHIFT+TAB: Prev Plugin | SPACE: Toggle | S: Save | Q: Quit ';
    }
    return ' ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit ';
  }

  private setupKeyBindings(): void {
    // Quit
    this.screen.key(['q', 'Q', 'C-c'], () => {
      if (this.onQuit) {
        this.onQuit();
      }
      return this.screen.destroy();
    });

    // Save
    this.screen.key(['s', 'S'], async () => {
      if (this.onSave) {
        await this.onSave();
      }
    });

    // TAB - Next plugin
    this.screen.key(['tab'], () => {
      if (this.plugins.length > 1) {
        this.currentPluginIndex = (this.currentPluginIndex + 1) % this.plugins.length;
        this.refreshComponentsForCurrentPlugin();
        this.render();
      }
    });

    // SHIFT+TAB - Previous plugin
    this.screen.key(['S-tab'], () => {
      if (this.plugins.length > 1) {
        this.currentPluginIndex = (this.currentPluginIndex - 1 + this.plugins.length) % this.plugins.length;
        this.refreshComponentsForCurrentPlugin();
        this.render();
      }
    });

    // Navigation between panels
    this.screen.key(['left', 'h'], () => {
      if (this.currentPanel === 'components') {
        this.currentPanel = 'plugins';
      } else if (this.currentPanel === 'preview') {
        this.currentPanel = 'components';
      }
      this.render();
    });

    this.screen.key(['right', 'l'], () => {
      if (this.currentPanel === 'plugins') {
        this.currentPanel = 'components';
      } else if (this.currentPanel === 'components') {
        this.currentPanel = 'preview';
      }
      this.render();
    });

    // Navigation within lists
    this.screen.key(['up', 'k'], () => {
      if (this.currentPanel === 'components') {
        this.currentComponentIndex = Math.max(0, this.currentComponentIndex - 1);
        this.componentsList.up(1);
      } else if (this.currentPanel === 'plugins') {
        this.currentPluginIndex = Math.max(0, this.currentPluginIndex - 1);
        this.pluginsList.up(1);
        this.refreshComponentsForCurrentPlugin();
      }
      this.render();
    });

    this.screen.key(['down', 'j'], () => {
      if (this.currentPanel === 'components') {
        const maxIndex = this.getAllComponentItems().length - 1;
        this.currentComponentIndex = Math.min(maxIndex, this.currentComponentIndex + 1);
        this.componentsList.down(1);
      } else if (this.currentPanel === 'plugins') {
        this.currentPluginIndex = Math.min(this.plugins.length - 1, this.currentPluginIndex + 1);
        this.pluginsList.down(1);
        this.refreshComponentsForCurrentPlugin();
      }
      this.render();
    });

    // Toggle selection
    this.screen.key(['space'], () => {
      if (this.currentPanel === 'components') {
        const items = this.getAllComponentItems();
        const item = items[this.currentComponentIndex];
        if (item) {
          this.selectionState.toggleSelection(item.id);
          this.render();
        }
      }
    });

    // Select all
    this.screen.key(['a', 'A'], () => {
      const plugin = this.getCurrentPlugin();
      if (plugin) {
        this.selectionState.selectAll(plugin.name);
        this.render();
      }
    });

    // Select none
    this.screen.key(['n', 'N'], () => {
      const plugin = this.getCurrentPlugin();
      if (plugin) {
        this.selectionState.selectNone(plugin.name);
        this.render();
      }
    });
  }

  private getCurrentPlugin(): ClaudeCodeNormalizedPlugin | undefined {
    return this.plugins[this.currentPluginIndex];
  }

  private getAllComponentItems(): Array<{ id: string; display: string; type: string }> {
    const plugin = this.getCurrentPlugin();
    if (!plugin) return [];

    const components = this.allComponents.get(plugin.name);
    if (!components) return [];

    const items: Array<{ id: string; display: string; type: string }> = [];

    // Commands section
    if (components.commands.length > 0) {
      items.push({
        id: 'header-commands',
        display: `{yellow-fg}COMMANDS (${components.commands.length}){/yellow-fg}`,
        type: 'header'
      });

      components.commands.forEach(c => {
        const checkbox = this.selectionState.isSelected(c.id) ? '[✓]' : '[ ]';
        items.push({
          id: c.id,
          display: `  ${checkbox} ${c.name}`,
          type: 'item'
        });
      });
    }

    // Agents section
    if (components.agents.length > 0) {
      items.push({
        id: 'header-agents',
        display: `{yellow-fg}AGENTS (${components.agents.length}){/yellow-fg}`,
        type: 'header'
      });

      components.agents.forEach(a => {
        const checkbox = this.selectionState.isSelected(a.id) ? '[✓]' : '[ ]';
        items.push({
          id: a.id,
          display: `  ${checkbox} ${a.name}`,
          type: 'item'
        });
      });
    }

    // Skills section
    if (components.skills.length > 0) {
      items.push({
        id: 'header-skills',
        display: `{yellow-fg}SKILLS (${components.skills.length}){/yellow-fg}`,
        type: 'header'
      });

      components.skills.forEach(s => {
        const checkbox = this.selectionState.isSelected(s.id) ? '[✓]' : '[ ]';
        items.push({
          id: s.id,
          display: `  ${checkbox} ${s.name}`,
          type: 'item'
        });
      });
    }

    // Hooks section
    if (components.hooks.length > 0) {
      items.push({
        id: 'header-hooks',
        display: `{yellow-fg}HOOKS (${components.hooks.length}){/yellow-fg}`,
        type: 'header'
      });

      components.hooks.forEach(h => {
        const checkbox = this.selectionState.isSelected(h.id) ? '[✓]' : '[ ]';
        items.push({
          id: h.id,
          display: `  ${checkbox} ${h.displayName}`,
          type: 'item'
        });
      });
    }

    // MCP Servers section
    if (components.mcps.length > 0) {
      items.push({
        id: 'header-mcps',
        display: `{yellow-fg}MCP SERVERS (${components.mcps.length}){/yellow-fg}`,
        type: 'header'
      });

      components.mcps.forEach(m => {
        const checkbox = this.selectionState.isSelected(m.id) ? '[✓]' : '[ ]';
        const details = m.details ? `\n    ${m.details}` : '';
        items.push({
          id: m.id,
          display: `  ${checkbox} ${m.displayName}${details}`,
          type: 'item'
        });
      });
    }

    return items;
  }

  private refreshComponentsForCurrentPlugin(): void {
    this.currentComponentIndex = 0;
  }

  private render(): void {
    // Update title bar
    this.titleBar.setContent(this.getTitleContent());

    // Update status bar
    this.statusBar.setContent(this.getStatusBarContent());

    // Render plugins list
    const pluginItems = this.plugins.map((p, idx) => {
      const components = this.allComponents.get(p.name);
      const counts: string[] = [];

      if (components) {
        if (components.commands.length > 0) counts.push(`• ${components.commands.length} commands`);
        if (components.agents.length > 0) counts.push(`• ${components.agents.length} agents`);
        if (components.skills.length > 0) counts.push(`• ${components.skills.length} skills`);
        if (components.hooks.length > 0) counts.push(`• ${components.hooks.length} hooks`);
        if (components.mcps.length > 0) counts.push(`• ${components.mcps.length} MCPs`);
      }

      const marker = idx === this.currentPluginIndex ? '▼' : '▽';
      const star = idx === this.currentPluginIndex ? ' (★)' : '';

      if (counts.length > 0) {
        return `${marker} ${p.name}${star}\n  ${counts.join('\n  ')}`;
      }
      return `${marker} ${p.name}${star}`;
    });

    this.pluginsList.setItems(pluginItems);
    this.pluginsList.select(this.currentPluginIndex);

    // Render components list with cursor indicator
    const componentItems = this.getAllComponentItems();
    const displayItems = componentItems.map((item, idx) => {
      if (item.type === 'header') {
        return item.display;
      }
      const cursor = (this.currentPanel === 'components' && idx === this.currentComponentIndex) ? '► ' : '  ';
      return cursor + item.display.trim();
    });

    this.componentsList.setItems(displayItems);
    this.componentsList.select(this.currentComponentIndex);

    // Render preview
    const previewJson = this.selectionState.getPreviewJson();
    this.previewBox.setContent(JSON.stringify(previewJson, null, 2));

    this.screen.render();
  }

  public onSaveCallback(callback: () => Promise<void>): void {
    this.onSave = callback;
  }

  public onQuitCallback(callback: () => void): void {
    this.onQuit = callback;
  }

  public showMessage(message: string): void {
    const msgBox = blessed.message({
      parent: this.screen,
      border: 'line',
      height: 'shrink',
      width: 'half',
      top: 'center',
      left: 'center',
      label: ' Message ',
      tags: true,
      keys: true,
      hidden: true,
      vi: true
    });

    msgBox.display(message, 0, () => {
      this.screen.render();
    });
  }

  public getSelectionState(): SelectionState {
    return this.selectionState;
  }

  public destroy(): void {
    this.screen.destroy();
  }
}
