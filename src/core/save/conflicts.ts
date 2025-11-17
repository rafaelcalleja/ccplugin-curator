/**
 * Conflict Resolver
 *
 * Detects and resolves naming conflicts when merging components from multiple plugins.
 * Applies namespace prefixes to conflicting items.
 *
 * Spec: docs/spec/007-save-operation-rules.md (Section 7.3-7.6)
 */

import { basename } from 'path';

/**
 * Conflict resolution result for a single item
 */
export interface ResolvedItem {
  /** Original path/name */
  original: string;
  /** Resolved path/name (with prefix if conflict detected) */
  resolved: string;
  /** Plugin name this item belongs to */
  pluginName: string;
}

/**
 * Detect conflicts in a list of items from multiple plugins
 *
 * A conflict occurs when the same basename appears in items from different plugins.
 *
 * @param items - Array of { pluginName, path } objects
 * @returns Array of resolved items with namespace prefixes applied
 */
export function resolvePathConflicts(
  items: Array<{ pluginName: string; path: string }>
): ResolvedItem[] {
  // Group by basename
  const byBasename = new Map<string, Array<{ pluginName: string; path: string }>>();

  for (const item of items) {
    const base = basename(item.path);
    if (!byBasename.has(base)) {
      byBasename.set(base, []);
    }
    byBasename.get(base)!.push(item);
  }

  const resolved: ResolvedItem[] = [];

  // Apply namespace prefix if conflict detected
  for (const [base, itemsWithSameBasename] of byBasename.entries()) {
    if (itemsWithSameBasename.length === 1) {
      // No conflict - keep original
      const item = itemsWithSameBasename[0];
      resolved.push({
        original: item.path,
        resolved: item.path,
        pluginName: item.pluginName,
      });
    } else {
      // Conflict - apply namespace prefix
      for (const item of itemsWithSameBasename) {
        const dir = item.path.substring(0, item.path.lastIndexOf('/'));
        const resolvedPath = `${dir}/${item.pluginName}--${base}`;
        resolved.push({
          original: item.path,
          resolved: resolvedPath,
          pluginName: item.pluginName,
        });
      }
    }
  }

  return resolved;
}

/**
 * Detect conflicts in MCP names from multiple plugins
 *
 * A conflict occurs when the same MCP name appears in different plugins.
 *
 * @param items - Array of { pluginName, mcpName } objects
 * @returns Map of original name → resolved name
 */
export function resolveMcpConflicts(
  items: Array<{ pluginName: string; mcpName: string }>
): Map<string, { original: string; resolved: string; pluginName: string }> {
  // Group by MCP name
  const byName = new Map<string, Array<{ pluginName: string; mcpName: string }>>();

  for (const item of items) {
    if (!byName.has(item.mcpName)) {
      byName.set(item.mcpName, []);
    }
    byName.get(item.mcpName)!.push(item);
  }

  const resolved = new Map<string, { original: string; resolved: string; pluginName: string }>();

  // Apply namespace prefix if conflict detected
  for (const [mcpName, itemsWithSameName] of byName.entries()) {
    if (itemsWithSameName.length === 1) {
      // No conflict - keep original
      const item = itemsWithSameName[0];
      const key = `${item.pluginName}:${mcpName}`;
      resolved.set(key, {
        original: mcpName,
        resolved: mcpName,
        pluginName: item.pluginName,
      });
    } else {
      // Conflict - apply namespace prefix
      for (const item of itemsWithSameName) {
        const key = `${item.pluginName}:${mcpName}`;
        resolved.set(key, {
          original: mcpName,
          resolved: `${item.pluginName}--${mcpName}`,
          pluginName: item.pluginName,
        });
      }
    }
  }

  return resolved;
}
