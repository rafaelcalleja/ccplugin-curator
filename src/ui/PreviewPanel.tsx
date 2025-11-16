/**
 * Preview panel - right panel showing real-time JSON
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { NormalizedPluginFormat } from '../types/normalized.js';

interface PreviewPanelProps {
  plugins: NormalizedPluginFormat[];
  selection: {
    [pluginName: string]: {
      commands: Set<string>;
      agents: Set<string>;
      skills: Set<string>;
      hooks: Set<number>;
      mcps: Set<number>;
    };
  };
}

export function PreviewPanel({ plugins, selection }: PreviewPanelProps) {
  // Build preview JSON from selection
  const preview: any = {
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcps: [],
  };

  for (const plugin of plugins) {
    const sel = selection[plugin.name];
    if (!sel) continue;

    preview.commands.push(...Array.from(sel.commands));
    preview.agents.push(...Array.from(sel.agents));
    preview.skills.push(...Array.from(sel.skills));

    for (const hookIndex of sel.hooks) {
      const hook = plugin.hooks[hookIndex];
      if (hook) {
        preview.hooks.push(`${hook.event}${hook.matcher ? `:${hook.matcher}` : ''} → ${hook.command}`);
      }
    }

    for (const mcpIndex of sel.mcps) {
      const mcp = plugin.mcps[mcpIndex];
      if (mcp) {
        preview.mcps.push(mcp.name);
      }
    }
  }

  const jsonString = JSON.stringify(preview, null, 2);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold>PREVIEW</Text>
      <Text> </Text>
      <Text>{jsonString}</Text>
    </Box>
  );
}
