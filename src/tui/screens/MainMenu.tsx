import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export interface MainMenuProps {
  onSelect: (option: 'create' | 'exit') => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const options = [
    { label: 'Create New Curated Plugin', value: 'create' as const },
    { label: 'Exit', value: 'exit' as const }
  ];

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => Math.min(options.length - 1, prev + 1));
    } else if (key.return) {
      onSelect(options[selectedIndex].value);
    } else if (input === 'q' || input === 'Q') {
      onSelect('exit');
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      {/* Title box */}
      <Box justifyContent="center" marginBottom={2} marginTop={2}>
        <Box borderStyle="double" borderColor="cyan" padding={1}>
          <Box flexDirection="column">
            <Text bold color="cyan">      CLAUDE MARKETPLACE CURATOR                   </Text>
            <Text dimColor>      </Text>
            <Text dimColor>      Curate and combine plugin components         </Text>
            <Text dimColor>      from multiple sources                        </Text>
          </Box>
        </Box>
      </Box>

      {/* Spacer */}
      <Box marginTop={1} />

      {/* Options */}
      <Box flexDirection="column" alignItems="center">
        {options.map((option, index) => (
          <Box key={option.value} marginBottom={1}>
            <Box borderStyle="single" width={40} padding={1}>
              <Text>
                {selectedIndex === index ? '► ' : '  '}
                {option.label}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Spacer */}
      <Box marginTop={1} />

      {/* Status bar */}
      <Box borderStyle="single" borderColor="gray">
        <Text dimColor> ↑↓: Navigate | ENTER: Select | Q: Quit</Text>
      </Box>
    </Box>
  );
};
