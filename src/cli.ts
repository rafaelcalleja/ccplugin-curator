#!/usr/bin/env node

import { Command } from 'commander';
import { render } from 'ink';
import React from 'react';
import * as path from 'path';
import * as fs from 'fs/promises';
import { loadPlugin } from './loader/pluginLoader';
import { transformToNormalized } from './transform/forward';
import { App } from './tui/App';
import { SetupFlow } from './tui/screens/SetupFlow';
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
          outputDir: options.output,
          onSave: async (selectionState: SelectionState, outputDirOverride?: string) => {
            // Build merged plugin
            const merged = selectionState.buildMergedPlugin(options.name);

            // Use override output dir if provided, otherwise use options
            const finalOutputDir = outputDirOverride || options.output;

            // Save to disk
            const result = await savePlugin(merged, sourcePluginsMap, {
              outputDir: path.resolve(finalOutputDir),
              pluginName: options.name
            });

            console.log('\n✓ Plugin saved successfully!\n');
            console.log('Files generated:');
            console.log(`  • ${result.marketplaceJson}`);
            console.log(`  • ${result.pluginJson}`);
            console.log(`  • ${result.normalizedJson}\n`);
            console.log('Components included:');
            console.log(`  • ${merged.commands.length} commands`);
            console.log(`  • ${merged.agents.length} agents`);
            console.log(`  • ${merged.skills.length} skills`);
            console.log(`  • ${merged.hooks.length} hooks`);
            console.log(`  • ${merged.mcps.length} MCPs\n`);
            console.log('Installation:');
            console.log(`  /plugin marketplace add ${result.marketplaceJson}`);
            console.log(`  /plugin install ${options.name}`);
          }
        })
      );

      await waitUntilExit();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

// Interactive mode - launch setup flow when no command provided
if (process.argv.length === 2) {
  // No arguments provided, launch interactive mode
  (async () => {
    try {
      const { waitUntilExit } = render(
        React.createElement(SetupFlow, {
          onSave: async (outputDir: string) => {
            console.log(`\n✓ Plugin saved to ${outputDir}`);
          }
        })
      );

      await waitUntilExit();
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  })();
} else {
  // Parse commands if arguments provided
  program.parse();
}
