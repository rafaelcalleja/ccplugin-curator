/**
 * Plugins Panel Component
 * Implements: docs/spec/003-tui-visual-spec.md (PLUGINS Panel section)
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { NormalizedPlugin } from '../../types/normalized';

interface PluginsPanelProps {
  plugins: NormalizedPlugin[];
  selectedIndex: number;
  cursorPosition: number;
  isActive: boolean;
  onSelect: (index: number) => void;
}

export function PluginsPanel({
  plugins,
  selectedIndex,
  cursorPosition,
  isActive,
  onSelect,
}: PluginsPanelProps) {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={isActive ? 'cyan' : 'gray'} paddingX={1} width="30%">
      <Text bold color="white">
        PLUGINS ({plugins.length})
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {plugins.length === 0 ? (
          <Text dimColor>No plugins found</Text>
        ) : (
          plugins.map((plugin, index) => {
            const isCurrent = index === cursorPosition;
            const isSelected = index === selectedIndex;

            return (
              <Box key={plugin.name}>
                <Text
                  color={isCurrent && isActive ? 'yellow' : isSelected ? 'green' : 'white'}
                  backgroundColor={isCurrent && isActive ? 'yellow' : undefined}
                  inverse={isCurrent && isActive}
                >
                  {isCurrent ? '> ' : '  '}
                  {plugin.name} ({plugin.version})
                </Text>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
