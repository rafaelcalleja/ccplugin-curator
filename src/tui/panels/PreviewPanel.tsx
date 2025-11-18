import React from 'react';
import { Box, Text } from 'ink';
import { transformToOfficial } from '../../transform/reverse';
import { SelectionState } from '../state/SelectionState';

interface PreviewPanelProps {
  selectionState: SelectionState;
  outputName: string;
}

/**
 * Preview Panel - Shows real-time JSON preview of selection
 *
 * Displays:
 * - Official plugin.json format
 * - Real-time updates as selection changes
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({ selectionState, outputName }) => {
  // Build merged plugin from selections
  const merged = selectionState.buildMergedPlugin(outputName);

  // Transform to official format
  const official = transformToOfficial(merged);

  // Pretty-print JSON
  const json = JSON.stringify(official, null, 2);

  // Split into lines for display
  const lines = json.split('\n');

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" padding={1}>
      <Text bold underline>
        PREVIEW (plugin.json)
      </Text>
      <Text dimColor>Selected: {selectionState.getCount()} components</Text>
      <Text dimColor> </Text>

      {lines.map((line, idx) => (
        <Text key={idx} dimColor={line.trim() === '' || line.includes('{')} color={line.includes('"') ? 'green' : undefined}>
          {line}
        </Text>
      ))}
    </Box>
  );
};
