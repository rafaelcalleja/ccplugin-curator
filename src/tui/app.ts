import * as blessed from 'blessed';
import { NormalizedPlugin } from '../types/normalized';
import { ComponentSelection, saveSelection } from '../lib/save';

export interface TUIState {
  plugins: NormalizedPlugin[];
  currentPluginIndex: number;
  currentPanel: 'plugins' | 'components' | 'preview';
  selections: Map<string, ComponentSelection>;
  componentCursor: number;
}

export class PluginCuratorTUI {
  private screen: blessed.Widgets.Screen;
  private state: TUIState;
  private pluginsPanel: blessed.Widgets.BoxElement;
  private componentsPanel: blessed.Widgets.BoxElement;
  private previewPanel: blessed.Widgets.BoxElement;
  private statusBar: blessed.Widgets.BoxElement;

  constructor(plugins: NormalizedPlugin[]) {
    this.state = {
      plugins,
      currentPluginIndex: 0,
      currentPanel: 'components',
      selections: new Map(),
      componentCursor: 0,
    };

    // Initialize selections
    for (const plugin of plugins) {
      this.state.selections.set(plugin.name, {
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: [],
      });
    }

    // Create screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Claude Plugin Curator',
    });

    // Create panels
    this.pluginsPanel = this.createPluginsPanel();
    this.componentsPanel = this.createComponentsPanel();
    this.previewPanel = this.createPreviewPanel();
    this.statusBar = this.createStatusBar();

    // Setup keyboard handlers
    this.setupKeyboardHandlers();

    // Initial render
    this.render();
  }

  private createPluginsPanel(): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: this.screen,
      label: ' PLUGINS ',
      top: 0,
      left: 0,
      width: '25%',
      height: '90%',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        focus: { border: { fg: 'yellow' } },
      },
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true,
      vi: true,
    });
  }

  private createComponentsPanel(): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: this.screen,
      label: ' COMPONENTS ',
      top: 0,
      left: '25%',
      width: '40%',
      height: '90%',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        focus: { border: { fg: 'yellow' } },
      },
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
      keys: true,
      vi: true,
    });
  }

  private createPreviewPanel(): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: this.screen,
      label: ' PREVIEW ',
      top: 0,
      left: '65%',
      width: '35%',
      height: '90%',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
      },
      scrollable: true,
      alwaysScroll: true,
      mouse: true,
    });
  }

  private createStatusBar(): blessed.Widgets.BoxElement {
    return blessed.box({
      parent: this.screen,
      top: '90%',
      left: 0,
      width: '100%',
      height: '10%',
      content: ' ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit',
      style: {
        bg: 'blue',
        fg: 'white',
      },
    });
  }

  private setupKeyboardHandlers(): void {
    // Quit
    this.screen.key(['q', 'Q'], () => {
      process.exit(0);
    });

    // Panel navigation
    this.screen.key(['right'], () => {
      if (this.state.currentPanel === 'plugins') {
        this.state.currentPanel = 'components';
        this.componentsPanel.focus();
      } else if (this.state.currentPanel === 'components') {
        this.state.currentPanel = 'preview';
        this.previewPanel.focus();
      }
      this.render();
    });

    this.screen.key(['left'], () => {
      if (this.state.currentPanel === 'preview') {
        this.state.currentPanel = 'components';
        this.componentsPanel.focus();
      } else if (this.state.currentPanel === 'components') {
        this.state.currentPanel = 'plugins';
        this.pluginsPanel.focus();
      }
      this.render();
    });

    // Vertical navigation
    this.screen.key(['up', 'k'], () => {
      if (this.state.currentPanel === 'components' && this.state.componentCursor > 0) {
        this.state.componentCursor--;
        this.render();
      }
    });

    this.screen.key(['down', 'j'], () => {
      if (this.state.currentPanel === 'components') {
        const maxCursor = this.getComponentsCount() - 1;
        if (this.state.componentCursor < maxCursor) {
          this.state.componentCursor++;
          this.render();
        }
      }
    });

    // Toggle selection
    this.screen.key(['space'], () => {
      if (this.state.currentPanel === 'components') {
        this.toggleCurrentComponent();
        this.render();
      }
    });

    // Select all
    this.screen.key(['a', 'A'], () => {
      this.selectAll();
      this.render();
    });

    // Deselect all
    this.screen.key(['n', 'N'], () => {
      this.deselectAll();
      this.render();
    });

    // Save
    this.screen.key(['s', 'S'], async () => {
      await this.save();
    });
  }

  private getComponentsCount(): number {
    const plugin = this.state.plugins[this.state.currentPluginIndex];
    return (
      plugin.commands.length +
      plugin.agents.length +
      plugin.skills.length +
      plugin.hooks.length +
      plugin.mcps.length
    );
  }

  private toggleCurrentComponent(): void {
    const plugin = this.state.plugins[this.state.currentPluginIndex];
    const selection = this.state.selections.get(plugin.name)!;
    const componentInfo = this.getComponentAtCursor();

    if (!componentInfo) return;

    const { type, index } = componentInfo;

    switch (type) {
      case 'command': {
        const cmd = plugin.commands[index];
        const idx = selection.commands.indexOf(cmd);
        if (idx >= 0) {
          selection.commands.splice(idx, 1);
        } else {
          selection.commands.push(cmd);
        }
        break;
      }
      case 'agent': {
        const agent = plugin.agents[index];
        const idx = selection.agents.indexOf(agent);
        if (idx >= 0) {
          selection.agents.splice(idx, 1);
        } else {
          selection.agents.push(agent);
        }
        break;
      }
      case 'skill': {
        const skill = plugin.skills[index];
        const idx = selection.skills.indexOf(skill);
        if (idx >= 0) {
          selection.skills.splice(idx, 1);
        } else {
          selection.skills.push(skill);
        }
        break;
      }
      case 'hook': {
        const hook = plugin.hooks[index];
        const idx = selection.hooks.findIndex(h => h === hook);
        if (idx >= 0) {
          selection.hooks.splice(idx, 1);
        } else {
          selection.hooks.push(hook);
        }
        break;
      }
      case 'mcp': {
        const mcp = plugin.mcps[index];
        const idx = selection.mcps.findIndex(m => m.name === mcp.name);
        if (idx >= 0) {
          selection.mcps.splice(idx, 1);
        } else {
          selection.mcps.push(mcp);
        }
        break;
      }
    }
  }

  private getComponentAtCursor(): { type: string; index: number } | null {
    const plugin = this.state.plugins[this.state.currentPluginIndex];
    let cursor = this.state.componentCursor;

    if (cursor < plugin.commands.length) {
      return { type: 'command', index: cursor };
    }
    cursor -= plugin.commands.length;

    if (cursor < plugin.agents.length) {
      return { type: 'agent', index: cursor };
    }
    cursor -= plugin.agents.length;

    if (cursor < plugin.skills.length) {
      return { type: 'skill', index: cursor };
    }
    cursor -= plugin.skills.length;

    if (cursor < plugin.hooks.length) {
      return { type: 'hook', index: cursor };
    }
    cursor -= plugin.hooks.length;

    if (cursor < plugin.mcps.length) {
      return { type: 'mcp', index: cursor };
    }

    return null;
  }

  private selectAll(): void {
    const plugin = this.state.plugins[this.state.currentPluginIndex];
    const selection = this.state.selections.get(plugin.name)!;

    selection.commands = [...plugin.commands];
    selection.agents = [...plugin.agents];
    selection.skills = [...plugin.skills];
    selection.hooks = [...plugin.hooks];
    selection.mcps = [...plugin.mcps];
  }

  private deselectAll(): void {
    const plugin = this.state.plugins[this.state.currentPluginIndex];
    const selection = this.state.selections.get(plugin.name)!;

    selection.commands = [];
    selection.agents = [];
    selection.skills = [];
    selection.hooks = [];
    selection.mcps = [];
  }

  private async save(): Promise<void> {
    try {
      await saveSelection(this.state.plugins, this.state.selections, {
        outputDir: './output/curated-plugin',
        pluginName: 'curated-plugin',
      });

      // Show success message
      const msg = blessed.message({
        parent: this.screen,
        top: 'center',
        left: 'center',
        width: '50%',
        height: 'shrink',
        border: { type: 'line' },
        style: {
          border: { fg: 'green' },
        },
      });

      msg.display('Plugin saved successfully!\n\nLocation: ./output/curated-plugin\n\nPress any key to continue...', 0, () => {
        this.render();
      });
    } catch (error: any) {
      const msg = blessed.message({
        parent: this.screen,
        top: 'center',
        left: 'center',
        width: '50%',
        height: 'shrink',
        border: { type: 'line' },
        style: {
          border: { fg: 'red' },
        },
      });

      msg.display(`Error: ${error.message}\n\nPress any key to continue...`, 0, () => {
        this.render();
      });
    }
  }

  private render(): void {
    this.renderPluginsPanel();
    this.renderComponentsPanel();
    this.renderPreviewPanel();
    this.screen.render();
  }

  private renderPluginsPanel(): void {
    const lines: string[] = [];

    for (let i = 0; i < this.state.plugins.length; i++) {
      const plugin = this.state.plugins[i];
      const isActive = i === this.state.currentPluginIndex;
      const icon = isActive ? '▼' : '▽';
      const star = isActive ? ' (★)' : '';

      lines.push(`${icon} ${plugin.name}${star}`);
      lines.push(`  • ${plugin.commands.length} commands`);
      lines.push(`  • ${plugin.agents.length} agents`);
      lines.push(`  • ${plugin.skills.length} skills`);
      lines.push(`  • ${plugin.hooks.length} hooks`);
      lines.push(`  • ${plugin.mcps.length} MCPs`);
      lines.push('');
    }

    this.pluginsPanel.setContent(lines.join('\n'));
  }

  private renderComponentsPanel(): void {
    const plugin = this.state.plugins[this.state.currentPluginIndex];
    const selection = this.state.selections.get(plugin.name)!;
    const lines: string[] = [];
    let cursor = 0;

    // Commands
    if (plugin.commands.length > 0) {
      lines.push(`COMMANDS (${plugin.commands.length})`);
      for (const cmd of plugin.commands) {
        const isSelected = selection.commands.includes(cmd);
        const checkbox = isSelected ? '[✓]' : '[ ]';
        const cursorChar = cursor === this.state.componentCursor ? '► ' : '  ';
        lines.push(`${cursorChar}${checkbox} ${cmd}`);
        cursor++;
      }
      lines.push('');
    }

    // Agents
    if (plugin.agents.length > 0) {
      lines.push(`AGENTS (${plugin.agents.length})`);
      for (const agent of plugin.agents) {
        const isSelected = selection.agents.includes(agent);
        const checkbox = isSelected ? '[✓]' : '[ ]';
        const cursorChar = cursor === this.state.componentCursor ? '► ' : '  ';
        lines.push(`${cursorChar}${checkbox} ${agent}`);
        cursor++;
      }
      lines.push('');
    }

    // Skills
    if (plugin.skills.length > 0) {
      lines.push(`SKILLS (${plugin.skills.length})`);
      for (const skill of plugin.skills) {
        const isSelected = selection.skills.includes(skill);
        const checkbox = isSelected ? '[✓]' : '[ ]';
        const cursorChar = cursor === this.state.componentCursor ? '► ' : '  ';
        lines.push(`${cursorChar}${checkbox} ${skill}`);
        cursor++;
      }
      lines.push('');
    }

    // Hooks
    if (plugin.hooks.length > 0) {
      lines.push(`HOOKS (${plugin.hooks.length})`);
      for (const hook of plugin.hooks) {
        const isSelected = selection.hooks.includes(hook);
        const checkbox = isSelected ? '[✓]' : '[ ]';
        const cursorChar = cursor === this.state.componentCursor ? '► ' : '  ';
        const display = `${hook.event}${hook.matcher ? `:${hook.matcher}` : ''} → ${hook.command}`;
        lines.push(`${cursorChar}${checkbox} ${display}`);
        cursor++;
      }
      lines.push('');
    }

    // MCPs
    if (plugin.mcps.length > 0) {
      lines.push(`MCP SERVERS (${plugin.mcps.length})`);
      for (const mcp of plugin.mcps) {
        const isSelected = selection.mcps.some(m => m.name === mcp.name);
        const checkbox = isSelected ? '[✓]' : '[ ]';
        const cursorChar = cursor === this.state.componentCursor ? '► ' : '  ';
        lines.push(`${cursorChar}${checkbox} ${mcp.name}`);
        cursor++;
      }
    }

    this.componentsPanel.setContent(lines.join('\n'));
  }

  private renderPreviewPanel(): void {
    const preview = this.generatePreview();
    this.previewPanel.setContent(JSON.stringify(preview, null, 2));
  }

  private generatePreview(): any {
    const preview: any = {
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    for (const [pluginName, selection] of this.state.selections.entries()) {
      preview.commands.push(...selection.commands);
      preview.agents.push(...selection.agents);
      preview.skills.push(...selection.skills);
      preview.hooks.push(...selection.hooks);
      preview.mcps.push(...selection.mcps);
    }

    return preview;
  }

  public run(): void {
    this.componentsPanel.focus();
    this.screen.render();
  }
}
