/**
 * Main Menu Screen
 * Implements: docs/spec/009-tui-setup-screens.md (Screen 1)
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';

interface MainMenuProps {
  onCreatePlugin: () => void;
  onExit: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onCreatePlugin, onExit }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handle keyboard input
  React.useEffect(() => {
    const handleInput = (input: string, key: any) => {
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedIndex((prev) => Math.min(1, prev + 1));
      } else if (key.return) {
        if (selectedIndex === 0) {
          onCreatePlugin();
        } else {
          onExit();
        }
      }
    };

    process.stdin.on('data', handleInput as any);
    return () => {
      process.stdin.off('data', handleInput as any);
    };
  }, [selectedIndex, onCreatePlugin, onExit]);

  return (
    <Box flexDirection="column" height="100%" justifyContent="center">
      {/* Title */}
      <Box justifyContent="center" marginBottom={3}>
        <Box
          borderStyle="double"
          borderColor="cyan"
          paddingX={3}
          paddingY={1}
          flexDirection="column"
        >
          <Text bold color="cyan">
            CLAUDE MARKETPLACE CURATOR
          </Text>
          <Text>
            {'  '}Curate and combine plugin components
          </Text>
          <Text>
            {'  '}from multiple sources
          </Text>
        </Box>
      </Box>

      {/* Menu Options */}
      <Box flexDirection="column" alignItems="center" marginTop={2}>
        {/* Create New Plugin Option */}
        <Box
          borderStyle="single"
          borderColor={selectedIndex === 0 ? 'blue' : 'gray'}
          width={40}
          justifyContent="center"
          paddingY={1}
          marginBottom={2}
        >
          <Text color={selectedIndex === 0 ? 'blue' : 'white'}>
            {selectedIndex === 0 ? '► ' : '  '}
            Create New Curated Plugin
          </Text>
        </Box>

        {/* Exit Option */}
        <Box
          borderStyle="single"
          borderColor={selectedIndex === 1 ? 'blue' : 'gray'}
          width={40}
          justifyContent="center"
          paddingY={1}
        >
          <Text color={selectedIndex === 1 ? 'blue' : 'white'}>
            {selectedIndex === 1 ? '► ' : '  '}
            Exit
          </Text>
        </Box>
      </Box>

      {/* Help text */}
      <Box justifyContent="center" marginTop={4}>
        <Text dimColor>↑↓: Navigate | ENTER: Select | Q: Quit</Text>
      </Box>
    </Box>
  );
};
