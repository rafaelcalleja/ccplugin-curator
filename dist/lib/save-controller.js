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
exports.save = save;
const path = __importStar(require("path"));
const reverse_transformer_1 = require("./reverse-transformer");
const validator_1 = require("./validator");
const conflict_resolver_1 = require("./conflict-resolver");
const file_ops_1 = require("./file-ops");
/**
 * Saves the curated plugin selection to disk
 * @param selection User's component selections
 * @param config Save configuration
 * @returns Save result
 */
async function save(selection, config) {
    try {
        // Validate non-empty selection
        if (!hasSelections(selection)) {
            return {
                success: false,
                errors: ['No components selected']
            };
        }
        // Prepare output directory
        const outputPath = path.resolve(config.outputDirectory);
        const pluginDir = path.join(outputPath, 'plugins', config.pluginName);
        // Check if output exists
        if ((0, file_ops_1.exists)(outputPath)) {
            // In CLI mode, would prompt user here
            // For now, we'll remove and recreate
            (0, file_ops_1.removeDirectory)(outputPath);
        }
        // Create directory structure
        (0, file_ops_1.ensureDirectory)(path.join(outputPath, '.claude-plugin'));
        (0, file_ops_1.ensureDirectory)(path.join(pluginDir, '.claude-plugin'));
        (0, file_ops_1.ensureDirectory)(path.join(pluginDir, 'commands'));
        (0, file_ops_1.ensureDirectory)(path.join(pluginDir, 'agents'));
        (0, file_ops_1.ensureDirectory)(path.join(pluginDir, 'skills'));
        (0, file_ops_1.ensureDirectory)(path.join(pluginDir, 'hooks'));
        // Merge selections from all plugins
        const merged = mergeSelections(selection);
        // Resolve conflicts
        const resolvedCommands = (0, conflict_resolver_1.resolveCommandConflicts)(merged.commands);
        const resolvedAgents = (0, conflict_resolver_1.resolveAgentConflicts)(merged.agents);
        const resolvedSkills = (0, conflict_resolver_1.resolveSkillConflicts)(merged.skills);
        const resolvedMcps = (0, conflict_resolver_1.resolveMcpConflicts)(merged.mcps);
        const resolvedHooks = (0, conflict_resolver_1.resolveHookScriptConflicts)(merged.hooks);
        // Copy component files
        for (const cmd of resolvedCommands) {
            const sourcePath = path.join(cmd.sourcePath, cmd.relPath);
            const destPath = path.join(pluginDir, cmd.destPath);
            (0, file_ops_1.copyFile)(sourcePath, destPath);
        }
        for (const agent of resolvedAgents) {
            const sourcePath = path.join(agent.sourcePath, agent.relPath);
            const destPath = path.join(pluginDir, agent.destPath);
            (0, file_ops_1.copyFile)(sourcePath, destPath);
        }
        for (const skill of resolvedSkills) {
            const sourcePath = path.join(skill.sourcePath, skill.relPath);
            const destPath = path.join(pluginDir, skill.destPath);
            (0, file_ops_1.copyDirectory)(sourcePath, destPath);
        }
        // Copy hook script files
        const copiedScripts = new Set();
        for (const hook of resolvedHooks) {
            const scriptPath = (0, conflict_resolver_1.getHookScriptPath)(hook.command);
            if (scriptPath && !copiedScripts.has(scriptPath)) {
                const sourcePath = path.join(hook.sourcePath, scriptPath);
                const destPath = path.join(pluginDir, scriptPath);
                if ((0, file_ops_1.exists)(sourcePath)) {
                    (0, file_ops_1.copyHookScript)(sourcePath, destPath);
                    copiedScripts.add(scriptPath);
                }
            }
        }
        // Build normalized plugin object
        const normalizedPlugin = {
            name: config.pluginName,
            source: pluginDir,
            version: '1.0.0',
            description: `Curated plugin from ${selection.plugins.length} source(s)`,
            author: {
                name: '',
                email: config.authorEmail || '',
                url: ''
            },
            homepage: '',
            repository: '',
            license: '',
            keywords: [],
            commands: resolvedCommands.map(c => c.destPath),
            agents: resolvedAgents.map(a => a.destPath),
            skills: resolvedSkills.map(s => s.destPath),
            hooks: resolvedHooks.map(h => ({
                event: h.event,
                type: h.type,
                command: h.command,
                ...(h.matcher && { matcher: h.matcher }),
                ...(h.timeout && { timeout: h.timeout })
            })),
            mcps: resolvedMcps.map(m => ({
                name: m.name,
                command: m.command,
                ...(m.args && { args: m.args }),
                ...(m.env && { env: m.env })
            }))
        };
        // Validate normalized format
        const normalizedValidation = (0, validator_1.validateNormalizedFormat)(normalizedPlugin);
        if (!normalizedValidation.valid) {
            return {
                success: false,
                errors: normalizedValidation.errors
            };
        }
        // Transform to official format
        let officialPlugin = (0, reverse_transformer_1.toOfficialFormat)(normalizedPlugin);
        officialPlugin = (0, reverse_transformer_1.omitDefaults)(officialPlugin);
        // Validate official format
        const officialValidation = (0, validator_1.validateOfficialFormat)(officialPlugin);
        if (!officialValidation.valid) {
            return {
                success: false,
                errors: officialValidation.errors
            };
        }
        // Write output files
        (0, file_ops_1.writeJson)(path.join(pluginDir, '.claude-plugin', 'plugin.json'), officialPlugin);
        (0, file_ops_1.writeJson)(path.join(outputPath, 'normalized-plugin.json'), normalizedPlugin);
        // Generate marketplace.json
        const marketplaceJson = {
            name: config.marketplaceName,
            owner: {
                name: '',
                email: config.authorEmail || ''
            },
            plugins: [
                {
                    name: config.pluginName,
                    source: `./plugins/${config.pluginName}`
                }
            ]
        };
        (0, file_ops_1.writeJson)(path.join(outputPath, '.claude-plugin', 'marketplace.json'), marketplaceJson);
        // Return success
        return {
            success: true,
            outputPath,
            stats: {
                commands: resolvedCommands.length,
                agents: resolvedAgents.length,
                skills: resolvedSkills.length,
                hooks: resolvedHooks.length,
                mcps: resolvedMcps.length
            }
        };
    }
    catch (error) {
        return {
            success: false,
            errors: [error instanceof Error ? error.message : String(error)]
        };
    }
}
/**
 * Checks if selection has any selected components
 */
