import React from 'react';
import { Box, Text } from 'ink';
import { NormalizedPluginInternalFormat } from '../types/normalized';
import { SelectionState } from './App';

interface PreviewPanelProps {
  plugins: NormalizedPluginInternalFormat[];
  selections: SelectionState;
}

export function PreviewPanel({ plugins, selections }: PreviewPanelProps) {
  // Build preview object from selections
  const preview: any = {
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcp: {
      servers: {},
    },
  };

  for (const plugin of plugins) {
    const sel = selections[plugin.name];
    if (!sel) continue;

    // Commands
    sel.commands.forEach((cmd) => {
      preview.commands.push(cmd);
    });

    // Agents
    sel.agents.forEach((agent) => {
      preview.agents.push(agent);
    });

    // Skills
    sel.skills.forEach((skill) => {
      preview.skills.push(skill);
    });

    // Hooks
    sel.hooks.forEach((idx) => {
      const hook = plugin.hooks[idx];
      if (hook) {
        const hookStr = `${hook.event}: ${hook.type} → ${hook.command || hook.agent || ''}`;
        preview.hooks.push(hookStr);
      }
    });

    // MCPs
    sel.mcps.forEach((idx) => {
      const mcp = plugin.mcps[idx];
      if (mcp) {
        preview.mcp.servers[mcp.name] = {
          command: mcp.command,
          args: mcp.args || [],
          env: mcp.env || {},
        };
      }
    });
  }

  const previewText = JSON.stringify(preview, null, 2);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="yellow">
        PREVIEW
      </Text>
      <Box flexDirection="column" marginTop={1}>
        <Text>{previewText}</Text>
      </Box>
    </Box>
  );
}
