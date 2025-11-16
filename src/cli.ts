#!/usr/bin/env node

import * as path from 'path';
import { scanPlugins } from './scanner/plugin-scanner';
import { PluginCuratorTUI } from './tui';
import { saveSelection } from './save/save-operation';

interface CLIOptions {
  pluginDir: string;
  outputDir?: string;
  pluginName?: string;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: mkcurator select <plugin-directory> [--output <dir>] [--name <plugin-name>]');
    process.exit(1);
  }

  const command = args[0];

  if (command === 'select') {
    await selectCommand(args.slice(1));
  } else {
    console.error(`Unknown command: ${command}`);
    console.error('Available commands: select');
    process.exit(1);
  }
}

async function selectCommand(args: string[]) {
  const options = parseSelectArgs(args);

  if (!options.pluginDir) {
    console.error('Error: plugin directory is required');
    console.error('Usage: mkcurator select <plugin-directory>');
    process.exit(1);
  }

  try {
    // Scan plugins
    console.log(`Scanning plugins in: ${options.pluginDir}`);
    const plugins = await scanPlugins(options.pluginDir);

    if (plugins.length === 0) {
      console.error('No plugins found in directory');
      process.exit(1);
    }

    console.log(`Found ${plugins.length} plugin(s)`);

    // Launch TUI
    const tui = new PluginCuratorTUI(plugins);

    // Setup save callback
    tui.onSaveCallback(async () => {
      const selectionState = tui.getSelectionState();

      if (!selectionState.hasSelection()) {
        tui.showMessage('⚠ No hay componentes seleccionados');
        return;
      }

      // Get output options
      const outputDir = options.outputDir || './output/curated-plugin';
      const pluginName = options.pluginName || 'curated-plugin';

      try {
        const result = await saveSelection(selectionState, {
          outputDir,
          pluginName,
          overwrite: true
        });

        if (result.success) {
          tui.showMessage(result.message);
        } else {
          tui.showMessage(`Error: ${result.message}`);
        }
      } catch (error) {
        tui.showMessage(`Error saving: ${error}`);
      }
    });

    // Setup quit callback
    tui.onQuitCallback(() => {
      console.log('Exiting...');
    });

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

function parseSelectArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    pluginDir: ''
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--output' || arg === '-o') {
      options.outputDir = args[++i];
    } else if (arg === '--name' || arg === '-n') {
      options.pluginName = args[++i];
    } else if (!arg.startsWith('-')) {
      options.pluginDir = arg;
    }
  }

  return options;
}

// Run main
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
