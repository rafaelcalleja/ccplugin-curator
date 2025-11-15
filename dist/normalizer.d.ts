import type { PluginJson, NormalizedPlugin } from './types/index.js';
/**
 * Normalize a plugin to internal format
 * Implements transformation rules from spec 001-normalization-protocol.md
 */
export declare function normalizePlugin(pluginJson: PluginJson, sourceDir: string): Promise<NormalizedPlugin>;
//# sourceMappingURL=normalizer.d.ts.map