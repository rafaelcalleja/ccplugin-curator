/**
 * Main Menu screen
 * Spec 009-tui-setup-screens.md lines 27-63
 */

import React, { useState } from 'react';
import { Box, Text, useInput, useApp } from 'ink';

interface MainMenuProps {
  onCreatePlugin: () => void;
}

export function MainMenu({ onCreatePlugin }: MainMenuProps) {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = [
    { label: 'Create New Curated Plugin', action: onCreatePlugin },
    { label: 'Exit', action: () => exit() },
  ];

  useInput((input, key) => {
    if (input === 'q' || input === 'Q') {
      exit();
    }

    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
    }

    if (key.downArrow) {
      setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
    }

    if (key.return) {
      options[selectedIndex].action();
    }
  });

  return (
    <Box flexDirection="column" height="100%">
      {/* Title Box */}
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        paddingY={3}
      >
        <Box borderStyle="double" paddingX={2} paddingY={1}>
          <Box flexDirection="column" alignItems="center">
            <Text bold>CLAUDE MARKETPLACE CURATOR</Text>
            <Text> </Text>
            <Text dimColor>Curate and combine plugin components</Text>
            <Text dimColor>from multiple sources</Text>
          </Box>
        </Box>
      </Box>

      {/* Menu Options */}
      <Box
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}
        gap={1}
      >
        {options.map((option, index) => (
          <Box key={index} width={40}>
            <Box
              borderStyle="single"
              paddingX={2}
              paddingY={1}
              width="100%"
              justifyContent="center"
            >
              <Text>
                {selectedIndex === index ? '► ' : '  '}
                {option.label}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Status Bar */}
      <Box borderStyle="single" borderTop paddingX={1}>
        <Text>↑↓: Navigate | ENTER: Select | Q: Quit</Text>
      </Box>
    </Box>
  );
}
