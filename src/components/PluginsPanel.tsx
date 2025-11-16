import React from 'react';
import { Box, Text } from 'ink';
import type { NormalizedPluginInternalFormat } from '../types/normalized.js';

interface PluginsPanelProps {
  plugins: NormalizedPluginInternalFormat[];
  activeIndex: number;
  active: boolean;
}

export function PluginsPanel({ plugins, activeIndex, active }: PluginsPanelProps) {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="yellow">PLUGINS</Text>
      <Box flexDirection="column" marginTop={1}>
        {plugins.map((plugin, index) => {
          const isActive = index === activeIndex;
          const stats = [
            plugin.commands.length > 0 && `${plugin.commands.length} commands`,
            plugin.agents.length > 0 && `${plugin.agents.length} agents`,
            plugin.skills.length > 0 && `${plugin.skills.length} skills`,
            plugin.hooks.length > 0 && `${plugin.hooks.length} hooks`,
            plugin.mcps.length > 0 && `${plugin.mcps.length} MCPs`,
          ].filter(Boolean);

          return (
            <Box key={plugin.name} flexDirection="column">
              <Text color={isActive ? 'cyan' : 'white'}>
                {isActive ? '▼' : '▽'} {plugin.name} {isActive && '(★)'}
              </Text>
              {stats.map((stat, i) => (
                <Text key={i} dimColor>  • {stat}</Text>
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
