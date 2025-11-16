#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './components/App';
import { scanAndNormalizePlugins } from './lib/normalize';
import { saveCuratedPlugin } from './lib/save';
import path from 'path';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
MkCurator - Claude Code Plugin Curator

Usage:
  mkcurator select <plugins-directory> [options]

Arguments:
  <plugins-directory>  Directory containing Claude Code plugins

Options:
  --output, -o <path>  Output path for curated plugin.json (default: ./output/plugin.json)
  --name <name>        Name for the curated plugin (default: curated-plugin)
  --help, -h           Show this help message

Examples:
  mkcurator select ~/.claude/plugins
  mkcurator select ./plugins --output ./my-plugin.json --name my-custom-plugin
`);
    process.exit(0);
  }

  const command = args[0];

  if (command !== 'select') {
    console.error(`Unknown command: ${command}`);
    console.error('Run "mkcurator --help" for usage information.');
    process.exit(1);
  }

  const pluginsDir = args[1];

  if (!pluginsDir) {
    console.error('Error: <plugins-directory> is required');
    console.error('Run "mkcurator --help" for usage information.');
    process.exit(1);
  }

  // Parse options
  let outputPath = './output/plugin.json';
  let name = 'curated-plugin';

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === '--name') {
      name = args[i + 1];
      i++;
    }
  }

  try {
    // Scan and normalize plugins
    console.log(`Scanning plugins in: ${pluginsDir}`);
    const plugins = await scanAndNormalizePlugins(pluginsDir);

    if (plugins.length === 0) {
      console.error('No plugins found in the specified directory.');
      process.exit(1);
    }

    console.log(`Found ${plugins.length} plugin(s)`);

    // Render TUI
    const { waitUntilExit } = render(
      <App
        plugins={plugins}
        onSave={async (selections) => {
          try {
            const successMessage = await saveCuratedPlugin(plugins, selections, outputPath, name, false);
            console.log('\n' + successMessage);
          } catch (error) {
            if (error instanceof Error) {
              // Handle OUTPUT_DIR_EXISTS error with prompt (spec 007-save-operation-rules.md:178-183)
              if (error.message === 'OUTPUT_DIR_EXISTS') {
                // Import readline for user prompt
                const readline = await import('readline');
                const rl = readline.createInterface({
                  input: process.stdin,
                  output: process.stdout
                });

                const answer = await new Promise<string>((resolve) => {
                  rl.question('\n⚠️  Output directory exists. Overwrite? [Y/n] ', (ans) => {
                    rl.close();
                    resolve(ans);
                  });
                });

                if (answer.toLowerCase() === 'y' || answer === '') {
                  try {
                    const successMessage = await saveCuratedPlugin(plugins, selections, outputPath, name, true);
                    console.log('\n' + successMessage);
                  } catch (retryError) {
                    if (retryError instanceof Error) {
                      console.error('\n' + retryError.message);
                    } else {
                      console.error('\nError saving plugin:', retryError);
                    }
                  }
                } else {
                  console.log('\nSave cancelled.');
                }
              } else {
                console.error('\n' + error.message);
              }
            } else {
              console.error('\nError saving plugin:', error);
            }
          }
        }}
      />
    );

    await waitUntilExit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
