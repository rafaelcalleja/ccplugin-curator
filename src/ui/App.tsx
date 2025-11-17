/**
 * Main TUI App component
 * Implements 3-panel layout with keyboard navigation
 */

import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import type { NormalizedPluginFormat } from '../types/normalized.js';
import { PluginsPanel } from './PluginsPanel.js';
import { ComponentsPanel } from './ComponentsPanel.js';
import { PreviewPanel } from './PreviewPanel.js';
import { StatusBar } from './StatusBar.js';
import { saveSelection } from '../save/save-operation.js';

type Panel = 'plugins' | 'components' | 'preview';

interface Selection {
  [pluginName: string]: {
    commands: Set<string>;
    agents: Set<string>;
    skills: Set<string>;
    hooks: Set<number>; // indices
    mcps: Set<number>; // indices
  };
}

export interface AppProps {
  plugins: NormalizedPluginFormat[];
}

export function App({ plugins }: AppProps) {
  const { exit } = useApp();
  const [currentPanel, setCurrentPanel] = useState<Panel>('components');
  const [currentPluginIndex, setCurrentPluginIndex] = useState(0);
  const [componentCursor, setComponentCursor] = useState(0);
  const [selection, setSelection] = useState<Selection>({});

  const currentPlugin = plugins[currentPluginIndex];

  // Initialize selection for current plugin if needed
  if (!selection[currentPlugin.name]) {
    setSelection({
      ...selection,
      [currentPlugin.name]: {
        commands: new Set(),
        agents: new Set(),
        skills: new Set(),
        hooks: new Set(),
        mcps: new Set(),
      },
    });
  }

  const currentSelection = selection[currentPlugin.name] || {
    commands: new Set(),
    agents: new Set(),
    skills: new Set(),
    hooks: new Set(),
    mcps: new Set(),
  };

  // Get all components as flat list for cursor navigation
  const allComponents = [
    ...currentPlugin.commands.map((c, i) => ({ type: 'command' as const, value: c, index: i })),
    ...currentPlugin.agents.map((a, i) => ({ type: 'agent' as const, value: a, index: i })),
    ...currentPlugin.skills.map((s, i) => ({ type: 'skill' as const, value: s, index: i })),
    ...currentPlugin.hooks.map((h, i) => ({ type: 'hook' as const, value: h, index: i })),
    ...currentPlugin.mcps.map((m, i) => ({ type: 'mcp' as const, value: m, index: i })),
  ];

  useInput((input, key) => {
    // Q - Quit
    if (input === 'q' || input === 'Q') {
      exit();
      return;
    }

    // S - Save
    if (input === 's' || input === 'S') {
      handleSave();
      return;
    }

    // Panel switching (left/right arrows)
    if (key.leftArrow) {
      if (currentPanel === 'components') setCurrentPanel('plugins');
      if (currentPanel === 'preview') setCurrentPanel('components');
      return;
    }

    if (key.rightArrow) {
      if (currentPanel === 'plugins') setCurrentPanel('components');
      if (currentPanel === 'components') setCurrentPanel('preview');
      return;
    }

    // Only handle other keys if in components panel
    if (currentPanel !== 'components') return;

    // Up/Down navigation
    if (key.upArrow) {
      setComponentCursor(Math.max(0, componentCursor - 1));
      return;
    }

    if (key.downArrow) {
      setComponentCursor(Math.min(allComponents.length - 1, componentCursor + 1));
      return;
    }

    // SPACE - Toggle selection
    if (input === ' ') {
      toggleComponent();
      return;
    }

    // A - Select All
    if (input === 'a' || input === 'A') {
      selectAll();
      return;
    }

    // N - Select None
    if (input === 'n' || input === 'N') {
      selectNone();
      return;
    }
  });

  const toggleComponent = useCallback(() => {
    const component = allComponents[componentCursor];
    if (!component) return;

    const newSelection = { ...currentSelection };

    if (component.type === 'command') {
      if (newSelection.commands.has(component.value)) {
        newSelection.commands.delete(component.value);
      } else {
        newSelection.commands.add(component.value);
      }
    } else if (component.type === 'agent') {
      if (newSelection.agents.has(component.value)) {
        newSelection.agents.delete(component.value);
      } else {
        newSelection.agents.add(component.value);
      }
    } else if (component.type === 'skill') {
      if (newSelection.skills.has(component.value)) {
        newSelection.skills.delete(component.value);
      } else {
        newSelection.skills.add(component.value);
      }
    } else if (component.type === 'hook') {
      if (newSelection.hooks.has(component.index)) {
        newSelection.hooks.delete(component.index);
      } else {
        newSelection.hooks.add(component.index);
      }
    } else if (component.type === 'mcp') {
      if (newSelection.mcps.has(component.index)) {
        newSelection.mcps.delete(component.index);
      } else {
        newSelection.mcps.add(component.index);
      }
    }

    setSelection({
      ...selection,
      [currentPlugin.name]: newSelection,
    });
  }, [componentCursor, allComponents, currentSelection, selection, currentPlugin.name]);

  const selectAll = useCallback(() => {
    setSelection({
      ...selection,
      [currentPlugin.name]: {
        commands: new Set(currentPlugin.commands),
        agents: new Set(currentPlugin.agents),
        skills: new Set(currentPlugin.skills),
        hooks: new Set(currentPlugin.hooks.map((_, i) => i)),
        mcps: new Set(currentPlugin.mcps.map((_, i) => i)),
      },
    });
  }, [selection, currentPlugin]);

  const selectNone = useCallback(() => {
    setSelection({
      ...selection,
      [currentPlugin.name]: {
        commands: new Set(),
        agents: new Set(),
        skills: new Set(),
        hooks: new Set(),
        mcps: new Set(),
      },
    });
  }, [selection, currentPlugin.name]);

  const handleSave = async () => {
    try {
      await saveSelection(plugins, selection);
      // Show success message (implement later)
      exit();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="single" paddingX={1}>
        <Text>PLUGIN: {currentPlugin.name}</Text>
      </Box>

      {/* Main 3-panel layout */}
      <Box flexGrow={1} borderStyle="single">
        <Box width="25%" borderStyle="single">
          <PluginsPanel
            plugins={plugins}
            currentIndex={currentPluginIndex}
            active={currentPanel === 'plugins'}
          />
        </Box>

        <Box width="50%" borderStyle="single">
          <ComponentsPanel
            plugin={currentPlugin}
            selection={currentSelection}
            cursor={componentCursor}
            active={currentPanel === 'components'}
          />
        </Box>

        <Box width="25%" borderStyle="single">
          <PreviewPanel plugins={plugins} selection={selection} />
        </Box>
      </Box>

      {/* Status bar */}
      <Box borderStyle="single" paddingX={1}>
        <StatusBar currentPanel={currentPanel} />
      </Box>
    </Box>
  );
}
