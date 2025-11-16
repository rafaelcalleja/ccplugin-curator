import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { NormalizedPluginInternalFormat } from '../types/normalized.js';

interface ComponentsPanelProps {
  plugin: NormalizedPluginInternalFormat;
  selection: Set<string>;
  active: boolean;
  onToggle: (itemKey: string) => void;
}

export function ComponentsPanel({ plugin, selection, active, onToggle }: ComponentsPanelProps) {
  const [cursor, setCursor] = useState(0);

  if (!plugin) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold color="yellow">COMPONENTS</Text>
        <Text dimColor>No plugin selected</Text>
      </Box>
    );
  }

  // Build flat list of items
  const items: Array<{ type: string; label: string; key: string }> = [];

  // Commands
  plugin.commands.forEach((cmd) => {
    items.push({ type: 'COMMANDS', label: cmd, key: `command:${cmd}` });
  });

  // Agents
  plugin.agents.forEach((agent) => {
    items.push({ type: 'AGENTS', label: agent, key: `agent:${agent}` });
  });

  // Skills
  plugin.skills.forEach((skill) => {
    items.push({ type: 'SKILLS', label: skill, key: `skill:${skill}` });
  });

  // Hooks
  plugin.hooks.forEach((hook, i) => {
    const label = `${hook.event}${hook.matcher ? `:${hook.matcher}` : ''} → ${hook.command}`;
    items.push({ type: 'HOOKS', label, key: `hook:${i}` });
  });

  // MCPs
  plugin.mcps.forEach((mcp, i) => {
    items.push({ type: 'MCP SERVERS', label: mcp.name, key: `mcp:${i}` });
  });

  // Handle keyboard input when active
  useInput((input, key) => {
    if (!active) return;

    if (key.upArrow && cursor > 0) {
      setCursor(cursor - 1);
    }

    if (key.downArrow && cursor < items.length - 1) {
      setCursor(cursor + 1);
    }

    if (input === ' ') {
      if (items[cursor]) {
        onToggle(items[cursor].key);
      }
    }
  }, { isActive: active });

  // Group items by type
  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    if (!grouped.has(item.type)) {
      grouped.set(item.type, []);
    }
    grouped.get(item.type)!.push(item);
  }

  let itemIndex = 0;

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="yellow">COMPONENTS</Text>

      {items.length === 0 && (
        <Text dimColor>No components available</Text>
      )}

      <Box flexDirection="column" marginTop={1}>
        {Array.from(grouped.entries()).map(([type, typeItems]) => (
          <Box key={type} flexDirection="column" marginBottom={1}>
            <Text bold>{type} ({typeItems.length})</Text>
            {typeItems.map((item) => {
              const isCursor = itemIndex === cursor;
              const isSelected = selection.has(item.key);
              itemIndex++;

              return (
                <Box key={item.key}>
                  <Text color={isCursor && active ? 'blue' : 'white'}>
                    {isCursor ? '► ' : '  '}
                    [{isSelected ? '✓' : ' '}] {item.label}
                  </Text>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
