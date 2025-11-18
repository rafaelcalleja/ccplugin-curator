/**
 * TUI State Types
 * Implements: docs/spec/003-tui-visual-spec.md (State Management section)
 */

import type { NormalizedPlugin, Hook, Mcp } from '../../types/normalized';

export interface TUIState {
  // Loaded plugins
  plugins: NormalizedPlugin[];

  // Currently selected plugin index
  selectedPluginIndex: number;

  // Active panel (0 = PLUGINS, 1 = COMPONENTS, 2 = PREVIEW)
  activePanelIndex: number;

  // Component selection state (componentId -> selected)
  selection: Map<string, boolean>;

  // Cursor positions per panel
  cursorPositions: {
    plugins: number;
    components: number;
    preview: number;
  };

  // Expanded categories in components tree
  expandedCategories: Set<string>;

  // Output directory for save operation
  outputDir: string;

  // Search/filter query
  searchQuery: string;
}

export interface ComponentTreeNode {
  id: string;
  type: 'category' | 'component';
  label: string;
  category?: string;
  path?: string;
  pluginName?: string;
  componentType?: 'command' | 'agent' | 'skill' | 'hook' | 'mcp';
  componentData?: string | Hook | Mcp;
  children?: ComponentTreeNode[];
}

export type TUIAction =
  | { type: 'SELECT_PLUGIN'; index: number }
  | { type: 'SET_ACTIVE_PANEL'; index: number }
  | { type: 'TOGGLE_SELECTION'; componentId: string }
  | { type: 'TOGGLE_CATEGORY'; category: string }
  | { type: 'MOVE_CURSOR'; panel: 'plugins' | 'components' | 'preview'; delta: number }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'SET_OUTPUT_DIR'; dir: string }
  | { type: 'SET_SEARCH_QUERY'; query: string };
