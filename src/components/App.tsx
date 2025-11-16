import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import type { NormalizedPluginInternalFormat } from '../types/normalized.js';
import { PluginsPanel } from './PluginsPanel.js';
import { ComponentsPanel } from './ComponentsPanel.js';
import { PreviewPanel } from './PreviewPanel.js';
import { StatusBar } from './StatusBar.js';
import { savePlugin, mergePlugins } from '../lib/save.js';

interface AppProps {
  plugins: NormalizedPluginInternalFormat[];
  outputDir: string;
}

type Panel = 'plugins' | 'components' | 'preview';

export function App({ plugins, outputDir }: AppProps) {
  const { exit } = useApp();
  const [activePanel, setActivePanel] = useState<Panel>('components');
  const [activePluginIndex, setActivePluginIndex] = useState(0);
  const [selection, setSelection] = useState<Map<string, Set<string>>>(new Map());
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const activePlugin = plugins[activePluginIndex];

  // Handle keyboard input
  useInput((input, key) => {
    // Clear message on any key
    if (message) {
      setMessage('');
      setMessageType('');
    }

    // Q: Quit
    if (input === 'q' || input === 'Q') {
      exit();
      return;
    }

    // S: Save
    if (input === 's' || input === 'S') {
      handleSave();
      return;
    }

    // A: Select all
    if (input === 'a' || input === 'A') {
      handleSelectAll();
      return;
    }

    // N: Select none
    if (input === 'n' || input === 'N') {
      handleSelectNone();
      return;
    }

    // Arrow keys for navigation
    if (key.leftArrow) {
      if (activePanel === 'components') setActivePanel('plugins');
      else if (activePanel === 'preview') setActivePanel('components');
    }

    if (key.rightArrow) {
      if (activePanel === 'plugins') setActivePanel('components');
      else if (activePanel === 'components') setActivePanel('preview');
    }

    // TAB / SHIFT+TAB for plugin switching
    if (key.tab && !key.shift && plugins.length > 1) {
      setActivePluginIndex((activePluginIndex + 1) % plugins.length);
    }

    if (key.tab && key.shift && plugins.length > 1) {
      setActivePluginIndex((activePluginIndex - 1 + plugins.length) % plugins.length);
    }
  });

  function handleSelectAll() {
    if (!activePlugin) return;

    const pluginSelection = new Set<string>();
    activePlugin.commands.forEach(cmd => pluginSelection.add(`command:${cmd}`));
    activePlugin.agents.forEach(agent => pluginSelection.add(`agent:${agent}`));
    activePlugin.skills.forEach(skill => pluginSelection.add(`skill:${skill}`));
    activePlugin.hooks.forEach((hook, i) => pluginSelection.add(`hook:${i}`));
    activePlugin.mcps.forEach((mcp, i) => pluginSelection.add(`mcp:${i}`));

    const newSelection = new Map(selection);
    newSelection.set(activePlugin.name, pluginSelection);
    setSelection(newSelection);
  }

  function handleSelectNone() {
    if (!activePlugin) return;

    const newSelection = new Map(selection);
    newSelection.delete(activePlugin.name);
    setSelection(newSelection);
  }

  function toggleSelection(pluginName: string, itemKey: string) {
    const newSelection = new Map(selection);
    const pluginSelection = newSelection.get(pluginName) || new Set();

    if (pluginSelection.has(itemKey)) {
      pluginSelection.delete(itemKey);
    } else {
      pluginSelection.add(itemKey);
    }

    if (pluginSelection.size === 0) {
      newSelection.delete(pluginName);
    } else {
      newSelection.set(pluginName, pluginSelection);
    }

    setSelection(newSelection);
  }

  async function handleSave() {
    // Build selection from all plugins
    const selectedPlugins: NormalizedPluginInternalFormat[] = [];

    for (const plugin of plugins) {
      const pluginSelection = selection.get(plugin.name);
      if (!pluginSelection || pluginSelection.size === 0) continue;

      const selected: NormalizedPluginInternalFormat = {
        ...plugin,
        commands: plugin.commands.filter((_, i) => pluginSelection.has(`command:${plugin.commands[i]}`)),
        agents: plugin.agents.filter((_, i) => pluginSelection.has(`agent:${plugin.agents[i]}`)),
        skills: plugin.skills.filter((_, i) => pluginSelection.has(`skill:${plugin.skills[i]}`)),
        hooks: plugin.hooks.filter((_, i) => pluginSelection.has(`hook:${i}`)),
        mcps: plugin.mcps.filter((_, i) => pluginSelection.has(`mcp:${i}`)),
      };

      selectedPlugins.push(selected);
    }

    if (selectedPlugins.length === 0) {
      setMessage('⚠ No components selected');
      setMessageType('error');
      return;
    }

    // Merge plugins if multiple
    const merged = selectedPlugins.length === 1
      ? selectedPlugins[0]
      : mergePlugins(selectedPlugins);

    // Save
    const result = await savePlugin(merged, {
      outputDir,
      pluginName: 'curated-plugin',
      marketplaceName: 'curated-plugins',
      ownerName: 'User',
      ownerEmail: 'user@example.com',
    });

    if (result.success) {
      setMessage(`✓ Plugin saved successfully to ${result.outputPath}`);
      setMessageType('success');
    } else {
      setMessage(`✗ Save failed: ${result.errors.join(', ')}`);
      setMessageType('error');
    }
  }

  // Build preview data
  const previewData = buildPreviewData(plugins, selection);

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">
          PLUGIN: {activePlugin?.name || 'N/A'}
        </Text>
        {plugins.length > 1 && (
          <Text dimColor> [Tab {activePluginIndex + 1} of {plugins.length}]</Text>
        )}
      </Box>

      {/* Main content */}
      <Box flexGrow={1} flexDirection="row" borderStyle="single">
        {/* Plugins Panel */}
        <Box width="25%" borderStyle="single" borderRight>
          <PluginsPanel
            plugins={plugins}
            activeIndex={activePluginIndex}
            active={activePanel === 'plugins'}
          />
        </Box>

        {/* Components Panel */}
        <Box width="50%" borderStyle="single" borderRight>
          <ComponentsPanel
            plugin={activePlugin}
            selection={selection.get(activePlugin?.name) || new Set()}
            active={activePanel === 'components'}
            onToggle={(itemKey) => toggleSelection(activePlugin.name, itemKey)}
          />
        </Box>

        {/* Preview Panel */}
        <Box width="25%" borderStyle="single">
          <PreviewPanel data={previewData} active={activePanel === 'preview'} />
        </Box>
      </Box>

      {/* Status bar */}
      <StatusBar />

      {/* Message */}
      {message && (
        <Box borderStyle="single" borderColor={messageType === 'error' ? 'red' : 'green'} paddingX={1}>
          <Text color={messageType === 'error' ? 'red' : 'green'}>{message}</Text>
        </Box>
      )}
    </Box>
  );
}

