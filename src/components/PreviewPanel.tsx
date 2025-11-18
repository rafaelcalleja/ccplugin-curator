import React from 'react';
import { Box, Text } from 'ink';

interface PreviewPanelProps {
  data: any;
  active: boolean;
}

export function PreviewPanel({ data, active }: PreviewPanelProps) {
  const jsonString = JSON.stringify(data, null, 2);

  // Simple syntax highlighting - split by lines and colorize
  const lines = jsonString.split('\n').map((line, index) => {
    // Detect keys (text before colon)
    const keyMatch = line.match(/^(\s*)"([^"]+)":/);
    if (keyMatch) {
      const indent = keyMatch[1];
      const key = keyMatch[2];
      const rest = line.substring(keyMatch[0].length);
      return (
        <Text key={index}>
          {indent}<Text color="cyan">"{key}"</Text>:<Text color="green">{rest}</Text>
        </Text>
      );
    }

    // Detect string values
    if (line.includes('"') && !line.includes(':')) {
      return <Text key={index} color="green">{line}</Text>;
    }

    // Detect numbers
    if (/:\s*\d+/.test(line)) {
      return <Text key={index} color="yellow">{line}</Text>;
    }

    // Detect booleans
    if (/:\s*(true|false)/.test(line)) {
      return <Text key={index} color="blue">{line}</Text>;
    }

    // Default (brackets, braces, etc.)
    return <Text key={index}>{line}</Text>;
  });

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold color="yellow">PREVIEW</Text>
      <Box flexDirection="column" marginTop={1}>
        {lines}
      </Box>
    </Box>
  );
}
