import React from 'react';
import { Box, Text } from 'ink';
import type { NormalizedPlugin } from '../types/index.js';

interface Props {
  plugins: NormalizedPlugin[];
  currentIndex: number;
  focused: boolean;
}

export const PluginPanel: React.FC<Props> = ({
  plugins,
  currentIndex,
  focused,
}) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={focused ? 'blue' : 'grey'}
      width="25%"
      paddingX={1}
    >
      <Text bold underline>
        PLUGINS
      </Text>

      {plugins.length === 0 ? (
        <Text>(No plugins found)</Text>
      ) : (
        plugins.map((plugin, idx) => (
          <Box key={plugin.name} flexDirection="column">
            <Text>
              {idx === currentIndex ? '▼' : '▽'} {plugin.name}
              {idx === currentIndex ? ' (★)' : ''}
            </Text>
            <Box marginLeft={2} flexDirection="column">
              <Text dimColor>• {plugin.commands.length} commands</Text>
              <Text dimColor>• {plugin.agents.length} agents</Text>
              {plugin.skills.length > 0 && (
                <Text dimColor>• {plugin.skills.length} skills</Text>
              )}
              {plugin.hooks.length > 0 && (
                <Text dimColor>• {plugin.hooks.length} hooks</Text>
              )}
              {plugin.mcps.length > 0 && (
                <Text dimColor>• {plugin.mcps.length} mcps</Text>
              )}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};
