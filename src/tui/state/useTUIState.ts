/**
 * TUI State Management Hook
 * Implements: docs/spec/003-tui-visual-spec.md (State Management section)
 */

import { useState, useCallback, useMemo } from 'react';
import type { NormalizedPlugin } from '../../types/normalized';
import type { TUIState, TUIAction, ComponentTreeNode } from './types';
import { denormalizePlugin } from '../../core/denormalize';

/**
 * Fuzzy matching: returns true if all characters in query appear in text in order
 * Example: "bld" matches "build", "bold", "build-tool"
 */
function fuzzyMatch(text: string, query: string): boolean {
  if (query === '') return true;

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length;
}

export function useTUIState(initialPlugins: NormalizedPlugin[]) {
  const [state, setState] = useState<TUIState>({
    plugins: initialPlugins,
    selectedPluginIndex: 0,
    activePanelIndex: 0,
    selection: new Map(),
    cursorPositions: {
      plugins: 0,
      components: 0,
      preview: 0,
    },
    expandedCategories: new Set(['commands', 'agents', 'skills', 'hooks', 'mcps']),
    outputDir: './output/curated-plugin',
    searchQuery: '',
  });

  const dispatch = useCallback((action: TUIAction) => {
    setState((prev) => {
      switch (action.type) {
        case 'SELECT_PLUGIN':
          return {
            ...prev,
            selectedPluginIndex: action.index,
            cursorPositions: { ...prev.cursorPositions, components: 0 },
          };

        case 'SET_ACTIVE_PANEL':
          return { ...prev, activePanelIndex: action.index };

        case 'TOGGLE_SELECTION':
          const newSelection = new Map(prev.selection);
          newSelection.set(action.componentId, !newSelection.get(action.componentId));
          return { ...prev, selection: newSelection };

        case 'TOGGLE_CATEGORY':
          const newExpanded = new Set(prev.expandedCategories);
          if (newExpanded.has(action.category)) {
            newExpanded.delete(action.category);
          } else {
            newExpanded.add(action.category);
          }
          return { ...prev, expandedCategories: newExpanded };

        case 'MOVE_CURSOR':
          return {
            ...prev,
            cursorPositions: {
              ...prev.cursorPositions,
              [action.panel]: Math.max(
                0,
                prev.cursorPositions[action.panel] + action.delta
              ),
            },
          };

        case 'SELECT_ALL': {
          const currentPlugin = prev.plugins[prev.selectedPluginIndex];
          if (!currentPlugin) return prev;

          const allSelection = new Map(prev.selection);
          const addComponents = (count: number, type: string) => {
            for (let idx = 0; idx < count; idx++) {
              const id = `${currentPlugin.name}-${type}-${idx}`;
              allSelection.set(id, true);
            }
          };

          addComponents(currentPlugin.commands.length, 'command');
          addComponents(currentPlugin.agents.length, 'agent');
          addComponents(currentPlugin.skills.length, 'skill');
          addComponents(currentPlugin.hooks.length, 'hook');
          addComponents(currentPlugin.mcps.length, 'mcp');

          return { ...prev, selection: allSelection };
        }

        case 'DESELECT_ALL':
          return { ...prev, selection: new Map() };

        case 'SET_OUTPUT_DIR':
          return { ...prev, outputDir: action.dir };

        case 'SET_SEARCH_QUERY':
          return { ...prev, searchQuery: action.query, cursorPositions: { ...prev.cursorPositions, components: 0 } };

        default:
          return prev;
      }
    });
  }, []);

  // Build component tree for current plugin
  const componentsTree = useMemo((): ComponentTreeNode[] => {
    const currentPlugin = state.plugins[state.selectedPluginIndex];
    if (!currentPlugin) return [];

    const tree: ComponentTreeNode[] = [];

    // Commands category
    if (currentPlugin.commands.length > 0) {
      tree.push({
        id: 'category-commands',
        type: 'category',
        label: `Commands (${currentPlugin.commands.length})`,
        category: 'commands',
        children: currentPlugin.commands.map((cmd, idx) => ({
          id: `${currentPlugin.name}-command-${idx}`,
          type: 'component',
          label: cmd.split('/').pop() || cmd,
          category: 'commands',
          path: cmd,
          pluginName: currentPlugin.name,
          componentType: 'command' as const,
          componentData: cmd,
        })),
      });
    }

    // Agents category
    if (currentPlugin.agents.length > 0) {
      tree.push({
        id: 'category-agents',
        type: 'category',
        label: `Agents (${currentPlugin.agents.length})`,
        category: 'agents',
        children: currentPlugin.agents.map((agent, idx) => ({
          id: `${currentPlugin.name}-agent-${idx}`,
          type: 'component',
          label: agent.split('/').pop() || agent,
          category: 'agents',
          path: agent,
          pluginName: currentPlugin.name,
          componentType: 'agent' as const,
          componentData: agent,
        })),
      });
    }

    // Skills category
    if (currentPlugin.skills.length > 0) {
      tree.push({
        id: 'category-skills',
        type: 'category',
        label: `Skills (${currentPlugin.skills.length})`,
        category: 'skills',
        children: currentPlugin.skills.map((skill, idx) => ({
          id: `${currentPlugin.name}-skill-${idx}`,
          type: 'component',
          label: skill.split('/').pop() || skill,
          category: 'skills',
          path: skill,
          pluginName: currentPlugin.name,
          componentType: 'skill' as const,
          componentData: skill,
        })),
      });
    }

    // Hooks category
    if (currentPlugin.hooks.length > 0) {
      tree.push({
        id: 'category-hooks',
        type: 'category',
        label: `Hooks (${currentPlugin.hooks.length})`,
        category: 'hooks',
        children: currentPlugin.hooks.map((hook, idx) => ({
          id: `${currentPlugin.name}-hook-${idx}`,
          type: 'component',
          label: `${hook.event}: ${hook.command || 'unknown'}`,
          category: 'hooks',
          pluginName: currentPlugin.name,
          componentType: 'hook' as const,
          componentData: hook,
        })),
      });
    }

    // MCPs category
    if (currentPlugin.mcps.length > 0) {
      tree.push({
        id: 'category-mcps',
        type: 'category',
        label: `MCPs (${currentPlugin.mcps.length})`,
        category: 'mcps',
        children: currentPlugin.mcps.map((mcp, idx) => ({
          id: `${currentPlugin.name}-mcp-${idx}`,
          type: 'component',
          label: mcp.name,
          category: 'mcps',
          pluginName: currentPlugin.name,
          componentType: 'mcp' as const,
          componentData: mcp,
        })),
      });
    }

    // Apply search filter if query exists
    if (state.searchQuery) {
      return tree.map(category => {
        if (category.type === 'category' && category.children) {
          const filteredChildren = category.children.filter(child =>
            fuzzyMatch(child.label, state.searchQuery)
          );

          if (filteredChildren.length === 0) {
            return null;
          }

          return {
            ...category,
            label: category.label.replace(/\(\d+\)/, `(${filteredChildren.length})`),
            children: filteredChildren,
          };
        }
        return category;
      }).filter(Boolean) as ComponentTreeNode[];
    }

    return tree;
  }, [state.plugins, state.selectedPluginIndex, state.searchQuery]);

  // Compute live preview JSON
  const previewJSON = useMemo(() => {
    // Collect all selected components across all plugins
    const selectedComponents: NormalizedPlugin = {
      name: 'curated-plugin',
      version: '0.0.1',
      description: 'Curated plugin from selected components',
      source: state.outputDir,
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: 'MIT',
      keywords: [],
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    state.plugins.forEach((plugin) => {
      plugin.commands.forEach((cmd, idx) => {
        const id = `${plugin.name}-command-${idx}`;
        if (state.selection.get(id)) {
          selectedComponents.commands.push(cmd);
        }
      });

      plugin.agents.forEach((agent, idx) => {
        const id = `${plugin.name}-agent-${idx}`;
        if (state.selection.get(id)) {
          selectedComponents.agents.push(agent);
        }
      });

      plugin.skills.forEach((skill, idx) => {
        const id = `${plugin.name}-skill-${idx}`;
        if (state.selection.get(id)) {
          selectedComponents.skills.push(skill);
        }
      });

      plugin.hooks.forEach((hook, idx) => {
        const id = `${plugin.name}-hook-${idx}`;
        if (state.selection.get(id)) {
          selectedComponents.hooks.push(hook);
        }
      });

      plugin.mcps.forEach((mcp, idx) => {
        const id = `${plugin.name}-mcp-${idx}`;
        if (state.selection.get(id)) {
          selectedComponents.mcps.push(mcp);
        }
      });
    });

    // Transform to official format for preview
    const officialFormat = denormalizePlugin(selectedComponents);
    return JSON.stringify(officialFormat, null, 2);
  }, [state.plugins, state.selection, state.outputDir]);

  // Get selection counts
  const selectionCounts = useMemo(() => {
    let commands = 0,
      agents = 0,
      skills = 0,
      hooks = 0,
      mcps = 0;

    state.plugins.forEach((plugin) => {
      plugin.commands.forEach((_, idx) => {
        if (state.selection.get(`${plugin.name}-command-${idx}`)) commands++;
      });
      plugin.agents.forEach((_, idx) => {
        if (state.selection.get(`${plugin.name}-agent-${idx}`)) agents++;
      });
      plugin.skills.forEach((_, idx) => {
        if (state.selection.get(`${plugin.name}-skill-${idx}`)) skills++;
      });
      plugin.hooks.forEach((_, idx) => {
        if (state.selection.get(`${plugin.name}-hook-${idx}`)) hooks++;
      });
      plugin.mcps.forEach((_, idx) => {
        if (state.selection.get(`${plugin.name}-mcp-${idx}`)) mcps++;
      });
    });

    return { commands, agents, skills, hooks, mcps, total: commands + agents + skills + hooks + mcps };
  }, [state.plugins, state.selection]);

  // Calculate total components and matches for search
  const totalComponentCount = useMemo(() => {
    return state.plugins[state.selectedPluginIndex]
      ? state.plugins[state.selectedPluginIndex].commands.length +
          state.plugins[state.selectedPluginIndex].agents.length +
          state.plugins[state.selectedPluginIndex].skills.length +
          state.plugins[state.selectedPluginIndex].hooks.length +
          state.plugins[state.selectedPluginIndex].mcps.length
      : 0;
  }, [state.plugins, state.selectedPluginIndex]);

  const matchCount = useMemo(() => {
    let count = 0;
    componentsTree.forEach(category => {
      if (category.type === 'category' && category.children) {
        count += category.children.length;
      }
    });
    return count;
  }, [componentsTree]);

  return {
    state,
    dispatch,
    componentsTree,
    previewJSON,
    selectionCounts,
    searchQuery: state.searchQuery,
    matchCount,
    totalComponentCount,
  };
}
