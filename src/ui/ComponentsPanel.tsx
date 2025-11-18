/**
 * Components panel - center panel with checkboxes
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { NormalizedPluginFormat } from '../types/normalized.js';

interface ComponentsPanelProps {
  plugin: NormalizedPluginFormat;
  selection: {
    commands: Set<string>;
    agents: Set<string>;
    skills: Set<string>;
    hooks: Set<number>;
    mcps: Set<number>;
  };
  cursor: number;
  active: boolean;
}

export function ComponentsPanel({
  plugin,
  selection,
  cursor,
  active,
}: ComponentsPanelProps) {
  const allComponents = [
    ...plugin.commands.map((c, i) => ({ type: 'command' as const, value: c, index: i })),
    ...plugin.agents.map((a, i) => ({ type: 'agent' as const, value: a, index: i })),
    ...plugin.skills.map((s, i) => ({ type: 'skill' as const, value: s, index: i })),
    ...plugin.hooks.map((h, i) => ({ type: 'hook' as const, value: h, index: i })),
    ...plugin.mcps.map((m, i) => ({ type: 'mcp' as const, value: m, index: i })),
  ];

  // Check if plugin is empty (spec 003 lines 268-293)
  const isEmpty = allComponents.length === 0;

  let currentIndex = 0;

  if (isEmpty) {
    return (
      <Box flexDirection="column" paddingX={1} justifyContent="center" alignItems="center" height="100%">
        <Text bold color="yellow">COMPONENTS</Text>
        <Text> </Text>
        <Text dimColor>No components available</Text>
        <Text dimColor>This plugin has no commands, agents, skills, hooks, or MCPs</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold>COMPONENTS</Text>
      <Text> </Text>

      {/* Commands */}
      {plugin.commands.length > 0 && (
        <>
          <Text color="yellow">COMMANDS ({plugin.commands.length})</Text>
          {plugin.commands.map((cmd) => {
            const isSelected = selection.commands.has(cmd);
            const isCursor = currentIndex === cursor;
            const cursorMark = isCursor && active ? '► ' : '  ';
            currentIndex++;

            return (
              <Text key={cmd} backgroundColor={isCursor && active ? 'blue' : undefined}>
                {cursorMark}
                <Text color={isSelected ? 'green' : 'dim'}>[{isSelected ? '✓' : ' '}]</Text>
                {' '}{cmd}
              </Text>
            );
          })}
          <Text> </Text>
        </>
      )}

      {/* Agents */}
      {plugin.agents.length > 0 && (
        <>
          <Text color="yellow">AGENTS ({plugin.agents.length})</Text>
          {plugin.agents.map((agent) => {
            const isSelected = selection.agents.has(agent);
            const isCursor = currentIndex === cursor;
            const cursorMark = isCursor && active ? '► ' : '  ';
            currentIndex++;

            return (
              <Text key={agent} backgroundColor={isCursor && active ? 'blue' : undefined}>
                {cursorMark}
                <Text color={isSelected ? 'green' : 'dim'}>[{isSelected ? '✓' : ' '}]</Text>
                {' '}{agent}
              </Text>
            );
          })}
          <Text> </Text>
        </>
      )}

      {/* Skills */}
      {plugin.skills.length > 0 && (
        <>
          <Text color="yellow">SKILLS ({plugin.skills.length})</Text>
          {plugin.skills.map((skill) => {
            const isSelected = selection.skills.has(skill);
            const isCursor = currentIndex === cursor;
            const cursorMark = isCursor && active ? '► ' : '  ';
            currentIndex++;

            return (
              <Text key={skill} backgroundColor={isCursor && active ? 'blue' : undefined}>
                {cursorMark}
                <Text color={isSelected ? 'green' : 'dim'}>[{isSelected ? '✓' : ' '}]</Text>
                {' '}{skill}
              </Text>
            );
          })}
          <Text> </Text>
        </>
      )}

      {/* Hooks (spec 003 lines 341-346) */}
      {plugin.hooks.length > 0 && (
        <>
          <Text color="yellow">HOOKS ({plugin.hooks.length})</Text>
          {plugin.hooks.map((hook, index) => {
            const isSelected = selection.hooks.has(index);
            const isCursor = currentIndex === cursor;
            const cursorMark = isCursor && active ? '► ' : '  ';
            const display = `${hook.event}${hook.matcher ? `:${hook.matcher}` : ''} → ${hook.command}`;
            currentIndex++;

            return (
              <Text key={index} backgroundColor={isCursor && active ? 'blue' : undefined}>
                {cursorMark}
                <Text color={isSelected ? 'green' : 'dim'}>[{isSelected ? '✓' : ' '}]</Text>
                {' '}{display}
              </Text>
            );
          })}
          <Text> </Text>
        </>
      )}

      {/* MCPs */}
      {plugin.mcps.length > 0 && (
        <>
          <Text color="yellow">MCP SERVERS ({plugin.mcps.length})</Text>
          {plugin.mcps.map((mcp, index) => {
            const isSelected = selection.mcps.has(index);
            const isCursor = currentIndex === cursor;
            const cursorMark = isCursor && active ? '► ' : '  ';
            currentIndex++;

            return (
              <Text key={index} backgroundColor={isCursor && active ? 'blue' : undefined}>
                {cursorMark}
                <Text color={isSelected ? 'green' : 'dim'}>[{isSelected ? '✓' : ' '}]</Text>
                {' '}{mcp.name}
              </Text>
            );
          })}
        </>
      )}
    </Box>
  );
}
