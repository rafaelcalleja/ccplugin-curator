/**
 * Main Menu Screen
 *
 * Welcome screen for interactive mode.
 * Displays options to create new curated plugin or exit.
 *
 * Spec: docs/spec/009-tui-setup-screens.md (Section 1)
 */

import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput } from 'ink';

export type MenuOption = 'create' | 'exit';

interface MainMenuProps {
  onSelect: (option: MenuOption) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelect }) => {
  const [cursor, setCursor] = useState(0);

  const options = [
    { key: 'create' as const, label: 'Create New Curated Plugin' },
    { key: 'exit' as const, label: 'Exit' },
  ];

  useInput((input, key) => {
    // Up arrow - move cursor up
    if (key.upArrow) {
      setCursor(Math.max(0, cursor - 1));
    }

    // Down arrow - move cursor down
    if (key.downArrow) {
      setCursor(Math.min(options.length - 1, cursor + 1));
    }

    // Enter - select current option
    if (key.return) {
      onSelect(options[cursor].key);
    }

    // Q - quick exit
    if (input === 'q' || input === 'Q') {
      onSelect('exit');
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="single" borderColor="cyan" paddingX={2} paddingY={1}>
        <Text bold color="cyan">
          ╔═══════════════════════════════════════╗
        </Text>
      </Box>
      <Box borderStyle="single" borderColor="cyan" paddingX={2}>
        <Text bold color="cyan">
          ║  CLAUDE MARKETPLACE CURATOR          ║
        </Text>
      </Box>
      <Box borderStyle="single" borderColor="cyan" paddingX={2} paddingBottom={1}>
        <Text bold color="cyan">
          ╚═══════════════════════════════════════╝
        </Text>
      </Box>

      {/* Spacing */}
      <Box marginY={1} />

      {/* Menu Options */}
      <Box flexDirection="column" paddingX={2}>
        {options.map((option, index) => {
          const isSelected = cursor === index;
          const cursor_indicator = isSelected ? '► ' : '  ';

          return (
            <Box key={option.key} marginY={0}>
              <Text
                bold={isSelected}
                color={isSelected ? 'green' : undefined}
                backgroundColor={isSelected ? 'blue' : undefined}
              >
                {cursor_indicator}{option.label}
              </Text>
            </Box>
          );
        })}
      </Box>

      {/* Spacing */}
      <Box marginY={1} />

      {/* Footer - Instructions */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>
          ↑↓: Navigate | ENTER: Select | Q: Quit
        </Text>
      </Box>
    </Box>
  );
};
