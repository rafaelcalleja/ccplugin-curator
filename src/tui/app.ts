import * as blessed from 'blessed';
import * as path from 'path';
import { NormalizedPlugin } from '../types/normalized';
import { saveSelection, hasSelections } from '../core/saver';

export interface SelectionState {
  [pluginName: string]: {
    commands: Set<string>;
    agents: Set<string>;
    skills: Set<string>;
    hooks: Set<string>;
    mcps: Set<string>;
  };
}

export class TUIApp {
  private screen: blessed.Widgets.Screen;
  private pluginsBox: blessed.Widgets.ListElement;
  private componentsBox: blessed.Widgets.ListElement;
  private previewBox: blessed.Widgets.BoxElement;
  private statusBar: blessed.Widgets.BoxElement;

  private plugins: NormalizedPlugin[];
  private pluginDir: string;
  private currentPluginIndex: number = 0;
  private currentFocus: 'plugins' | 'components' | 'preview' = 'components';
  private selection: SelectionState = {};

  private allComponents: Array<{ type: string; id: string; label: string }> = [];
  private currentComponentIndex: number = 0;

  constructor(plugins: NormalizedPlugin[], pluginDir: string) {
    this.plugins = plugins;
    this.pluginDir = pluginDir;
    this.initializeSelection();
    this.screen = this.createScreen();
    this.pluginsBox = this.createPluginsPanel();
    this.componentsBox = this.createComponentsPanel();
    this.previewBox = this.createPreviewPanel();
    this.statusBar = this.createStatusBar();
    this.setupKeyBindings();
    this.updateAllPanels();
  }

  private initializeSelection() {
    for (const plugin of this.plugins) {
      this.selection[plugin.name] = {
        commands: new Set(),
        agents: new Set(),
        skills: new Set(),
        hooks: new Set(),
        mcps: new Set(),
      };
    }
  }

