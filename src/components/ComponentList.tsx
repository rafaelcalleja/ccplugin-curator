import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { NormalizedPluginInternalFormat } from '../types/normalized';
import { SelectionState } from './App';

interface ComponentListProps {
  plugin: NormalizedPluginInternalFormat;
  selections: SelectionState[string];
  active: boolean;
  onToggle: (type: keyof SelectionState[string], item: string | number) => void;
  onSelectAll: (type: keyof SelectionState[string]) => void;
  onSelectNone: (type: keyof SelectionState[string]) => void;
}

type ComponentType = 'commands' | 'agents' | 'skills' | 'hooks' | 'mcps';

interface ListItem {
  type: ComponentType;
  index: number;
  value: string | number;
  display: string;
}

export function ComponentList({
  plugin,
  selections,
  active,
  onToggle,
  onSelectAll,
  onSelectNone,
}: ComponentListProps) {
  const [cursorIndex, setCursorIndex] = useState(0);

  // Build flat list of all items
  const items: ListItem[] = [];

  // Commands
  plugin.commands.forEach((cmd, idx) => {
    items.push({
      type: 'commands',
      index: idx,
      value: cmd,
      display: cmd,
    });
  });

  // Agents
  plugin.agents.forEach((agent, idx) => {
    items.push({
      type: 'agents',
      index: idx,
      value: agent,
      display: agent,
    });
  });

  // Skills
  plugin.skills.forEach((skill, idx) => {
    items.push({
      type: 'skills',
      index: idx,
      value: skill,
      display: skill,
    });
  });

  // Hooks
  plugin.hooks.forEach((hook, idx) => {
    const hookDisplay = `${hook.event}: ${hook.type} → ${hook.command || hook.agent || ''}`;
    items.push({
      type: 'hooks',
      index: idx,
      value: idx,
      display: hookDisplay,
    });
  });

  // MCPs
  plugin.mcps.forEach((mcp, idx) => {
    const mcpDisplay = `${mcp.name} (${mcp.command})`;
    items.push({
      type: 'mcps',
      index: idx,
      value: idx,
      display: mcpDisplay,
    });
  });

  useInput(
    (input: string, key: any) => {
      if (!active) return;

      // Up/Down to navigate
      if (key.upArrow) {
        setCursorIndex((prev) => Math.max(0, prev - 1));
      }
      if (key.downArrow) {
        setCursorIndex((prev) => Math.min(items.length - 1, prev + 1));
      }

      // Space to toggle
      if (input === ' ') {
        const item = items[cursorIndex];
        if (item) {
          onToggle(item.type, item.value);
        }
      }

      // A to select all of current type
      if (input === 'a' || input === 'A') {
        const item = items[cursorIndex];
        if (item) {
          onSelectAll(item.type);
        }
      }

      // N to select none of current type
      if (input === 'n' || input === 'N') {
        const item = items[cursorIndex];
        if (item) {
          onSelectNone(item.type);
        }
      }
    },
    { isActive: active }
  );

  // Group items by type for display
  const renderSection = (title: string, type: ComponentType, startIdx: number, endIdx: number) => {
    const sectionItems = items.slice(startIdx, endIdx);
    if (sectionItems.length === 0) return null;

    return (
      <Box flexDirection="column" marginTop={1}>
        <Text bold color="yellow">
          {title} ({sectionItems.length})
        </Text>
        {sectionItems.map((item, localIdx) => {
          const globalIdx = startIdx + localIdx;
          const isCursor = globalIdx === cursorIndex && active;
          const typeSelections = selections[type] as Set<string> | Set<number>;
          const isSelected = typeSelections.has(item.value as never);
          const checkbox = isSelected ? '[✓]' : '[ ]';
          const cursor = isCursor ? '► ' : '  ';

          return (
            <Text
              key={globalIdx}
              backgroundColor={isCursor ? 'blue' : undefined}
              color={isSelected ? 'green' : 'white'}
            >
              {cursor}
              {checkbox} {item.display}
            </Text>
          );
        })}
      </Box>
    );
  };

  // Calculate section boundaries
  let idx = 0;
  const commandsStart = idx;
  const commandsEnd = (idx += plugin.commands.length);
  const agentsStart = idx;
  const agentsEnd = (idx += plugin.agents.length);
  const skillsStart = idx;
  const skillsEnd = (idx += plugin.skills.length);
  const hooksStart = idx;
  const hooksEnd = (idx += plugin.hooks.length);
  const mcpsStart = idx;
  const mcpsEnd = (idx += plugin.mcps.length);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="yellow">
        COMPONENTS
      </Text>
      {items.length === 0 ? (
        <Box marginTop={1}>
          <Text dimColor>
            No components available
          </Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          {renderSection('COMMANDS', 'commands', commandsStart, commandsEnd)}
          {renderSection('AGENTS', 'agents', agentsStart, agentsEnd)}
          {renderSection('SKILLS', 'skills', skillsStart, skillsEnd)}
          {renderSection('HOOKS', 'hooks', hooksStart, hooksEnd)}
          {renderSection('MCP SERVERS', 'mcps', mcpsStart, mcpsEnd)}
        </Box>
      )}
    </Box>
  );
}
