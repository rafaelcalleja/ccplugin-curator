"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOfficialFormat = toOfficialFormat;
exports.groupHooksByEvent = groupHooksByEvent;
exports.mcpsToObject = mcpsToObject;
exports.omitDefaults = omitDefaults;
/**
 * Transforms a normalized plugin back to official Claude Code format
 * @param normalized Normalized plugin object
 * @returns Official plugin.json format
 */
function toOfficialFormat(normalized) {
    const official = {
        name: normalized.name
    };
    // Add non-default metadata fields
    if (normalized.version && normalized.version !== '0.0.0') {
        official.version = normalized.version;
    }
    if (normalized.description) {
        official.description = normalized.description;
    }
    // Add author if not all empty
    const author = normalized.author;
    if (author && (author.name || author.email || author.url)) {
        official.author = {};
        if (author.name)
            official.author.name = author.name;
        if (author.email)
            official.author.email = author.email;
        if (author.url)
            official.author.url = author.url;
    }
    if (normalized.homepage) {
        official.homepage = normalized.homepage;
    }
    if (normalized.repository) {
        official.repository = normalized.repository;
    }
    if (normalized.license) {
        official.license = normalized.license;
    }
    if (normalized.keywords && normalized.keywords.length > 0) {
        official.keywords = normalized.keywords;
    }
    // Transform component paths (add ./ prefix)
    if (normalized.commands && normalized.commands.length > 0) {
        official.commands = normalized.commands.map((cmd) => `./${cmd}`);
    }
    if (normalized.agents && normalized.agents.length > 0) {
        official.agents = normalized.agents.map((agent) => `./${agent}`);
    }
    if (normalized.skills && normalized.skills.length > 0) {
        official.skills = normalized.skills.map((skill) => `./${skill}`);
    }
    // Transform hooks (flat array → nested object)
    if (normalized.hooks && normalized.hooks.length > 0) {
        official.hooks = groupHooksByEvent(normalized.hooks);
    }
    // Transform MCPs (array → object)
    if (normalized.mcps && normalized.mcps.length > 0) {
        official.mcpServers = mcpsToObject(normalized.mcps);
    }
    return official;
}
/**
 * Groups hooks by event and matcher, creating nested structure
 * @param hooks Flat array of hooks
 * @returns Nested hooks object
 */
function groupHooksByEvent(hooks) {
    const grouped = {};
    // Group by event
    for (const hook of hooks) {
        const event = hook.event;
        if (!grouped[event]) {
            grouped[event] = [];
        }
        // Find existing group with same matcher
        const matcher = hook.matcher || null;
        let group = grouped[event].find((g) => {
            const gMatcher = g.matcher || null;
            return gMatcher === matcher;
        });
        if (!group) {
            // Create new group
            group = { hooks: [] };
            if (matcher) {
                group.matcher = matcher;
            }
            grouped[event].push(group);
        }
        // Remove event and matcher from hook config
        const { event: _, matcher: __, ...hookConfig } = hook;
        // Transform command path to use ${CLAUDE_PLUGIN_ROOT} for local scripts
        if (hookConfig.command && !hookConfig.command.startsWith('npx') &&
            !hookConfig.command.startsWith('node') &&
            !hookConfig.command.startsWith('/usr/')) {
            // Local script path - add ${CLAUDE_PLUGIN_ROOT}
            hookConfig.command = `\${CLAUDE_PLUGIN_ROOT}/${hookConfig.command}`;
        }
        group.hooks.push(hookConfig);
    }
    return grouped;
}
/**
 * Converts MCP array to object using name as key
 * @param mcps Array of MCP configurations
 * @returns Object with MCP names as keys
 */
function mcpsToObject(mcps) {
    const obj = {};
    for (const mcp of mcps) {
        const { name, ...config } = mcp;
        // Omit empty env object
        if (config.env && Object.keys(config.env).length === 0) {
            delete config.env;
        }
        obj[name] = config;
    }
    return obj;
}
/**
 * Removes default values from plugin object to minimize output
 * @param plugin Partial plugin object
 * @returns Cleaned plugin object
 */
function omitDefaults(plugin) {
    const cleaned = { ...plugin };
    // Remove default version
    if (cleaned.version === '0.0.0') {
        delete cleaned.version;
    }
    // Remove empty description
    if (cleaned.description === '') {
        delete cleaned.description;
    }
    // Remove empty author
    if (cleaned.author) {
        const { name, email, url } = cleaned.author;
        if (!name && !email && !url) {
            delete cleaned.author;
        }
    }
    // Remove empty strings
    if (cleaned.homepage === '')
        delete cleaned.homepage;
    if (cleaned.repository === '')
        delete cleaned.repository;
    if (cleaned.license === '')
        delete cleaned.license;
    // Remove empty arrays
    if (Array.isArray(cleaned.keywords) && cleaned.keywords.length === 0) {
        delete cleaned.keywords;
    }
    if (Array.isArray(cleaned.commands) && cleaned.commands.length === 0) {
        delete cleaned.commands;
    }
    if (Array.isArray(cleaned.agents) && cleaned.agents.length === 0) {
        delete cleaned.agents;
    }
    if (Array.isArray(cleaned.skills) && cleaned.skills.length === 0) {
        delete cleaned.skills;
    }
    // Remove empty hooks/mcps objects
    if (cleaned.hooks && Object.keys(cleaned.hooks).length === 0) {
        delete cleaned.hooks;
    }
    if (cleaned.mcpServers && Object.keys(cleaned.mcpServers).length === 0) {
        delete cleaned.mcpServers;
    }
    return cleaned;
}
//# sourceMappingURL=reverse-transformer.js.map