import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Hook transformation for forward direction (Official → Normalized)
 *
 * Implements rules from Spec 005:
 * - Flatten nested structure (event → matcher? → hooks array)
 * - Extract event name from top-level key
 * - Extract matcher from matcher field (if present)
 * - Add event and matcher fields to each hook
 */

export interface NormalizedHook {
  event: string;
  type: 'command';
  command: string;
  matcher?: string;
  timeout?: number;
  [key: string]: unknown;
}

interface HookEntry {
  matcher?: string;
  hooks: Array<{
    type: 'command';
    command: string;
    timeout?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

interface HooksConfig {
  hooks: {
    [event: string]: HookEntry[];
  };
}

/**
 * Transform hooks from official to normalized format
 *
 * Handles both:
 * - File path: loads and parses JSON file
 * - Inline object: transforms directly
 *
 * @param hooks - Hooks configuration (string path or inline object)
 * @param pluginDir - Absolute path to plugin directory
 * @returns Array of normalized hooks
 */
export async function transformHooks(
  hooks: string | object | undefined,
  pluginDir: string
): Promise<NormalizedHook[]> {
  if (!hooks) {
    return []; // No hooks defined
  }

  let hooksConfig: HooksConfig;

  if (typeof hooks === 'string') {
    // Load from file
    const hooksPath = path.join(pluginDir, hooks);
    try {
      const content = await fs.readFile(hooksPath, 'utf-8');
      hooksConfig = JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load hooks from ${hooksPath}: ${(error as Error).message}`);
      return [];
    }
  } else {
    // Inline object
    hooksConfig = hooks as HooksConfig;
  }

  // Flatten the nested structure
  return flattenHooks(hooksConfig);
}

/**
 * Flatten hooks from nested structure to flat array
 *
 * Nested structure:
 * {
 *   "hooks": {
 *     "EventName": [
 *       {
 *         "matcher": "pattern",
 *         "hooks": [...]
 *       }
 *     ]
 *   }
 * }
 *
 * Flat structure:
 * [
 *   {
 *     "event": "EventName",
 *     "matcher": "pattern",
 *     ...hook fields
 *   }
 * ]
 *
 * @param config - Hooks configuration object
 * @returns Flat array of normalized hooks
 */
function flattenHooks(config: HooksConfig): NormalizedHook[] {
  const result: NormalizedHook[] = [];

  const hooksObj = config.hooks || {};

  for (const [eventName, entries] of Object.entries(hooksObj)) {
    for (const entry of entries) {
      const matcher = entry.matcher;
      const hooksList = entry.hooks || [];

      for (const hook of hooksList) {
        const normalized: NormalizedHook = {
          event: eventName,
          type: hook.type,
          command: hook.command,
          ...hook // Preserve additional fields
        };

        // Add matcher if present
        if (matcher) {
          normalized.matcher = matcher;
        }

        result.push(normalized);
      }
    }
  }

  return result;
}
