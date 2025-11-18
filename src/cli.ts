#!/usr/bin/env node

import { Command } from 'commander';
import { render } from 'ink';
import React from 'react';
import * as path from 'path';
import * as fs from 'fs/promises';
import { loadPlugin } from './loader/pluginLoader';
import { transformToNormalized } from './transform/forward';
import { App } from './tui/App';
import { SelectionState } from './tui/state/SelectionState';
import { savePlugin } from './saver/save';
import { NormalizedPluginConfiguration } from './types/normalized';

/**
 * CLI Entry Point
 *
 * Command: ccplugin-curator select <plugin-folder>
 *
 * Options:
 * --output <path>: Output directory (default: ./output)
 * --name <name>: Plugin name (default: curated-plugin)
 */

const program = new Command();

program
  .name('ccplugin-curator')
  .description('Interactive TUI tool for curating and combining Claude Code plugins')
  .version('0.0.14');

program
  .command('select <plugin-folder>')
  .description('Load plugins and launch interactive selector')
  .option('-o, --output <path>', 'Output directory', './output')
  .option('-n, --name <name>', 'Output plugin name', 'curated-plugin')
  .action(async (pluginFolder: string, options: { output: string; name: string }) => {
    try {
      // Resolve plugin folder to absolute path
      const pluginDir = path.resolve(pluginFolder);

      // Check if directory exists
      try {
        const stat = await fs.stat(pluginDir);
        if (!stat.isDirectory()) {
          console.error(`Error: ${pluginDir} is not a directory`);
          process.exit(1);
        }
      } catch {
        console.error(`Error: Directory ${pluginDir} does not exist`);
        process.exit(1);
      }

      // Load plugins (support loading from a directory of plugins or a single plugin)
      let plugins: NormalizedPluginConfiguration[];

      // Check if this is a plugin directory (has .claude-plugin/plugin.json)
      const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
      const hasPluginJson = await fs.access(pluginJsonPath).then(() => true).catch(() => false);

      if (hasPluginJson) {
        // Single plugin
        console.log(`Loading plugin from ${pluginDir}...`);
        const loaded = await loadPlugin(pluginDir);
        const normalized = await transformToNormalized(loaded.config, loaded.pluginDir);
        plugins = [normalized];
      } else {
        // Directory of plugins
        console.log(`Scanning for plugins in ${pluginDir}...`);
        const entries = await fs.readdir(pluginDir, { withFileTypes: true });
        const pluginDirs = entries
          .filter(e => e.isDirectory())
          .map(e => path.join(pluginDir, e.name));

        plugins = [];
        for (const dir of pluginDirs) {
          try {
            const loaded = await loadPlugin(dir);
            const normalized = await transformToNormalized(loaded.config, loaded.pluginDir);
            plugins.push(normalized);
          } catch {
            // Skip directories that aren't plugins
          }
        }

        if (plugins.length === 0) {
          console.error('Error: No plugins found in directory');
          process.exit(1);
        }
      }

      console.log(`Loaded ${plugins.length} plugin(s)`);

      // Build source plugins map for file copying
      const sourcePluginsMap = new Map<string, NormalizedPluginConfiguration>();
      for (const plugin of plugins) {
        sourcePluginsMap.set(plugin.name, plugin);
      }

      // Launch TUI
      const { waitUntilExit } = render(
        React.createElement(App, {
          plugins,
          outputName: options.name,
          onSave: async (selectionState: SelectionState) => {
            // Build merged plugin
            const merged = selectionState.buildMergedPlugin(options.name);

            // Save to disk
            const result = await savePlugin(merged, sourcePluginsMap, {
              outputDir: path.resolve(options.output),
              pluginName: options.name
            });

            console.log('\nCurated plugin saved successfully!');
            console.log(`  Marketplace JSON: ${result.marketplaceJson}`);
            console.log(`  Plugin JSON: ${result.pluginJson}`);
            console.log(`  Normalized JSON: ${result.normalizedJson}`);
            console.log(`  Files: ${result.filesDir}`);
            console.log('\nTo use this plugin:');
            console.log(`  1. Copy ${path.dirname(result.pluginJson)} to your Claude Code plugins directory`);
            console.log(`  2. Or publish ${result.marketplaceJson} to the Claude Code marketplace`);
          }
        })
      );

      await waitUntilExit();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
