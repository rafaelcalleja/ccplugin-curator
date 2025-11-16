import React from 'react';
import { Box, Text } from 'ink';

export function StatusBar() {
  return (
    <Box borderStyle="single" paddingX={1}>
      <Text dimColor>
        ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit
      </Text>
    </Box>
  );
}
