"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePlugin = normalizePlugin;
exports.autoDiscoverCommands = autoDiscoverCommands;
exports.autoDiscoverAgents = autoDiscoverAgents;
exports.autoDiscoverSkills = autoDiscoverSkills;
exports.parseHooks = parseHooks;
exports.parseMcps = parseMcps;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
/**
 * Normalizes a plugin from official Claude Code format to internal format
 * @param pluginPath Absolute path to plugin directory (.claude-plugin parent)
 * @returns Normalized plugin object
 */
async function normalizePlugin(pluginPath) {
    const pluginJsonPath = path.join(pluginPath, '.claude-plugin', 'plugin.json');
    if (!fs.existsSync(pluginJsonPath)) {
        throw new Error(`Plugin file not found: ${pluginJsonPath}`);
    }
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
    // Required field: name (default to directory basename)
    const name = pluginJson.name || path.basename(pluginPath);
    // Auto-discover components (always happens, even with custom paths)
    const autoCommands = await autoDiscoverCommands(pluginPath);
    const autoAgents = await autoDiscoverAgents(pluginPath);
    const autoSkills = await autoDiscoverSkills(pluginPath);
    // Parse custom paths (additive to auto-discovery)
    const customCommands = await parseComponentPaths(pluginPath, pluginJson.commands, '**/*.md');
    const customAgents = await parseComponentPaths(pluginPath, pluginJson.agents, '**/*.md');
    const customSkills = await parseComponentPaths(pluginPath, pluginJson.skills, '*/SKILL.md', true);
    // Combine auto-discovered and custom paths (removing duplicates)
    const commands = Array.from(new Set([...autoCommands, ...customCommands]));
    const agents = Array.from(new Set([...autoAgents, ...customAgents]));
    const skills = Array.from(new Set([...autoSkills, ...customSkills]));
    // Parse hooks and MCPs
    const hooks = await parseHooks(pluginPath, pluginJson.hooks);
    const mcps = await parseMcps(pluginPath, pluginJson.mcpServers);
    // Build normalized plugin object
    const normalized = {
        name,
        source: pluginPath,
        version: pluginJson.version || '0.0.0',
        description: pluginJson.description || '',
        author: {
            name: pluginJson.author?.name || '',
            email: pluginJson.author?.email || '',
            url: pluginJson.author?.url || ''
        },
        homepage: pluginJson.homepage || '',
        repository: pluginJson.repository || '',
        license: pluginJson.license || '',
        keywords: pluginJson.keywords || [],
        commands,
        agents,
        skills,
        hooks: hooks,
        mcps
    };
    return normalized;
}
/**
 * Auto-discovers commands using default glob pattern
 * @param pluginPath Absolute path to plugin directory
 * @returns Array of relative command paths (without ./ prefix)
 */
