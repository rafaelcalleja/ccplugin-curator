import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useInput } from 'ink';
import type { NormalizedPlugin } from '../types/index.js';
import type { ComponentSelection } from '../types/index.js';
import { PluginPanel } from './PluginPanel.js';
import { ComponentPanel } from './ComponentPanel.js';
import { PreviewPanel } from './PreviewPanel.js';

interface Props {
  plugins: NormalizedPlugin[];
  onExit: (selections: ComponentSelection[]) => void;
  onSave: (selections: ComponentSelection[]) => void;
}

export const PluginCurator: React.FC<Props> = ({
  plugins,
  onExit,
  onSave,
}) => {
  const [currentPluginIndex, setCurrentPluginIndex] = useState(0);
  const [focusPanel, setFocusPanel] = useState<'plugins' | 'components' | 'preview'>('components');
  const [selections, setSelections] = useState<Map<string, ComponentSelection>>(new Map());
  const [componentIndex, setComponentIndex] = useState(0);

  const currentPlugin = plugins[currentPluginIndex];

  // Initialize selection for current plugin if not exists
  useEffect(() => {
    if (!selections.has(currentPlugin.name)) {
      selections.set(currentPlugin.name, {
        pluginName: currentPlugin.name,
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: [],
      });
      setSelections(new Map(selections));
    }
  }, [currentPluginIndex, selections, currentPlugin.name]);

  const currentSelection = selections.get(currentPlugin.name) || {
    pluginName: currentPlugin.name,
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcps: [],
  };

  // Handle keyboard input
  useInput((input, key) => {
    if (input === 'q' || input === 'Q') {
      onExit(Array.from(selections.values()));
      return;
    }

    if (input === 's' || input === 'S') {
      onSave(Array.from(selections.values()));
      return;
    }

    if (key.tab) {
      if (key.shift) {
        setCurrentPluginIndex((currentPluginIndex - 1 + plugins.length) % plugins.length);
      } else {
        setCurrentPluginIndex((currentPluginIndex + 1) % plugins.length);
      }
      setComponentIndex(0);
      return;
    }

    if (key.rightArrow) {
      if (focusPanel === 'plugins') {
        setFocusPanel('components');
      } else if (focusPanel === 'components') {
        setFocusPanel('preview');
      }
      return;
    }

    if (key.leftArrow) {
      if (focusPanel === 'preview') {
        setFocusPanel('components');
      } else if (focusPanel === 'components') {
        setFocusPanel('plugins');
      }
      return;
    }

    if (key.upArrow) {
      if (focusPanel === 'components' || focusPanel === 'plugins') {
        setComponentIndex(Math.max(0, componentIndex - 1));
      }
      return;
    }

    if (key.downArrow) {
      if (focusPanel === 'components' || focusPanel === 'plugins') {
        const allComponentsCount = getTotalComponentsCount(currentPlugin);
        setComponentIndex(Math.min(allComponentsCount - 1, componentIndex + 1));
      }
      return;
    }

    if (input === ' ') {
      if (focusPanel === 'components') {
        const updatedSelection = { ...currentSelection };
        const { componentType, index } = getComponentAtIndex(currentPlugin, componentIndex);

        if (componentType === 'commands') {
          const cmd = currentPlugin.commands[index];
          if (updatedSelection.commands.includes(cmd)) {
            updatedSelection.commands = updatedSelection.commands.filter((c) => c !== cmd);
          } else {
            updatedSelection.commands.push(cmd);
          }
        } else if (componentType === 'agents') {
          const agent = currentPlugin.agents[index];
          if (updatedSelection.agents.includes(agent)) {
            updatedSelection.agents = updatedSelection.agents.filter((a) => a !== agent);
          } else {
            updatedSelection.agents.push(agent);
          }
        } else if (componentType === 'skills') {
          const skill = currentPlugin.skills[index];
          if (updatedSelection.skills.includes(skill)) {
            updatedSelection.skills = updatedSelection.skills.filter((s) => s !== skill);
          } else {
            updatedSelection.skills.push(skill);
          }
        } else if (componentType === 'hooks') {
          const hook = (currentPlugin as any).hooks[index];
          const hookIndex = updatedSelection.hooks.findIndex((h: any) => h.event === hook.event);
          if (hookIndex !== -1) {
            updatedSelection.hooks.splice(hookIndex, 1);
          } else {
            updatedSelection.hooks.push(hook);
          }
        } else if (componentType === 'mcps') {
          const mcp = (currentPlugin as any).mcps[index];
          const mcpIndex = updatedSelection.mcps.findIndex((m: any) => m.name === mcp.name);
          if (mcpIndex !== -1) {
            updatedSelection.mcps.splice(mcpIndex, 1);
          } else {
            updatedSelection.mcps.push(mcp);
          }
        }

        selections.set(currentPlugin.name, updatedSelection);
        setSelections(new Map(selections));
      }
      return;
    }

    if (input === 'a' || input === 'A') {
      if (focusPanel === 'components') {
        const updatedSelection: ComponentSelection = {
          pluginName: currentPlugin.name,
          commands: [...currentPlugin.commands],
          agents: [...currentPlugin.agents],
          skills: [...currentPlugin.skills],
          hooks: [...((currentPlugin as any).hooks || [])],
          mcps: [...((currentPlugin as any).mcps || [])],
        };
        selections.set(currentPlugin.name, updatedSelection);
        setSelections(new Map(selections));
      }
      return;
    }

    if (input === 'n' || input === 'N') {
      if (focusPanel === 'components') {
        const updatedSelection: ComponentSelection = {
          pluginName: currentPlugin.name,
          commands: [],
          agents: [],
          skills: [],
          hooks: [],
          mcps: [],
        };
        selections.set(currentPlugin.name, updatedSelection);
        setSelections(new Map(selections));
      }
      return;
    }
  });

  const tabInfo = `[Tab ${currentPluginIndex + 1} of ${plugins.length}]`;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan">
      <Box paddingX={1} justifyContent="space-between">
        <Text>
          PLUGIN: <Text bold>{currentPlugin.name}</Text>
        </Text>
        <Text>{tabInfo}</Text>
      </Box>

      <Box flexDirection="row" flexGrow={1} height={25}>
        <PluginPanel
          plugins={plugins}
          currentIndex={currentPluginIndex}
          focused={focusPanel === 'plugins'}
        />
        <ComponentPanel
          plugin={currentPlugin}
          selection={currentSelection}
          focused={focusPanel === 'components'}
          selectedIndex={componentIndex}
        />
        <PreviewPanel
          selection={currentSelection}
          focused={focusPanel === 'preview'}
        />
      </Box>

      <Box paddingX={1} marginTop={1}>
        <Text dimColor>
          ←→: Panel | ↑↓: Nav | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit
        </Text>
      </Box>
    </Box>
  );
};

function getTotalComponentsCount(plugin: NormalizedPlugin): number {
  return (
    plugin.commands.length +
    plugin.agents.length +
    plugin.skills.length +
    ((plugin as any).hooks?.length || 0) +
    ((plugin as any).mcps?.length || 0)
  );
}

function getComponentAtIndex(
  plugin: NormalizedPlugin,
  index: number
): { componentType: string; index: number } {
  let currentIndex = 0;

  // Commands
  if (index < currentIndex + plugin.commands.length) {
    return { componentType: 'commands', index: index - currentIndex };
  }
  currentIndex += plugin.commands.length;

  // Agents
  if (index < currentIndex + plugin.agents.length) {
    return { componentType: 'agents', index: index - currentIndex };
  }
  currentIndex += plugin.agents.length;

  // Skills
  if (index < currentIndex + plugin.skills.length) {
    return { componentType: 'skills', index: index - currentIndex };
  }
  currentIndex += plugin.skills.length;

  // Hooks
  const hooksCount = (plugin as any).hooks?.length || 0;
  if (index < currentIndex + hooksCount) {
    return { componentType: 'hooks', index: index - currentIndex };
  }
  currentIndex += hooksCount;

  // MCPs
  return { componentType: 'mcps', index: index - currentIndex };
}
