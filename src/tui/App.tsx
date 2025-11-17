/**
 * Main TUI App Component
 *
 * Integrates all panels and handles keyboard input.
 *
 * Spec: docs/spec/004-user-workflows.md (keyboard navigation)
 */

import React, { useState } from 'react';
import { useInput, useApp } from 'ink';
import type { NormalizedPluginFormatInternal } from '../types/normalized.js';
import {
  createInitialState,
  getActivePlugin,
  getComponentItems,
  toggleSelection,
  selectAll,
  selectNone,
  type TuiState,
} from './state.js';
import { Layout } from './Layout.js';
import { PluginsPanel } from './panels/PluginsPanel.js';
import { ComponentsPanel } from './panels/ComponentsPanel.js';
import { PreviewPanel } from './panels/PreviewPanel.js';

interface AppProps {
  plugins: NormalizedPluginFormatInternal[];
  onSave?: (state: TuiState) => void | Promise<void>;
}

export const App: React.FC<AppProps> = ({ plugins, onSave }) => {
  const { exit } = useApp();
  const [state, setState] = useState<TuiState>(() => createInitialState(plugins));

  useInput((input, key) => {
    const plugin = getActivePlugin(state);
    if (!plugin) return;

    const items = getComponentItems(plugin);
    const maxCursor = items.length - 1;

    setState((prev) => {
      const newState = { ...prev };

      // Arrow Up - Move cursor up
      if (key.upArrow && newState.activePanel === 'components') {
        newState.componentCursor = Math.max(0, newState.componentCursor - 1);
      }

      // Arrow Down - Move cursor down
      if (key.downArrow && newState.activePanel === 'components') {
        newState.componentCursor = Math.min(maxCursor, newState.componentCursor + 1);
      }

      // Arrow Left - Switch panel left
      if (key.leftArrow) {
        if (newState.activePanel === 'components') newState.activePanel = 'plugins';
        else if (newState.activePanel === 'preview') newState.activePanel = 'components';
      }

      // Arrow Right - Switch panel right
      if (key.rightArrow) {
        if (newState.activePanel === 'plugins') newState.activePanel = 'components';
        else if (newState.activePanel === 'components') newState.activePanel = 'preview';
      }

      // Space - Toggle selection
      if (input === ' ' && newState.activePanel === 'components') {
        const item = items[newState.componentCursor];
        if (item) {
          toggleSelection(newState, plugin.name, item);
        }
      }

      // Tab - Switch plugin forward
      if (key.tab) {
        newState.activePluginIndex = (newState.activePluginIndex + 1) % plugins.length;
        newState.componentCursor = 0; // Reset cursor
      }

      // Shift+Tab - Switch plugin backward
      if (key.shift && key.tab) {
        newState.activePluginIndex =
          (newState.activePluginIndex - 1 + plugins.length) % plugins.length;
        newState.componentCursor = 0; // Reset cursor
      }

      // A - Select all
      if (input === 'a' || input === 'A') {
        selectAll(newState);
      }

      // N - Select none
      if (input === 'n' || input === 'N') {
        selectNone(newState);
      }

      // S - Save (trigger callback)
      if (input === 's' || input === 'S') {
        if (onSave) {
          onSave(newState);
        }
      }

      // Q - Quit
      if (input === 'q' || input === 'Q') {
        exit();
      }

      return newState;
    });
  });

  return (
    <Layout
      state={state}
      pluginsPanel={<PluginsPanel state={state} />}
      componentsPanel={<ComponentsPanel state={state} />}
      previewPanel={<PreviewPanel state={state} />}
    />
  );
};