async function autoDiscoverCommands(pluginPath) {
    const commandsDir = path.join(pluginPath, 'commands');
    if (!fs.existsSync(commandsDir)) {
        return [];
    }
    const pattern = 'commands/**/*.md';
    const files = await (0, glob_1.glob)(pattern, { cwd: pluginPath });
    // Normalize paths: remove leading ./
    return files.map(f => f.replace(/^\.\//, ''));
}
/**
 * Auto-discovers agents using default glob pattern
 * @param pluginPath Absolute path to plugin directory
 * @returns Array of relative agent paths (without ./ prefix)
 */
async function autoDiscoverAgents(pluginPath) {
    const agentsDir = path.join(pluginPath, 'agents');
    if (!fs.existsSync(agentsDir)) {
        return [];
    }
    const pattern = 'agents/**/*.md';
    const files = await (0, glob_1.glob)(pattern, { cwd: pluginPath });
    // Normalize paths: remove leading ./
    return files.map(f => f.replace(/^\.\//, ''));
}
/**
 * Auto-discovers skills using default glob pattern
 * Skills returns parent directory paths, NOT file paths
 * @param pluginPath Absolute path to plugin directory
 * @returns Array of relative skill directory paths (without ./ prefix)
 */
async function autoDiscoverSkills(pluginPath) {
    const skillsDir = path.join(pluginPath, 'skills');
    if (!fs.existsSync(skillsDir)) {
        return [];
    }
    const pattern = 'skills/*/SKILL.md';
    const files = await (0, glob_1.glob)(pattern, { cwd: pluginPath });
    // Extract parent directories and normalize
    return files.map(f => {
        const dir = path.dirname(f);
        return dir.replace(/^\.\//, '');
    });
}
/**
 * Parses component paths from plugin.json (string or array)
 * @param pluginPath Absolute path to plugin directory
 * @param pathConfig Path configuration (string | string[] | undefined)
 * @param globPattern Glob pattern to use for string paths
 * @param returnDirs If true, return parent directories instead of file paths
 * @returns Array of relative paths (without ./ prefix)
 */
async function parseComponentPaths(pluginPath, pathConfig, globPattern, returnDirs = false) {
    if (!pathConfig) {
        return [];
    }
    if (typeof pathConfig === 'string') {
        // String path: apply glob pattern
        const customDir = pathConfig.replace(/^\.\//, '');
        const customDirAbs = path.join(pluginPath, customDir);
        if (!fs.existsSync(customDirAbs)) {
            return [];
        }
        const pattern = path.join(customDir, globPattern);
        const files = await (0, glob_1.glob)(pattern, { cwd: pluginPath });
        if (returnDirs) {
            // Return parent directories
            return files.map(f => path.dirname(f).replace(/^\.\//, ''));
        }
        // Return file paths
        return files.map(f => f.replace(/^\.\//, ''));
    }
    // Array of explicit paths
    return pathConfig.map(p => p.replace(/^\.\//, ''));
}
/**
 * Parses hooks configuration (file or inline object)
 * @param pluginPath Absolute path to plugin directory
 * @param hooksConfig Hooks configuration (string | object | undefined)
 * @returns Array of normalized hooks
 */
async function parseHooks(pluginPath, hooksConfig) {
    let hooksData;
    if (!hooksConfig) {
        // Try default locations
        const defaultPaths = [
            path.join(pluginPath, 'hooks', 'hooks.json'),
            path.join(pluginPath, 'settings.json')
        ];
        for (const p of defaultPaths) {
            if (fs.existsSync(p)) {
                hooksData = JSON.parse(fs.readFileSync(p, 'utf-8'));
                break;
            }
        }
        if (!hooksData) {
            return [];
        }
    }
    else if (typeof hooksConfig === 'string') {
        // Load from file path
        const hooksPath = path.join(pluginPath, hooksConfig.replace(/^\.\//, ''));
        if (!fs.existsSync(hooksPath)) {
            return [];
        }
        hooksData = JSON.parse(fs.readFileSync(hooksPath, 'utf-8'));
    }
    else {
        // Inline configuration
        hooksData = hooksConfig;
    }
    // Extract hooks from nested structure
    const normalized = [];
    const hooksObject = hooksData.hooks || hooksData;
    for (const [event, eventHooks] of Object.entries(hooksObject)) {
        if (!Array.isArray(eventHooks))
            continue;
        for (const entry of eventHooks) {
            const matcher = entry.matcher;
            const hooks = entry.hooks || [];
            for (const hook of hooks) {
                // Normalize the hook object
                const normalizedHook = {
                    event,
                    ...hook
                };
                // Add matcher if present
                if (matcher) {
                    normalizedHook.matcher = matcher;
                }
                // Normalize command path (remove ./ prefix)
                if (normalizedHook.command) {
                    normalizedHook.command = normalizedHook.command.replace(/^\.\//, '');
                }
                normalized.push(normalizedHook);
            }
        }
    }
    return normalized;
}
/**
 * Parses MCP servers configuration (file or inline object)
 * @param pluginPath Absolute path to plugin directory
 * @param mcpConfig MCP configuration (string | object | undefined)
 * @returns Array of normalized MCPs
 */
async function parseMcps(pluginPath, mcpConfig) {
    let mcpData;
    if (!mcpConfig) {
        // Try default location
        const defaultPath = path.join(pluginPath, '.mcp.json');
        if (!fs.existsSync(defaultPath)) {
            return [];
        }
        mcpData = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));
    }
    else if (typeof mcpConfig === 'string') {
        // Load from file path
        const mcpPath = path.join(pluginPath, mcpConfig.replace(/^\.\//, ''));
        if (!fs.existsSync(mcpPath)) {
            return [];
        }
        mcpData = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
    }
    else {
        // Inline configuration
        mcpData = mcpConfig;
    }
    // Extract MCPs from object structure
    const normalized = [];
    const mcpServers = mcpData.mcpServers || mcpData;
    for (const [name, config] of Object.entries(mcpServers)) {
        if (typeof config !== 'object' || config === null)
            continue;
        const normalizedMcp = {
            name,
            ...config
        };
        // Ensure env is an object
        if (!normalizedMcp.env) {
            normalizedMcp.env = {};
        }
        normalized.push(normalizedMcp);
    }
    return normalized;
}
//# sourceMappingURL=normalizer.js.map