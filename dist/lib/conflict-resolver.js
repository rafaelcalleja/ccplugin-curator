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
exports.resolveCommandConflicts = resolveCommandConflicts;
exports.resolveAgentConflicts = resolveAgentConflicts;
exports.resolveSkillConflicts = resolveSkillConflicts;
exports.resolveMcpConflicts = resolveMcpConflicts;
exports.mergeHooksByEvent = mergeHooksByEvent;
exports.resolveHookScriptConflicts = resolveHookScriptConflicts;
exports.getHookScriptPath = getHookScriptPath;
const path = __importStar(require("path"));
/**
 * Resolves filename conflicts for commands by adding namespace prefix
 * @param commands Array of command selections
 * @returns Array of resolved commands with destination paths
 */
function resolveCommandConflicts(commands) {
    return resolveFileConflicts(commands, 'commands');
}
/**
 * Resolves filename conflicts for agents by adding namespace prefix
 * @param agents Array of agent selections
 * @returns Array of resolved agents with destination paths
 */
function resolveAgentConflicts(agents) {
    return resolveFileConflicts(agents, 'agents');
}
/**
 * Generic function to resolve file conflicts
 * @param components Array of component selections
 * @param type Component type (commands or agents)
 * @returns Array of resolved components
 */
function resolveFileConflicts(components, type) {
    const resolved = [];
    const filenameMap = new Map();
    // Group by filename
    for (const component of components) {
        const filename = path.basename(component.relPath);
        if (!filenameMap.has(filename)) {
            filenameMap.set(filename, []);
        }
        filenameMap.get(filename).push(component);
    }
    // Resolve conflicts
    for (const [filename, comps] of filenameMap.entries()) {
        if (comps.length === 1) {
            // No conflict - use original name
            resolved.push({
                ...comps[0],
                destPath: comps[0].relPath,
                wasRenamed: false
            });
        }
        else {
            // Conflict - apply namespace prefix
            for (const comp of comps) {
                const ext = path.extname(filename);
                const base = path.basename(filename, ext);
                const newFilename = `${comp.pluginName}--${base}${ext}`;
                const dir = path.dirname(comp.relPath);
                const destPath = path.join(dir, newFilename);
                resolved.push({
                    ...comp,
                    destPath,
                    wasRenamed: true
                });
            }
        }
    }
    return resolved;
}
/**
 * Resolves directory name conflicts for skills by adding namespace prefix
 * @param skills Array of skill selections
 * @returns Array of resolved skills with destination paths
 */
function resolveSkillConflicts(skills) {
    const resolved = [];
    const dirnameMap = new Map();
    // Group by directory name
    for (const skill of skills) {
        const dirname = path.basename(skill.relPath);
        if (!dirnameMap.has(dirname)) {
            dirnameMap.set(dirname, []);
        }
        dirnameMap.get(dirname).push(skill);
    }
    // Resolve conflicts
    for (const [dirname, comps] of dirnameMap.entries()) {
        if (comps.length === 1) {
            // No conflict - use original name
            resolved.push({
                ...comps[0],
                destPath: comps[0].relPath,
                wasRenamed: false
            });
        }
        else {
            // Conflict - apply namespace prefix
            for (const comp of comps) {
                const parentDir = path.dirname(comp.relPath);
                const newDirname = `${comp.pluginName}--${dirname}`;
                const destPath = path.join(parentDir, newDirname);
                resolved.push({
                    ...comp,
                    destPath,
                    wasRenamed: true
                });
            }
        }
    }
    return resolved;
}
/**
 * Resolves MCP name conflicts by adding namespace prefix
 * @param mcps Array of MCP selections
 * @returns Array of resolved MCPs with updated names
 */
function resolveMcpConflicts(mcps) {
    const resolved = [];
    const nameMap = new Map();
    // Group by MCP name
    for (const mcp of mcps) {
        if (!nameMap.has(mcp.name)) {
            nameMap.set(mcp.name, []);
        }
        nameMap.get(mcp.name).push(mcp);
    }
    // Resolve conflicts
    for (const [name, mcpList] of nameMap.entries()) {
        if (mcpList.length === 1) {
            // No conflict - use original name
            resolved.push(mcpList[0]);
        }
        else {
            // Conflict - apply namespace prefix
            for (const mcp of mcpList) {
                resolved.push({
                    ...mcp,
                    name: `${mcp.pluginName}--${name}`
                });
            }
        }
    }
    return resolved;
}
/**
 * Merges hooks by event while preserving selection order
 * No conflicts - hooks can coexist for the same event
 * @param hooks Array of hook selections
 * @returns Merged hooks array
 */
function mergeHooksByEvent(hooks) {
    // Hooks don't conflict - they're just merged
    // Return as-is, preserving order
    return [...hooks];
}
/**
 * Resolves hook script filename conflicts by adding namespace prefix
 * @param hooks Array of hook selections
 * @returns Array of hooks with updated command paths
 */
function resolveHookScriptConflicts(hooks) {
    const resolved = [];
    const scriptMap = new Map();
    // Group by script path (only for local scripts, not system commands)
    for (const hook of hooks) {
        const command = hook.command;
        // Only process local script paths (not system commands like npx, node, etc.)
        if (command && !command.startsWith('npx') &&
            !command.startsWith('node') &&
            !command.startsWith('/usr/')) {
            const scriptPath = command.replace(/^\$\{CLAUDE_PLUGIN_ROOT\}\//, '');
            if (!scriptMap.has(scriptPath)) {
                scriptMap.set(scriptPath, []);
            }
            scriptMap.get(scriptPath).push(hook);
        }
        else {
            // System command - no conflict possible
            resolved.push(hook);
        }
    }
    // Resolve conflicts
    for (const [scriptPath, hookList] of scriptMap.entries()) {
        if (hookList.length === 1) {
            // No conflict - use original path
            resolved.push(hookList[0]);
        }
        else {
            // Conflict - apply namespace prefix to script filename
            for (const hook of hookList) {
                const dir = path.dirname(scriptPath);
                const filename = path.basename(scriptPath);
                const newFilename = `${hook.pluginName}--${filename}`;
                const newScriptPath = path.join(dir, newFilename);
                resolved.push({
                    ...hook,
                    command: newScriptPath
                });
            }
        }
    }
    return resolved;
}
/**
 * Gets the destination script path for a hook command
 * Handles both ${CLAUDE_PLUGIN_ROOT}/ prefix and plain paths
 * @param command Hook command string
 * @returns Relative script path
 */
function getHookScriptPath(command) {
    if (!command)
        return null;
    // Skip system commands
    if (command.startsWith('npx') ||
        command.startsWith('node') ||
        command.startsWith('/usr/')) {
        return null;
    }
    // Remove ${CLAUDE_PLUGIN_ROOT}/ prefix if present
    return command.replace(/^\$\{CLAUDE_PLUGIN_ROOT\}\//, '');
}
//# sourceMappingURL=conflict-resolver.js.map