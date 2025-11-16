#!/usr/bin/env node
/**
 * Main entry point for ccplugin-curator CLI
 * Implements the TUI for plugin component selection
 */

import React from 'react';
import { render } from 'ink';
import { App } from './ui/App.js';
import { loadPlugins } from './plugin-loader.js';
import { resolve } from 'path';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: ccplugin-curator <plugin-directory>');
    process.exit(1);
  }

  const pluginPath = resolve(args[0]);

  try {
    const plugins = await loadPlugins(pluginPath);

    if (plugins.length === 0) {
      console.error('No plugins found in:', pluginPath);
      process.exit(1);
    }

    render(<App plugins={plugins} />);
  } catch (error) {
    console.error('Error loading plugins:', error);
    process.exit(1);
  }
}

main();
