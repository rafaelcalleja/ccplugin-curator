import React from 'react';
import { Box, Text } from 'ink';

interface PreviewPanelProps {
  data: any;
  active: boolean;
}

export function PreviewPanel({ data, active }: PreviewPanelProps) {
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="yellow">PREVIEW</Text>
      <Box flexDirection="column" marginTop={1}>
        <Text>{jsonString}</Text>
      </Box>
    </Box>
  );
}
