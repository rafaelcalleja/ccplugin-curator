"use strict";
/**
 * Reverse transformation implementation (Normalized → Official)
 * Based on docs/spec/006-reverse-transformation-rules.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseTransform = reverseTransform;
/**
 * Transform a normalized plugin back to official Claude Code format
 *
 * Implements:
 * - 006::Invariant::1: Minimalism - omit defaults
 * - 006::Invariant::2: Valid Claude Code plugin format
 * - 006::Invariant::6: Always output arrays with ./ prefix
 * - 006::Invariant::7: NEVER include source field
 *
 * @param normalized - Normalized plugin format
 * @returns Official plugin.json format
 */
function reverseTransform(normalized) {
    const official = {};
    // 1. Name (required)
    official.name = normalized.name;
    // 2. Metadata (only if non-default)
    if (normalized.version !== '0.0.0') {
        official.version = normalized.version;
    }
    if (normalized.description !== '') {
        official.description = normalized.description;
    }
    const author = removeEmptyAuthorFields(normalized.author);
    if (author && Object.keys(author).length > 0) {
        official.author = author;
    }
    if (normalized.homepage !== '') {
        official.homepage = normalized.homepage;
    }
    if (normalized.repository !== '') {
        official.repository = normalized.repository;
    }
    if (normalized.license !== '') {
        official.license = normalized.license;
    }
    if (normalized.keywords.length > 0) {
        official.keywords = normalized.keywords;
    }
    // 3. Commands (only if non-empty, add "./" prefix)
    if (normalized.commands.length > 0) {
        official.commands = normalized.commands.map(addDotSlashPrefix);
    }
    // 4. Agents (only if non-empty, add "./" prefix)
    if (normalized.agents.length > 0) {
        official.agents = normalized.agents.map(addDotSlashPrefix);
    }
    // 5. Skills (only if non-empty, add "./" prefix)
    if (normalized.skills.length > 0) {
        official.skills = normalized.skills.map(addDotSlashPrefix);
    }
    // 6. Hooks (group by event)
    if (normalized.hooks.length > 0) {
        official.hooks = groupHooksByEvent(normalized.hooks);
    }
    // 7. MCPs (use name as key)
    if (normalized.mcps.length > 0) {
        official.mcpServers = mcpsToObject(normalized.mcps);
    }
    return official;
}
/**
 * Remove empty fields from author object
 * Returns undefined if all fields are empty
 */
function removeEmptyAuthorFields(author) {
    const result = {};
    let hasNonEmpty = false;
    if (author.name !== '') {
        result.name = author.name;
        hasNonEmpty = true;
    }
    if (author.email !== '') {
        result.email = author.email;
        hasNonEmpty = true;
    }
    if (author.url !== '') {
        result.url = author.url;
        hasNonEmpty = true;
    }
    return hasNonEmpty ? result : undefined;
}
/**
 * Add ./ prefix to path if not already present
 */
function addDotSlashPrefix(path) {
    return path.startsWith('./') ? path : `./${path}`;
}
/**
 * Group hooks by event and matcher
 * Implements 006::Invariant::11: Hooks are grouped by event correctly
 * Implements 006::Invariant::18: Preserve all fields except event
 */
function groupHooksByEvent(hooks) {
    const grouped = {};
    // Group by event first
    const eventGroups = {};
    for (const hook of hooks) {
        const event = hook.event;
        if (!eventGroups[event]) {
            eventGroups[event] = [];
        }
        eventGroups[event].push(hook);
    }
    // For each event, group by matcher
    for (const [event, eventHooks] of Object.entries(eventGroups)) {
        const matcherGroups = {};
        for (const hook of eventHooks) {
            const matcher = hook.matcher || '_no_matcher_';
            if (!matcherGroups[matcher]) {
                matcherGroups[matcher] = [];
            }
            matcherGroups[matcher].push(hook);
        }
        // Build event config array
        const eventConfigs = [];
        for (const [matcher, matcherHooks] of Object.entries(matcherGroups)) {
            const config = {
                hooks: matcherHooks.map(h => {
                    // Remove event and matcher fields
                    const { event: _, matcher: __, ...hookConfig } = h;
                    return hookConfig;
                }),
            };
            // Add matcher if present
            if (matcher !== '_no_matcher_') {
                config.matcher = matcher;
            }
            eventConfigs.push(config);
        }
        grouped[event] = eventConfigs;
    }
    return grouped;
}
/**
 * Convert MCP array to object format
 * Implements 006::Invariant::12: MCPs are keyed by name correctly
 * Implements 006::Invariant::19: Preserve all fields except name
 */
function mcpsToObject(mcps) {
    const result = {};
    for (const mcp of mcps) {
        const name = mcp.name;
        // Remove name field and copy rest
        const { name: _, ...config } = mcp;
        // Omit empty env objects
        if (config.env && Object.keys(config.env).length === 0) {
            delete config.env;
        }
        result[name] = config;
    }
    return result;
}
//# sourceMappingURL=reverse-transform.js.map