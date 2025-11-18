/**
 * Main TUI Application
 * Implements: docs/spec/003-tui-visual-spec.md
 * Implements: docs/spec/004-user-workflows.md
 * Implements: docs/spec/009-tui-setup-screens.md
 */

import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';
import type { NormalizedPlugin } from '../types/normalized';
import { useTUIState } from './state/useTUIState';
import { useKeyboard } from './hooks/useKeyboard';
import { useSave } from './hooks/useSave';
import { PluginsPanel } from './components/PluginsPanel';
import { ComponentsPanel } from './components/ComponentsPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { MainMenu } from './screens/MainMenu';
import { ConfigurationForm, type FormData } from './screens/ConfigurationForm';
import { useSetupState } from './state/useSetupState';

interface TUIAppProps {
  plugins: NormalizedPlugin[];
}

function TUIApp({ plugins }: TUIAppProps) {
  const { state, dispatch, componentsTree, previewJSON, selectionCounts } = useTUIState(plugins);
  const [shouldExit, setShouldExit] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const {
    handleSave,
    handleOverwriteConfirm,
    handleOverwriteCancel,
    clearResult,
    saveResult,
    isOverwritePrompt,
  } = useSave({
    plugins: state.plugins,
    selection: state.selection,
    outputDir: state.outputDir,
  });

  // Keyboard navigation
  useKeyboard({
    activePanelIndex: state.activePanelIndex,
    cursorPositions: state.cursorPositions,
    pluginsCount: state.plugins.length,
    componentsTree,
    expandedCategories: state.expandedCategories,
    dispatch,
    onSave: handleSave,
    onQuit: () => setShouldExit(true),
  });

  // Handle save result
  useEffect(() => {
    if (saveResult) {
      setStatusMessage(saveResult.message);

      // Auto-clear success messages after 5 seconds
      if (saveResult.success) {
        const timeout = setTimeout(() => {
          clearResult();
          setStatusMessage(null);
        }, 5000);

        return () => clearTimeout(timeout);
      }
    }
  }, [saveResult, clearResult]);

  // Exit
  useEffect(() => {
    if (shouldExit) {
      process.exit(0);
    }
  }, [shouldExit]);

  // Handle overwrite prompt with keyboard
  useEffect(() => {
    if (isOverwritePrompt) {
      const stdin = process.stdin;
      stdin.setRawMode(true);
      stdin.resume();

      const listener = (key: Buffer) => {
        const char = key.toString();
        if (char.toLowerCase() === 'y') {
          handleOverwriteConfirm();
          stdin.removeListener('data', listener);
        } else if (char.toLowerCase() === 'n' || char === '\u001b') {
          handleOverwriteCancel();
          stdin.removeListener('data', listener);
        }
      };

      stdin.on('data', listener);

      return () => {
        stdin.removeListener('data', listener);
      };
    }
  }, [isOverwritePrompt, handleOverwriteConfirm, handleOverwriteCancel]);

  const currentPlugin = state.plugins[state.selectedPluginIndex];

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Claude Plugin Curator
        </Text>
      </Box>

      {/* Three-panel layout */}
      <Box flexGrow={1}>
        <PluginsPanel
          plugins={state.plugins}
          selectedIndex={state.selectedPluginIndex}
          cursorPosition={state.cursorPositions.plugins}
          isActive={state.activePanelIndex === 0}
          onSelect={(index) => dispatch({ type: 'SELECT_PLUGIN', index })}
        />

        <ComponentsPanel
          tree={componentsTree}
          selection={state.selection}
          expandedCategories={state.expandedCategories}
          cursorPosition={state.cursorPositions.components}
          isActive={state.activePanelIndex === 1}
          onToggleSelection={(id) => dispatch({ type: 'TOGGLE_SELECTION', componentId: id })}
          onToggleCategory={(cat) => dispatch({ type: 'TOGGLE_CATEGORY', category: cat })}
        />

        <PreviewPanel
          previewJSON={previewJSON}
          selectionCounts={selectionCounts}
          isActive={state.activePanelIndex === 2}
        />
      </Box>

      {/* Footer with keyboard shortcuts */}
      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>
          ↑↓: Navigate | ←→ TAB: Switch panel | SPACE: Select | ENTER: Expand | S: Save | A: Select all | N: Deselect all | Q/ESC: Quit
        </Text>
      </Box>

      {/* Status message */}
      {statusMessage && (
        <Box marginTop={1} borderStyle="round" borderColor={saveResult?.success ? 'green' : 'yellow'} paddingX={1}>
          <Text color={saveResult?.success ? 'green' : 'yellow'}>{statusMessage}</Text>
        </Box>
      )}
    </Box>
  );
}

/**
 * TUI App with Setup Flow
 * Handles Main Menu → Configuration Form → Component Selection
 */
interface TUIAppWithSetupProps {
  initialPlugins?: NormalizedPlugin[];
  initialFormData?: FormData;
  skipSetup?: boolean;
}

function TUIAppWithSetup({ initialPlugins, initialFormData, skipSetup = false }: TUIAppWithSetupProps) {
  const { state: setupState, showMainMenu, showConfigurationForm, showComponentSelection, goBack } = useSetupState(
    skipSetup ? 'component-selection' : 'main-menu'
  );

  const [plugins, setPlugins] = useState<NormalizedPlugin[]>(initialPlugins || []);
  const [formData, setFormData] = useState<FormData | null>(initialFormData || null);

  // Handle screen transitions
  const handleCreatePlugin = () => {
    showConfigurationForm();
  };

  const handleExit = () => {
    process.exit(0);
  };

  const handleFormSubmit = async (data: FormData) => {
    setFormData(data);
    // Scan plugins from source directory
    const { scanPlugins } = await import('../cli/index');
    const scannedPlugins = await scanPlugins(data.sourceDirectory);
    setPlugins(scannedPlugins);
    showComponentSelection(data);
  };

  const handleFormCancel = () => {
    goBack();
  };

  // Render current screen
  if (setupState.currentScreen === 'main-menu') {
    return <MainMenu onCreatePlugin={handleCreatePlugin} onExit={handleExit} />;
  }

  if (setupState.currentScreen === 'configuration-form') {
    return <ConfigurationForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />;
  }

  if (setupState.currentScreen === 'component-selection' && plugins.length > 0) {
    return <TUIApp plugins={plugins} />;
  }

  // Fallback
  return (
    <Box flexDirection="column" justifyContent="center" alignItems="center" height="100%">
      <Text>Loading...</Text>
    </Box>
  );
}

/**
 * Launch TUI with plugins (direct mode - skips setup)
 */
export async function launchTUI(plugins: NormalizedPlugin[]): Promise<void> {
  render(<TUIAppWithSetup initialPlugins={plugins} skipSetup={true} />);
}

/**
 * Launch TUI in interactive mode (with setup screens)
 */
export async function launchInteractiveTUI(): Promise<void> {
  render(<TUIAppWithSetup />);
}