  private createScreen(): blessed.Widgets.Screen {
    const screen = blessed.screen({
      smartCSR: true,
      title: 'mkcurator - Plugin Component Selector',
    });

    screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0);
    });

    return screen;
  }

  private createPluginsPanel(): blessed.Widgets.ListElement {
    const box = blessed.list({
      parent: this.screen,
      label: ' PLUGINS ',
      tags: true,
      top: 0,
      left: 0,
      width: '25%',
      height: '100%-2',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        selected: { bg: 'blue', fg: 'white' },
        focus: { border: { fg: 'yellow' } },
      },
      keys: true,
      vi: true,
      mouse: true,
    });

    return box;
  }

  private createComponentsPanel(): blessed.Widgets.ListElement {
    const box = blessed.list({
      parent: this.screen,
      label: ' COMPONENTS ',
      tags: true,
      top: 0,
      left: '25%',
      width: '40%',
      height: '100%-2',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
        selected: { bg: 'blue', fg: 'white' },
        focus: { border: { fg: 'yellow' } },
      },
      keys: true,
      vi: true,
      mouse: true,
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        track: { bg: 'gray' },
        style: { inverse: true },
      },
    });

    return box;
  }

  private createPreviewPanel(): blessed.Widgets.BoxElement {
    const box = blessed.box({
      parent: this.screen,
      label: ' PREVIEW ',
      tags: true,
      top: 0,
      left: '65%',
      width: '35%',
      height: '100%-2',
      border: { type: 'line' },
      style: {
        border: { fg: 'cyan' },
      },
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        track: { bg: 'gray' },
        style: { inverse: true },
      },
      keys: true,
      vi: true,
    });

    return box;
  }

  private createStatusBar(): blessed.Widgets.BoxElement {
    const box = blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      content: '↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit',
      style: {
        bg: 'blue',
        fg: 'white',
      },
    });

    return box;
  }

  private setupKeyBindings() {
    // Components panel - toggle selection
    this.componentsBox.key(['space'], () => {
      this.toggleCurrentComponent();
    });

    // Select all / none shortcuts
    this.screen.key(['a'], () => {
      if (this.currentFocus === 'components') {
        this.selectAllComponents();
      }
    });

    this.screen.key(['n'], () => {
      if (this.currentFocus === 'components') {
        this.selectNoneComponents();
      }
    });

    // Save
    this.screen.key(['s'], () => {
      this.saveSelection();
    });

    // Tab navigation
    this.screen.key(['tab'], () => {
      this.currentPluginIndex = (this.currentPluginIndex + 1) % this.plugins.length;
      this.updateAllPanels();
    });

    this.screen.key(['S-tab'], () => {
      this.currentPluginIndex = (this.currentPluginIndex - 1 + this.plugins.length) % this.plugins.length;
      this.updateAllPanels();
    });

    // Update preview when selection changes
    this.componentsBox.on('select', () => {
      this.currentComponentIndex = (this.componentsBox as any).selected;
      this.updatePreview();
    });

    // Focus management
    this.componentsBox.focus();
  }

  private updateAllPanels() {
    this.updatePluginsList();
    this.updateComponentsList();
    this.updatePreview();
    this.screen.render();
  }

  private updatePluginsList() {
    const items = this.plugins.map((plugin, index) => {
      const active = index === this.currentPluginIndex ? '{yellow-fg}▶{/yellow-fg} ' : '  ';
      const stats = [
        plugin.commands.length && `${plugin.commands.length} commands`,
        plugin.agents.length && `${plugin.agents.length} agents`,
        plugin.skills.length && `${plugin.skills.length} skills`,
        plugin.hooks.length && `${plugin.hooks.length} hooks`,
        plugin.mcps.length && `${plugin.mcps.length} MCPs`,
      ].filter(Boolean).join(', ');

      return `${active}{bold}${plugin.name}{/bold}\n    ${stats || '(empty)'}`;
    });

    this.pluginsBox.setItems(items);
    this.pluginsBox.select(this.currentPluginIndex);
  }

  private updateComponentsList() {
    const plugin = this.plugins[this.currentPluginIndex];
    if (!plugin) return;

    this.allComponents = [];
    const items: string[] = [];

    // Commands
    if (plugin.commands.length > 0) {
      items.push(`{yellow-fg}COMMANDS (${plugin.commands.length}){/yellow-fg}`);
      plugin.commands.forEach((cmd) => {
        const id = cmd;
        const checked = this.selection[plugin.name].commands.has(id);
        const checkbox = checked ? '{green-fg}[✓]{/green-fg}' : '[ ]';
        const name = path.basename(cmd, '.md');
        items.push(`  ${checkbox} ${name}`);
        this.allComponents.push({ type: 'commands', id, label: name });
      });
    }

    // Agents
    if (plugin.agents.length > 0) {
      items.push('');
      items.push(`{yellow-fg}AGENTS (${plugin.agents.length}){/yellow-fg}`);
      plugin.agents.forEach((agent) => {
        const id = agent;
        const checked = this.selection[plugin.name].agents.has(id);
        const checkbox = checked ? '{green-fg}[✓]{/green-fg}' : '[ ]';
        const name = path.basename(agent, '.md');
        items.push(`  ${checkbox} ${name}`);
        this.allComponents.push({ type: 'agents', id, label: name });
      });
    }

    // Skills
    if (plugin.skills.length > 0) {
      items.push('');
      items.push(`{yellow-fg}SKILLS (${plugin.skills.length}){/yellow-fg}`);
      plugin.skills.forEach((skill) => {
        const id = skill;
        const checked = this.selection[plugin.name].skills.has(id);
        const checkbox = checked ? '{green-fg}[✓]{/green-fg}' : '[ ]';
        const name = path.basename(skill);
        items.push(`  ${checkbox} ${name}`);
        this.allComponents.push({ type: 'skills', id, label: name });
      });
    }

    // Hooks
    if (plugin.hooks.length > 0) {
      items.push('');
      items.push(`{yellow-fg}HOOKS (${plugin.hooks.length}){/yellow-fg}`);
      plugin.hooks.forEach((hook) => {
        const id = hook.id;
        const checked = this.selection[plugin.name].hooks.has(id);
        const checkbox = checked ? '{green-fg}[✓]{/green-fg}' : '[ ]';
        const matcher = hook.matcher ? `:${hook.matcher}` : ':*';
        const command = hook.config.command || hook.config.agent || '';
        const label = `${hook.event}${matcher} → ${path.basename(command)}`;
        items.push(`  ${checkbox} ${label}`);
        this.allComponents.push({ type: 'hooks', id, label });
      });
    }

    // MCPs
    if (plugin.mcps.length > 0) {
      items.push('');
      items.push(`{yellow-fg}MCP SERVERS (${plugin.mcps.length}){/yellow-fg}`);
      plugin.mcps.forEach((mcp) => {
        const id = mcp.id;
        const checked = this.selection[plugin.name].mcps.has(id);
        const checkbox = checked ? '{green-fg}[✓]{/green-fg}' : '[ ]';
        items.push(`  ${checkbox} ${mcp.name}`);
        this.allComponents.push({ type: 'mcps', id, label: mcp.name });
      });
    }

    this.componentsBox.setItems(items);
  }

  private toggleCurrentComponent() {
    const plugin = this.plugins[this.currentPluginIndex];
    if (!plugin) return;

    // Find which component we're on (skip section headers)
    let componentIndex = -1;
    let visualIndex = 0;

    for (let i = 0; i < this.allComponents.length; i++) {
      // Skip section headers (they have yellow-fg tag)
      const box = this.componentsBox as any;
      while (visualIndex < box.ritems.length &&
             box.ritems[visualIndex].includes('yellow-fg')) {
        visualIndex++;
      }

      if (visualIndex === box.selected) {
        componentIndex = i;
        break;
      }
      visualIndex++;
    }

    if (componentIndex === -1) return;

    const component = this.allComponents[componentIndex];
    const set = this.selection[plugin.name][component.type as keyof typeof this.selection[string]];

    if (set.has(component.id)) {
      set.delete(component.id);
    } else {
      set.add(component.id);
    }

    this.updateComponentsList();
    this.updatePreview();
    this.screen.render();
  }

  private selectAllComponents() {
    const plugin = this.plugins[this.currentPluginIndex];
    if (!plugin) return;

    for (const component of this.allComponents) {
      (this.selection[plugin.name][component.type as keyof typeof this.selection[string]] as Set<string>).add(component.id);
    }

    this.updateComponentsList();
    this.updatePreview();
    this.screen.render();
  }

  private selectNoneComponents() {
    const plugin = this.plugins[this.currentPluginIndex];
    if (!plugin) return;

    this.selection[plugin.name] = {
      commands: new Set(),
      agents: new Set(),
      skills: new Set(),
      hooks: new Set(),
      mcps: new Set(),
    };

    this.updateComponentsList();
    this.updatePreview();
    this.screen.render();
  }

  private updatePreview() {
    const preview = this.generatePreviewJSON();
    this.previewBox.setContent(preview);
  }

  private generatePreviewJSON(): string {
    const output: any = {
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    // Aggregate all selections
    for (const plugin of this.plugins) {
      const sel = this.selection[plugin.name];

      output.commands.push(...Array.from(sel.commands));
      output.agents.push(...Array.from(sel.agents));
      output.skills.push(...Array.from(sel.skills));
      output.hooks.push(...Array.from(sel.hooks));
      output.mcps.push(...Array.from(sel.mcps));
    }

    return JSON.stringify(output, null, 2);
  }

  private async saveSelection() {
    // Check if there are selections
    if (!hasSelections(this.selection)) {
      const msg = blessed.message({
        parent: this.screen,
        top: 'center',
        left: 'center',
        width: '50%',
        height: 'shrink',
        border: { type: 'line' },
        style: { border: { fg: 'red' } },
        content: '{center}No components selected!{/center}\n\n{center}Press any key to continue{/center}',
        tags: true,
      });
      msg.focus();
      this.screen.render();
      return;
    }

    // Save to output directory
    const outputPath = path.join(process.cwd(), 'output', 'curated-plugin.json');

    try {
      await saveSelection(outputPath, this.plugins, this.selection);

      const msg = blessed.message({
        parent: this.screen,
        top: 'center',
        left: 'center',
        width: '60%',
        height: 'shrink',
        border: { type: 'line' },
        style: { border: { fg: 'green' } },
        content: `{center}{green-fg}✓ Saved successfully!{/green-fg}{/center}\n\n{center}${outputPath}{/center}\n\n{center}Press any key to continue{/center}`,
        tags: true,
      });
      msg.focus();
      this.screen.render();
    } catch (error) {
      const msg = blessed.message({
        parent: this.screen,
        top: 'center',
        left: 'center',
        width: '60%',
        height: 'shrink',
        border: { type: 'line' },
        style: { border: { fg: 'red' } },
        content: `{center}{red-fg}Error saving file:{/red-fg}{/center}\n\n${error instanceof Error ? error.message : String(error)}\n\n{center}Press any key to continue{/center}`,
        tags: true,
      });
      msg.focus();
      this.screen.render();
    }
  }

  public run() {
    this.screen.render();
  }
}
