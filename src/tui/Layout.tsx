/**
 * TUI Layout Component
 *
 * Main 3-panel layout using Ink.
 * Uses box-drawing characters for borders.
 *
 * Spec: docs/spec/003-tui-visual-spec.md
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { TuiState } from './state.js';

interface LayoutProps {
  state: TuiState;
  pluginsPanel: React.ReactNode;
  componentsPanel: React.ReactNode;
  previewPanel: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  state,
  pluginsPanel,
  componentsPanel,
  previewPanel,
}) => {
  const plugin = state.plugins[state.activePluginIndex];
  const pluginName = plugin?.name || 'No plugin';
  const tabInfo = `[Tab ${state.activePluginIndex + 1} of ${state.plugins.length}]`;

  return (
    <Box flexDirection="column" width="100%">
      {/* Header */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text>
          PLUGIN: <Text bold>{pluginName}</Text>
        </Text>
        <Box flexGrow={1} />
        <Text dimColor>{tabInfo}</Text>
      </Box>

      {/* Main content area - 3 panels */}
      <Box borderStyle="single" borderColor="gray" flexGrow={1}>
        {/* Plugins panel (left) */}
        <Box
          width="25%"
          borderStyle="single"
          borderColor={state.activePanel === 'plugins' ? 'cyan' : 'gray'}
          flexDirection="column"
        >
          <Box borderStyle="single" borderColor="gray" paddingX={1}>
            <Text bold>PLUGINS</Text>
          </Box>
          <Box flexDirection="column" paddingX={1} paddingY={0}>
            {pluginsPanel}
          </Box>
        </Box>

        {/* Components panel (center) */}
        <Box
          width="40%"
          borderStyle="single"
          borderColor={state.activePanel === 'components' ? 'cyan' : 'gray'}
          flexDirection="column"
        >
          <Box borderStyle="single" borderColor="gray" paddingX={1}>
            <Text bold>COMPONENTS</Text>
          </Box>
          <Box flexDirection="column" paddingX={1} paddingY={0}>
            {componentsPanel}
          </Box>
        </Box>

        {/* Preview panel (right) */}
        <Box
          width="35%"
          borderStyle="single"
          borderColor={state.activePanel === 'preview' ? 'cyan' : 'gray'}
          flexDirection="column"
        >
          <Box borderStyle="single" borderColor="gray" paddingX={1}>
            <Text bold>PREVIEW</Text>
          </Box>
          <Box flexDirection="column" paddingX={1} paddingY={0}>
            {previewPanel}
          </Box>
        </Box>
      </Box>

      {/* Footer - keyboard shortcuts */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>
          ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit
        </Text>
      </Box>
    </Box>
  );
};
