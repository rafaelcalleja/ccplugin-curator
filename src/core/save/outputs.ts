/**
 * Output Writers
 *
 * Write various output files (plugin.json, normalized-plugin.json).
 *
 * Spec: docs/spec/007-save-operation-rules.md (Section 3, 4)
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import type { NormalizedPluginFormatInternal } from '../../types/normalized.js';
import type { OfficialPluginJson } from '../../transformers/reverse/index.js';
import { reverseTransform } from '../../transformers/reverse/index.js';

/**
 * Write plugin.json (official format) to disk
 *
 * @param claudePluginDir - Path to .claude-plugin directory
 * @param pluginJson - Official plugin.json object
 */
export function writePluginJson(
  claudePluginDir: string,
  pluginJson: OfficialPluginJson
): void {
  const filePath = join(claudePluginDir, 'plugin.json');
  const content = JSON.stringify(pluginJson, null, 2);
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Write normalized-plugin.json to disk
 *
 * This is for debugging/testing purposes.
 *
 * @param outputRoot - Root output directory
 * @param normalized - Normalized plugin object
 */
export function writeNormalizedJson(
  outputRoot: string,
  normalized: NormalizedPluginFormatInternal
): void {
  const filePath = join(outputRoot, 'normalized-plugin.json');
  const content = JSON.stringify(normalized, null, 2);
  writeFileSync(filePath, content, 'utf-8');
}

/**
 * Generate plugin.json from normalized format
 *
 * Applies reverse transformation.
 *
 * @param normalized - Normalized plugin
 * @returns Official plugin.json object
 */
export function generatePluginJson(
  normalized: NormalizedPluginFormatInternal
): OfficialPluginJson {
  return reverseTransform(normalized);
}
