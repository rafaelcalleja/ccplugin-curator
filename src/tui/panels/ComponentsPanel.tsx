/**
 * Components Panel Component
 *
 * Displays all components for the active plugin grouped by type.
 * Shows checkboxes for selection and cursor indicator.
 *
 * Spec: docs/spec/003-tui-visual-spec.md (Components panel)
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { TuiState } from '../state.js';
import { getActivePlugin, getComponentItems, isSelected } from '../state.js';

interface ComponentsPanelProps {
  state: TuiState;
}

export const ComponentsPanel: React.FC<ComponentsPanelProps> = ({ state }) => {
  const plugin = getActivePlugin(state);

  if (!plugin) {
    return <Text dimColor>No plugin loaded</Text>;
  }

  const items = getComponentItems(plugin);

  if (items.length === 0) {
    return <Text dimColor>No components available</Text>;
  }

  // Group items by type
  const commands = items.filter((i) => i.type === 'command');
  const agents = items.filter((i) => i.type === 'agent');
  const skills = items.filter((i) => i.type === 'skill');
  const hooks = items.filter((i) => i.type === 'hook');
  const mcps = items.filter((i) => i.type === 'mcp');

  let currentIndex = 0;

  const renderSection = (
    title: string,
    sectionItems: typeof items,
    startIndex: number
  ) => {
    if (sectionItems.length === 0) return null;

    return (
      <Box flexDirection="column" key={title}>
        <Text bold color="yellow">
          {title} ({sectionItems.length})
        </Text>
        {sectionItems.map((item, idx) => {
          const globalIndex = startIndex + idx;
          const isCursor = globalIndex === state.componentCursor;
          const selected = isSelected(state, plugin.name, item);
          const checkbox = selected ? '[✓]' : '[ ]';
          const cursor = isCursor ? '► ' : '  ';

          return (
            <Text
              key={`${item.type}-${idx}`}
              backgroundColor={isCursor ? 'blue' : undefined}
              color={selected ? 'green' : undefined}
            >
              {cursor}
              {checkbox} {item.label}
            </Text>
          );
        })}
      </Box>
    );
  };

  const sections = [];

  if (commands.length > 0) {
    sections.push(renderSection('COMMANDS', commands, currentIndex));
    currentIndex += commands.length;
  }

  if (agents.length > 0) {
    sections.push(renderSection('AGENTS', agents, currentIndex));
    currentIndex += agents.length;
  }

  if (skills.length > 0) {
    sections.push(renderSection('SKILLS', skills, currentIndex));
    currentIndex += skills.length;
  }

  if (hooks.length > 0) {
    sections.push(renderSection('HOOKS', hooks, currentIndex));
    currentIndex += hooks.length;
  }

  if (mcps.length > 0) {
    sections.push(renderSection('MCP SERVERS', mcps, currentIndex));
  }

  return <Box flexDirection="column">{sections}</Box>;
};
