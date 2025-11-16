"use strict";
/**
 * Save operation implementation
 * Based on docs/spec/007-save-operation-rules.md
 */
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
exports.savePlugin = savePlugin;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const reverse_transform_1 = require("./reverse-transform");
/**
 * Save curated plugin to output directory
 *
 * Implements:
 * - 007::Invariant::1: Validate normalized format before saving
 * - 007::Invariant::2: Apply transformation before saving
 * - 007::Invariant::3: Validate official format before saving
 * - 007::EdgeCase::1-6: All edge cases
 *
 * @param selections - Array of normalized plugins with selected components
 * @param options - Save options
 */
function savePlugin(selections, options) {
    const { outputDir, pluginName, overwrite = false } = options;
    // Merge all selections into one normalized plugin
    const mergedPlugin = mergeSelections(selections, pluginName);
    // 007::EdgeCase::1 - Empty selection
    if (hasNoComponents(mergedPlugin)) {
        throw new Error('No hay componentes seleccionados');
    }
    // 007::Invariant::1 - Validate normalized format
    validateNormalizedPlugin(mergedPlugin);
    // 007::EdgeCase::2 - Output directory exists
    if (fs.existsSync(outputDir)) {
        if (!overwrite) {
            throw new Error('Output directory exists. Use overwrite option to replace.');
        }
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    // Create output directory structure
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(path.join(outputDir, '.claude-plugin'), { recursive: true });
    const pluginDir = path.join(outputDir, 'plugins', pluginName);
    fs.mkdirSync(path.join(pluginDir, '.claude-plugin'), { recursive: true });
    // 007::Invariant::2 - Apply transformation
    const officialPlugin = (0, reverse_transform_1.reverseTransform)(mergedPlugin);
    // 007::Invariant::3 - Validate official format
    validateOfficialPlugin(officialPlugin);
    // Copy component files
    copyComponentFiles(selections, mergedPlugin, pluginDir);
    // Write output files
    writeOutputFiles(outputDir, pluginDir, pluginName, officialPlugin, mergedPlugin);
}
/**
 * Merge multiple plugin selections into one
 * Handles conflicts by adding namespace prefixes
 */
function mergeSelections(selections, targetName) {
    const merged = {
        name: selections.length > 0 ? selections[0].name : targetName,
        source: '', // Not used in output
        version: '0.0.0',
        description: '',
        author: { name: '', email: '', url: '' },
        homepage: '',
        repository: '',
        license: '',
        keywords: [],
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: [],
    };
    // Track conflicts
    const commandNames = new Map(); // basename -> [pluginName, ...]
    const agentNames = new Map();
    const skillNames = new Map();
    const mcpNames = new Map();
    // First pass: detect conflicts
    for (const selection of selections) {
        // Commands
        for (const cmd of selection.commands) {
            const basename = path.basename(cmd);
            if (!commandNames.has(basename)) {
                commandNames.set(basename, []);
            }
            commandNames.get(basename).push(selection.name);
        }
        // Agents
        for (const agent of selection.agents) {
            const basename = path.basename(agent);
            if (!agentNames.has(basename)) {
                agentNames.set(basename, []);
            }
            agentNames.get(basename).push(selection.name);
        }
        // Skills
        for (const skill of selection.skills) {
            const basename = path.basename(skill);
            if (!skillNames.has(basename)) {
                skillNames.set(basename, []);
            }
            skillNames.get(basename).push(selection.name);
        }
        // MCPs
        for (const mcp of selection.mcps) {
            if (!mcpNames.has(mcp.name)) {
                mcpNames.set(mcp.name, []);
            }
            mcpNames.get(mcp.name).push(selection.name);
        }
    }
    // Second pass: merge with namespace prefixes where needed
    for (const selection of selections) {
        // Merge metadata (take first non-default value)
        if (merged.version === '0.0.0' && selection.version !== '0.0.0') {
            merged.version = selection.version;
        }
        if (merged.description === '' && selection.description !== '') {
            merged.description = selection.description;
        }
        if (merged.license === '' && selection.license !== '') {
            merged.license = selection.license;
        }
        merged.keywords.push(...selection.keywords);
        // Commands (with conflict resolution)
        for (const cmd of selection.commands) {
            const basename = path.basename(cmd);
            const dirname = path.dirname(cmd);
            const hasConflict = commandNames.get(basename).length > 1;
            if (hasConflict) {
                // Add namespace prefix
                const newPath = path.join(dirname, `${selection.name}--${basename}`);
                merged.commands.push(newPath);
            }
            else {
                merged.commands.push(cmd);
            }
        }
        // Agents (with conflict resolution)
        for (const agent of selection.agents) {
            const basename = path.basename(agent);
            const dirname = path.dirname(agent);
            const hasConflict = agentNames.get(basename).length > 1;
            if (hasConflict) {
                const newPath = path.join(dirname, `${selection.name}--${basename}`);
                merged.agents.push(newPath);
            }
            else {
                merged.agents.push(agent);
            }
        }
        // Skills (with conflict resolution)
        for (const skill of selection.skills) {
            const basename = path.basename(skill);
            const dirname = path.dirname(skill);
            const hasConflict = skillNames.get(basename).length > 1;
            if (hasConflict) {
                const newPath = path.join(dirname, `${selection.name}--${basename}`);
                merged.skills.push(newPath);
            }
            else {
                merged.skills.push(skill);
            }
        }
        // Hooks (merge into same events)
        merged.hooks.push(...selection.hooks);
        // MCPs (with conflict resolution)
        for (const mcp of selection.mcps) {
            const hasConflict = mcpNames.get(mcp.name).length > 1;
            if (hasConflict) {
                merged.mcps.push({
                    ...mcp,
                    name: `${selection.name}--${mcp.name}`,
                });
            }
            else {
                merged.mcps.push(mcp);
            }
        }
    }
    // Remove duplicate keywords
    merged.keywords = [...new Set(merged.keywords)];
    return merged;
}
/**
 * Check if plugin has no components selected
 */
function hasNoComponents(plugin) {
    return (plugin.commands.length === 0 &&
        plugin.agents.length === 0 &&
        plugin.skills.length === 0 &&
        plugin.hooks.length === 0 &&
        plugin.mcps.length === 0);
}
/**
 * Validate normalized plugin format
 */
function validateNormalizedPlugin(plugin) {
    if (!plugin.name) {
        throw new Error('Plugin name is required');
    }
    // Check all required fields are defined
    if (plugin.commands === undefined) {
        throw new Error('commands field is required');
    }
    if (plugin.agents === undefined) {
        throw new Error('agents field is required');
    }
    if (plugin.skills === undefined) {
        throw new Error('skills field is required');
    }
    if (plugin.hooks === undefined) {
        throw new Error('hooks field is required');
    }
    if (plugin.mcps === undefined) {
        throw new Error('mcps field is required');
    }
}
/**
 * Validate official plugin format
 */
function validateOfficialPlugin(plugin) {
    if (!plugin.name) {
        throw new Error('Plugin name is required in official format');
    }
    // Verify source field is not present
    if (plugin.source !== undefined) {
        throw new Error('source field should not be in official format');
    }
}
/**
 * Copy component files to output directory
 * Implements real file copying from source plugins to output directory
 */
function copyComponentFiles(selections, mergedPlugin, targetDir) {
    // Create base directories for components that exist
    if (mergedPlugin.commands.length > 0) {
        fs.mkdirSync(path.join(targetDir, 'commands'), { recursive: true });
    }
    if (mergedPlugin.agents.length > 0) {
        fs.mkdirSync(path.join(targetDir, 'agents'), { recursive: true });
    }
    if (mergedPlugin.skills.length > 0) {
        fs.mkdirSync(path.join(targetDir, 'skills'), { recursive: true });
    }
    // Build a map of component paths to their source directories
    const componentSources = new Map();
    // Track which components in merged plugin came from which source
    for (const selection of selections) {
        for (const cmd of selection.commands) {
            componentSources.set(cmd, {
                pluginName: selection.name,
                source: selection.source,
            });
        }
        for (const agent of selection.agents) {
            componentSources.set(agent, {
                pluginName: selection.name,
                source: selection.source,
            });
        }
        for (const skill of selection.skills) {
            componentSources.set(skill, {
                pluginName: selection.name,
                source: selection.source,
            });
        }
    }
    // Copy commands
    for (const cmdPath of mergedPlugin.commands) {
        // Extract original path (without namespace prefix if present)
        const originalPath = cmdPath.includes('--')
            ? cmdPath.replace(/^([^/]+)\/[^-]+--/, '$1/')
            : cmdPath;
        const sourceInfo = componentSources.get(originalPath);
        if (!sourceInfo) {
            continue; // Skip if source not found
        }
        const sourcePath = path.join(sourceInfo.source, originalPath);
        const destPath = path.join(targetDir, cmdPath);
        if (fs.existsSync(sourcePath)) {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
        }
    }
    // Copy agents
    for (const agentPath of mergedPlugin.agents) {
        // Extract original path (without namespace prefix if present)
        const originalPath = agentPath.includes('--')
            ? agentPath.replace(/^([^/]+)\/[^-]+--/, '$1/')
            : agentPath;
        const sourceInfo = componentSources.get(originalPath);
        if (!sourceInfo) {
            continue;
        }
        const sourcePath = path.join(sourceInfo.source, originalPath);
        const destPath = path.join(targetDir, agentPath);
        if (fs.existsSync(sourcePath)) {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
        }
    }
    // Copy skills (directories)
    for (const skillPath of mergedPlugin.skills) {
        // Extract original path (without namespace prefix if present)
        const originalPath = skillPath.includes('--')
            ? skillPath.replace(/^([^/]+)\/[^-]+--/, '$1/')
            : skillPath;
        const sourceInfo = componentSources.get(originalPath);
        if (!sourceInfo) {
            continue;
        }
        const sourcePath = path.join(sourceInfo.source, originalPath);
        const destPath = path.join(targetDir, skillPath);
        if (fs.existsSync(sourcePath)) {
            copyDirectoryRecursive(sourcePath, destPath);
        }
    }
}
/**
 * Copy directory recursively
 */
function copyDirectoryRecursive(source, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(source, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(source, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath);
        }
        else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
/**
 * Write output files
 */
function writeOutputFiles(outputDir, pluginDir, pluginName, officialPlugin, normalizedPlugin) {
    // 1. marketplace.json
    const marketplace = {
        name: 'curated-plugins',
        owner: {
            name: 'User',
            email: 'user@example.com',
        },
        plugins: [
            {
                name: pluginName,
                source: `./plugins/${pluginName}`,
            },
        ],
    };
    fs.writeFileSync(path.join(outputDir, '.claude-plugin', 'marketplace.json'), JSON.stringify(marketplace, null, 2));
    // 2. plugin.json (official format)
    fs.writeFileSync(path.join(pluginDir, '.claude-plugin', 'plugin.json'), JSON.stringify(officialPlugin, null, 2));
    // 3. normalized-plugin.json (for debugging)
    fs.writeFileSync(path.join(outputDir, 'normalized-plugin.json'), JSON.stringify(normalizedPlugin, null, 2));
}
//# sourceMappingURL=save.js.map