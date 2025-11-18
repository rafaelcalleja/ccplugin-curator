/**
 * Hook grouping for reverse direction (Normalized → Official)
 *
 * Implements rules from Spec 006:
 * - Group hooks by event field
 * - Within each event, group by matcher field
 * - Remove event and matcher fields from hook configs
 * - Create nested structure: { "EventName": [{ "matcher"?: string, "hooks": [...] }] }
 */

interface NormalizedHook {
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
}

interface GroupedHooks {
  hooks: {
    [event: string]: HookEntry[];
  };
}

/**
 * Group hooks from flat array to nested structure
 *
 * Flat array:
 * [
 *   { event: "SessionStart", type: "command", command: "...", matcher?: "..." }
 * ]
 *
 * Nested structure:
 * {
 *   "hooks": {
 *     "SessionStart": [
 *       {
 *         "matcher": "...",  // Optional
 *         "hooks": [
 *           { type: "command", command: "..." }
 *         ]
 *       }
 *     ]
 *   }
 * }
 *
 * @param hooks - Array of normalized hooks
 * @returns Grouped hooks object
 */
export function groupHooks(hooks: NormalizedHook[]): GroupedHooks | undefined {
  if (hooks.length === 0) {
    return undefined; // Omit empty hooks
  }

  // Group by event, then by matcher
  const eventGroups = new Map<string, Map<string | undefined, NormalizedHook[]>>();

  for (const hook of hooks) {
    const { event, matcher } = hook;

    if (!eventGroups.has(event)) {
      eventGroups.set(event, new Map());
    }

    const matcherGroups = eventGroups.get(event)!;
    const matcherKey = matcher ?? undefined;

    if (!matcherGroups.has(matcherKey)) {
      matcherGroups.set(matcherKey, []);
    }

    matcherGroups.get(matcherKey)!.push(hook);
  }

  // Build the nested structure
  const result: GroupedHooks = { hooks: {} };

  for (const [event, matcherGroups] of eventGroups) {
    result.hooks[event] = [];

    for (const [matcher, hooksList] of matcherGroups) {
      const entry: HookEntry = {
        hooks: hooksList.map(h => {
          // Remove event and matcher fields
          const { event: _, matcher: __, ...rest } = h;
          return rest as {
            type: 'command';
            command: string;
            timeout?: number;
            [key: string]: unknown;
          };
        })
      };

      // Add matcher if present
      if (matcher !== undefined) {
        entry.matcher = matcher;
      }

      result.hooks[event].push(entry);
    }
  }

  return result;
}
