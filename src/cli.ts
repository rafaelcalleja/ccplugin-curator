import readline from 'readline';
import chalk from 'chalk';
import keypress from 'keypress';
import type { NormalizedPlugin } from './types/index.js';
import type { ComponentSelection } from './types/index.js';

export class CLI {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  displayHeader(pluginName: string) {
    console.clear();
    console.log(chalk.cyan('╔════════════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║') + chalk.bold('  mk-curator - Plugin Component Selector') + chalk.cyan('           ║'));
    console.log(chalk.cyan('╚════════════════════════════════════════════════════════════════╝'));
    console.log('');
    console.log(chalk.bold(`📦 Plugin: ${chalk.green(pluginName)}`));
    console.log('');
  }

  displayPlugin(plugin: NormalizedPlugin) {
    console.log(chalk.bold('Plugin Information:'));
    console.log(`  ${chalk.dim('Name:')} ${plugin.name}`);
    console.log(`  ${chalk.dim('Version:')} ${plugin.version}`);
    console.log(`  ${chalk.dim('Description:')} ${plugin.description || '(none)'}`);
    console.log('');

    const hookCount = (plugin as any).hooks?.length || 0;
    const mcpCount = (plugin as any).mcps?.length || 0;

    console.log(chalk.bold('📊 Available Components:'));
    console.log(`  ${chalk.cyan('Commands:')} ${plugin.commands.length} items`);
    console.log(`  ${chalk.cyan('Agents:')} ${plugin.agents.length} items`);
    console.log(`  ${chalk.cyan('Skills:')} ${plugin.skills.length} items`);
    console.log(`  ${chalk.cyan('Hooks:')} ${hookCount} items`);
    console.log(`  ${chalk.cyan('MCPs:')} ${mcpCount} items`);
    console.log('');
  }

