import type { NormalizedPlugin } from '../types/normalized';
export interface TuiState {
    plugins: NormalizedPlugin[];
    selections: Map<string, PluginSelection>;
    focus: {
        panel: 'plugins' | 'components' | 'preview';
        pluginIndex: number;
        componentIndex: number;
    };
}
export interface PluginSelection {
    pluginName: string;
    commands: Set<string>;
    agents: Set<string>;
    skills: Set<string>;
    hooks: Set<number>;
    mcps: Set<number>;
}
/**
 * Creates initial empty state
 */
export declare function createState(plugins: NormalizedPlugin[]): TuiState;
/**
 * Toggles selection of a command
 */
export declare function toggleCommand(state: TuiState, pluginName: string, command: string): void;
/**
 * Toggles selection of an agent
 */
export declare function toggleAgent(state: TuiState, pluginName: string, agent: string): void;
/**
 * Toggles selection of a skill
 */
export declare function toggleSkill(state: TuiState, pluginName: string, skill: string): void;
/**
 * Toggles selection of a hook
 */
export declare function toggleHook(state: TuiState, pluginName: string, hookIndex: number): void;
/**
 * Toggles selection of an MCP
 */
export declare function toggleMcp(state: TuiState, pluginName: string, mcpIndex: number): void;
/**
 * Selects all components for a plugin
 */
export declare function selectAll(state: TuiState, pluginName: string): void;
/**
 * Deselects all components for a plugin
 */
export declare function deselectAll(state: TuiState, pluginName: string): void;
/**
 * Generates preview JSON from current selections
 */
export declare function generatePreview(state: TuiState): any;
/**
 * Gets total count of selected components across all plugins
 */
export declare function getSelectionCount(state: TuiState): number;
//# sourceMappingURL=state.d.ts.map