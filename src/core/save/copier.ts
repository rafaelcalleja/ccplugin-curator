/**
 * File Copier
 *
 * Copies component files from source plugins to output directory.
 * Handles conflicts with namespace prefixes.
 *
 * Spec: docs/spec/007-save-operation-rules.md (Section 5, 7.3-7.6)
 */

import { copyFileSync, cpSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import type { ResolvedItem } from './conflicts.js';

/**
 * Copy a single file to output directory
 *
 * @param sourcePath - Absolute path to source file
 * @param destPath - Absolute path to destination file
 */
export function copyFile(sourcePath: string, destPath: string): void {
  // Ensure destination directory exists
  const destDir = dirname(destPath);
  mkdirSync(destDir, { recursive: true });

  // Copy file
  copyFileSync(sourcePath, destPath);
}

/**
 * Copy a directory recursively to output directory
 *
 * @param sourceDir - Absolute path to source directory
 * @param destDir - Absolute path to destination directory
 */
export function copyDirectory(sourceDir: string, destDir: string): void {
  // Ensure parent directory exists
  const parentDir = dirname(destDir);
  mkdirSync(parentDir, { recursive: true });

  // Copy directory recursively
  cpSync(sourceDir, destDir, { recursive: true });
}

/**
 * Copy command/agent files with conflict resolution
 *
 * @param items - Resolved items with original and resolved paths
 * @param sourceRoots - Map of plugin name → plugin source directory
 * @param outputPluginDir - Destination plugin directory
 * @returns Array of resolved paths (relative to plugin root)
 */
export function copyComponentFiles(
  items: ResolvedItem[],
  sourceRoots: Map<string, string>,
  outputPluginDir: string
): string[] {
  const resolvedPaths: string[] = [];

  for (const item of items) {
    const sourceRoot = sourceRoots.get(item.pluginName);
    if (!sourceRoot) {
      throw new Error(`Source root not found for plugin: ${item.pluginName}`);
    }

    const sourcePath = join(sourceRoot, item.original);
    const destPath = join(outputPluginDir, item.resolved);

    // Check if source file exists
    if (!existsSync(sourcePath)) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    // Copy file
    copyFile(sourcePath, destPath);

    // Track resolved path
    resolvedPaths.push(item.resolved);
  }

  return resolvedPaths;
}

/**
 * Copy skill directories with conflict resolution
 *
 * @param items - Resolved items with original and resolved paths
 * @param sourceRoots - Map of plugin name → plugin source directory
 * @param outputPluginDir - Destination plugin directory
 * @returns Array of resolved directory paths (relative to plugin root)
 */
export function copySkillDirectories(
  items: ResolvedItem[],
  sourceRoots: Map<string, string>,
  outputPluginDir: string
): string[] {
  const resolvedPaths: string[] = [];

  for (const item of items) {
    const sourceRoot = sourceRoots.get(item.pluginName);
    if (!sourceRoot) {
      throw new Error(`Source root not found for plugin: ${item.pluginName}`);
    }

    const sourceDir = join(sourceRoot, item.original);
    const destDir = join(outputPluginDir, item.resolved);

    // Check if source directory exists
    if (!existsSync(sourceDir)) {
      throw new Error(`Source directory not found: ${sourceDir}`);
    }

    // Copy directory
    copyDirectory(sourceDir, destDir);

    // Track resolved path
    resolvedPaths.push(item.resolved);
  }

  return resolvedPaths;
}
