import React from 'react';
import { Box, Text } from 'ink';
import { NormalizedPluginInternalFormat } from '../types/normalized';

interface PluginListProps {
  plugins: NormalizedPluginInternalFormat[];
  selectedIndex: number;
  active: boolean;
}

export function PluginList({ plugins, selectedIndex, active }: PluginListProps) {
  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="yellow">
        PLUGINS
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {plugins.map((plugin, index) => {
          const isSelected = index === selectedIndex;
          const icon = isSelected ? '▼' : '▽';
          const star = isSelected ? ' (★)' : '';

          return (
            <Box key={plugin.name} flexDirection="column">
              <Text color={isSelected ? 'cyan' : 'white'} bold={isSelected}>
                {icon} {plugin.name}{star}
              </Text>
              {isSelected && (
                <Box flexDirection="column" paddingLeft={2}>
                  {plugin.commands.length > 0 && <Text dimColor>• {plugin.commands.length} commands</Text>}
                  {plugin.agents.length > 0 && <Text dimColor>• {plugin.agents.length} agents</Text>}
                  {plugin.skills.length > 0 && <Text dimColor>• {plugin.skills.length} skills</Text>}
                  {plugin.hooks.length > 0 && <Text dimColor>• {plugin.hooks.length} hooks</Text>}
                  {plugin.mcps.length > 0 && <Text dimColor>• {plugin.mcps.length} MCPs</Text>}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
