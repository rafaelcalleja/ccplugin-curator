import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const ComponentPanel = ({ plugin, selection, focused, selectedIndex, }) => {
    let currentIndex = 0;
    const renderComponentSection = (title, items, type) => {
        if (items.length === 0)
            return null;
        const startIndex = currentIndex;
        const section = [];
        section.push(_jsxs(Text, { bold: true, color: "yellow", children: [title, " (", items.length, ")"] }, `${type}-header`));
        items.forEach((item, itemIndex) => {
            const globalIndex = startIndex + itemIndex;
            const isSelected = isItemSelected(item, type, selection);
            const isFocused = focused && globalIndex === selectedIndex;
            let displayText = '';
            if (type === 'hooks') {
                displayText = `${item.event}: ${item.command || item.agent || '?'}`;
            }
            else if (type === 'mcps') {
                displayText = item.name;
            }
            else {
                displayText = item;
            }
            section.push(_jsxs(Box, { children: [_jsx(Text, { children: isFocused ? '► ' : '  ' }), _jsx(Text, { children: isSelected ? '[✓]' : '[ ]' }), _jsxs(Text, { children: [" ", displayText] })] }, `${type}-${itemIndex}`));
        });
        currentIndex += items.length;
        return section;
    };
    const hasComponents = plugin.commands.length > 0 ||
        plugin.agents.length > 0 ||
        plugin.skills.length > 0 ||
        plugin.hooks.length > 0 ||
        plugin.mcps.length > 0;
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "single", borderColor: focused ? 'blue' : 'grey', width: "50%", paddingX: 1, children: [_jsx(Text, { bold: true, underline: true, children: "COMPONENTS" }), !hasComponents ? (_jsx(Text, { children: "(No components available)" })) : (_jsxs(Box, { flexDirection: "column", children: [renderComponentSection('COMMANDS', plugin.commands, 'commands'), renderComponentSection('AGENTS', plugin.agents, 'agents'), renderComponentSection('SKILLS', plugin.skills, 'skills'), renderComponentSection('HOOKS', plugin.hooks, 'hooks'), renderComponentSection('MCP SERVERS', plugin.mcps, 'mcps')] }))] }));
};
function isItemSelected(item, type, selection) {
    if (type === 'commands') {
        return selection.commands.includes(item);
    }
    else if (type === 'agents') {
        return selection.agents.includes(item);
    }
    else if (type === 'skills') {
        return selection.skills.includes(item);
    }
    else if (type === 'hooks') {
        return selection.hooks.some((h) => h.event === item.event);
    }
    else if (type === 'mcps') {
        return selection.mcps.some((m) => m.name === item.name);
    }
    return false;
}
//# sourceMappingURL=ComponentPanel.js.map