/**
 * Auto-Discovery System
 *
 * Discovers plugin components (commands, agents, skills) from the filesystem.
 * Implements the auto-discovery rules defined in the normalization protocol.
 *
 * Spec: docs/spec/001-normalization-protocol.md (Section 2)
 */

import { glob } from 'glob';
import { join, relative, dirname } from 'path';
import { existsSync } from 'fs';

/**
 * Normalize path: remove leading "./"
 */
function normalizePath(path: string): string {
  return path.replace(/^\.\//, '');
}

/**
 * Discover command files from default location
 *
 * Pattern: `commands/**\/*.md`
 * Returns relative paths from plugin root
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Array of relative paths to command files
 */
export async function discoverCommands(pluginDir: string): Promise<string[]> {
  const pattern = join(pluginDir, 'commands', '**', '*.md');
  const files = await glob(pattern, { nodir: true });

  // Convert to relative paths
  return files.map((file) => normalizePath(relative(pluginDir, file)));
}

/**
 * Discover agent files from default location
 *
 * Pattern: `agents/**\/*.md`
 * Returns relative paths from plugin root
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Array of relative paths to agent files
 */
export async function discoverAgents(pluginDir: string): Promise<string[]> {
  const pattern = join(pluginDir, 'agents', '**', '*.md');
  const files = await glob(pattern, { nodir: true });

  // Convert to relative paths
  return files.map((file) => normalizePath(relative(pluginDir, file)));
}

/**
 * Discover skill directories from default location
 *
 * Pattern: `skills/*\/SKILL.md` → return parent directory paths
 * Returns relative directory paths (not file paths)
 *
 * @param pluginDir - Absolute path to plugin directory
 * @returns Array of relative paths to skill directories
 */
export async function discoverSkills(pluginDir: string): Promise<string[]> {
  const pattern = join(pluginDir, 'skills', '*', 'SKILL.md');
  const files = await glob(pattern, { nodir: true });

  // Get parent directories and convert to relative paths
  const skillDirs = files.map((file) => {
    const dir = dirname(file);
    return normalizePath(relative(pluginDir, dir));
  });

  // Remove duplicates
  return Array.from(new Set(skillDirs));
}

/**
 * Resolve custom paths from plugin.json
 *
 * Handles string (directory path) or array (explicit files/dirs).
 * For string paths, performs glob expansion.
 * For array paths, returns as-is (already explicit).
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param customValue - Value from plugin.json (string or array)
 * @param globPattern - Pattern to use for string expansion (e.g., '**\/*.md')
 * @returns Array of relative paths
 */
export async function resolveCustomPaths(
  pluginDir: string,
  customValue: string | string[] | undefined,
  globPattern: string
): Promise<string[]> {
  if (!customValue) return [];

  if (typeof customValue === 'string') {
    // String path → glob expansion
    const pattern = join(pluginDir, customValue, globPattern);
    const files = await glob(pattern, { nodir: true });
    return files.map((file) => normalizePath(relative(pluginDir, file)));
  }

  // Array → normalize and return
  return customValue.map(normalizePath);
}

/**
 * Get all command paths (auto-discovered + custom)
 *
 * CRITICAL: Custom paths COMPLEMENT auto-discovery, never replace it.
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param customCommands - Custom commands value from plugin.json
 * @returns Array of all command paths (merged)
 */
export async function getAllCommands(
  pluginDir: string,
  customCommands?: string | string[]
): Promise<string[]> {
  // Auto-discovery ALWAYS runs if directory exists
  const autoDiscovered = existsSync(join(pluginDir, 'commands'))
    ? await discoverCommands(pluginDir)
    : [];

  // Resolve custom paths
  const custom = await resolveCustomPaths(
    pluginDir,
    customCommands,
    '**/*.md'
  );

  // Merge and deduplicate
  const all = [...custom, ...autoDiscovered];
  return Array.from(new Set(all));
}

/**
 * Get all agent paths (auto-discovered + custom)
 *
 * CRITICAL: Custom paths COMPLEMENT auto-discovery, never replace it.
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param customAgents - Custom agents value from plugin.json
 * @returns Array of all agent paths (merged)
 */
export async function getAllAgents(
  pluginDir: string,
  customAgents?: string | string[]
): Promise<string[]> {
  // Auto-discovery ALWAYS runs if directory exists
  const autoDiscovered = existsSync(join(pluginDir, 'agents'))
    ? await discoverAgents(pluginDir)
    : [];

  // Resolve custom paths
  const custom = await resolveCustomPaths(pluginDir, customAgents, '**/*.md');

  // Merge and deduplicate
  const all = [...custom, ...autoDiscovered];
  return Array.from(new Set(all));
}

/**
 * Get all skill directory paths (auto-discovered + custom)
 *
 * CRITICAL: Custom paths COMPLEMENT auto-discovery, never replace it.
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param customSkills - Custom skills value from plugin.json
 * @returns Array of all skill directory paths (merged)
 */
export async function getAllSkills(
  pluginDir: string,
  customSkills?: string | string[]
): Promise<string[]> {
  // Auto-discovery ALWAYS runs if directory exists
  const autoDiscovered = existsSync(join(pluginDir, 'skills'))
    ? await discoverSkills(pluginDir)
    : [];

  // Resolve custom paths (skills can be string or array)
  let custom: string[] = [];
  if (customSkills) {
    if (typeof customSkills === 'string') {
      // String path → discover SKILL.md files in that directory
      const pattern = join(pluginDir, customSkills, '*', 'SKILL.md');
      const files = await glob(pattern, { nodir: true });
      custom = files.map((file) => {
        const dir = dirname(file);
        return normalizePath(relative(pluginDir, dir));
      });
    } else {
      // Array → assume directory paths
      custom = customSkills.map(normalizePath);
    }
  }

  // Merge and deduplicate
  const all = [...custom, ...autoDiscovered];
  return Array.from(new Set(all));
}
