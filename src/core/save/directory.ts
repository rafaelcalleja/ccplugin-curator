/**
 * Directory Manager
 *
 * Manages output directory creation and cleanup.
 *
 * Spec: docs/spec/007-save-operation-rules.md (Section 3, 7.2)
 */

import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

/**
 * Output directory structure
 */
export interface OutputPaths {
  /** Root output directory */
  root: string;
  /** Marketplace config directory */
  marketplaceDir: string;
  /** Plugin directory */
  pluginDir: string;
  /** Plugin's .claude-plugin directory */
  claudePluginDir: string;
}

/**
 * Get output paths for a given plugin name and output directory
 *
 * Structure:
 * output/
 * ├── .claude-plugin/
 * │   └── marketplace.json
 * ├── plugins/
 * │   └── {pluginName}/
 * │       └── .claude-plugin/
 * │           └── plugin.json
 * └── normalized-plugin.json
 *
 * @param outputDir - Base output directory
 * @param pluginName - Name of the curated plugin
 * @returns Output paths object
 */
export function getOutputPaths(outputDir: string, pluginName: string): OutputPaths {
  const root = outputDir;
  const marketplaceDir = join(root, '.claude-plugin');
  const pluginDir = join(root, 'plugins', pluginName);
  const claudePluginDir = join(pluginDir, '.claude-plugin');

  return {
    root,
    marketplaceDir,
    pluginDir,
    claudePluginDir,
  };
}

/**
 * Check if output directory exists
 *
 * @param outputDir - Output directory path
 * @returns True if directory exists
 */
export function outputDirExists(outputDir: string): boolean {
  return existsSync(outputDir);
}

/**
 * Delete output directory (used for overwrite)
 *
 * @param outputDir - Output directory path
 */
export function deleteOutputDir(outputDir: string): void {
  if (existsSync(outputDir)) {
    rmSync(outputDir, { recursive: true, force: true });
  }
}

/**
 * Create output directory structure
 *
 * Creates:
 * - Root directory
 * - .claude-plugin/ directory
 * - plugins/{pluginName}/.claude-plugin/ directory
 *
 * @param paths - Output paths object
 */
export function createOutputStructure(paths: OutputPaths): void {
  // Create root directory
  mkdirSync(paths.root, { recursive: true });

  // Create marketplace directory
  mkdirSync(paths.marketplaceDir, { recursive: true });

  // Create plugin directory structure
  mkdirSync(paths.claudePluginDir, { recursive: true });
}
