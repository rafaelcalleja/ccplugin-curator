import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { NormalizedPlugin } from '../types/normalized.js';
import { savePlugin } from '../lib/file-ops.js';

interface AppProps {
  plugins: NormalizedPlugin[];
  outputDir: string;
}

type Panel = 'plugins' | 'components' | 'preview';

interface Selection {
  [key: string]: Set<string>; // pluginName -> Set of selected component paths
}

export function App({ plugins, outputDir }: AppProps) {
  const { exit } = useApp();
  const [currentPanel, setCurrentPanel] = useState<Panel>('components');
  const [pluginIndex, setPluginIndex] = useState(0);
  const [componentIndex, setComponentIndex] = useState(0);
  const [selection, setSelection] = useState<Selection>({});
  const [message, setMessage] = useState<string>('');

  const currentPlugin = plugins[pluginIndex];

  // Get all components for current plugin
  const components = [
    ...currentPlugin.commands.map((c) => ({ type: 'command', path: c, label: c })),
    ...currentPlugin.agents.map((a) => ({ type: 'agent', path: a, label: a })),
    ...currentPlugin.skills.map((s) => ({ type: 'skill', path: s, label: s })),
    ...currentPlugin.hooks.map((h, i) => ({
      type: 'hook',
      path: `${h.event}:${i}`,
      label: `${h.event}${h.matcher ? `:${h.matcher}` : ''} → ${h.command}`,
    })),
    ...currentPlugin.mcps.map((m) => ({
      type: 'mcp',
      path: m.name,
      label: m.name,
    })),
  ];

  const isSelected = (path: string) => {
    return selection[currentPlugin.name]?.has(path) || false;
  };

  const toggleSelection = (path: string) => {
    setSelection((prev) => {
      const pluginSelection = new Set(prev[currentPlugin.name] || []);
      if (pluginSelection.has(path)) {
        pluginSelection.delete(path);
      } else {
        pluginSelection.add(path);
      }
      return { ...prev, [currentPlugin.name]: pluginSelection };
    });
  };

  const handleSave = async () => {
    // Check if selection is empty
    const totalSelected = Object.values(selection).reduce(
      (sum, set) => sum + set.size,
      0,
    );

    if (totalSelected === 0) {
      setMessage('⚠ No hay componentes seleccionados');
      return;
    }

    try {
      // Build normalized plugin from selection
      const selectedComponents = new Set(selection[currentPlugin.name] || []);

      const curatedPlugin: NormalizedPlugin = {
        ...currentPlugin,
        commands: currentPlugin.commands.filter((c) => selectedComponents.has(c)),
        agents: currentPlugin.agents.filter((a) => selectedComponents.has(a)),
        skills: currentPlugin.skills.filter((s) => selectedComponents.has(s)),
        hooks: currentPlugin.hooks.filter((h, i) =>
          selectedComponents.has(`${h.event}:${i}`),
        ),
        mcps: currentPlugin.mcps.filter((m) => selectedComponents.has(m.name)),
      };

      await savePlugin({
        outputDir,
        pluginName: 'curated-plugin',
        selection: curatedPlugin,
      });

      setMessage(
        `✓ Plugin guardado en ${outputDir}\n\nInstalación:\n  /plugin marketplace add ${outputDir}\n  /plugin install curated-plugin`,
      );
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  useInput((input, key) => {
    if (input === 'q' || input === 'Q') {
      exit();
      return;
    }

    if (input === 's' || input === 'S') {
      handleSave();
      return;
    }

    if (key.upArrow) {
      if (currentPanel === 'components') {
        setComponentIndex((i) => Math.max(0, i - 1));
      } else if (currentPanel === 'plugins') {
        setPluginIndex((i) => Math.max(0, i - 1));
      }
    }

    if (key.downArrow) {
      if (currentPanel === 'components') {
        setComponentIndex((i) => Math.min(components.length - 1, i + 1));
      } else if (currentPanel === 'plugins') {
        setPluginIndex((i) => Math.min(plugins.length - 1, i + 1));
      }
    }

    if (key.leftArrow) {
      if (currentPanel === 'components') setCurrentPanel('plugins');
      else if (currentPanel === 'preview') setCurrentPanel('components');
    }

    if (key.rightArrow) {
      if (currentPanel === 'plugins') setCurrentPanel('components');
      else if (currentPanel === 'components') setCurrentPanel('preview');
    }

    if (input === ' ') {
      if (currentPanel === 'components' && components[componentIndex]) {
        toggleSelection(components[componentIndex].path);
      }
    }

    if (input === 'a' || input === 'A') {
      // Select all
      if (currentPanel === 'components') {
        const allPaths = new Set(components.map((c) => c.path));
        setSelection((prev) => ({ ...prev, [currentPlugin.name]: allPaths }));
      }
    }

    if (input === 'n' || input === 'N') {
      // Select none
      if (currentPanel === 'components') {
        setSelection((prev) => ({ ...prev, [currentPlugin.name]: new Set() }));
      }
    }
  });

  // Build preview JSON
  const selectedPaths = selection[currentPlugin.name] || new Set();
  const preview = {
    commands: currentPlugin.commands.filter((c) => selectedPaths.has(c)),
    agents: currentPlugin.agents.filter((a) => selectedPaths.has(a)),
    skills: currentPlugin.skills.filter((s) => selectedPaths.has(s)),
    hooks: currentPlugin.hooks.filter((h, i) => selectedPaths.has(`${h.event}:${i}`)),
    mcps: currentPlugin.mcps.filter((m) => selectedPaths.has(m.name)),
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="single" borderColor="cyan">
        <Text>
          PLUGIN: {currentPlugin.name} [Tab {pluginIndex + 1} of {plugins.length}]
        </Text>
      </Box>

      {/* Main panels */}
      <Box flexGrow={1} borderStyle="single">
        {/* Plugins panel */}
        <Box width="25%" flexDirection="column" borderStyle="single" padding={1}>
          <Text bold>PLUGINS</Text>
          <Text> </Text>
          {plugins.map((p, i) => (
            <Text key={i} color={i === pluginIndex ? 'green' : undefined}>
              {i === pluginIndex ? '▼' : '▽'} {p.name} {i === pluginIndex ? '(★)' : ''}
            </Text>
          ))}
        </Box>

        {/* Components panel */}
        <Box
          width="50%"
          flexDirection="column"
          borderStyle="single"
          padding={1}
        >
          <Text bold>COMPONENTS</Text>
          <Text> </Text>
          {components.map((c, i) => (
            <Text key={i} color={isSelected(c.path) ? 'green' : undefined}>
              {i === componentIndex && currentPanel === 'components' ? '►' : ' '} [
              {isSelected(c.path) ? '✓' : ' '}] {c.label || c.path}
            </Text>
          ))}
        </Box>

        {/* Preview panel */}
        <Box width="25%" flexDirection="column" borderStyle="single" padding={1}>
          <Text bold>PREVIEW</Text>
          <Text> </Text>
          <Text>{JSON.stringify(preview, null, 2)}</Text>
        </Box>
      </Box>

      {/* Status bar */}
      <Box borderStyle="single" borderColor="gray">
        <Text>
          ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save |
          Q: Quit
        </Text>
      </Box>

      {/* Message */}
      {message && (
        <Box borderStyle="single" borderColor="yellow" padding={1}>
          <Text>{message}</Text>
        </Box>
      )}
    </Box>
  );
}
