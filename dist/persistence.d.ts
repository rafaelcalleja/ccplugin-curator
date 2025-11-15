import type { ComponentSelection } from './types/index.js';
/**
 * Save curated plugin selections
 * Generates a plugin.json with selected components
 */
export declare function saveCuratedPlugin(selections: ComponentSelection[], outputDir?: string): Promise<string>;
/**
 * Save individual plugin selections to separate plugin.json files
 * Useful for creating separate plugins per source
 */
export declare function saveCuratedPlugins(selections: ComponentSelection[], outputDir?: string): Promise<string[]>;
//# sourceMappingURL=persistence.d.ts.map