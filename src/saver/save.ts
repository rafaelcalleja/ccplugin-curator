import * as fs from 'fs/promises';
import * as path from 'path';
import { NormalizedPluginConfiguration } from '../types/normalized';
import { transformToOfficial } from '../transform/reverse';
import { copyFiles } from './fileCopy';
import { resolveConflicts } from './conflicts';

/**
 * Save operation handler
 *
 * Implements dual output strategy from Spec 007:
 * - .claude-plugin/marketplace.json (for marketplace)
 * - plugins/<name>/.claude-plugin/plugin.json (for Claude Code)
 * - normalized-plugin.json (debug)
 *
 * Also handles:
 * - File copying (commands, agents, skills, hooks)
 * - Namespace conflict resolution
 */

export interface SaveOptions {
  outputDir?: string;
  pluginName?: string;
}

export interface SaveResult {
  marketplaceJson: string;
  pluginJson: string;
  normalizedJson: string;
  filesDir: string;
}

/**
 * Save curated plugin to disk
 *
 * @param merged - Merged normalized plugin configuration
 * @param sourcePlugins - Original source plugins (for file copying)
 * @param options - Save options
 * @returns Paths to generated files
 */
export async function savePlugin(
  merged: NormalizedPluginConfiguration,
  sourcePlugins: Map<string, NormalizedPluginConfiguration>,
  options: SaveOptions = {}
): Promise<SaveResult> {
  const outputDir = options.outputDir || './output';
  const pluginName = options.pluginName || merged.name;

  // Resolve namespace conflicts
  const resolved = await resolveConflicts(merged, sourcePlugins);

  // Transform to official format
  const official = transformToOfficial(resolved);

  // Create output directories
  const marketplaceDir = path.join(outputDir, '.claude-plugin');
  const pluginDir = path.join(outputDir, 'plugins', pluginName, '.claude-plugin');
  const filesDir = path.join(outputDir, 'plugins', pluginName);

  await fs.mkdir(marketplaceDir, { recursive: true });
  await fs.mkdir(pluginDir, { recursive: true });
  await fs.mkdir(filesDir, { recursive: true });

  // Write marketplace.json
  const marketplaceJsonPath = path.join(marketplaceDir, 'marketplace.json');
  await fs.writeFile(marketplaceJsonPath, JSON.stringify(official, null, 2), 'utf-8');

  // Write plugin.json
  const pluginJsonPath = path.join(pluginDir, 'plugin.json');
  await fs.writeFile(pluginJsonPath, JSON.stringify(official, null, 2), 'utf-8');

  // Write normalized-plugin.json (debug)
  const normalizedJsonPath = path.join(outputDir, 'normalized-plugin.json');
  await fs.writeFile(normalizedJsonPath, JSON.stringify(resolved, null, 2), 'utf-8');

  // Copy files
  await copyFiles(resolved, sourcePlugins, filesDir);

  return {
    marketplaceJson: marketplaceJsonPath,
    pluginJson: pluginJsonPath,
    normalizedJson: normalizedJsonPath,
    filesDir
  };
}