function hasSelections(selection) {
    for (const plugin of selection.plugins) {
        if (plugin.commands.length > 0 ||
            plugin.agents.length > 0 ||
            plugin.skills.length > 0 ||
            plugin.hooks.length > 0 ||
            plugin.mcps.length > 0) {
            return true;
        }
    }
    return false;
}
/**
 * Merges selections from all plugins into unified arrays
 */
function mergeSelections(selection) {
    const commands = [];
    const agents = [];
    const skills = [];
    const hooks = [];
    const mcps = [];
    for (const plugin of selection.plugins) {
        const pluginName = plugin.normalized.name;
        const sourcePath = plugin.normalized.source;
        // Add commands
        for (const relPath of plugin.commands) {
            commands.push({ pluginName, sourcePath, relPath });
        }
        // Add agents
        for (const relPath of plugin.agents) {
            agents.push({ pluginName, sourcePath, relPath });
        }
        // Add skills
        for (const relPath of plugin.skills) {
            skills.push({ pluginName, sourcePath, relPath });
        }
        // Add hooks
        for (const hook of plugin.hooks) {
            hooks.push({
                pluginName,
                sourcePath,
                ...hook
            });
        }
        // Add MCPs
        for (const mcp of plugin.mcps) {
            mcps.push({
                pluginName,
                ...mcp
            });
        }
    }
    return { commands, agents, skills, hooks, mcps };
}
//# sourceMappingURL=save-controller.js.map