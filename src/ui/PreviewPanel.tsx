import React from 'react';
import { Box, Text } from 'ink';
import type { ComponentSelection } from '../types/index.js';

interface Props {
  selection: ComponentSelection;
  focused: boolean;
}

export const PreviewPanel: React.FC<Props> = ({ selection, focused }) => {
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
      servers: Object.fromEntries(
        selection.mcps.map((m) => [
          m.name,
          {
            command: m.command,
            ...(m.args && { args: m.args }),
            ...(m.env && { env: m.env }),
          },
        ])
      ),
    },
  };

  const jsonString = JSON.stringify(preview, null, 2);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={focused ? 'blue' : 'grey'}
      width="25%"
      paddingX={1}
      overflow="hidden"
    >
      <Text bold underline>
        PREVIEW
      </Text>
      <Box flexDirection="column" overflow="hidden">
        {jsonString.split('\n').map((line, idx) => (
          <Text key={idx} wrap="truncate">
            {highlightJson(line)}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

/**
 * Simple JSON syntax highlighting
 * Returns Text with appropriate colors for JSON elements
 */
function highlightJson(line: string): React.ReactNode {
  // This is a simplified version - Ink has limited color support
  // In a real implementation, you might want to use a proper JSON parser
  if (line.includes(':')) {
    return (
      <Text>
        <Text color="cyan">{line.split(':')[0]}:</Text>
        {line.substring(line.indexOf(':') + 1)}
      </Text>
    );
  }
  return line;
}
