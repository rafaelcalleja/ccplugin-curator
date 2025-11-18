import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface MainMenuProps {
  onCreatePlugin: () => void;
  onExit: () => void;
}

type MenuItem = 'create' | 'exit';

export function MainMenu({ onCreatePlugin, onExit }: MainMenuProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem>('create');

  useInput((input, key) => {
    // Q: Quit
    if (input === 'q' || input === 'Q') {
      onExit();
      return;
    }

    // ESC: Exit
    if (key.escape) {
      onExit();
      return;
    }

    // Arrow keys for navigation
    if (key.upArrow) {
      setSelectedItem('create');
    }

    if (key.downArrow) {
      setSelectedItem('exit');
    }

    // ENTER: Select
    if (key.return) {
      if (selectedItem === 'create') {
        onCreatePlugin();
      } else {
        onExit();
      }
    }
  });

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      {/* Title */}
      <Box marginBottom={2} justifyContent="center">
        <Box borderStyle="double" borderColor="cyan" paddingX={3} paddingY={1}>
          <Box flexDirection="column" alignItems="center">
            <Text bold color="cyan">
              CLAUDE MARKETPLACE CURATOR
            </Text>
            <Text dimColor> </Text>
            <Text dimColor>Curate and combine plugin components</Text>
            <Text dimColor>from multiple sources</Text>
          </Box>
        </Box>
      </Box>

      {/* Spacer */}
      <Box height={2} />

      {/* Menu Items */}
      <Box flexDirection="column" alignItems="center">
        <Box
          borderStyle="single"
          borderColor={selectedItem === 'create' ? 'blue' : 'gray'}
          paddingX={2}
          paddingY={0}
          width={40}
        >
          <Text color={selectedItem === 'create' ? 'blue' : 'white'}>
            {selectedItem === 'create' ? '► ' : '  '}
            Create New Curated Plugin
          </Text>
        </Box>

        <Box height={2} />

        <Box
          borderStyle="single"
          borderColor={selectedItem === 'exit' ? 'blue' : 'gray'}
          paddingX={2}
          paddingY={0}
          width={40}
        >
          <Text color={selectedItem === 'exit' ? 'blue' : 'white'}>
            {selectedItem === 'exit' ? '► ' : '  '}
            Exit
          </Text>
        </Box>
      </Box>

      {/* Spacer */}
      <Box height={2} />

      {/* Help */}
      <Box borderStyle="single" borderColor="gray">
        <Text dimColor>↑↓: Navigate | ENTER: Select | Q: Quit</Text>
      </Box>
    </Box>
  );
}
