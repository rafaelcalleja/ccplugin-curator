#!/usr/bin/env node
import { Command } from 'commander';
import { render } from 'ink';
import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import { Setup } from './components/Setup.js';
import { normalizePlugin } from './lib/normalize.js';
import type { NormalizedPluginInternalFormat } from './types/normalized.js';
import type { ClaudeCodePluginOfficialFormat } from './types/plugin.js';

const program = new Command();

program
  .name('ccplugin-curator')
  .description('TUI for curating and selecting components from Claude Code plugins')
  .version('0.0.10');

program
  .command('select <directory>')
  .description('Select and curate components from plugins in directory')
  .option('-o, --output <dir>', 'Output directory', './output')
  .action(async (directory: string, options: { output: string }) => {
    try {
      const plugins = await loadPlugins(directory);

      if (plugins.length === 0) {
        console.error('No plugins found in directory:', directory);
        process.exit(1);
      }

      // Render TUI in direct mode (skip setup screens)
      render(React.createElement(Setup, {
        plugins,
        outputDir: options.output,
      }));
    } catch (err: any) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  });

// Interactive mode: no command provided
program.action(() => {
  // Render Setup component (shows Main Menu first)
  render(React.createElement(Setup, {}));
});

program.parse(process.argv);

// If no arguments provided, run interactive mode
if (process.argv.length === 2) {
  render(React.createElement(Setup, {}));
}

/**
 * Load all plugins from directory
 */
async function loadPlugins(directory: string): Promise<NormalizedPluginInternalFormat[]> {
  const absoluteDir = path.resolve(directory);
  const plugins: NormalizedPluginInternalFormat[] = [];

  // Check if directory exists
  try {
    await fs.access(absoluteDir);
  } catch {
    throw new Error(`Directory not found: ${absoluteDir}`);
  }

  // Check if it's a single plugin directory
  const pluginJsonPath = path.join(absoluteDir, '.claude-plugin', 'plugin.json');
  try {
    await fs.access(pluginJsonPath);
    // Single plugin
    const plugin = await loadSinglePlugin(absoluteDir);
    plugins.push(plugin);
    return plugins;
  } catch {
    // Not a single plugin, scan subdirectories
  }

  // Scan for multiple plugins
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginDir = path.join(absoluteDir, entry.name);
    const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');

    try {
      await fs.access(pluginJsonPath);
      const plugin = await loadSinglePlugin(pluginDir);
      plugins.push(plugin);
    } catch {
      // Not a plugin directory, skip
      continue;
    }
  }

  return plugins;
}

/**
 * Load single plugin from directory
 */
async function loadSinglePlugin(pluginDir: string): Promise<NormalizedPluginInternalFormat> {
  const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');

  // Read plugin.json
  const content = await fs.readFile(pluginJsonPath, 'utf-8');
  const pluginJson: ClaudeCodePluginOfficialFormat = JSON.parse(content);

  // Normalize
  const normalized = await normalizePlugin(pluginJson, pluginDir);

  return normalized;
}
