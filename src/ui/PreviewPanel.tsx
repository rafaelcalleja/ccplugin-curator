/**
 * Preview panel - right panel showing real-time JSON
 * Shows full plugin.json structure with hooks grouped by event
 */

import React from 'react';
import { Box, Text } from 'ink';
import { join } from 'path';
import type { NormalizedPluginFormat } from '../types/normalized.js';
import { officialize } from '../transform/officialize.js';

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

/**
 * Build normalized plugin from selection for preview
 */
function buildPreviewPlugin(
  plugins: NormalizedPluginFormat[],
  selection: PreviewPanelProps['selection']
): NormalizedPluginFormat {
  const result: NormalizedPluginFormat = {
    name: 'curated-plugin',
    source: join(process.cwd(), 'output/curated-plugin/plugins/curated-plugin'),
    version: '0.0.0',
    description: 'Curated plugin components',
    author: { name: '', email: '', url: '' },
    homepage: '',
    repository: '',
    license: '',
    keywords: [],
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcps: [],
  };

  // Collect selected components
  for (const plugin of plugins) {
    const sel = selection[plugin.name];
    if (!sel) continue;

    // Add commands
    result.commands.push(...Array.from(sel.commands));

    // Add agents
    result.agents.push(...Array.from(sel.agents));

    // Add skills
    result.skills.push(...Array.from(sel.skills));

    // Add hooks
    for (const hookIndex of sel.hooks) {
      const hook = plugin.hooks[hookIndex];
      if (hook) {
        result.hooks.push(hook);
      }
    }

    // Add MCPs
    for (const mcpIndex of sel.mcps) {
      const mcp = plugin.mcps[mcpIndex];
      if (mcp) {
        result.mcps.push(mcp);
      }
    }
  }

  return result;
}

export function PreviewPanel({ plugins, selection }: PreviewPanelProps) {
  // Build normalized plugin from selection
  const normalizedPlugin = buildPreviewPlugin(plugins, selection);

  // Convert to official format for preview
  const officialPlugin = officialize(normalizedPlugin);

  const jsonString = JSON.stringify(officialPlugin, null, 2);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold>PREVIEW</Text>
      <Text> </Text>
      <Text>{jsonString}</Text>
    </Box>
  );
}
