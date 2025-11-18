import React, { useState } from 'react';
import * as path from 'path';
import { MainMenu } from './MainMenu';
import { ConfigurationForm, FormData } from './ConfigurationForm';
import { App } from '../App';
import { useApp } from 'ink';
import { loadPluginsFromDirectory } from '../../loader/pluginLoader';
import { savePlugin } from '../../saver/save';
import { SelectionState } from '../state/SelectionState';
import { NormalizedPluginConfiguration } from '../../types/normalized';

export interface SetupConfig extends FormData {
  plugins: NormalizedPluginConfiguration[];
}

type Screen = 'menu' | 'form' | 'selection';

export interface SetupFlowProps {
  onSave?: (outputDir: string) => void;
}

export const SetupFlow: React.FC<SetupFlowProps> = ({ onSave }) => {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('menu');
  const [config, setConfig] = useState<SetupConfig | null>(null);

  const handleMenuSelect = (option: 'create' | 'exit') => {
    if (option === 'exit') {
      exit();
    } else {
      setScreen('form');
    }
  };

  const handleFormCancel = () => {
    setScreen('menu');
  };

  const handleFormSubmit = async (formData: FormData) => {
    // Expand ~ to home directory
    let sourceDir = formData.sourceDirectory;
    if (sourceDir.startsWith('~')) {
      const home = process.env.HOME || process.env.USERPROFILE || '';
      sourceDir = sourceDir.replace(/^~/, home);
    }

    // Load plugins
    try {
      const plugins = await loadPluginsFromDirectory(sourceDir);

      setConfig({
        ...formData,
        plugins
      });

      setScreen('selection');
    } catch (error) {
      // Error loading plugins - stay on form
      console.error('Error loading plugins:', error);
    }
  };

  const handleSave = async (selectionState: SelectionState, outputDirOverride?: string) => {
    if (!config) return;

    // Build merged plugin
    const merged = selectionState.buildMergedPlugin(config.marketplaceName);

    // Build source plugins map
    const sourcePluginsMap = new Map<string, NormalizedPluginConfiguration>();
    for (const plugin of config.plugins) {
      sourcePluginsMap.set(plugin.name, plugin);
    }

    // Use override output dir if provided, otherwise use config
    const finalOutputDir = outputDirOverride || config.outputDirectory;

    // Save to disk
    const result = await savePlugin(merged, sourcePluginsMap, {
      outputDir: path.resolve(finalOutputDir),
      pluginName: config.marketplaceName
    });

    console.log('\n✓ Plugin saved successfully!\n');
    console.log('Files generated:');
    console.log(`  • ${result.marketplaceJson}`);
    console.log(`  • ${result.pluginJson}`);
    console.log(`  • ${result.normalizedJson}\n`);
    console.log('Components included:');
    console.log(`  • ${merged.commands.length} commands`);
    console.log(`  • ${merged.agents.length} agents`);
    console.log(`  • ${merged.skills.length} skills`);
    console.log(`  • ${merged.hooks.length} hooks`);
    console.log(`  • ${merged.mcps.length} MCPs\n`);
    console.log('Installation:');
    console.log(`  /plugin marketplace add ${result.marketplaceJson}`);
    console.log(`  /plugin install ${config.marketplaceName}`);

    if (onSave) {
      onSave(finalOutputDir);
    }
  };

  // Render appropriate screen
  if (screen === 'menu') {
    return <MainMenu onSelect={handleMenuSelect} />;
  }

  if (screen === 'form') {
    return <ConfigurationForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} />;
  }

  if (screen === 'selection' && config) {
    return (
      <App
        plugins={config.plugins}
        outputName={config.marketplaceName}
        outputDir={config.outputDirectory}
        authorEmail={config.authorEmail}
        onSave={handleSave}
      />
    );
  }

  return <MainMenu onSelect={handleMenuSelect} />;
};
