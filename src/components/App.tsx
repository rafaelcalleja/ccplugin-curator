import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { NormalizedPluginInternalFormat } from '../types/normalized';
import { PluginList } from './PluginList';
import { ComponentList } from './ComponentList';
import { PreviewPanel } from './PreviewPanel';

export interface AppProps {
  plugins: NormalizedPluginInternalFormat[];
  onSave: (selections: SelectionState) => Promise<void>;
}

export interface SelectionState {
  [pluginName: string]: {
    commands: Set<string>;
    agents: Set<string>;
    skills: Set<string>;
    hooks: Set<number>; // Index in hooks array
    mcps: Set<number>; // Index in mcps array
  };
}

type Panel = 'plugins' | 'components' | 'preview';

export function App({ plugins, onSave }: AppProps) {
  const { exit } = useApp();
  const [activePanel, setActivePanel] = useState<Panel>('components');
  const [selectedPluginIndex, setSelectedPluginIndex] = useState(0);
  const [selections, setSelections] = useState<SelectionState>({});

  // Initialize selections for all plugins
  useEffect(() => {
    const initialSelections: SelectionState = {};
    for (const plugin of plugins) {
      initialSelections[plugin.name] = {
        commands: new Set(),
        agents: new Set(),
        skills: new Set(),
        hooks: new Set(),
        mcps: new Set(),
      };
    }
    setSelections(initialSelections);
  }, [plugins]);

  const currentPlugin = plugins[selectedPluginIndex];
  const currentSelections = currentPlugin ? selections[currentPlugin.name] : undefined;

  // Handle keyboard input
  useInput((input: string, key: any) => {
    // Q to quit
    if (input === 'q' || input === 'Q') {
      exit();
      return;
    }

    // S to save
    if (input === 's' || input === 'S') {
      onSave(selections).then(() => {
        // Stay in app after save
      });
      return;
    }

    // Left/Right arrows to switch panels
    if (key.rightArrow) {
      if (activePanel === 'plugins') setActivePanel('components');
      else if (activePanel === 'components') setActivePanel('preview');
    }
    if (key.leftArrow) {
      if (activePanel === 'preview') setActivePanel('components');
      else if (activePanel === 'components') setActivePanel('plugins');
    }

    // Tab to cycle through plugins
    if (key.tab) {
      if (!key.shift) {
        setSelectedPluginIndex((prev) => (prev + 1) % plugins.length);
      } else {
        setSelectedPluginIndex((prev) => (prev - 1 + plugins.length) % plugins.length);
      }
    }
  });

  const handleToggleSelection = (type: keyof SelectionState[string], item: string | number) => {
    if (!currentPlugin) return;

    setSelections((prev) => {
      const pluginSelections = { ...prev[currentPlugin.name] };
      const set = new Set<any>(pluginSelections[type]);

      if (set.has(item as any)) {
        set.delete(item as any);
      } else {
        set.add(item as any);
      }

      return {
        ...prev,
        [currentPlugin.name]: {
          ...pluginSelections,
          [type]: set as any,
        },
      };
    });
  };

  const handleSelectAll = (type: keyof SelectionState[string]) => {
    if (!currentPlugin) return;

    setSelections((prev) => {
      const pluginSelections = { ...prev[currentPlugin.name] };
      let items: (string | number)[];

      if (type === 'commands') items = currentPlugin.commands;
      else if (type === 'agents') items = currentPlugin.agents;
      else if (type === 'skills') items = currentPlugin.skills;
      else if (type === 'hooks') items = currentPlugin.hooks.map((_, i) => i);
      else if (type === 'mcps') items = currentPlugin.mcps.map((_, i) => i);
      else items = [];

      return {
        ...prev,
        [currentPlugin.name]: {
          ...pluginSelections,
          [type]: new Set(items),
        },
      };
    });
  };

  const handleSelectNone = (type: keyof SelectionState[string]) => {
    if (!currentPlugin) return;

    setSelections((prev) => {
      const pluginSelections = { ...prev[currentPlugin.name] };
      return {
        ...prev,
        [currentPlugin.name]: {
          ...pluginSelections,
          [type]: new Set(),
        },
      };
    });
  };

  if (plugins.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">No plugins found in the specified directory.</Text>
        <Text>Press Q to quit.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text>
          PLUGIN: <Text bold>{currentPlugin?.name}</Text>
        </Text>
        <Box flexGrow={1} />
        <Text>
          [Tab {selectedPluginIndex + 1} of {plugins.length}]
        </Text>
      </Box>

      {/* Main content area */}
      <Box flexGrow={1} borderStyle="single" borderColor="gray">
        {/* Plugins panel */}
        <Box width="25%" borderStyle="single" borderColor={activePanel === 'plugins' ? 'blue' : 'gray'}>
          <PluginList
            plugins={plugins}
            selectedIndex={selectedPluginIndex}
            active={activePanel === 'plugins'}
          />
        </Box>

        {/* Components panel */}
        <Box width="50%" borderStyle="single" borderColor={activePanel === 'components' ? 'blue' : 'gray'}>
          {currentPlugin && currentSelections && (
            <ComponentList
              plugin={currentPlugin}
              selections={currentSelections}
              active={activePanel === 'components'}
              onToggle={handleToggleSelection}
              onSelectAll={handleSelectAll}
              onSelectNone={handleSelectNone}
            />
          )}
        </Box>

        {/* Preview panel */}
        <Box width="25%" borderStyle="single" borderColor={activePanel === 'preview' ? 'blue' : 'gray'}>
          <PreviewPanel plugins={plugins} selections={selections} />
        </Box>
      </Box>

      {/* Status bar */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text>
          ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | TAB: Next Plugin | S: Save | Q: Quit
        </Text>
      </Box>
    </Box>
  );
}