function buildPreviewData(
  plugins: NormalizedPluginInternalFormat[],
  selection: Map<string, Set<string>>
): any {
  const preview: any = {
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcp: { servers: {} },
  };

  for (const plugin of plugins) {
    const pluginSelection = selection.get(plugin.name);
    if (!pluginSelection) continue;

    plugin.commands.forEach((cmd) => {
      if (pluginSelection.has(`command:${cmd}`)) {
        preview.commands.push(cmd);
      }
    });

    plugin.agents.forEach((agent) => {
      if (pluginSelection.has(`agent:${agent}`)) {
        preview.agents.push(agent);
      }
    });

    plugin.skills.forEach((skill) => {
      if (pluginSelection.has(`skill:${skill}`)) {
        preview.skills.push(skill);
      }
    });

    plugin.hooks.forEach((hook, i) => {
      if (pluginSelection.has(`hook:${i}`)) {
        preview.hooks.push(`${hook.event}${hook.matcher ? `:${hook.matcher}` : ''} → ${hook.command}`);
      }
    });

    plugin.mcps.forEach((mcp, i) => {
      if (pluginSelection.has(`mcp:${i}`)) {
        preview.mcp.servers[mcp.name] = {
          command: mcp.command,
          args: mcp.args || [],
          env: mcp.env || {},
        };
      }
    });
  }

  return preview;
}
