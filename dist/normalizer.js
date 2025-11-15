import fs from 'fs';
import path from 'path';
import { autoDiscoverComponents } from './scanner.js';
/**
 * Normalize a plugin to internal format
 * Implements transformation rules from spec 001-normalization-protocol.md
 */
export async function normalizePlugin(pluginJson, sourceDir) {
    // Get auto-discovered components
    const discovered = await autoDiscoverComponents(sourceDir);
    // Normalize metadata with defaults
    const normalized = {
        name: pluginJson.name || path.basename(sourceDir),
        source: sourceDir,
        version: pluginJson.version || '0.0.0',
        description: pluginJson.description || '',
        author: {
            name: pluginJson.author?.name || '',
            email: pluginJson.author?.email || '',
            url: pluginJson.author?.url || '',
        },
        homepage: pluginJson.homepage || '',
        repository: pluginJson.repository || '',
        license: pluginJson.license || '',
        keywords: pluginJson.keywords || [],
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: [],
    };
    // Normalize commands
    normalized.commands = normalizeComponentPaths(pluginJson.commands, discovered.commands, sourceDir);
    // Normalize agents
    normalized.agents = normalizeComponentPaths(pluginJson.agents, discovered.agents, sourceDir);
    // Skills are ALWAYS discovered, never defined in plugin.json
    normalized.skills = discovered.skills;
    // Normalize hooks
    // (Simplified - stores original format for now)
    if (pluginJson.hooks) {
        if (typeof pluginJson.hooks === 'string') {
            const hooksPath = path.resolve(sourceDir, pluginJson.hooks);
            if (fs.existsSync(hooksPath)) {
                try {
                    const hooksConfig = JSON.parse(fs.readFileSync(hooksPath, 'utf-8'));
                    normalized.hooks = normalizeHooks(hooksConfig);
                }
                catch (error) {
                    console.warn(`Failed to load hooks from ${pluginJson.hooks}:`, error);
                }
            }
        }
        else if (typeof pluginJson.hooks === 'object') {
            normalized.hooks = normalizeHooks(pluginJson.hooks);
        }
    }
    else if (discovered.hooks) {
        normalized.hooks = normalizeHooks(discovered.hooks);
    }
    // Normalize MCPs
    // (Simplified - stores original format for now)
    if (pluginJson.mcpServers) {
        if (typeof pluginJson.mcpServers === 'string') {
            const mcpPath = path.resolve(sourceDir, pluginJson.mcpServers);
            if (fs.existsSync(mcpPath)) {
                try {
                    const mcpConfig = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
                    normalized.mcps = normalizeMcps(mcpConfig);
                }
                catch (error) {
                    console.warn(`Failed to load MCPs from ${pluginJson.mcpServers}:`, error);
                }
            }
        }
        else if (typeof pluginJson.mcpServers === 'object') {
            normalized.mcps = normalizeMcps(pluginJson.mcpServers);
        }
    }
    else if (discovered.mcps) {
        normalized.mcps = normalizeMcps(discovered.mcps);
    }
    return normalized;
}
/**
 * Normalize component paths (commands, agents)
 * Custom paths COMPLEMENT auto-discovery, never replace
 */
function normalizeComponentPaths(customPaths, discoveredPaths, sourceDir) {
    const paths = [];
    // Add custom paths first
    if (customPaths) {
        const customArray = Array.isArray(customPaths) ? customPaths : [customPaths];
        for (const customPath of customArray) {
            // Remove leading ./ if present
            const normalized = customPath.startsWith('./') ? customPath.slice(2) : customPath;
            if (normalized && !paths.includes(normalized)) {
                paths.push(normalized);
            }
        }
    }
    // Add discovered paths (complementary, not replacing)
    for (const discoveredPath of discoveredPaths) {
        if (!paths.includes(discoveredPath)) {
            paths.push(discoveredPath);
        }
    }
    return paths;
}
/**
 * Convert hooks object format to Hook[] array
 * Format: { "EventName": [{ type, command/agent, matcher? }] }
 */
function normalizeHooks(hooksConfig) {
    const hooks = [];
    for (const [event, configs] of Object.entries(hooksConfig)) {
        if (Array.isArray(configs)) {
            for (const config of configs) {
                hooks.push({
                    event,
                    type: config.type || 'command',
                    command: config.command,
                    agent: config.agent,
                    matcher: config.matcher,
                    ...config, // Preserve additional fields
                });
            }
        }
    }
    return hooks;
}
/**
 * Convert MCPs object format to Mcp[] array
 * Format: { "serverName": { command, args?, env? } }
 */
function normalizeMcps(mcpConfig) {
    const mcps = [];
    for (const [name, config] of Object.entries(mcpConfig)) {
        mcps.push({
            name,
            command: config.command,
            args: config.args,
            env: config.env || {},
            ...config, // Preserve additional fields
        });
    }
    return mcps;
}
//# sourceMappingURL=normalizer.js.map