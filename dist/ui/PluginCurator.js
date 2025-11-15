import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useInput } from 'ink';
import { PluginPanel } from './PluginPanel.js';
import { ComponentPanel } from './ComponentPanel.js';
import { PreviewPanel } from './PreviewPanel.js';
export const PluginCurator = ({ plugins, onExit, onSave, }) => {
    const [currentPluginIndex, setCurrentPluginIndex] = useState(0);
    const [focusPanel, setFocusPanel] = useState('components');
    const [selections, setSelections] = useState(new Map());
    const [componentIndex, setComponentIndex] = useState(0);
    const currentPlugin = plugins[currentPluginIndex];
    // Initialize selection for current plugin if not exists
    useEffect(() => {
        if (!selections.has(currentPlugin.name)) {
            selections.set(currentPlugin.name, {
                pluginName: currentPlugin.name,
                commands: [],
                agents: [],
                skills: [],
                hooks: [],
                mcps: [],
            });
            setSelections(new Map(selections));
        }
    }, [currentPluginIndex, selections, currentPlugin.name]);
    const currentSelection = selections.get(currentPlugin.name) || {
        pluginName: currentPlugin.name,
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: [],
    };
    // Handle keyboard input
    useInput((input, key) => {
        if (input === 'q' || input === 'Q') {
            onExit(Array.from(selections.values()));
            return;
        }
        if (input === 's' || input === 'S') {
            onSave(Array.from(selections.values()));
            return;
        }
        if (key.tab) {
            if (key.shift) {
                setCurrentPluginIndex((currentPluginIndex - 1 + plugins.length) % plugins.length);
            }
            else {
                setCurrentPluginIndex((currentPluginIndex + 1) % plugins.length);
            }
            setComponentIndex(0);
            return;
        }
        if (key.rightArrow) {
            if (focusPanel === 'plugins') {
                setFocusPanel('components');
            }
            else if (focusPanel === 'components') {
                setFocusPanel('preview');
            }
            return;
        }
        if (key.leftArrow) {
            if (focusPanel === 'preview') {
                setFocusPanel('components');
            }
            else if (focusPanel === 'components') {
                setFocusPanel('plugins');
            }
            return;
        }
        if (key.upArrow) {
            if (focusPanel === 'components' || focusPanel === 'plugins') {
                setComponentIndex(Math.max(0, componentIndex - 1));
            }
            return;
        }
        if (key.downArrow) {
            if (focusPanel === 'components' || focusPanel === 'plugins') {
                const allComponentsCount = getTotalComponentsCount(currentPlugin);
                setComponentIndex(Math.min(allComponentsCount - 1, componentIndex + 1));
            }
            return;
        }
        if (input === ' ') {
            if (focusPanel === 'components') {
                const updatedSelection = { ...currentSelection };
                const { componentType, index } = getComponentAtIndex(currentPlugin, componentIndex);
                if (componentType === 'commands') {
                    const cmd = currentPlugin.commands[index];
                    if (updatedSelection.commands.includes(cmd)) {
                        updatedSelection.commands = updatedSelection.commands.filter((c) => c !== cmd);
                    }
                    else {
                        updatedSelection.commands.push(cmd);
                    }
                }
                else if (componentType === 'agents') {
                    const agent = currentPlugin.agents[index];
                    if (updatedSelection.agents.includes(agent)) {
                        updatedSelection.agents = updatedSelection.agents.filter((a) => a !== agent);
                    }
                    else {
                        updatedSelection.agents.push(agent);
                    }
                }
                else if (componentType === 'skills') {
                    const skill = currentPlugin.skills[index];
                    if (updatedSelection.skills.includes(skill)) {
                        updatedSelection.skills = updatedSelection.skills.filter((s) => s !== skill);
                    }
                    else {
                        updatedSelection.skills.push(skill);
                    }
                }
                else if (componentType === 'hooks') {
                    const hook = currentPlugin.hooks[index];
                    const hookIndex = updatedSelection.hooks.findIndex((h) => h.event === hook.event);
                    if (hookIndex !== -1) {
                        updatedSelection.hooks.splice(hookIndex, 1);
                    }
                    else {
                        updatedSelection.hooks.push(hook);
                    }
                }
                else if (componentType === 'mcps') {
                    const mcp = currentPlugin.mcps[index];
                    const mcpIndex = updatedSelection.mcps.findIndex((m) => m.name === mcp.name);
                    if (mcpIndex !== -1) {
                        updatedSelection.mcps.splice(mcpIndex, 1);
                    }
                    else {
                        updatedSelection.mcps.push(mcp);
                    }
                }
                selections.set(currentPlugin.name, updatedSelection);
                setSelections(new Map(selections));
            }
            return;
        }
        if (input === 'a' || input === 'A') {
            if (focusPanel === 'components') {
                const updatedSelection = {
                    pluginName: currentPlugin.name,
                    commands: [...currentPlugin.commands],
                    agents: [...currentPlugin.agents],
                    skills: [...currentPlugin.skills],
                    hooks: [...(currentPlugin.hooks || [])],
                    mcps: [...(currentPlugin.mcps || [])],
                };
                selections.set(currentPlugin.name, updatedSelection);
                setSelections(new Map(selections));
            }
            return;
        }
        if (input === 'n' || input === 'N') {
            if (focusPanel === 'components') {
                const updatedSelection = {
                    pluginName: currentPlugin.name,
                    commands: [],
                    agents: [],
                    skills: [],
                    hooks: [],
                    mcps: [],
                };
                selections.set(currentPlugin.name, updatedSelection);
                setSelections(new Map(selections));
            }
            return;
        }
    });
    const tabInfo = `[Tab ${currentPluginIndex + 1} of ${plugins.length}]`;
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: "cyan", children: [_jsxs(Box, { paddingX: 1, justifyContent: "space-between", children: [_jsxs(Text, { children: ["PLUGIN: ", _jsx(Text, { bold: true, children: currentPlugin.name })] }), _jsx(Text, { children: tabInfo })] }), _jsxs(Box, { flexDirection: "row", flexGrow: 1, height: 25, children: [_jsx(PluginPanel, { plugins: plugins, currentIndex: currentPluginIndex, focused: focusPanel === 'plugins' }), _jsx(ComponentPanel, { plugin: currentPlugin, selection: currentSelection, focused: focusPanel === 'components', selectedIndex: componentIndex }), _jsx(PreviewPanel, { selection: currentSelection, focused: focusPanel === 'preview' })] }), _jsx(Box, { paddingX: 1, marginTop: 1, children: _jsx(Text, { dimColor: true, children: "\u2190\u2192: Panel | \u2191\u2193: Nav | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit" }) })] }));
};
function getTotalComponentsCount(plugin) {
    return (plugin.commands.length +
        plugin.agents.length +
        plugin.skills.length +
        (plugin.hooks?.length || 0) +
        (plugin.mcps?.length || 0));
}
function getComponentAtIndex(plugin, index) {
    let currentIndex = 0;
    // Commands
    if (index < currentIndex + plugin.commands.length) {
        return { componentType: 'commands', index: index - currentIndex };
    }
    currentIndex += plugin.commands.length;
    // Agents
    if (index < currentIndex + plugin.agents.length) {
        return { componentType: 'agents', index: index - currentIndex };
    }
    currentIndex += plugin.agents.length;
    // Skills
    if (index < currentIndex + plugin.skills.length) {
        return { componentType: 'skills', index: index - currentIndex };
    }
    currentIndex += plugin.skills.length;
    // Hooks
    const hooksCount = plugin.hooks?.length || 0;
    if (index < currentIndex + hooksCount) {
        return { componentType: 'hooks', index: index - currentIndex };
    }
    currentIndex += hooksCount;
    // MCPs
    return { componentType: 'mcps', index: index - currentIndex };
}
//# sourceMappingURL=PluginCurator.js.map