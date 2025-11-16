/**
 * Preview Panel Component
 * Implements: docs/spec/003-tui-visual-spec.md (PREVIEW Panel section)
 */

import React from 'react';
import { Box, Text } from 'ink';

interface PreviewPanelProps {
  previewJSON: string;
  selectionCounts: {
    commands: number;
    agents: number;
    skills: number;
    hooks: number;
    mcps: number;
    total: number;
  };
  isActive: boolean;
}

export function PreviewPanel({ previewJSON, selectionCounts, isActive }: PreviewPanelProps) {
  const hasSelection = selectionCounts.total > 0;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={isActive ? 'cyan' : 'gray'} paddingX={1} width="30%">
      <Text bold color="white">
        PREVIEW
      </Text>

      {hasSelection ? (
        <>
          <Box marginTop={1} flexDirection="column">
            <Text dimColor>
              Selected: {selectionCounts.commands} cmd, {selectionCounts.agents} agents,{' '}
              {selectionCounts.skills} skills, {selectionCounts.hooks} hooks, {selectionCounts.mcps} MCPs
            </Text>
          </Box>

          <Box marginTop={1} flexDirection="column">
            <Text dimColor>{previewJSON}</Text>
          </Box>
        </>
      ) : (
        <Box marginTop={1}>
          <Text dimColor>No components selected</Text>
        </Box>
      )}
    </Box>
  );
}
