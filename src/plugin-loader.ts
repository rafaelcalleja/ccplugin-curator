/**
 * Plugin loader - scans directory for plugins and normalizes them
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { normalize, type OfficialPluginFormat } from './transform/normalize.js';
import type { NormalizedPluginFormat } from './types/normalized.js';

/**
 * Load and normalize all plugins from a directory
 */
export async function loadPlugins(
  baseDir: string
): Promise<NormalizedPluginFormat[]> {
  const plugins: NormalizedPluginFormat[] = [];

  // Check if baseDir is itself a plugin
  const pluginJsonPath = join(baseDir, '.claude-plugin/plugin.json');
  try {
    await stat(pluginJsonPath);
    // It's a plugin directory
    const plugin = await loadPlugin(baseDir);
    plugins.push(plugin);
    return plugins;
  } catch {
    // Not a plugin, scan subdirectories
  }

  // Scan subdirectories for plugins
  const entries = await readdir(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginDir = join(baseDir, entry.name);
    const pluginJsonPath = join(pluginDir, '.claude-plugin/plugin.json');

    try {
      await stat(pluginJsonPath);
      const plugin = await loadPlugin(pluginDir);
      plugins.push(plugin);
    } catch {
      // Not a plugin, skip
      continue;
    }
  }

  return plugins;
}

/**
 * Load and normalize a single plugin
 */
async function loadPlugin(pluginDir: string): Promise<NormalizedPluginFormat> {
  const pluginJsonPath = join(pluginDir, '.claude-plugin/plugin.json');
  const content = await readFile(pluginJsonPath, 'utf-8');
  const pluginJson: OfficialPluginFormat = JSON.parse(content);

  return normalize(pluginDir, pluginJson);
}
