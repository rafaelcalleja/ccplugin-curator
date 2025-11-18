#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs/promises';
import { normalizePlugin } from './lib/normalize';
import { NormalizedPlugin } from './types/normalized';
import { PluginCuratorTUI } from './tui/app';
import { MainMenu } from './tui/menu';
import { ConfigForm, ConfigFormData } from './tui/config-form';

/**
 * CLI Entry Point
 *
 * Usage:
 *   ccplugin-curator               (interactive mode)
 *   ccplugin-curator select <plugins-folder>
 */
async function main() {
  const args = process.argv.slice(2);

  // Help
  if (args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  // Interactive mode (no arguments)
  if (args.length === 0) {
    await runInteractive();
    return;
  }

  // Command mode
  const command = args[0];

  if (command === 'select') {
    const pluginsFolder = args[1];

    if (!pluginsFolder) {
      console.error('Error: Missing plugins folder argument');
      console.error('Usage: ccplugin-curator select <plugins-folder>');
      process.exit(1);
    }

    await runSelect(pluginsFolder);
  } else {
    console.error(`Error: Unknown command "${command}"`);
    printHelp();
    process.exit(1);
  }
}

/**
 * Run interactive mode (setup screens + component selection)
 */
async function runInteractive() {
  try {
    // Show main menu
    const menu = new MainMenu();
    const menuResult = await menu.show();

    if (menuResult === 'exit') {
      console.log('Goodbye!');
      process.exit(0);
    }

    // Show configuration form
    const configForm = new ConfigForm();
    const config = await configForm.show();

    if (!config) {
      console.log('Configuration cancelled');
      process.exit(0);
    }

    // Expand ~ in paths
    const sourceDir = config.sourceDir.replace(/^~/, process.env.HOME || '~');
    const outputDir = config.outputDir.replace(/^~/, process.env.HOME || '~');

    console.log('\nConfiguration:');
    console.log(`  Marketplace Name: ${config.marketplaceName}`);
    console.log(`  Plugin Name: ${config.pluginName}`);
    console.log(`  Source Directory: ${sourceDir}`);
    console.log(`  Output Directory: ${outputDir}`);
    if (config.authorEmail) {
      console.log(`  Author Email: ${config.authorEmail}`);
    }
    console.log('');

    // Run component selection with the configured settings
    await runSelect(sourceDir, {
      outputDir,
      pluginName: config.marketplaceName,
      displayName: config.pluginName,
      authorEmail: config.authorEmail,
    });
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Claude Plugin Curator - TUI tool to curate and combine plugin components

Usage:
  ccplugin-curator                       Interactive mode (recommended)
  ccplugin-curator select <plugins-folder>

Commands:
  (no arguments)     Launch interactive mode with setup screens
  select <folder>    Scan plugins in folder and launch TUI to select components

Options:
  -h, --help        Show this help message

Examples:
  ccplugin-curator                        # Interactive mode
  ccplugin-curator select ~/.claude/plugins
  ccplugin-curator select ./my-plugins

Interactive Mode Flow:
  1. Main Menu         Choose to create curated plugin or exit
  2. Configuration     Enter plugin metadata and directories
  3. Component Selection    Select components from discovered plugins

Keyboard Shortcuts (TUI):
  ←→                Switch between panels
  ↑↓                Navigate up/down
  SPACE             Toggle component selection
  A                 Select all components
  N                 Deselect all components
  S                 Save selection
  Q                 Quit

Output:
  ./output/curated-plugin/
    ├── .claude-plugin/marketplace.json    (marketplace config)
    ├── plugins/curated-plugin/            (ready-to-use plugin)
    └── normalized-plugin.json             (debug format)

Installation:
  /plugin marketplace add ./output/curated-plugin
  /plugin install curated-plugin
`);
}

/**
 * Run select command
 */
async function runSelect(
  pluginsFolder: string,
  options?: {
    outputDir?: string;
    pluginName?: string;
    displayName?: string;
    authorEmail?: string;
  }
) {
  try {
    console.log(`Scanning plugins in: ${pluginsFolder}`);

    // Scan for plugins
    const plugins = await scanPlugins(pluginsFolder);

    if (plugins.length === 0) {
      console.error('Error: No plugins found in the specified folder');
      console.error('Make sure each plugin has a .claude-plugin/plugin.json file');
      process.exit(1);
    }

    console.log(`Found ${plugins.length} plugin(s)`);

    // Normalize all plugins
    const normalized: NormalizedPlugin[] = [];

    for (const pluginDir of plugins) {
      console.log(`Loading: ${path.basename(pluginDir)}`);
      const normalizedPlugin = await normalizePlugin(pluginDir);
      normalized.push(normalizedPlugin);
    }

    console.log('Launching TUI...\n');

    // Launch TUI
    const tui = new PluginCuratorTUI(normalized, options);
    tui.run();
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Scan for plugins in a folder
 * Returns list of plugin directories that contain .claude-plugin/plugin.json
 */
async function scanPlugins(folder: string): Promise<string[]> {
  const plugins: string[] = [];
  const resolvedFolder = path.resolve(folder);

  try {
    const entries = await fs.readdir(resolvedFolder, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const pluginDir = path.join(resolvedFolder, entry.name);
      const pluginJsonPath = path.join(pluginDir, '.claude-plugin/plugin.json');

      try {
        await fs.access(pluginJsonPath);
        plugins.push(pluginDir);
      } catch {
        // plugin.json doesn't exist, skip
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to scan plugins folder: ${error.message}`);
  }

  return plugins;
}

// Run CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
