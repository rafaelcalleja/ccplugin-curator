#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import React from 'react';
import { render } from 'ink';
import chalk from 'chalk';
import { scanPlugins } from './scanner.js';
import { normalizePlugin } from './normalizer.js';
import { saveCuratedPlugin } from './persistence.js';
import { PluginCurator } from './ui/PluginCurator.js';
import type { NormalizedPlugin } from './types/index.js';
import type { ComponentSelection } from './types/index.js';

// Parse command-line arguments
const args = process.argv.slice(2);

if (args.length < 2 || args[0] !== 'select') {
  console.log(`${chalk.cyan('mk-curator')} - Interactive Plugin Curator for Claude Code`);
  console.log('');
  console.log(chalk.bold('Usage:'));
  console.log(`  mkcurator select <plugins-directory>`);
  console.log('');
  console.log(chalk.bold('Example:'));
  console.log(`  mkcurator select ~/.claude/plugins`);
  console.log('');
  console.log(chalk.bold('Keys:'));
  console.log('  ←→: Switch panel');
  console.log('  ↑↓: Navigate');
  console.log('  SPACE: Toggle selection');
  console.log('  A: Select all');
  console.log('  N: Deselect all');
  console.log('  S: Save');
  console.log('  Q: Quit');
  process.exit(0);
}

const pluginsDir = args[1];

async function main() {
  try {
    // Scan plugins
    console.log(chalk.dim(`📂 Scanning plugins in ${pluginsDir}...`));
    const plugins = await scanPlugins(pluginsDir);

    if (plugins.length === 0) {
      console.error(
        chalk.red('✗ No plugins found. Ensure you have .claude-plugin/plugin.json files.')
      );
      process.exit(1);
    }

    console.log(chalk.green(`✓ Found ${plugins.length} plugin(s)`));

    // Normalize plugins
    console.log(chalk.dim('📦 Normalizing plugins...'));
    const normalizedPlugins: NormalizedPlugin[] = [];

    for (const plugin of plugins) {
      const sourceDir = (plugin as any).__sourceDir;
      const normalized = await normalizePlugin(plugin, sourceDir);
      normalizedPlugins.push(normalized);
    }

    console.log(chalk.green('✓ Plugins normalized'));
    console.log('');

    // Render TUI
    const exitCode = await new Promise<number>((resolve) => {
      const { unmount, waitUntilExit } = render(
        React.createElement(PluginCurator, {
          plugins: normalizedPlugins,
          onExit: () => {
            unmount();
            console.log(chalk.dim('👋 Exiting...'));
            resolve(0);
          },
          onSave: async (selections: ComponentSelection[]) => {
            unmount();

            // Check if anything is selected
            const hasSelection = selections.some(
              (s) =>
                s.commands.length > 0 ||
                s.agents.length > 0 ||
                s.skills.length > 0 ||
                s.hooks.length > 0 ||
                s.mcps.length > 0
            );

            if (!hasSelection) {
              console.log(chalk.yellow('⚠️ No components selected'));
              resolve(0);
              return;
            }

            try {
              console.log('');
              console.log(chalk.bold('💾 Saving curated plugins...'));
              const savedPath = await saveCuratedPlugin(selections);
              console.log(chalk.green(`✓ Saved to ${savedPath}`));
              console.log('');

              // Display the saved file
              const content = JSON.parse(fs.readFileSync(savedPath, 'utf-8'));
              console.log(chalk.bold('📄 Generated plugin.json:'));
              console.log(JSON.stringify(content, null, 2));
              console.log('');
              console.log(chalk.green('✅ Done!'));

              resolve(0);
            } catch (error) {
              console.error(chalk.red('✗ Failed to save:'), error);
              resolve(1);
            }
          },
        })
      );

      waitUntilExit().catch(() => {
        resolve(0);
      });
    });

    process.exit(exitCode);
  } catch (error) {
    console.error(chalk.red('✗ Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
