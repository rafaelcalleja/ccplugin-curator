/**
 * Hooks Loader
 *
 * Loads hook configurations from file paths or inline objects.
 * Transforms nested hook structure into flat array format.
 *
 * Spec: docs/spec/001-normalization-protocol.md (Section 3, hooks)
 * Spec: docs/spec/005-transformation-rules.md (Section 2.3)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Hook event types
 */
export type HookEvent =
  | 'SessionStart'
  | 'SessionEnd'
  | 'UserPromptSubmit'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Notification'
  | 'Stop'
  | 'SubagentStop'
  | 'PreCompact';

/**
 * Normalized hook format (flat array)
 */
export interface NormalizedHook {
  event: HookEvent;
  type: 'command';
  command: string;
  matcher?: string;
  timeout?: number;
  [key: string]: any; // Preserve additional fields
}

/**
 * Official hooks format (nested structure)
 */
interface OfficialHooksConfig {
  [eventName: string]: Array<{
    matcher?: string;
    hooks: Array<{
      type: 'command';
      command: string;
      timeout?: number;
      [key: string]: any;
    }>;
  }>;
}

/**
 * Load hooks from file path
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param filePath - Relative path to hooks file (e.g., "./hooks/hooks.json")
 * @returns Normalized hooks array
 * @throws Error if file not found or invalid JSON
 */
export function loadHooksFromFile(
  pluginDir: string,
  filePath: string
): NormalizedHook[] {
  // Remove leading "./"
  const cleanPath = filePath.replace(/^\.\//, '');
  const fullPath = join(pluginDir, cleanPath);

  if (!existsSync(fullPath)) {
    throw new Error(`Hooks file not found: ${fullPath}`);
  }

  let content: any;
  try {
    const fileContent = readFileSync(fullPath, 'utf-8');
    content = JSON.parse(fileContent);
  } catch (err: any) {
    throw new Error(`Failed to parse hooks file: ${err.message}`);
  }

  // Extract hooks from { "hooks": {...} } wrapper or use directly
  const hooksConfig = content.hooks || content;

  return normalizeHooks(hooksConfig);
}

/**
 * Normalize hooks from nested object to flat array
 *
 * Transformation:
 * {
 *   "SessionStart": [{ hooks: [{ type, command }] }],
 *   "PostToolUse": [{ matcher: "Write", hooks: [{ type, command }] }]
 * }
 * →
 * [
 *   { event: "SessionStart", type, command },
 *   { event: "PostToolUse", type, command, matcher: "Write" }
 * ]
 *
 * @param hooksConfig - Nested hooks configuration
 * @returns Flat array of normalized hooks
 */
export function normalizeHooks(
  hooksConfig: OfficialHooksConfig
): NormalizedHook[] {
  const normalized: NormalizedHook[] = [];

  for (const [eventName, eventHooks] of Object.entries(hooksConfig)) {
    for (const hookGroup of eventHooks) {
      const matcher = hookGroup.matcher;
      const hooks = hookGroup.hooks || [];

      for (const hook of hooks) {
        const normalizedHook: NormalizedHook = {
          ...hook, // Preserve all additional fields first
          event: eventName as HookEvent, // Override with event
        };

        // Remove 'hooks' field if it exists (it's the nested array)
        delete (normalizedHook as any).hooks;

        // Add matcher if present
        if (matcher) {
          normalizedHook.matcher = matcher;
        }

        normalized.push(normalizedHook);
      }
    }
  }

  return normalized;
}

/**
 * Load hooks from plugin.json value
 *
 * Handles:
 * - String: file path to hooks.json
 * - Object: inline hooks configuration
 * - Undefined: try default locations
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param hooksValue - Value from plugin.json
 * @returns Normalized hooks array
 */
export function loadHooks(
  pluginDir: string,
  hooksValue?: string | object
): NormalizedHook[] {
  // String → load from file
  if (typeof hooksValue === 'string') {
    return loadHooksFromFile(pluginDir, hooksValue);
  }

  // Object → normalize inline config
  if (typeof hooksValue === 'object' && hooksValue !== null) {
    return normalizeHooks(hooksValue as OfficialHooksConfig);
  }

  // Undefined → try default locations
  const defaultPaths = ['hooks/hooks.json', 'settings.json'];

  for (const defaultPath of defaultPaths) {
    const fullPath = join(pluginDir, defaultPath);
    if (existsSync(fullPath)) {
      try {
        return loadHooksFromFile(pluginDir, `./${defaultPath}`);
      } catch (err) {
        // Continue to next default path
      }
    }
  }

  // No hooks found
  return [];
}
