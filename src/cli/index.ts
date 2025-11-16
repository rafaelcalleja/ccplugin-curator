#!/usr/bin/env node

/**
 * CLI Entry Point
 * Implements: docs/spec/004-user-workflows.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { normalizePlugin } from '../core/normalize';
import type { PluginJson } from '../types/plugin';
import type { NormalizedPlugin } from '../types/normalized';

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: ccplugin-curator select <plugin-folder>');
    process.exit(1);
  }

  const command = args[0];
  const pluginFolder = args[1];

  if (command === 'select') {
    if (!pluginFolder) {
      console.error('Error: Plugin folder required');
      console.log('Usage: ccplugin-curator select <plugin-folder>');
      process.exit(1);
    }

    await selectCommand(pluginFolder);
  } else {
    console.error(`Unknown command: ${command}`);
    console.log('Available commands: select');
    process.exit(1);
  }
}

/**
 * Select command: scan plugins and launch TUI
 */
async function selectCommand(pluginFolder: string) {
  const resolvedPath = path.resolve(pluginFolder);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: Folder not found: ${pluginFolder}`);
    process.exit(1);
  }

  // Scan for plugins
  console.log(`Scanning ${resolvedPath} for plugins...`);
  const plugins = await scanPlugins(resolvedPath);

  if (plugins.length === 0) {
    console.error('Error: No plugins found');
    console.log('Looking for directories with .claude-plugin/plugin.json');
    process.exit(1);
  }

  console.log(`Found ${plugins.length} plugin(s):`);
  for (const plugin of plugins) {
    console.log(`  - ${plugin.name} (${plugin.source})`);
  }

  console.log('\nLaunching TUI...\n');

  // Launch TUI
  const { launchTUI } = await import('../tui/app');
  await launchTUI(plugins);
}

/**
 * Scan for plugins in a directory
 */
async function scanPlugins(dir: string): Promise<NormalizedPlugin[]> {
  const plugins: NormalizedPlugin[] = [];

  // Check if dir itself is a plugin
  const pluginJsonPath = path.join(dir, '.claude-plugin', 'plugin.json');
  if (fs.existsSync(pluginJsonPath)) {
    const plugin = await loadPlugin(dir);
    if (plugin) {
      plugins.push(plugin);
    }
    return plugins;
  }

  // Search for plugins in subdirectories
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const subDir = path.join(dir, entry.name);
    const subPluginJsonPath = path.join(
      subDir,
      '.claude-plugin',
      'plugin.json'
    );

    if (fs.existsSync(subPluginJsonPath)) {
      const plugin = await loadPlugin(subDir);
      if (plugin) {
        plugins.push(plugin);
      }
    }
  }

  return plugins;
}

/**
 * Load and normalize a single plugin
 */
async function loadPlugin(
  pluginDir: string
): Promise<NormalizedPlugin | null> {
  try {
    const pluginJsonPath = path.join(
      pluginDir,
      '.claude-plugin',
      'plugin.json'
    );
    const content = fs.readFileSync(pluginJsonPath, 'utf-8');
    const pluginJson: PluginJson = JSON.parse(content);

    return await normalizePlugin(pluginDir, pluginJson);
  } catch (error) {
    console.error(`Error loading plugin from ${pluginDir}:`, error);
    return null;
  }
}

// Run CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
