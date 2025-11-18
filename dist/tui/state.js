"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createState = createState;
exports.toggleCommand = toggleCommand;
exports.toggleAgent = toggleAgent;
exports.toggleSkill = toggleSkill;
exports.toggleHook = toggleHook;
exports.toggleMcp = toggleMcp;
exports.selectAll = selectAll;
exports.deselectAll = deselectAll;
exports.generatePreview = generatePreview;
exports.getSelectionCount = getSelectionCount;
/**
 * Creates initial empty state
 */
function createState(plugins) {
    const selections = new Map();
    for (const plugin of plugins) {
        selections.set(plugin.name, {
            pluginName: plugin.name,
            commands: new Set(),
            agents: new Set(),
            skills: new Set(),
            hooks: new Set(),
            mcps: new Set()
        });
    }
    return {
        plugins,
        selections,
        focus: {
            panel: 'plugins',
            pluginIndex: 0,
            componentIndex: 0
        }
    };
}
/**
 * Toggles selection of a command
 */
function toggleCommand(state, pluginName, command) {
    const selection = state.selections.get(pluginName);
    if (!selection)
        return;
    if (selection.commands.has(command)) {
        selection.commands.delete(command);
    }
    else {
        selection.commands.add(command);
    }
}
/**
 * Toggles selection of an agent
 */
function toggleAgent(state, pluginName, agent) {
    const selection = state.selections.get(pluginName);
    if (!selection)
        return;
    if (selection.agents.has(agent)) {
        selection.agents.delete(agent);
    }
    else {
        selection.agents.add(agent);
    }
}
/**
 * Toggles selection of a skill
 */
function toggleSkill(state, pluginName, skill) {
    const selection = state.selections.get(pluginName);
    if (!selection)
        return;
    if (selection.skills.has(skill)) {
        selection.skills.delete(skill);
    }
    else {
        selection.skills.add(skill);
    }
}
/**
 * Toggles selection of a hook
 */
function toggleHook(state, pluginName, hookIndex) {
    const selection = state.selections.get(pluginName);
    if (!selection)
        return;
    if (selection.hooks.has(hookIndex)) {
        selection.hooks.delete(hookIndex);
    }
    else {
        selection.hooks.add(hookIndex);
    }
}
/**
 * Toggles selection of an MCP
 */
function toggleMcp(state, pluginName, mcpIndex) {
    const selection = state.selections.get(pluginName);
    if (!selection)
        return;
    if (selection.mcps.has(mcpIndex)) {
        selection.mcps.delete(mcpIndex);
    }
    else {
        selection.mcps.add(mcpIndex);
    }
}
/**
 * Selects all components for a plugin
 */
function selectAll(state, pluginName) {
    const plugin = state.plugins.find(p => p.name === pluginName);
    const selection = state.selections.get(pluginName);
    if (!plugin || !selection)
        return;
    selection.commands = new Set(plugin.commands);
    selection.agents = new Set(plugin.agents);
    selection.skills = new Set(plugin.skills);
    selection.hooks = new Set(plugin.hooks.map((_, i) => i));
    selection.mcps = new Set(plugin.mcps.map((_, i) => i));
}
/**
 * Deselects all components for a plugin
 */
function deselectAll(state, pluginName) {
    const selection = state.selections.get(pluginName);
    if (!selection)
        return;
    selection.commands.clear();
    selection.agents.clear();
    selection.skills.clear();
    selection.hooks.clear();
    selection.mcps.clear();
}
/**
 * Generates preview JSON from current selections
 */
function generatePreview(state) {
    const result = {
        selections: []
    };
    for (const [pluginName, selection] of state.selections.entries()) {
        const plugin = state.plugins.find(p => p.name === pluginName);
        if (!plugin)
            continue;
        const hasSelections = selection.commands.size > 0 ||
            selection.agents.size > 0 ||
            selection.skills.size > 0 ||
            selection.hooks.size > 0 ||
            selection.mcps.size > 0;
        if (!hasSelections)
            continue;
        const pluginSelection = {
            plugin: pluginName,
            components: {}
        };
        if (selection.commands.size > 0) {
            pluginSelection.components.commands = Array.from(selection.commands);
        }
        if (selection.agents.size > 0) {
            pluginSelection.components.agents = Array.from(selection.agents);
        }
        if (selection.skills.size > 0) {
            pluginSelection.components.skills = Array.from(selection.skills);
        }
        if (selection.hooks.size > 0) {
            pluginSelection.components.hooks = Array.from(selection.hooks).map(i => plugin.hooks[i]);
        }
        if (selection.mcps.size > 0) {
            pluginSelection.components.mcps = Array.from(selection.mcps).map(i => plugin.mcps[i]);
        }
        result.selections.push(pluginSelection);
    }
    return result;
}
/**
 * Gets total count of selected components across all plugins
 */
function getSelectionCount(state) {
    let count = 0;
    for (const selection of state.selections.values()) {
        count += selection.commands.size;
        count += selection.agents.size;
        count += selection.skills.size;
        count += selection.hooks.size;
        count += selection.mcps.size;
    }
    return count;
}
//# sourceMappingURL=state.js.map