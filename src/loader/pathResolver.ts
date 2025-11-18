import * as path from 'path';

/**
 * Path resolution utilities for plugin files
 *
 * Handles:
 * - Path normalization (remove leading ./)
 * - Relative to absolute path resolution
 * - Custom paths + auto-discovery supplements
 */

/**
 * Normalize a path by removing leading './'
 *
 * @param filePath - Path to normalize
 * @returns Normalized path without leading './'
 *
 * @example
 * normalizePath('./commands/foo.md') // => 'commands/foo.md'
 * normalizePath('commands/foo.md')   // => 'commands/foo.md'
 */
export function normalizePath(filePath: string): string {
  if (filePath.startsWith('./')) {
    return filePath.slice(2);
  }
  return filePath;
}

/**
 * Resolve a relative path to absolute based on plugin directory
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param relativePath - Relative path to resolve
 * @returns Absolute path
 *
 * @example
 * resolveAbsolute('/home/user/my-plugin', './commands/foo.md')
 * // => '/home/user/my-plugin/commands/foo.md'
 */
export function resolveAbsolute(pluginDir: string, relativePath: string): string {
  const normalized = normalizePath(relativePath);
  return path.resolve(pluginDir, normalized);
}

/**
 * Add './' prefix to a path if it doesn't have one
 * Used in reverse transformation
 *
 * @param filePath - Path to prefix
 * @returns Path with './' prefix
 *
 * @example
 * addPathPrefix('commands/foo.md')  // => './commands/foo.md'
 * addPathPrefix('./commands/foo.md') // => './commands/foo.md'
 */
export function addPathPrefix(filePath: string): string {
  if (filePath.startsWith('./') || filePath.startsWith('/')) {
    return filePath;
  }
  return `./${filePath}`;
}

/**
 * Make a path relative to plugin directory
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param absolutePath - Absolute path to make relative
 * @returns Relative path from plugin directory
 *
 * @example
 * makeRelative('/home/user/my-plugin', '/home/user/my-plugin/commands/foo.md')
 * // => 'commands/foo.md'
 */
export function makeRelative(pluginDir: string, absolutePath: string): string {
  const rel = path.relative(pluginDir, absolutePath);
  return normalizePath(rel);
}
