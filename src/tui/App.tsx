import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import { NormalizedPluginConfiguration } from '../types/normalized';
import { SelectionState } from './state/SelectionState';
import { PluginsPanel } from './panels/PluginsPanel';
import { ComponentsPanel } from './panels/ComponentsPanel';
import { PreviewPanel } from './panels/PreviewPanel';
import { useKeyboard } from './hooks/useKeyboard';

interface AppProps {
  plugins: NormalizedPluginConfiguration[];
  outputName: string;
  onSave: (selectionState: SelectionState) => Promise<void>;
}

/**
 * Main TUI Application
 *
 * 3-panel layout:
 * - Left: Plugins list
 * - Center: Components with checkboxes
 * - Right: JSON preview
 *
 * Navigation:
 * - Tab: Switch between plugins
 * - ↑/↓: Navigate components
 * - Space: Toggle selection
 * - S: Save
 * - Q: Quit
 */
export const App: React.FC<AppProps> = ({ plugins, outputName, onSave }) => {
  const { exit } = useApp();

  // State
  const [activePluginIndex, setActivePluginIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [selectionState] = useState(() => new SelectionState(plugins));
  const [saving, setSaving] = useState(false);
  const [, forceUpdate] = useState({});

  const activePlugin = plugins[activePluginIndex];

  // Count total components in active plugin
  const totalComponents =
    activePlugin.commands.length +
    activePlugin.agents.length +
    activePlugin.skills.length +
    activePlugin.hooks.length +
    activePlugin.mcps.length;

  // Keyboard handlers
  useKeyboard({
    onUp: () => {
      if (totalComponents > 0) {
        setCursorIndex(prev => Math.max(0, prev - 1));
      }
    },
    onDown: () => {
      if (totalComponents > 0) {
        setCursorIndex(prev => Math.min(totalComponents - 1, prev + 1));
      }
    },
    onTab: () => {
      // Switch to next plugin
      setActivePluginIndex(prev => (prev + 1) % plugins.length);
      setCursorIndex(0); // Reset cursor when switching plugins
    },
    onSpace: () => {
      // Toggle selection at cursor
      if (totalComponents === 0) return;

      // Determine which component is at cursor
      let currentIdx = 0;

      // Commands
      if (cursorIndex < activePlugin.commands.length) {
        const idx = cursorIndex;
        selectionState.toggle({
          pluginName: activePlugin.name,
          type: 'command',
          path: activePlugin.commands[idx],
          index: idx
        });
        forceUpdate({});
        return;
      }
      currentIdx += activePlugin.commands.length;

      // Agents
      if (cursorIndex < currentIdx + activePlugin.agents.length) {
        const idx = cursorIndex - currentIdx;
        selectionState.toggle({
          pluginName: activePlugin.name,
          type: 'agent',
          path: activePlugin.agents[idx],
          index: idx
        });
        forceUpdate({});
        return;
      }
      currentIdx += activePlugin.agents.length;

      // Skills
      if (cursorIndex < currentIdx + activePlugin.skills.length) {
        const idx = cursorIndex - currentIdx;
        selectionState.toggle({
          pluginName: activePlugin.name,
          type: 'skill',
          path: activePlugin.skills[idx],
          index: idx
        });
        forceUpdate({});
        return;
      }
      currentIdx += activePlugin.skills.length;

      // Hooks
      if (cursorIndex < currentIdx + activePlugin.hooks.length) {
        const idx = cursorIndex - currentIdx;
        selectionState.toggle({
          pluginName: activePlugin.name,
          type: 'hook',
          path: activePlugin.hooks[idx].command,
          index: idx
        });
        forceUpdate({});
        return;
      }
      currentIdx += activePlugin.hooks.length;

      // MCPs
      if (cursorIndex < currentIdx + activePlugin.mcps.length) {
        const idx = cursorIndex - currentIdx;
        selectionState.toggle({
          pluginName: activePlugin.name,
          type: 'mcp',
          path: activePlugin.mcps[idx].name,
          index: idx
        });
        forceUpdate({});
        return;
      }
    },
    onSave: async () => {
      if (selectionState.getCount() === 0) {
        return; // Nothing to save
      }

      setSaving(true);
      try {
        await onSave(selectionState);
        exit();
      } catch (error) {
        console.error('Save failed:', error);
        setSaving(false);
      }
    },
    onQuit: () => {
      exit();
    }
  });

  if (saving) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan">Saving curated plugin...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">
        Claude Plugin Curator
      </Text>
      <Text dimColor>Select components from multiple plugins to create a curated plugin</Text>
      <Text> </Text>

      <Box flexDirection="row" height={30}>
        {/* Left: Plugins Panel */}
        <Box width="25%" marginRight={1}>
          <PluginsPanel plugins={plugins} activeIndex={activePluginIndex} />
        </Box>

        {/* Center: Components Panel */}
        <Box width="40%" marginRight={1}>
          <ComponentsPanel
            plugin={activePlugin}
            selectionState={selectionState}
            cursorIndex={cursorIndex}
          />
        </Box>

        {/* Right: Preview Panel */}
        <Box width="35%">
          <PreviewPanel selectionState={selectionState} outputName={outputName} />
        </Box>
      </Box>

      <Text> </Text>
      <Text dimColor>Tab: Switch Plugin | ↑/↓: Navigate | Space: Select | S: Save | Q: Quit</Text>
    </Box>
  );
};
