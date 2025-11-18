#!/usr/bin/env node

import { Command } from 'commander';
import { normalizePlugin } from '../lib/normalizer';
import { save, type SaveConfig, type Selection } from '../lib/save-controller';
import { listPluginDirectories } from '../lib/validator';
import * as path from 'path';

const program = new Command();

program
  .name('ccplugin-curator')
  .description('Curate and combine Claude Code plugin components')
  .version('0.1.0');

program
  .command('normalize <plugin-dir>')
  .description('Normalize a plugin and display its structure')
  .action(async (pluginDir: string) => {
    try {
      const absolutePath = path.resolve(pluginDir);
      console.log(`Normalizing plugin at: ${absolutePath}\n`);

      const normalized = await normalizePlugin(absolutePath);

      console.log('Normalized Plugin:');
      console.log(JSON.stringify(normalized, null, 2));
      console.log('\nStats:');
      console.log(`  Commands: ${normalized.commands.length}`);
      console.log(`  Agents: ${normalized.agents.length}`);
      console.log(`  Skills: ${normalized.skills.length}`);
      console.log(`  Hooks: ${normalized.hooks.length}`);
      console.log(`  MCPs: ${normalized.mcps.length}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('list <directory>')
  .description('List all plugins in a directory')
  .action((directory: string) => {
    try {
      const absolutePath = path.resolve(directory);
      const plugins = listPluginDirectories(absolutePath);

      if (plugins.length === 0) {
        console.log('No plugins found in directory');
        return;
      }

      console.log(`Found ${plugins.length} plugin(s):\n`);
      for (const plugin of plugins) {
        const name = path.basename(plugin);
        console.log(`  - ${name} (${plugin})`);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('curate')
  .description('Interactive TUI for selecting and combining plugin components')
  .action(() => {
    console.log('TUI not yet implemented. Please use the normalize and combine commands for now.');
    process.exit(1);
  });

program
  .command('combine <source-dir>')
  .description('Combine plugins from a source directory')
  .requiredOption('-n, --name <name>', 'Curated plugin name')
  .requiredOption('-o, --output <dir>', 'Output directory')
  .option('-m, --marketplace <name>', 'Marketplace name', 'curated-plugins')
  .option('-e, --email <email>', 'Author email')
  .action(async (sourceDir: string, options: any) => {
    try {
      const sourcePath = path.resolve(sourceDir);
      const plugins = listPluginDirectories(sourcePath);

      if (plugins.length === 0) {
        console.error('No plugins found in source directory');
        process.exit(1);
      }

      console.log(`Found ${plugins.length} plugin(s) to combine\n`);

      // Normalize all plugins
      const normalized = [];
      for (const pluginPath of plugins) {
        console.log(`Normalizing ${path.basename(pluginPath)}...`);
        const norm = await normalizePlugin(pluginPath);
        normalized.push(norm);
      }

      // Create selection with all components from all plugins
      const selection: Selection = {
        plugins: normalized.map(norm => ({
          normalized: norm,
          commands: norm.commands,
          agents: norm.agents,
          skills: norm.skills,
          hooks: norm.hooks as any,
          mcps: norm.mcps as any
        }))
      };

      // Save configuration
      const config: SaveConfig = {
        marketplaceName: options.marketplace,
        pluginName: options.name,
        outputDirectory: path.resolve(options.output),
        authorEmail: options.email
      };

      console.log('\nSaving curated plugin...\n');
      const result = await save(selection, config);

      if (!result.success) {
        console.error('Failed to save plugin:');
        if (result.errors) {
          for (const error of result.errors) {
            console.error(`  - ${error}`);
          }
        }
        process.exit(1);
      }

      console.log('✓ Plugin saved successfully\n');
      console.log('Files generated:');
      console.log(`  • ${result.outputPath}/.claude-plugin/marketplace.json`);
      console.log(`  • ${result.outputPath}/plugins/${config.pluginName}/`);
      console.log(`  • ${result.outputPath}/normalized-plugin.json\n`);
      console.log('Components included:');
      if (result.stats) {
        console.log(`  • ${result.stats.commands} commands`);
        console.log(`  • ${result.stats.agents} agents`);
        console.log(`  • ${result.stats.skills} skills`);
        console.log(`  • ${result.stats.hooks} hooks`);
        console.log(`  • ${result.stats.mcps} MCPs\n`);
      }
      console.log('Installation:');
      console.log(`  /plugin marketplace add ${result.outputPath}`);
      console.log(`  /plugin install ${config.pluginName}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
