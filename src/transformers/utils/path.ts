/**
 * Path Utilities
 *
 * Helper functions for path manipulation and normalization.
 *
 * Spec: docs/spec/005-transformation-rules.md (Section 3)
 * Spec: docs/spec/006-reverse-transformation-rules.md (Section 3.3)
 */

/**
 * Normalize path: remove leading "./"
 *
 * Examples:
 * - "./commands/file.md" → "commands/file.md"
 * - "commands/file.md" → "commands/file.md"
 *
 * @param path - Path to normalize
 * @returns Normalized path without leading "./"
 */
export function normalizePath(path: string): string {
  return path.replace(/^\.\//, '');
}

/**
 * Add leading "./" to path
 *
 * Used when converting normalized paths back to official format.
 * Official format requires "./" prefix for all paths.
 *
 * Examples:
 * - "commands/file.md" → "./commands/file.md"
 * - "./commands/file.md" → "./commands/file.md" (already has prefix)
 *
 * @param path - Path to add prefix to
 * @returns Path with leading "./"
 */
export function addPathPrefix(path: string): string {
  if (path.startsWith('./')) {
    return path;
  }
  return `./${path}`;
}

/**
 * Normalize array of paths
 *
 * @param paths - Array of paths to normalize
 * @returns Array of normalized paths
 */
export function normalizePaths(paths: string[]): string[] {
  return paths.map(normalizePath);
}

/**
 * Add prefix to array of paths
 *
 * @param paths - Array of paths to add prefix to
 * @returns Array of paths with "./" prefix
 */
export function addPathPrefixes(paths: string[]): string[] {
  return paths.map(addPathPrefix);
}