  async selectComponents(plugin: NormalizedPlugin): Promise<ComponentSelection> {
    const selection: ComponentSelection = {
      pluginName: plugin.name,
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    // Select commands
    if (plugin.commands.length > 0) {
      selection.commands = await this.selectMultiple(
        'Select Commands (press Space, then Enter):',
        plugin.commands
      );
    }

    // Select agents
    if (plugin.agents.length > 0) {
      selection.agents = await this.selectMultiple(
        'Select Agents (press Space, then Enter):',
        plugin.agents
      );
    }

    // Select skills
    if (plugin.skills.length > 0) {
      selection.skills = await this.selectMultiple(
        'Select Skills (press Space, then Enter):',
        plugin.skills
      );
    }

    // Select hooks
    const hooks = (plugin as any).hooks || [];
    if (hooks.length > 0) {
      const hookLabels = hooks.map((h: any) => `${h.event}: ${h.command || h.agent || '?'}`);
      const selectedHookIndices = await this.selectMultiple(
        'Select Hooks (press Space, then Enter):',
        hookLabels
      );
      selection.hooks = selectedHookIndices.map((idx: any) => {
        const i = parseInt(idx.split(':')[0]);
        return hooks[i];
      });
    }

    // Select MCPs
    const mcps = (plugin as any).mcps || [];
    if (mcps.length > 0) {
      const mcpLabels = mcps.map((m: any) => m.name);
      const selectedMcpNames = await this.selectMultiple(
        'Select MCP Servers (press Space, then Enter):',
        mcpLabels
      );
      selection.mcps = selectedMcpNames.map((name: any) =>
        mcps.find((m: any) => m.name === name)
      );
    }

    return selection;
  }

  async selectMultiple(
    prompt: string,
    items: string[]
  ): Promise<string[]> {
    return new Promise((resolve) => {
      console.log('');
      console.log(chalk.yellow(prompt));
      console.log(chalk.dim('(Use Arrow Keys to navigate, Space to select, Enter to confirm)'));
      console.log('');

      // Check if stdin supports raw mode (interactive terminal)
      const isTTY = process.stdin.isTTY;

      if (!isTTY) {
        // Non-interactive mode - select all by default
        console.log(chalk.dim('(Non-interactive mode - selecting all items)'));
        resolve(items);
        return;
      }

      const selected = new Set<number>();
      let current = 0;
      let lines = items.length + 1; // +1 for prompt line

      // Setup keypress
      try {
        keypress(process.stdin);
      } catch (error) {
        // Fallback: select all
        console.log(chalk.dim('(Could not initialize keyboard input - selecting all items)'));
        resolve(items);
        return;
      }

      const redraw = () => {
        // Move cursor up to clear previous output
        for (let i = 0; i < lines; i++) {
          process.stdout.write('\x1B[A\x1B[2K');
        }
        lines = items.length;

        items.forEach((item, idx) => {
          const isSelected = selected.has(idx);
          const isCurrent = idx === current;

          let line = '';
          if (isCurrent) {
            line = chalk.bgBlue(chalk.white('►'));
          } else {
            line = ' ';
          }

          line += ' ';

          if (isSelected) {
            line += chalk.green('[✓]');
          } else {
            line += '[ ]';
          }

          line += ` ${item}`;
          console.log(line);
        });
      };

      redraw();

      const handleInput = (ch: any, key: any) => {
        if (key && key.ctrl && key.name === 'c') {
          if ((process.stdin as any).setRawMode) {
            (process.stdin as any).setRawMode(false);
          }
          process.exit(0);
        }

        if (key && key.name === 'up') {
          current = Math.max(0, current - 1);
          redraw();
        } else if (key && key.name === 'down') {
          current = Math.min(items.length - 1, current + 1);
          redraw();
        } else if (ch === ' ') {
          if (selected.has(current)) {
            selected.delete(current);
          } else {
            selected.add(current);
          }
          redraw();
        } else if (key && key.name === 'return') {
          if ((process.stdin as any).setRawMode) {
            (process.stdin as any).setRawMode(false);
          }
          process.stdin.removeListener('keypress', handleInput);
          process.stdout.write('\x1B[?25h'); // Show cursor
          console.log('');

          const result = Array.from(selected).map((idx) => items[idx]);
          resolve(result);
        }
      };

      if ((process.stdin as any).setRawMode) {
        (process.stdin as any).setRawMode(true);
      }
      process.stdin.on('keypress', handleInput);
    });
  }

  async confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.rl.question(chalk.yellow(message) + ' (y/n): ', (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
  }

  displaySelection(selection: ComponentSelection) {
    console.log('');
    console.log(chalk.bold('📋 Your Selection:'));
    console.log(`  ${chalk.cyan('Commands:')} ${selection.commands.length}`);
    console.log(`  ${chalk.cyan('Agents:')} ${selection.agents.length}`);
    console.log(`  ${chalk.cyan('Skills:')} ${selection.skills.length}`);
    console.log(`  ${chalk.cyan('Hooks:')} ${selection.hooks.length}`);
    console.log(`  ${chalk.cyan('MCPs:')} ${selection.mcps.length}`);
    console.log('');

    console.log(chalk.bold('📄 Preview (JSON):'));
    console.log('');

    const preview = {
      name: 'curated-plugin',
      commands: selection.commands,
      agents: selection.agents,
      skills: selection.skills,
      ...(selection.hooks.length > 0 && { hooks: selection.hooks }),
      ...(selection.mcps.length > 0 && { mcpServers: selection.mcps }),
    };

    console.log(JSON.stringify(preview, null, 2));
    console.log('');
  }

  showSuccess(filePath: string) {
    console.log(chalk.green('✓ Plugin saved successfully!'));
    console.log(`  Location: ${chalk.cyan(filePath)}`);
    console.log('');
  }

  showWarning(message: string) {
    console.log(chalk.yellow(`⚠ ${message}`));
    console.log('');
  }

  showError(message: string) {
    console.log(chalk.red(`✗ Error: ${message}`));
    console.log('');
  }

  close() {
    this.rl.close();
  }
}
