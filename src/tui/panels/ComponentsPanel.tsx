import React from 'react';
import { Box, Text } from 'ink';
import { NormalizedPluginConfiguration } from '../../types/normalized';
import { Checkbox } from '../components/Checkbox';
import { SelectionState } from '../state/SelectionState';

interface ComponentsPanelProps {
  plugin: NormalizedPluginConfiguration;
  selectionState: SelectionState;
  cursorIndex: number;
}

/**
 * Components Panel - Shows selectable components of active plugin
 *
 * Displays:
 * - COMMANDS section with checkboxes
 * - AGENTS section with checkboxes
 * - SKILLS section with checkboxes
 * - HOOKS section with checkboxes
 * - MCP SERVERS section with checkboxes
 */
export const ComponentsPanel: React.FC<ComponentsPanelProps> = ({
  plugin,
  selectionState,
  cursorIndex
}) => {
  // Build flat list of all components
  const items: Array<{
    type: 'command' | 'agent' | 'skill' | 'hook' | 'mcp';
    label: string;
    index: number;
    path: string;
  }> = [];

  // Add commands
  plugin.commands.forEach((cmd, idx) => {
    items.push({ type: 'command', label: cmd, index: idx, path: cmd });
  });

  // Add agents
  plugin.agents.forEach((agent, idx) => {
    items.push({ type: 'agent', label: agent, index: idx, path: agent });
  });

  // Add skills
  plugin.skills.forEach((skill, idx) => {
    items.push({ type: 'skill', label: skill, index: idx, path: skill });
  });

  // Add hooks
  plugin.hooks.forEach((hook, idx) => {
    const label = `${hook.event}${hook.matcher ? ` (${hook.matcher})` : ''} - ${hook.command}`;
    items.push({ type: 'hook', label, index: idx, path: hook.command });
  });

  // Add MCPs
  plugin.mcps.forEach((mcp, idx) => {
    const label = `${mcp.name} - ${mcp.command}`;
    items.push({ type: 'mcp', label, index: idx, path: mcp.name });
  });

  // Find section boundaries for headers
  const commandsEnd = plugin.commands.length;
  const agentsEnd = commandsEnd + plugin.agents.length;
  const skillsEnd = agentsEnd + plugin.skills.length;
  const hooksEnd = skillsEnd + plugin.hooks.length;

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="gray" padding={1}>
      <Text bold underline>
        COMPONENTS
      </Text>
      <Text dimColor> </Text>

      {items.length === 0 ? (
        <Text dimColor>No components available</Text>
      ) : (
        items.map((item, flatIdx) => {
          const focused = flatIdx === cursorIndex;
          const checked = selectionState.isSelected({
            pluginName: plugin.name,
            type: item.type,
            path: item.path,
            index: item.index
          });

          // Add section headers
          let header = null;
          if (flatIdx === 0 && plugin.commands.length > 0) {
            header = <Text bold dimColor>COMMANDS ({plugin.commands.length})</Text>;
          } else if (flatIdx === commandsEnd && plugin.agents.length > 0) {
            header = <Text bold dimColor>AGENTS ({plugin.agents.length})</Text>;
          } else if (flatIdx === agentsEnd && plugin.skills.length > 0) {
            header = <Text bold dimColor>SKILLS ({plugin.skills.length})</Text>;
          } else if (flatIdx === skillsEnd && plugin.hooks.length > 0) {
            header = <Text bold dimColor>HOOKS ({plugin.hooks.length})</Text>;
          } else if (flatIdx === hooksEnd && plugin.mcps.length > 0) {
            header = <Text bold dimColor>MCP SERVERS ({plugin.mcps.length})</Text>;
          }

          return (
            <Box key={flatIdx} flexDirection="column">
              {header}
              <Checkbox label={item.label} checked={checked} focused={focused} />
            </Box>
          );
        })
      )}

      <Text dimColor> </Text>
      <Text dimColor>↑/↓: Navigate | Space: Toggle | Tab: Switch Panel | S: Save</Text>
    </Box>
  );
};
