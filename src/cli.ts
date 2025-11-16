#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './ui/App.js';
import { scanPlugins, loadPluginJson } from './lib/file-ops.js';
import { normalizePlugin } from './lib/normalize.js';
import { NormalizedPlugin } from './types/normalized.js';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Usage: ccplugin-curator <plugins-directory>

Example:
  ccplugin-curator ~/.claude/plugins
  ccplugin-curator ./my-plugins
    `);
    process.exit(0);
  }

  const pluginsDir = path.resolve(args[0]);
  const outputDir = path.resolve('./output/curated-plugin');

  try {
    // Scan for plugins
    console.log(`Scanning ${pluginsDir} for plugins...`);
    const pluginPaths = await scanPlugins(pluginsDir);

    if (pluginPaths.length === 0) {
      console.error('No plugins found in directory');
      process.exit(1);
    }

    console.log(`Found ${pluginPaths.length} plugin(s)`);

    // Load and normalize all plugins
    const plugins: NormalizedPlugin[] = [];
    for (const pluginPath of pluginPaths) {
      try {
        console.log(`Loading ${path.basename(pluginPath)}...`);
        const pluginJson = await loadPluginJson(pluginPath);
        const normalized = await normalizePlugin(pluginPath, pluginJson);
        plugins.push(normalized);
      } catch (err: any) {
        console.error(`Error loading ${pluginPath}: ${err.message}`);
      }
    }

    if (plugins.length === 0) {
      console.error('No valid plugins loaded');
      process.exit(1);
    }

    console.log(`Successfully loaded ${plugins.length} plugin(s)\n`);

    // Render TUI
    render(React.createElement(App, { plugins, outputDir }));
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
