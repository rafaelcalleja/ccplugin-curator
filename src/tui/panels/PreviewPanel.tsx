/**
 * Preview Panel Component
 *
 * Displays real-time JSON preview of current selection.
 * Shows aggregated selection across all plugins.
 *
 * Spec: docs/spec/003-tui-visual-spec.md (Preview panel)
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { TuiState } from '../state.js';
import { getSelection } from '../state.js';

interface PreviewPanelProps {
  state: TuiState;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ state }) => {
  // Aggregate selections from all plugins
  const allCommands: string[] = [];
  const allAgents: string[] = [];
  const allSkills: string[] = [];
  const allHooks: string[] = [];
  const allMcps: string[] = [];

  for (const plugin of state.plugins) {
    const selection = getSelection(state, plugin.name);

    // Commands
    selection.commands.forEach((cmd) => allCommands.push(cmd));

    // Agents
    selection.agents.forEach((agent) => allAgents.push(agent));

    // Skills
    selection.skills.forEach((skill) => allSkills.push(skill));

    // Hooks (display format)
    Array.from(selection.hooks).forEach((hookIndex) => {
      const hook = plugin.hooks[hookIndex];
      if (hook) {
        const label = hook.matcher
          ? `${hook.event}:${hook.matcher} → ${hook.command}`
          : `${hook.event} → ${hook.command}`;
        allHooks.push(label);
      }
    });

    // MCPs (display format)
    Array.from(selection.mcps).forEach((mcpIndex) => {
      const mcp = plugin.mcps[mcpIndex];
      if (mcp) {
        allMcps.push(mcp.name);
      }
    });
  }

  // Build preview JSON (simplified representation)
  const preview: any = {
    commands: allCommands,
    agents: allAgents,
    skills: allSkills,
    hooks: allHooks,
    mcp: {
      servers: allMcps.reduce((acc, name) => {
        acc[name] = '...';
        return acc;
      }, {} as Record<string, string>),
    },
  };

  const jsonString = JSON.stringify(preview, null, 2);

  return (
    <Box flexDirection="column">
      {jsonString.split('\n').map((line, idx) => (
        <Text key={idx} dimColor={line.trim() === '' || line.includes('[]') || line.includes('{}')} color={
          line.includes('"commands"') || line.includes('"agents"') || line.includes('"skills"') || line.includes('"hooks"') || line.includes('"mcp"')
            ? 'cyan'
            : undefined
        }>
          {line}
        </Text>
      ))}
    </Box>
  );
};
