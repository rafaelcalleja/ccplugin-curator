/**
 * Reverse Hooks Transformer
 *
 * Transforms normalized hooks (flat array) back to official format (nested object).
 * Groups by event, then by matcher.
 *
 * Spec: docs/spec/006-reverse-transformation-rules.md (Section 3.5)
 */

import type { NormalizedHook } from '../../core/hooks-loader.js';

/**
 * Official hooks configuration format (nested)
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
 * Get group key string for Map
 */
function getGroupKeyString(event: string, matcher?: string): string {
  return matcher ? `${event}:${matcher}` : event;
}

/**
 * Transform hooks from flat array to nested object
 *
 * Transformation steps:
 * 1. Group hooks by event
 * 2. Within each event, group by matcher
 * 3. Remove 'event' and 'matcher' fields from hook configs
 * 4. Create nested structure
 *
 * Example:
 * [
 *   { event: "SessionStart", type: "command", command: "/init.sh" },
 *   { event: "PostToolUse", type: "command", command: "/fmt.sh", matcher: "Write" }
 * ]
 * →
 * {
 *   "SessionStart": [{ hooks: [{ type: "command", command: "/init.sh" }] }],
 *   "PostToolUse": [{ matcher: "Write", hooks: [{ type: "command", command: "/fmt.sh" }] }]
 * }
 *
 * @param hooks - Normalized hooks array
 * @returns Official hooks configuration or undefined if empty
 */
export function transformHooks(hooks: NormalizedHook[]): OfficialHooksConfig | undefined {
  if (hooks.length === 0) {
    return undefined;
  }

  // Group hooks by event + matcher
  const groups = new Map<string, NormalizedHook[]>();

  for (const hook of hooks) {
    const key = getGroupKeyString(hook.event, hook.matcher);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(hook);
  }

  // Build nested structure
  const result: OfficialHooksConfig = {};

  for (const [, groupHooks] of groups.entries()) {
    const firstHook = groupHooks[0];
    const event = firstHook.event;
    const matcher = firstHook.matcher;

    // Initialize event array if not exists
    if (!result[event]) {
      result[event] = [];
    }

    // Create hook configs without 'event' and 'matcher' fields
    const hookConfigs = groupHooks.map((hook) => {
      const config: any = { ...hook };
      delete config.event;
      delete config.matcher;
      return config;
    });

    // Create group object
    const groupObject: any = {
      hooks: hookConfigs,
    };

    // Add matcher if present
    if (matcher) {
      groupObject.matcher = matcher;
    }

    result[event].push(groupObject);
  }

  return result;
}
