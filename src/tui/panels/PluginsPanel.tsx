/**
 * Plugins Panel Component
 *
 * Displays list of loaded plugins with component counts.
 * Shows active plugin indicator (★).
 * Includes search bar for filtering plugins.
 *
 * Spec: docs/spec/003-tui-visual-spec.md (Plugins panel)
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { TuiState } from '../state.js';
import { getFilteredPlugins } from '../state.js';
import { SearchBar } from '../components/SearchBar.js';

interface PluginsPanelProps {
  state: TuiState;
  isSearching?: boolean;
}

export const PluginsPanel: React.FC<PluginsPanelProps> = ({ state, isSearching = false }) => {
  const filteredPlugins = getFilteredPlugins(state);
  const showingCount = filteredPlugins.length;
  const totalCount = state.plugins.length;

  return (
    <Box flexDirection="column">
      {/* Search Bar */}
      <SearchBar query={state.searchQuery} isActive={isSearching} />

      {/* Plugin count indicator */}
      {state.searchQuery && (
        <Box marginY={1}>
          <Text dimColor>
            Showing {showingCount} of {totalCount} plugins
          </Text>
        </Box>
      )}

      {/* Plugin list */}
      {filteredPlugins.length === 0 && state.searchQuery ? (
        <Box marginY={1}>
          <Text color="yellow">No plugins match your search</Text>
        </Box>
      ) : (
        filteredPlugins.map((plugin, index) => {
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
              <Text bold={isActive} color={isActive ? 'cyan' : undefined} dimColor={!isActive}>
                {indicator} {plugin.name}
                {star}
              </Text>
              {commandCount > 0 && (
                <Text color="cyan">  • {commandCount} commands</Text>
              )}
              {agentCount > 0 && (
                <Text color="cyan">  • {agentCount} agents</Text>
              )}
              {skillCount > 0 && (
                <Text color="cyan">  • {skillCount} skills</Text>
              )}
              {hookCount > 0 && (
                <Text color="cyan">  • {hookCount} hooks</Text>
              )}
              {mcpCount > 0 && (
                <Text color="cyan">  • {mcpCount} MCPs</Text>
              )}
              {commandCount + agentCount + skillCount + hookCount + mcpCount === 0 && (
                <Text dimColor>  (empty)</Text>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
};
