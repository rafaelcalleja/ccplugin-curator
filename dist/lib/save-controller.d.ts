import type { NormalizedPlugin } from '../types/normalized';
export interface SaveConfig {
    marketplaceName: string;
    pluginName: string;
    outputDirectory: string;
    authorEmail?: string;
}
export interface Selection {
    plugins: SelectionPlugin[];
}
export interface SelectionPlugin {
    normalized: NormalizedPlugin;
    commands: string[];
    agents: string[];
    skills: string[];
    hooks: any[];
    mcps: any[];
}
export interface SaveResult {
    success: boolean;
    outputPath?: string;
    errors?: string[];
    stats?: {
        commands: number;
        agents: number;
        skills: number;
        hooks: number;
        mcps: number;
    };
}
/**
 * Saves the curated plugin selection to disk
 * @param selection User's component selections
 * @param config Save configuration
 * @returns Save result
 */
export declare function save(selection: Selection, config: SaveConfig): Promise<SaveResult>;
//# sourceMappingURL=save-controller.d.ts.map