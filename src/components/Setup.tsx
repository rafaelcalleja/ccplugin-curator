import React, { useState } from 'react';
import { useApp } from 'ink';
import { MainMenu } from './MainMenu.js';
import { ConfigurationForm, ConfigFormData } from './ConfigurationForm.js';
import { App } from './App.js';
import type { NormalizedPluginInternalFormat } from '../types/normalized.js';
import fs from 'fs/promises';
import path from 'path';
import type { ClaudeCodePluginOfficialFormat } from '../types/plugin.js';
import { normalizePlugin } from '../lib/normalize.js';

type Screen = 'menu' | 'form' | 'tui';

interface SetupProps {
  plugins?: NormalizedPluginInternalFormat[];
  outputDir?: string;
}

export function Setup({ plugins: initialPlugins, outputDir: initialOutputDir }: SetupProps) {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>(initialPlugins ? 'tui' : 'menu');
  const [plugins, setPlugins] = useState<NormalizedPluginInternalFormat[]>(initialPlugins || []);
  const [outputDir, setOutputDir] = useState<string>(initialOutputDir || './output');

  function handleExit() {
    exit();
  }

  function handleCreatePlugin() {
    setScreen('form');
  }

  function handleFormCancel() {
    setScreen('menu');
  }

  async function handleFormSubmit(data: ConfigFormData) {
    try {
      // Load plugins from source directory
      const loadedPlugins = await loadPluginsFromDirectory(data.sourceDirectory);

      if (loadedPlugins.length === 0) {
        // Should not happen due to form validation, but handle it anyway
        setScreen('form');
        return;
      }

      // Set state and transition to TUI
      setPlugins(loadedPlugins);
      setOutputDir(data.outputDirectory);
      setScreen('tui');
    } catch (err) {
      console.error('Error loading plugins:', err);
      // Stay on form to allow user to fix
    }
  }

  if (screen === 'menu') {
    return <MainMenu onCreatePlugin={handleCreatePlugin} onExit={handleExit} />;
  }

  if (screen === 'form') {
    return <ConfigurationForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />;
  }

  // screen === 'tui'
  return <App plugins={plugins} outputDir={outputDir} />;
}

/**
 * Load all plugins from directory
 */
async function loadPluginsFromDirectory(directory: string): Promise<NormalizedPluginInternalFormat[]> {
  const expandedPath = directory.replace(/^~/, process.env.HOME || '~');
  const absoluteDir = path.resolve(expandedPath);
  const plugins: NormalizedPluginInternalFormat[] = [];

  // Check if it's a single plugin directory
  const pluginJsonPath = path.join(absoluteDir, '.claude-plugin', 'plugin.json');
  try {
    await fs.access(pluginJsonPath);
    // Single plugin
    const plugin = await loadSinglePlugin(absoluteDir);
    plugins.push(plugin);
    return plugins;
  } catch {
    // Not a single plugin, scan subdirectories
  }

  // Scan for multiple plugins
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const pluginDir = path.join(absoluteDir, entry.name);
    const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');

    try {
      await fs.access(pluginJsonPath);
      const plugin = await loadSinglePlugin(pluginDir);
      plugins.push(plugin);
    } catch {
      // Not a plugin directory, skip
      continue;
    }
  }

  return plugins;
}

/**
 * Load single plugin from directory
 */
async function loadSinglePlugin(pluginDir: string): Promise<NormalizedPluginInternalFormat> {
  const pluginJsonPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');

  // Read plugin.json
  const content = await fs.readFile(pluginJsonPath, 'utf-8');
  const pluginJson: ClaudeCodePluginOfficialFormat = JSON.parse(content);

  // Normalize
  const normalized = await normalizePlugin(pluginJson, pluginDir);

  return normalized;
}
