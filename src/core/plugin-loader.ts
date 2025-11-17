/**
 * Plugin Loader
 *
 * Scans directories for Claude Code plugins and loads plugin.json files.
 * A valid plugin directory contains `.claude-plugin/plugin.json`.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { validatePluginJson } from './validator.js';

export interface PluginLoadResult {
  /** Plugin data (validated) */
  data: any;
  /** Absolute path to plugin directory */
  pluginDir: string;
  /** Absolute path to plugin.json file */
  pluginJsonPath: string;
}

export interface PluginLoadError {
  /** Path where error occurred */
  path: string;
  /** Error message */
  error: string;
}

export interface ScanResult {
  /** Successfully loaded plugins */
  plugins: PluginLoadResult[];
  /** Errors encountered during scan */
  errors: PluginLoadError[];
}

/**
 * Check if a directory contains a valid plugin
 */
export function isPluginDirectory(dirPath: string): boolean {
  const pluginJsonPath = join(dirPath, '.claude-plugin', 'plugin.json');
  return existsSync(pluginJsonPath);
}

/**
 * Load a single plugin from a directory
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Plugin data and metadata
 * @throws Error if plugin.json is invalid or missing
 */
export function loadPlugin(pluginDir: string): PluginLoadResult {
  const pluginJsonPath = join(pluginDir, '.claude-plugin', 'plugin.json');

  // Check if plugin.json exists
  if (!existsSync(pluginJsonPath)) {
    throw new Error(`Plugin not found: ${pluginJsonPath}`);
  }

  // Read and parse plugin.json
  let data: any;
  try {
    const content = readFileSync(pluginJsonPath, 'utf-8');
    data = JSON.parse(content);
  } catch (err: any) {
    throw new Error(`Failed to parse plugin.json: ${err.message}`);
  }

  // Validate against schema
  const validation = validatePluginJson(data);
  if (!validation.valid) {
    throw new Error(
      `Invalid plugin.json:\n${validation.errors?.join('\n')}`
    );
  }

  // If no name specified, use directory basename
  if (!data.name) {
    data.name = basename(pluginDir);
  }

  return {
    data,
    pluginDir,
    pluginJsonPath,
  };
}

/**
 * Scan a directory for plugins (non-recursive)
 *
 * Looks for subdirectories containing `.claude-plugin/plugin.json`.
 * Does NOT scan recursively - only checks immediate subdirectories.
 *
 * @param searchDir - Directory to scan for plugins
 * @returns Scan results with plugins and errors
 */
export function scanPlugins(searchDir: string): ScanResult {
  const plugins: PluginLoadResult[] = [];
  const errors: PluginLoadError[] = [];

  // Check if search directory exists
  if (!existsSync(searchDir)) {
    errors.push({
      path: searchDir,
      error: 'Directory does not exist',
    });
    return { plugins, errors };
  }

  // Check if it's a directory
  const stat = statSync(searchDir);
  if (!stat.isDirectory()) {
    errors.push({
      path: searchDir,
      error: 'Not a directory',
    });
    return { plugins, errors };
  }

  // Check if searchDir itself is a plugin
  if (isPluginDirectory(searchDir)) {
    try {
      const plugin = loadPlugin(searchDir);
      plugins.push(plugin);
    } catch (err: any) {
      errors.push({
        path: searchDir,
        error: err.message,
      });
    }
    return { plugins, errors };
  }

  // Scan subdirectories
  const entries = readdirSync(searchDir);

  for (const entry of entries) {
    const fullPath = join(searchDir, entry);

    // Skip non-directories
    try {
      const entryStat = statSync(fullPath);
      if (!entryStat.isDirectory()) {
        continue;
      }
    } catch (err) {
      // Skip entries we can't stat
      continue;
    }

    // Check if this is a plugin directory
    if (isPluginDirectory(fullPath)) {
      try {
        const plugin = loadPlugin(fullPath);
        plugins.push(plugin);
      } catch (err: any) {
        errors.push({
          path: fullPath,
          error: err.message,
        });
      }
    }
  }

  return { plugins, errors };
}

/**
 * Load multiple plugins from an array of paths
 *
 * @param pluginDirs - Array of absolute paths to plugin directories
 * @returns Scan results with plugins and errors
 */
export function loadPlugins(pluginDirs: string[]): ScanResult {
  const plugins: PluginLoadResult[] = [];
  const errors: PluginLoadError[] = [];

  for (const dir of pluginDirs) {
    try {
      const plugin = loadPlugin(dir);
      plugins.push(plugin);
    } catch (err: any) {
      errors.push({
        path: dir,
        error: err.message,
      });
    }
  }

  return { plugins, errors };
}
