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
 * Check if a command is a local script path (not a system command)
 *
 * Local script paths start with:
 * - "./" or "hooks/" or other relative path indicators
 * - A path (contains "/" and doesn't start with system command)
 *
 * @param command - Hook command string
 * @returns true if command is a local script path
 */
function isLocalScriptCommand(command: string): boolean {
  // System commands (no transformation needed)
  if (/^(npx|node|python|python3|bash|sh|npm|yarn|pnpm)\s/.test(command)) {
    return false;
  }

  // Check for path indicators
  return (
    command.startsWith('./') ||
    command.startsWith('hooks/') ||
    /^[a-zA-Z0-9_-]+\//.test(command) || // starts with directory/
    /\.(sh|bash|js|ts|py)(\s|$)/.test(command) // has script extension
  );
}

/**
 * Transform hook command to use ${CLAUDE_PLUGIN_ROOT} for local scripts
 *
 * Spec: docs/spec/006-reverse-transformation-rules.md §3.5
 *
 * Local script paths are transformed:
 *   "hooks/setup.sh" → "${CLAUDE_PLUGIN_ROOT}/hooks/setup.sh"
 *   "./hooks/init.sh arg" → "${CLAUDE_PLUGIN_ROOT}/hooks/init.sh arg"
 *
 * System commands remain unchanged:
 *   "npx tsx hooks/script.ts" → "npx tsx hooks/script.ts"
 *
 * @param command - Original command string
 * @returns Transformed command with ${CLAUDE_PLUGIN_ROOT} if applicable
 */
function transformHookCommand(command: string): string {
  if (!isLocalScriptCommand(command)) {
    return command; // System command, no transformation
  }

  // Remove leading "./" if present
  let normalized = command;
  if (normalized.startsWith('./')) {
    normalized = normalized.substring(2);
  }

  // Add ${CLAUDE_PLUGIN_ROOT}/ prefix
  return `\${CLAUDE_PLUGIN_ROOT}/${normalized}`;
}

/**
 * Transform hooks from flat array to nested object
 *
 * Transformation steps:
 * 1. Group hooks by event
 * 2. Within each event, group by matcher
 * 3. Transform local script paths to use ${CLAUDE_PLUGIN_ROOT}
 * 4. Remove 'event' and 'matcher' fields from hook configs
 * 5. Create nested structure
 *
 * Example:
 * [
 *   { event: "SessionStart", type: "command", command: "hooks/init.sh" },
 *   { event: "PostToolUse", type: "command", command: "hooks/fmt.sh", matcher: "Write" }
 * ]
 * →
 * {
 *   "SessionStart": [{ hooks: [{ type: "command", command: "${CLAUDE_PLUGIN_ROOT}/hooks/init.sh" }] }],
 *   "PostToolUse": [{ matcher: "Write", hooks: [{ type: "command", command: "${CLAUDE_PLUGIN_ROOT}/hooks/fmt.sh" }] }]
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
    // Transform commands to use ${CLAUDE_PLUGIN_ROOT} for local scripts
    const hookConfigs = groupHooks.map((hook) => {
      const config: any = { ...hook };
      delete config.event;
      delete config.matcher;

      // Transform command if it's a local script
      if (config.command) {
        config.command = transformHookCommand(config.command);
      }

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
