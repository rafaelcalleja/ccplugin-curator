#!/usr/bin/env node

import * as path from 'path';
import { scanPluginDirectory } from './core/scanner';
import { normalizePlugins } from './core/normalizer';
import { TUIApp } from './tui/app';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
mkcurator - Claude Code Plugin Component Curator

Usage:
  mkcurator select <plugin-directory>

Options:
  -h, --help     Show this help message

Example:
  mkcurator select ~/.claude/plugins
    `);
    process.exit(0);
  }

  const command = args[0];

  if (command !== 'select') {
    console.error(`Error: Unknown command '${command}'`);
    console.error('Use --help for usage information');
    process.exit(1);
  }

  const pluginDir = args[1];

  if (!pluginDir) {
    console.error('Error: Please specify a plugin directory');
    console.error('Usage: mkcurator select <plugin-directory>');
    process.exit(1);
  }

  const absoluteDir = path.resolve(pluginDir);

  console.log(`Scanning plugins in: ${absoluteDir}`);

  try {
    // Scan and normalize plugins
    const discoveries = await scanPluginDirectory(absoluteDir);

    if (discoveries.length === 0) {
      console.error('Error: No plugins found in the specified directory');
      console.error('Make sure plugins have a .claude-plugin/plugin.json file');
      process.exit(1);
    }

    const plugins = normalizePlugins(discoveries);

    console.log(`Found ${plugins.length} plugin(s):\n`);
    plugins.forEach((p) => {
      console.log(`  - ${p.name}`);
      console.log(`    Commands: ${p.commands.length}`);
      console.log(`    Agents: ${p.agents.length}`);
      console.log(`    Skills: ${p.skills.length}`);
      console.log(`    Hooks: ${p.hooks.length}`);
      console.log(`    MCPs: ${p.mcps.length}\n`);
    });

    console.log('Starting TUI...\n');

    // Launch TUI
    const app = new TUIApp(plugins, absoluteDir);
    app.run();
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
