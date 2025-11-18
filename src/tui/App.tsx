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
  outputDir?: string;
  authorEmail?: string;
  onSave: (selectionState: SelectionState, outputDir?: string) => Promise<void>;
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
export const App: React.FC<AppProps> = ({ plugins, outputName, outputDir, authorEmail, onSave }) => {
  const { exit } = useApp();

  // State
  const [activePluginIndex, setActivePluginIndex] = useState(0);
  const [cursorIndex, setCursorIndex] = useState(0);
  const [focusedPanel, setFocusedPanel] = useState<'plugins' | 'components' | 'preview'>('components');
  const [selectionState] = useState(() => new SelectionState(plugins));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    onShiftTab: () => {
      // Switch to previous plugin
      setActivePluginIndex(prev => prev === 0 ? plugins.length - 1 : prev - 1);
      setCursorIndex(0); // Reset cursor when switching plugins
    },
    onLeft: () => {
      // Navigate to previous panel
      setFocusedPanel(prev => {
        if (prev === 'preview') return 'components';
        if (prev === 'components') return 'plugins';
        return 'plugins';
      });
    },
    onRight: () => {
      // Navigate to next panel
      setFocusedPanel(prev => {
        if (prev === 'plugins') return 'components';
        if (prev === 'components') return 'preview';
        return 'preview';
      });
    },
    onSelectAll: () => {
      // Select all components in current plugin
      selectionState.selectAll(activePlugin.name);
      forceUpdate({});
    },
    onSelectNone: () => {
      // Deselect all components in current plugin
      selectionState.deselectAll(activePlugin.name);
      forceUpdate({});
    },
    onSave: async () => {
      if (selectionState.getCount() === 0) {
        setError('No components selected. Select at least one component to save.');
        setTimeout(() => setError(null), 3000);
        return;
      }

      setSaving(true);
      setError(null);
      try {
        await onSave(selectionState, outputDir);
        exit();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Save failed: ${message}`);
        setSaving(false);
        setTimeout(() => setError(null), 5000);
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

  // Handle empty plugin list
  if (plugins.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold color="red">
          Error: No plugins loaded
        </Text>
        <Text dimColor>Please provide valid plugin directories</Text>
        <Text> </Text>
        <Text dimColor>Press Q to quit</Text>
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

      {/* Error Message */}
      {error && (
        <>
          <Box borderStyle="round" borderColor="red" padding={1}>
            <Text color="red" bold>⚠ {error}</Text>
          </Box>
          <Text> </Text>
        </>
      )}

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
      {/* Status Bar */}
      <Box flexDirection="row" justifyContent="space-between">
        <Text dimColor>Tab/Shift+Tab: Switch Plugin | ←/→: Panel | ↑/↓: Navigate | Space: Select | A: All | N: None | S: Save | Q: Quit</Text>
        <Text color="cyan">
          {selectionState.getCount()} component{selectionState.getCount() !== 1 ? 's' : ''} selected
        </Text>
      </Box>
    </Box>
  );
};
