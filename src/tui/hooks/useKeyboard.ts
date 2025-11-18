/**
 * Keyboard Navigation Hook
 * Implements: docs/spec/003-tui-visual-spec.md (Keyboard Navigation section)
 * Extended with search functionality
 */

import { useInput } from 'ink';
import { useMemo, useState } from 'react';
import type { TUIAction, ComponentTreeNode } from '../state/types';

interface UseKeyboardProps {
  activePanelIndex: number;
  cursorPositions: { plugins: number; components: number; preview: number };
  pluginsCount: number;
  componentsTree: ComponentTreeNode[];
  expandedCategories: Set<string>;
  searchQuery: string;
  dispatch: (action: TUIAction) => void;
  onSave: () => void;
  onQuit: () => void;
}

export function useKeyboard({
  activePanelIndex,
  cursorPositions,
  pluginsCount,
  componentsTree,
  expandedCategories,
  searchQuery,
  dispatch,
  onSave,
  onQuit,
}: UseKeyboardProps) {
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Flatten components tree for cursor navigation
  const flatComponents = useMemo(() => {
    const items: ComponentTreeNode[] = [];

    componentsTree.forEach((node) => {
      items.push(node);

      if (node.type === 'category' && node.category && expandedCategories.has(node.category)) {
        node.children?.forEach((child) => {
          items.push(child);
        });
      }
    });

    return items;
  }, [componentsTree, expandedCategories]);

  useInput((input, key) => {
    // Search mode handling
    if (isSearchMode) {
      if (key.escape) {
        // Clear search and exit search mode
        dispatch({ type: 'SET_SEARCH_QUERY', query: '' });
        setIsSearchMode(false);
        return;
      }

      if (key.return) {
        // Exit search mode but keep query
        setIsSearchMode(false);
        return;
      }

      if (key.backspace || key.delete) {
        // Remove last character
        const newQuery = searchQuery.slice(0, -1);
        dispatch({ type: 'SET_SEARCH_QUERY', query: newQuery });
        return;
      }

      // Add character to search query
      if (input && !key.ctrl && !key.meta) {
        const newQuery = searchQuery + input;
        dispatch({ type: 'SET_SEARCH_QUERY', query: newQuery });
        return;
      }

      return;
    }

    // Normal mode handling
    // Activate search mode with "/"
    if (input === '/') {
      setIsSearchMode(true);
      return;
    }

    // Clear search with ESC (when not in search mode)
    if (key.escape && searchQuery) {
      dispatch({ type: 'SET_SEARCH_QUERY', query: '' });
      return;
    }

    // Quit keys
    if (input === 'q' || input === 'Q') {
      if (!searchQuery) {
        onQuit();
      }
      return;
    }

    // Save key
    if (input === 's' || input === 'S') {
      onSave();
      return;
    }

    // Select all
    if (input === 'a' || input === 'A') {
      dispatch({ type: 'SELECT_ALL' });
      return;
    }

    // Deselect all
    if (input === 'n' || input === 'N') {
      dispatch({ type: 'DESELECT_ALL' });
      return;
    }

    // Panel navigation
    if (key.rightArrow) {
      const nextPanel = (activePanelIndex + 1) % 3;
      dispatch({ type: 'SET_ACTIVE_PANEL', index: nextPanel });
      return;
    }

    if (key.leftArrow) {
      const prevPanel = (activePanelIndex - 1 + 3) % 3;
      dispatch({ type: 'SET_ACTIVE_PANEL', index: prevPanel });
      return;
    }

    if (key.tab) {
      if (key.shift) {
        const prevPanel = (activePanelIndex - 1 + 3) % 3;
        dispatch({ type: 'SET_ACTIVE_PANEL', index: prevPanel });
      } else {
        const nextPanel = (activePanelIndex + 1) % 3;
        dispatch({ type: 'SET_ACTIVE_PANEL', index: nextPanel });
      }
      return;
    }

    // Panel-specific navigation
    if (activePanelIndex === 0) {
      // PLUGINS panel
      if (key.upArrow) {
        const newPos = Math.max(0, cursorPositions.plugins - 1);
        dispatch({ type: 'MOVE_CURSOR', panel: 'plugins', delta: -1 });
        if (newPos < cursorPositions.plugins) {
          dispatch({ type: 'SELECT_PLUGIN', index: newPos });
        }
      } else if (key.downArrow) {
        const newPos = Math.min(pluginsCount - 1, cursorPositions.plugins + 1);
        dispatch({ type: 'MOVE_CURSOR', panel: 'plugins', delta: 1 });
        if (newPos > cursorPositions.plugins) {
          dispatch({ type: 'SELECT_PLUGIN', index: newPos });
        }
      } else if (key.return || input === ' ') {
        dispatch({ type: 'SELECT_PLUGIN', index: cursorPositions.plugins });
      }
    } else if (activePanelIndex === 1) {
      // COMPONENTS panel
      if (key.upArrow) {
        dispatch({ type: 'MOVE_CURSOR', panel: 'components', delta: -1 });
      } else if (key.downArrow) {
        const maxCursor = Math.max(0, flatComponents.length - 1);
        if (cursorPositions.components < maxCursor) {
          dispatch({ type: 'MOVE_CURSOR', panel: 'components', delta: 1 });
        }
      } else if (key.return) {
        // Expand/collapse category on ENTER
        const currentItem = flatComponents[cursorPositions.components];
        if (currentItem?.type === 'category' && currentItem.category) {
          dispatch({ type: 'TOGGLE_CATEGORY', category: currentItem.category });
        }
      } else if (input === ' ') {
        // Toggle selection on SPACE
        const currentItem = flatComponents[cursorPositions.components];
        if (currentItem?.type === 'component') {
          dispatch({ type: 'TOGGLE_SELECTION', componentId: currentItem.id });
        }
      }
    }
  });

  return { isSearchMode };
}
