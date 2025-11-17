/**
 * Plugins Panel Component
 *
 * Displays list of loaded plugins with component counts.
 * Shows active plugin indicator (★).
 *
 * Spec: docs/spec/003-tui-visual-spec.md (Plugins panel)
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { TuiState } from '../state.js';

interface PluginsPanelProps {
  state: TuiState;
}

export const PluginsPanel: React.FC<PluginsPanelProps> = ({ state }) => {
  return (
    <Box flexDirection="column">
      {state.plugins.map((plugin, index) => {
        const isActive = index === state.activePluginIndex;
        const indicator = isActive ? '▼' : '▽';
        const star = isActive ? ' (★)' : '';

        // Count components
        const commandCount = plugin.commands.length;
        const agentCount = plugin.agents.length;
        const skillCount = plugin.skills.length;
        const hookCount = plugin.hooks.length;
        const mcpCount = plugin.mcps.length;

        return (
          <Box key={plugin.name} flexDirection="column">
            <Text bold={isActive} color={isActive ? 'cyan' : undefined}>
              {indicator} {plugin.name}
              {star}
            </Text>
            {commandCount > 0 && (
              <Text dimColor>  • {commandCount} commands</Text>
            )}
            {agentCount > 0 && (
              <Text dimColor>  • {agentCount} agents</Text>
            )}
            {skillCount > 0 && (
              <Text dimColor>  • {skillCount} skills</Text>
            )}
            {hookCount > 0 && (
              <Text dimColor>  • {hookCount} hooks</Text>
            )}
            {mcpCount > 0 && (
              <Text dimColor>  • {mcpCount} MCPs</Text>
            )}
            {commandCount + agentCount + skillCount + hookCount + mcpCount === 0 && (
              <Text dimColor>  (empty)</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
