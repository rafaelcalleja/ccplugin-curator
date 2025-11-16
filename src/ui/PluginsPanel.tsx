/**
 * Plugins panel - left panel showing list of plugins
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { NormalizedPluginFormat } from '../types/normalized.js';

interface PluginsPanelProps {
  plugins: NormalizedPluginFormat[];
  currentIndex: number;
  active: boolean;
}

export function PluginsPanel({ plugins, currentIndex, active }: PluginsPanelProps) {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold>PLUGINS</Text>
      <Text> </Text>
      {plugins.map((plugin, index) => {
        const isCurrent = index === currentIndex;
        const prefix = isCurrent ? '▼ ' : '▽ ';
        const suffix = isCurrent ? ' (★)' : '';

        return (
          <Box key={plugin.name} flexDirection="column">
            <Text color={isCurrent ? 'cyan' : 'gray'}>
              {prefix}{plugin.name}{suffix}
            </Text>
            {isCurrent && (
              <>
                <Text color="gray">  • {plugin.commands.length} commands</Text>
                <Text color="gray">  • {plugin.agents.length} agents</Text>
                <Text color="gray">  • {plugin.skills.length} skills</Text>
                <Text color="gray">  • {plugin.hooks.length} hooks</Text>
                <Text color="gray">  • {plugin.mcps.length} MCPs</Text>
              </>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
