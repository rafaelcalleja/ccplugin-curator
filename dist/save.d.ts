/**
 * Save operation implementation
 * Based on docs/spec/007-save-operation-rules.md
 */
import { NormalizedPlugin } from './types';
export interface SaveOptions {
    outputDir: string;
    pluginName: string;
    overwrite?: boolean;
}
export interface MarketplaceJson {
    name: string;
    owner: {
        name: string;
        email: string;
    };
    plugins: Array<{
        name: string;
        source: string;
    }>;
}
/**
 * Save curated plugin to output directory
 *
 * Implements:
 * - 007::Invariant::1: Validate normalized format before saving
 * - 007::Invariant::2: Apply transformation before saving
 * - 007::Invariant::3: Validate official format before saving
 * - 007::EdgeCase::1-6: All edge cases
 *
 * @param selections - Array of normalized plugins with selected components
 * @param options - Save options
 */
export declare function savePlugin(selections: NormalizedPlugin[], options: SaveOptions): void;
//# sourceMappingURL=save.d.ts.map