#!/usr/bin/env node
/**
 * CLI Entry Point
 *
 * Command-line interface for ccplugin-curator.
 * Implements `select <plugin-folder>` command.
 *
 * Spec: docs/spec/004-user-workflows.md (Comando section)
 */

import { Command } from 'commander';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { scanPlugins } from './core/plugin-loader.js';
import { normalizePlugins } from './core/normalizer.js';
import { renderTui } from './tui/index.js';
import { save } from './core/save/index.js';
import type { TuiState } from './tui/state.js';

const program = new Command();

program
  .name('ccplugin-curator')
  .description('CLI tool for curating and combining Claude Code plugin components')
  .version('0.0.13');

/**
 * Select command - Main command to launch TUI
 */
program
  .command('select <plugin-folder>')
  .description('Select components from plugins in the specified folder')
  .option('-o, --output <dir>', 'Output directory', './output/curated-plugin')
  .option('-n, --name <name>', 'Plugin name', 'curated-plugin')
  .option('--overwrite', 'Overwrite output directory if exists', false)
  .action(async (pluginFolder: string, options: any) => {
    try {
      // Resolve plugin folder path
      const pluginFolderPath = resolve(process.cwd(), pluginFolder);

      // Check if folder exists
      if (!existsSync(pluginFolderPath)) {
        console.error(`❌ Error: Plugin folder not found: ${pluginFolderPath}`);
        process.exit(1);
      }

      console.log(`📂 Scanning plugins in: ${pluginFolderPath}`);

      // Scan plugins
      const scanResult = scanPlugins(pluginFolderPath);

      // Report errors
      if (scanResult.errors.length > 0) {
        console.warn(`\n⚠️  Warnings during scan:`);
        for (const error of scanResult.errors) {
          console.warn(`  • ${error.path}: ${error.error}`);
        }
      }

      // Check if any plugins found
      if (scanResult.plugins.length === 0) {
        console.error(`\n❌ No valid plugins found in: ${pluginFolderPath}`);
        console.log('\nPlugins must have a .claude-plugin/plugin.json file.');
        process.exit(1);
      }

      console.log(`✅ Found ${scanResult.plugins.length} plugin(s)\n`);

      // Normalize plugins
      console.log('🔄 Normalizing plugins...');
      const normalized = await normalizePlugins(
        scanResult.plugins.map((p: any) => ({
          data: p.data,
          pluginDir: p.pluginDir,
        }))
      );

      console.log('✅ Normalization complete\n');

      // Launch TUI
      console.log('🚀 Launching TUI...\n');

      const { waitUntilExit } = renderTui(normalized, async (state: TuiState) => {
        // Save callback
        console.log('\n💾 Saving selection...\n');

        const saveResult = await save(state, {
          outputDir: options.output,
          pluginName: options.name,
          overwrite: options.overwrite,
        });

        if (!saveResult.success) {
          console.error('❌ Save failed:');
          for (const error of saveResult.errors) {
            console.error(`  • ${error}`);
          }
          return;
        }

        // Success message
        console.log('✅ Plugin saved successfully!\n');
        console.log('📦 Output files:');
        console.log(`  • ${saveResult.outputDir}/.claude-plugin/marketplace.json`);
        console.log(`  • ${saveResult.outputDir}/plugins/${options.name}/.claude-plugin/plugin.json`);
        console.log(`  • ${saveResult.outputDir}/normalized-plugin.json\n`);
        console.log('📊 Components included:');
        console.log(`  • ${saveResult.stats.commands} commands`);
        console.log(`  • ${saveResult.stats.agents} agents`);
        console.log(`  • ${saveResult.stats.skills} skills`);
        console.log(`  • ${saveResult.stats.hooks} hooks`);
        console.log(`  • ${saveResult.stats.mcps} MCPs\n`);
        console.log('📍 Location:', saveResult.outputDir);
        console.log('\n📖 Installation:');
        console.log(`  /plugin marketplace add ${saveResult.outputDir}`);
        console.log(`  /plugin install ${options.name}\n`);
      });

      await waitUntilExit();
    } catch (error: any) {
      console.error(`\n❌ Error: ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Parse CLI arguments
program.parse();
