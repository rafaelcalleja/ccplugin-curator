#!/usr/bin/env node
/**
 * Main entry point for ccplugin-curator CLI
 * Implements the TUI for plugin component selection
 * Spec 004-user-workflows.md lines 10-28
 */

import React, { useState } from 'react';
import { render } from 'ink';
import { App } from './ui/App.js';
import { MainMenu } from './ui/MainMenu.js';
import { runConfigurationForm } from './ui/ConfigurationForm.js';
import { loadPlugins } from './plugin-loader.js';
import { resolve } from 'path';

/**
 * Interactive mode: Main Menu → Configuration Form → TUI
 */
async function interactiveMode() {
  let showMenu = true;

  while (showMenu) {
    // Show main menu
    await new Promise<void>((resolveMenu) => {
      const { waitUntilExit } = render(
        <MainMenu
          onCreatePlugin={async () => {
            resolveMenu();
          }}
        />
      );
      waitUntilExit();
    });

    // Run configuration form
    const config = await runConfigurationForm();

    if (!config) {
      // User cancelled, show menu again
      continue;
    }

    // Load plugins from configured directory
    try {
      const plugins = await loadPlugins(config.sourceDirectory);

      if (plugins.length === 0) {
        console.error('No plugins found in:', config.sourceDirectory);
        console.log('\nPress ENTER to return to main menu...');
        await new Promise((r) => process.stdin.once('data', r));
        continue;
      }

      // Show TUI
      render(<App plugins={plugins} />);
      showMenu = false;
    } catch (error) {
      console.error('Error loading plugins:', error);
      console.log('\nPress ENTER to return to main menu...');
      await new Promise((r) => process.stdin.once('data', r));
    }
  }
}

/**
 * Direct mode: Skip setup, go straight to TUI
 * Usage: app select <plugin-directory>
 */
async function directMode(pluginPath: string) {
  const resolvedPath = resolve(pluginPath);

  try {
    const plugins = await loadPlugins(resolvedPath);

    if (plugins.length === 0) {
      console.error('No plugins found in:', resolvedPath);
      process.exit(1);
    }

    render(<App plugins={plugins} />);
  } catch (error) {
    console.error('Error loading plugins:', error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Interactive mode (spec 004 lines 10-15)
  if (args.length === 0) {
    await interactiveMode();
    return;
  }

  // Direct mode (spec 004 lines 17-28)
  if (args[0] === 'select' && args[1]) {
    await directMode(args[1]);
    return;
  }

  // Legacy mode: direct path without "select" keyword
  if (args.length === 1) {
    await directMode(args[0]);
    return;
  }

  console.error('Usage:');
  console.error('  ccplugin-curator              # Interactive mode');
  console.error('  ccplugin-curator select <dir> # Direct mode');
  console.error('  ccplugin-curator <dir>         # Legacy direct mode');
  process.exit(1);
}

main();
