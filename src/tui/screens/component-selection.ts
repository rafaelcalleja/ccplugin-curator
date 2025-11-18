import * as blessed from 'blessed';
import type { NormalizedPlugin } from '../../types/normalized';
import { createState, toggleCommand, toggleAgent, toggleSkill, toggleHook, toggleMcp, selectAll, deselectAll, generatePreview, type TuiState } from '../state';
import type { Selection, SelectionPlugin } from '../../lib/save-controller';

export interface ComponentSelectionResult {
  selection: Selection;
  action: 'save' | 'quit';
}

/**
 * Shows component selection TUI and returns user's selections
 */
export async function showComponentSelection(plugins: NormalizedPlugin[]): Promise<ComponentSelectionResult> {
  return new Promise((resolve) => {
    const state = createState(plugins);
    const screen = blessed.screen({
      smartCSR: true,
      title: 'Component Selection - CCPlugin Curator'
    });

    // Three panels: PLUGINS | COMPONENTS | PREVIEW
    const pluginsPanel = blessed.list({
      label: ' PLUGINS ',
      top: 0,
      left: 0,
      width: '25%',
      height: '100%-2',
      border: 'line',
      style: {
        border: { fg: 'cyan' },
        selected: { bg: 'blue', fg: 'white', bold: true },
        focus: { border: { fg: 'yellow' } }
      },
      keys: true,
      vi: true,
      mouse: true,
      scrollbar: {
        ch: ' ',
        style: { inverse: true }
      },
      items: plugins.map(p => p.name)
    });

    const componentsPanel = blessed.list({
      label: ' COMPONENTS ',
      top: 0,
      left: '25%',
      width: '40%',
      height: '100%-2',
      border: 'line',
      style: {
        border: { fg: 'cyan' },
        selected: { bg: 'blue', fg: 'white', bold: true },
        focus: { border: { fg: 'yellow' } }
      },
      keys: true,
      vi: true,
      mouse: true,
      scrollbar: {
        ch: ' ',
        style: { inverse: true }
      }
    });

    const previewPanel = blessed.box({
      label: ' PREVIEW ',
      top: 0,
      left: '65%',
      width: '35%',
      height: '100%-2',
      border: 'line',
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: ' ',
        style: { inverse: true }
      },
      style: {
        border: { fg: 'cyan' }
      },
      keys: true,
      vi: true,
      mouse: true
    });

    const helpBar = blessed.text({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 2,
      content: '←→: Switch panels | ↑↓: Navigate | SPACE: Toggle | A: Select all | N: Deselect all | S: Save | Q: Quit',
      style: {
        fg: 'gray',
        bg: 'black'
      }
    });

    screen.append(pluginsPanel);
    screen.append(componentsPanel);
    screen.append(previewPanel);
    screen.append(helpBar);

    let currentPanel: 'plugins' | 'components' | 'preview' = 'plugins';

    /**
     * Updates the components list based on selected plugin
     */
    function updateComponentsList() {
      if (state.focus.pluginIndex >= plugins.length) return;

      const plugin = plugins[state.focus.pluginIndex];
      const selection = state.selections.get(plugin.name);
      if (!selection) return;

      const items: string[] = [];

      // Commands
      if (plugin.commands.length > 0) {
        items.push('{bold}Commands:{/bold}');
        for (const cmd of plugin.commands) {
          const checked = selection.commands.has(cmd) ? '[✓]' : '[ ]';
          items.push(`  ${checked} ${cmd}`);
        }
      }

      // Agents
      if (plugin.agents.length > 0) {
        items.push('{bold}Agents:{/bold}');
        for (const agent of plugin.agents) {
          const checked = selection.agents.has(agent) ? '[✓]' : '[ ]';
          items.push(`  ${checked} ${agent}`);
        }
      }

      // Skills
      if (plugin.skills.length > 0) {
        items.push('{bold}Skills:{/bold}');
        for (const skill of plugin.skills) {
          const checked = selection.skills.has(skill) ? '[✓]' : '[ ]';
          items.push(`  ${checked} ${skill}`);
        }
      }

      // Hooks
      if (plugin.hooks.length > 0) {
        items.push('{bold}Hooks:{/bold}');
        plugin.hooks.forEach((hook, i) => {
          const checked = selection.hooks.has(i) ? '[✓]' : '[ ]';
          const display = `${hook.event}${hook.matcher ? ` (${hook.matcher})` : ''}`;
          items.push(`  ${checked} ${display}`);
        });
      }

      // MCPs
      if (plugin.mcps.length > 0) {
        items.push('{bold}MCPs:{/bold}');
        plugin.mcps.forEach((mcp, i) => {
          const checked = selection.mcps.has(i) ? '[✓]' : '[ ]';
          items.push(`  ${checked} ${mcp.name}`);
        });
      }

      componentsPanel.setItems(items);
      screen.render();
    }

    /**
     * Updates the preview panel
     */
    function updatePreview() {
      const preview = generatePreview(state);
      const json = JSON.stringify(preview, null, 2);
      previewPanel.setContent(json);
      screen.render();
    }

    /**
     * Toggles selection of current component
     */
    function toggleCurrentComponent() {
      const plugin = plugins[state.focus.pluginIndex];
      if (!plugin) return;

      const items = (componentsPanel as any).items as any[];
      const selectedIndex = (componentsPanel as any).selected;
      const item = items[selectedIndex];

      if (!item || item.startsWith('{bold}')) return; // Skip headers

      const text = item.toString();

      // Find which type it is based on position
      let cmdCount = 0, agentCount = 0, skillCount = 0, hookCount = 0;
      let currentType = '';

      for (let i = 0; i <= selectedIndex; i++) {
        const line = items[i].toString();
        if (line.includes('{bold}Commands:{/bold}')) currentType = 'commands';
        else if (line.includes('{bold}Agents:{/bold}')) currentType = 'agents';
        else if (line.includes('{bold}Skills:{/bold}')) currentType = 'skills';
        else if (line.includes('{bold}Hooks:{/bold}')) currentType = 'hooks';
        else if (line.includes('{bold}MCPs:{/bold}')) currentType = 'mcps';
        else if (!line.startsWith('{bold}')) {
          if (currentType === 'commands') cmdCount++;
          else if (currentType === 'agents') agentCount++;
          else if (currentType === 'skills') skillCount++;
          else if (currentType === 'hooks') hookCount++;
        }
      }

      // Toggle based on type
      if (currentType === 'commands' && cmdCount > 0) {
        const cmd = plugin.commands[cmdCount - 1];
        if (cmd) toggleCommand(state, plugin.name, cmd);
      } else if (currentType === 'agents' && agentCount > 0) {
        const agent = plugin.agents[agentCount - 1];
        if (agent) toggleAgent(state, plugin.name, agent);
      } else if (currentType === 'skills' && skillCount > 0) {
        const skill = plugin.skills[skillCount - 1];
        if (skill) toggleSkill(state, plugin.name, skill);
      } else if (currentType === 'hooks' && hookCount > 0) {
        toggleHook(state, plugin.name, hookCount - 1);
      } else if (currentType === 'mcps') {
        const mcpIndex = plugin.hooks.length > 0 ? hookCount : (hookCount - 1);
        toggleMcp(state, plugin.name, mcpIndex);
      }

      updateComponentsList();
      updatePreview();
    }

    // Initialize
    updateComponentsList();
    updatePreview();
    pluginsPanel.focus();

    // Plugin selection change
    pluginsPanel.on('select', (item, index) => {
      state.focus.pluginIndex = index;
      updateComponentsList();
    });

    // Navigation between panels
    screen.key(['left', 'h'], () => {
      if (currentPanel === 'components') {
        currentPanel = 'plugins';
        pluginsPanel.focus();
      } else if (currentPanel === 'preview') {
        currentPanel = 'components';
        componentsPanel.focus();
      }
      screen.render();
    });

    screen.key(['right', 'l'], () => {
      if (currentPanel === 'plugins') {
        currentPanel = 'components';
        componentsPanel.focus();
      } else if (currentPanel === 'components') {
        currentPanel = 'preview';
        previewPanel.focus();
      }
      screen.render();
    });

    // Toggle selection
    screen.key(['space'], () => {
      if (currentPanel === 'components') {
        toggleCurrentComponent();
      }
    });

    // Select all
    screen.key(['a', 'A'], () => {
      const plugin = plugins[state.focus.pluginIndex];
      if (plugin) {
        selectAll(state, plugin.name);
        updateComponentsList();
        updatePreview();
      }
    });

    // Deselect all
    screen.key(['n', 'N'], () => {
      const plugin = plugins[state.focus.pluginIndex];
      if (plugin) {
        deselectAll(state, plugin.name);
        updateComponentsList();
        updatePreview();
      }
    });

    // Save
    screen.key(['s', 'S'], () => {
      const selection: Selection = {
        plugins: plugins.map(p => {
          const sel = state.selections.get(p.name)!;
          return {
            normalized: p,
            commands: Array.from(sel.commands),
            agents: Array.from(sel.agents),
            skills: Array.from(sel.skills),
            hooks: Array.from(sel.hooks).map(i => p.hooks[i]),
            mcps: Array.from(sel.mcps).map(i => p.mcps[i])
          };
        })
      };

      screen.destroy();
      resolve({ selection, action: 'save' });
    });

    // Quit
    screen.key(['q', 'Q', 'escape', 'C-c'], () => {
      screen.destroy();
      resolve({ selection: { plugins: [] }, action: 'quit' });
    });

    screen.render();
  });
}
