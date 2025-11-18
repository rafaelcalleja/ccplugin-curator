/**
 * File Copier
 *
 * Copies component files from source plugins to output directory.
 * Handles conflicts with namespace prefixes.
 *
 * Spec: docs/spec/007-save-operation-rules.md (Section 5, 7.3-7.6)
 */

import { copyFileSync, cpSync, mkdirSync, existsSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import type { ResolvedItem } from './conflicts.js';
import type { NormalizedHook } from '../hooks-loader.js';

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

/**
 * Check if a hook command is a local script path (relative path to a file)
 *
 * Returns true if the command looks like a local script path:
 * - Starts with "./" or "hooks/" or "./hooks/"
 * - Contains a file extension like .sh, .bash, .js, .ts, .py
 * - Does NOT start with a system command (npx, node, python, etc.)
 *
 * @param command - Hook command string
 * @returns true if command is a local script path
 */
export function isLocalScriptPath(command: string): boolean {
  // Skip system commands
  if (/^(npx|node|python|python3|bash|sh|npm|yarn|pnpm)\s/.test(command)) {
    return false;
  }

  // Check for relative path indicators
  const hasRelativePath = /^(\.\/|hooks\/|\.\/hooks\/)/.test(command);

  // Check for file extensions
  const hasScriptExtension = /\.(sh|bash|js|ts|py|rb|pl)(\s|$)/.test(command);

  return hasRelativePath || hasScriptExtension;
}

/**
 * Extract script path from hook command
 *
 * For simple paths, returns the whole command.
 * For commands with arguments, extracts just the script path.
 * Handles ${CLAUDE_PLUGIN_ROOT} variable.
 *
 * @param command - Hook command string
 * @returns Extracted script path (relative)
 */
export function extractScriptPath(command: string): string {
  // Remove ${CLAUDE_PLUGIN_ROOT}/ prefix
  let normalized = command.replace(/^\$\{CLAUDE_PLUGIN_ROOT\}\//, '');

  // Remove leading "./"
  normalized = normalized.replace(/^\.\//, '');

  // Extract just the script path (before any arguments)
  const match = normalized.match(/^([^\s]+)/);
  return match ? match[1] : normalized;
}

/**
 * Copy a hook script file with executable permissions
 *
 * @param sourcePath - Absolute path to source script
 * @param destPath - Absolute path to destination script
 */
export function copyHookScriptFile(sourcePath: string, destPath: string): void {
  // Copy file
  copyFile(sourcePath, destPath);

  // Set executable permissions (rwxr-xr-x = 0755)
  chmodSync(destPath, 0o755);
}

/**
 * Copy hook script files with conflict resolution and executable permissions
 *
 * Extracts script paths from hook commands, copies them with executable permissions,
 * and returns updated hooks with resolved paths.
 *
 * @param hooks - Array of normalized hooks
 * @param sourceRoots - Map of plugin name → plugin source directory
 * @param outputPluginDir - Destination plugin directory
 * @param hooksByPlugin - Map of hook → originating plugin name
 * @returns Updated hooks with resolved script paths
 */
export function copyHookScripts(
  hooks: NormalizedHook[],
  sourceRoots: Map<string, string>,
  outputPluginDir: string,
  hooksByPlugin: Map<NormalizedHook, string>
): NormalizedHook[] {
  // Group hooks by script path to detect conflicts
  const scriptsByPath = new Map<string, Array<{ hook: NormalizedHook; pluginName: string }>>();

  // Identify hooks with local scripts
  for (const hook of hooks) {
    if (isLocalScriptPath(hook.command)) {
      const scriptPath = extractScriptPath(hook.command);
      const pluginName = hooksByPlugin.get(hook) || 'unknown';

      if (!scriptsByPath.has(scriptPath)) {
        scriptsByPath.set(scriptPath, []);
      }
      scriptsByPath.get(scriptPath)!.push({ hook, pluginName });
    }
  }

  // Resolve conflicts and copy scripts
  // Use (pluginName, scriptPath) as key to handle conflicts correctly
  const pathMappings = new Map<string, string>(); // "pluginName:scriptPath" → resolved

  for (const [scriptPath, items] of scriptsByPath.entries()) {
    if (items.length === 1) {
      // No conflict - use original path
      const { pluginName } = items[0];
      const sourceRoot = sourceRoots.get(pluginName);
      if (!sourceRoot) continue;

      const sourcePath = join(sourceRoot, scriptPath);
      const destPath = join(outputPluginDir, scriptPath);

      if (existsSync(sourcePath)) {
        copyHookScriptFile(sourcePath, destPath);
        // Store mapping with plugin name as part of key
        pathMappings.set(`${pluginName}:${scriptPath}`, scriptPath);
      }
    } else {
      // Conflict - apply namespace prefix
      for (const { pluginName } of items) {
        const sourceRoot = sourceRoots.get(pluginName);
        if (!sourceRoot) continue;

        // Get basename and directory
        const lastSlash = scriptPath.lastIndexOf('/');
        const dir = lastSlash >= 0 ? scriptPath.substring(0, lastSlash) : '';
        const basename = lastSlash >= 0 ? scriptPath.substring(lastSlash + 1) : scriptPath;

        // Apply namespace prefix
        const resolvedBasename = `${pluginName}--${basename}`;
        const resolvedPath = dir ? `${dir}/${resolvedBasename}` : resolvedBasename;

        const sourcePath = join(sourceRoot, scriptPath);
        const destPath = join(outputPluginDir, resolvedPath);

        if (existsSync(sourcePath)) {
          copyHookScriptFile(sourcePath, destPath);
          // Store mapping with plugin name as part of key
          pathMappings.set(`${pluginName}:${scriptPath}`, resolvedPath);
        }
      }
    }
  }

  // Update hook commands with resolved paths
  const updatedHooks: NormalizedHook[] = hooks.map(hook => {
    if (!isLocalScriptPath(hook.command)) {
      return hook; // System command, no changes
    }

    const scriptPath = extractScriptPath(hook.command);
    const pluginName = hooksByPlugin.get(hook) || '';

    // Look up resolved path using plugin name + script path
    const resolvedPath = pathMappings.get(`${pluginName}:${scriptPath}`);

    if (!resolvedPath) {
      return hook; // Script not found or not copied
    }

    // Update command with resolved path
    const updatedCommand = hook.command.replace(scriptPath, resolvedPath);

    return {
      ...hook,
      command: updatedCommand,
    };
  });

  return updatedHooks;
}
