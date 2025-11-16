#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs/promises';
import { normalizePlugin } from './lib/normalize';
import { NormalizedPlugin } from './types/normalized';
import { PluginCuratorTUI } from './tui/app';

/**
 * CLI Entry Point
 *
 * Usage: ccplugin-curator select <plugins-folder>
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }

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
 * Print help message
 */
function printHelp() {
  console.log(`
Claude Plugin Curator - TUI tool to curate and combine plugin components

Usage:
  ccplugin-curator select <plugins-folder>

Commands:
  select <folder>    Scan plugins in folder and launch TUI to select components

Options:
  -h, --help        Show this help message

Examples:
  ccplugin-curator select ~/.claude/plugins
  ccplugin-curator select ./my-plugins

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
async function runSelect(pluginsFolder: string) {
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
    const tui = new PluginCuratorTUI(normalized);
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
