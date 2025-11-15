import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const PreviewPanel = ({ selection, focused }) => {
    // Build JSON preview
    const preview = {
        commands: selection.commands,
        agents: selection.agents,
        skills: selection.skills,
        hooks: selection.hooks.map((h) => ({
            event: h.event,
            type: h.type,
            ...(h.command && { command: h.command }),
            ...(h.agent && { agent: h.agent }),
            ...(h.matcher && { matcher: h.matcher }),
        })),
        mcp: {
            servers: Object.fromEntries(selection.mcps.map((m) => [
                m.name,
                {
                    command: m.command,
                    ...(m.args && { args: m.args }),
                    ...(m.env && { env: m.env }),
                },
            ])),
        },
    };
    const jsonString = JSON.stringify(preview, null, 2);
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "single", borderColor: focused ? 'blue' : 'grey', width: "25%", paddingX: 1, overflow: "hidden", children: [_jsx(Text, { bold: true, underline: true, children: "PREVIEW" }), _jsx(Box, { flexDirection: "column", overflow: "hidden", children: jsonString.split('\n').map((line, idx) => (_jsx(Text, { wrap: "truncate", children: highlightJson(line) }, idx))) })] }));
};
/**
 * Simple JSON syntax highlighting
 * Returns Text with appropriate colors for JSON elements
 */
function highlightJson(line) {
    // This is a simplified version - Ink has limited color support
    // In a real implementation, you might want to use a proper JSON parser
    if (line.includes(':')) {
        return (_jsxs(Text, { children: [_jsxs(Text, { color: "cyan", children: [line.split(':')[0], ":"] }), line.substring(line.indexOf(':') + 1)] }));
    }
    return line;
}
//# sourceMappingURL=PreviewPanel.js.map