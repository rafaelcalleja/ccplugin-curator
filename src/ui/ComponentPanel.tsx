import React from 'react';
import { Box, Text } from 'ink';
import type { NormalizedPlugin } from '../types/index.js';
import type { ComponentSelection } from '../types/index.js';

interface Props {
  plugin: NormalizedPlugin;
  selection: ComponentSelection;
  focused: boolean;
  selectedIndex: number;
}

export const ComponentPanel: React.FC<Props> = ({
  plugin,
  selection,
  focused,
  selectedIndex,
}) => {
  let currentIndex = 0;

  const renderComponentSection = (
    title: string,
    items: any[],
    type: 'commands' | 'agents' | 'skills' | 'hooks' | 'mcps'
  ) => {
    if (items.length === 0) return null;

    const startIndex = currentIndex;
    const section = [];

    section.push(
      <Text key={`${type}-header`} bold color="yellow">
        {title} ({items.length})
      </Text>
    );

    items.forEach((item, itemIndex) => {
      const globalIndex = startIndex + itemIndex;
      const isSelected = isItemSelected(item, type, selection);
      const isFocused = focused && globalIndex === selectedIndex;

      let displayText = '';

      if (type === 'hooks') {
        displayText = `${item.event}: ${item.command || item.agent || '?'}`;
      } else if (type === 'mcps') {
        displayText = item.name;
      } else {
        displayText = item;
      }

      section.push(
        <Box key={`${type}-${itemIndex}`}>
          <Text>{isFocused ? '► ' : '  '}</Text>
          <Text>{isSelected ? '[✓]' : '[ ]'}</Text>
          <Text> {displayText}</Text>
        </Box>
      );
    });

    currentIndex += items.length;
    return section;
  };

  const hasComponents =
    plugin.commands.length > 0 ||
    plugin.agents.length > 0 ||
    plugin.skills.length > 0 ||
    plugin.hooks.length > 0 ||
    plugin.mcps.length > 0;

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={focused ? 'blue' : 'grey'}
      width="50%"
      paddingX={1}
    >
      <Text bold underline>
        COMPONENTS
      </Text>

      {!hasComponents ? (
        <Text>(No components available)</Text>
      ) : (
        <Box flexDirection="column">
          {renderComponentSection(
            'COMMANDS',
            plugin.commands,
            'commands'
          )}
          {renderComponentSection('AGENTS', plugin.agents, 'agents')}
          {renderComponentSection('SKILLS', plugin.skills, 'skills')}
          {renderComponentSection('HOOKS', plugin.hooks, 'hooks')}
          {renderComponentSection('MCP SERVERS', plugin.mcps, 'mcps')}
        </Box>
      )}
    </Box>
  );
};

function isItemSelected(
  item: any,
  type: 'commands' | 'agents' | 'skills' | 'hooks' | 'mcps',
  selection: ComponentSelection
): boolean {
  if (type === 'commands') {
    return selection.commands.includes(item);
  } else if (type === 'agents') {
    return selection.agents.includes(item);
  } else if (type === 'skills') {
    return selection.skills.includes(item);
  } else if (type === 'hooks') {
    return selection.hooks.some((h) => h.event === item.event);
  } else if (type === 'mcps') {
    return selection.mcps.some((m) => m.name === item.name);
  }
  return false;
}
