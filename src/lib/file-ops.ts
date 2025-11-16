import * as fs from 'fs/promises';
import * as path from 'path';
import { NormalizedPlugin } from '../types/normalized.js';
import { denormalizePlugin } from './denormalize.js';

export interface SaveOptions {
  outputDir: string;
  pluginName: string;
  selection: NormalizedPlugin;
}

/**
 * Save curated plugin with dual output:
 * 1. .claude-plugin/marketplace.json
 * 2. plugins/curated-plugin/.claude-plugin/plugin.json (official)
 * 3. normalized-plugin.json (for testing)
 */
export async function savePlugin(options: SaveOptions): Promise<void> {
  const { outputDir, pluginName, selection } = options;

  // 1. Create output directory structure
  const pluginDir = path.join(outputDir, 'plugins', pluginName);
  await fs.mkdir(path.join(outputDir, '.claude-plugin'), { recursive: true });
  await fs.mkdir(path.join(pluginDir, '.claude-plugin'), { recursive: true });

  // 2. Generate official format
  const officialPlugin = denormalizePlugin(selection);

  // 3. Write marketplace.json
  const marketplace = {
    name: 'curated-plugins',
    owner: {
      name: 'User',
      email: 'user@example.com',
    },
    plugins: [
      {
        name: pluginName,
        source: `./plugins/${pluginName}`,
      },
    ],
  };

  await fs.writeFile(
    path.join(outputDir, '.claude-plugin', 'marketplace.json'),
    JSON.stringify(marketplace, null, 2),
  );

  // 4. Write plugin.json (official format)
  await fs.writeFile(
    path.join(pluginDir, '.claude-plugin', 'plugin.json'),
    JSON.stringify(officialPlugin, null, 2),
  );

  // 5. Write normalized-plugin.json (for debugging)
  await fs.writeFile(
    path.join(outputDir, 'normalized-plugin.json'),
    JSON.stringify(selection, null, 2),
  );

  // 6. Copy component files
  await copyComponents(selection, pluginDir);
}

/**
 * Copy selected component files to output directory
 */
async function copyComponents(
  selection: NormalizedPlugin,
  outputDir: string,
): Promise<void> {
  const sourceRoot = selection.source;

  // Copy commands
  for (const cmd of selection.commands) {
    const sourcePath = path.join(sourceRoot, cmd);
    const destPath = path.join(outputDir, cmd);
    await copyFile(sourcePath, destPath);
  }

  // Copy agents
  for (const agent of selection.agents) {
    const sourcePath = path.join(sourceRoot, agent);
    const destPath = path.join(outputDir, agent);
    await copyFile(sourcePath, destPath);
  }

  // Copy skills (directories)
  for (const skill of selection.skills) {
    const sourcePath = path.join(sourceRoot, skill);
    const destPath = path.join(outputDir, skill);
    await copyDirectory(sourcePath, destPath);
  }
}

/**
 * Copy a single file
 */
async function copyFile(source: string, dest: string): Promise<void> {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(source, dest);
}

/**
 * Copy a directory recursively
 */
async function copyDirectory(source: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destPath);
    } else {
      await fs.copyFile(sourcePath, destPath);
    }
  }
}

/**
 * Load plugin.json from a directory
 */
export async function loadPluginJson(pluginRoot: string): Promise<any> {
  const pluginJsonPath = path.join(pluginRoot, '.claude-plugin', 'plugin.json');
  const content = await fs.readFile(pluginJsonPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Scan directory for plugins (directories with .claude-plugin/plugin.json)
 */
export async function scanPlugins(pluginsDir: string): Promise<string[]> {
  const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
  const plugins: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginPath = path.join(pluginsDir, entry.name);
    const pluginJsonPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');

    try {
      await fs.access(pluginJsonPath);
      plugins.push(pluginPath);
    } catch {
      // No plugin.json found, skip
    }
  }

  return plugins;
}
