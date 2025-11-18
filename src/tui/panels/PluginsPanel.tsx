import React from 'react';
import { Box, Text } from 'ink';
import { NormalizedPluginConfiguration } from '../../types/normalized';

interface PluginsPanelProps {
  plugins: NormalizedPluginConfiguration[];
  activeIndex: number;
}

/**
 * Plugins Panel - Shows list of loaded plugins
 *
 * Displays:
 * - Plugin name
 * - Component counts
 * - Active indicator (★)
 */
export const PluginsPanel: React.FC<PluginsPanelProps> = ({ plugins, activeIndex }) => {
  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" padding={1}>
      <Text bold underline>
        PLUGINS
      </Text>
      <Text dimColor> </Text>

      {plugins.map((plugin, idx) => {
        const isActive = idx === activeIndex;
        const indicator = isActive ? '★' : ' ';

        const stats = [
          `${plugin.commands.length} cmd`,
          `${plugin.agents.length} agt`,
          `${plugin.skills.length} skl`,
          `${plugin.hooks.length} hk`,
          `${plugin.mcps.length} mcp`
        ].join(', ');

        return (
          <Box key={idx} flexDirection="column">
            <Text color={isActive ? 'cyan' : undefined} bold={isActive}>
              {indicator} {plugin.name}
            </Text>
            <Text dimColor>  {stats}</Text>
          </Box>
        );
      })}
    </Box>
  );
};
