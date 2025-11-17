/**
 * Reverse Components Transformer
 *
 * Transforms normalized component paths back to official format.
 * Adds "./" prefix to all paths and omits empty arrays.
 *
 * Spec: docs/spec/006-reverse-transformation-rules.md (Section 3.3, 3.4)
 */

import { addPathPrefixes } from '../utils/path.js';

/**
 * Transform commands array from normalized to official format
 *
 * Rules:
 * - Empty array → undefined (omit field)
 * - Non-empty → array with "./" prefix on each path
 *
 * @param commands - Normalized commands array
 * @returns Official commands format or undefined if empty
 */
export function transformCommands(commands: string[]): string[] | undefined {
  if (commands.length === 0) {
    return undefined;
  }

  return addPathPrefixes(commands);
}

/**
 * Transform agents array from normalized to official format
 *
 * Rules:
 * - Empty array → undefined (omit field)
 * - Non-empty → array with "./" prefix on each path
 *
 * @param agents - Normalized agents array
 * @returns Official agents format or undefined if empty
 */
export function transformAgents(agents: string[]): string[] | undefined {
  if (agents.length === 0) {
    return undefined;
  }

  return addPathPrefixes(agents);
}

/**
 * Transform skills array from normalized to official format
 *
 * Rules:
 * - Empty array → undefined (omit field)
 * - Non-empty → array with "./" prefix on each path
 *
 * @param skills - Normalized skills array
 * @returns Official skills format or undefined if empty
 */
export function transformSkills(skills: string[]): string[] | undefined {
  if (skills.length === 0) {
    return undefined;
  }

  return addPathPrefixes(skills);
}
