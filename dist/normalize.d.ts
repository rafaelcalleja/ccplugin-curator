/**
 * Plugin normalization implementation
 * Based on docs/spec/001-normalization-protocol.md
 */
import { PluginJson, NormalizedPlugin } from './types';
/**
 * Normalize a plugin from official Claude Code format to internal format
 *
 * Implements invariants:
 * - 001::Invariant::1: All normalized plugins MUST have all fields defined
 * - 001::Invariant::2: All array fields MUST be arrays
 * - 001::Invariant::3: All component paths MUST be relative to plugin source directory
 * - 001::Invariant::5: source field MUST be absolute path to plugin directory
 *
 * @param pluginDir - Absolute path to plugin directory
 * @param pluginJson - Optional plugin.json content (will be read from file if not provided)
 * @returns Normalized plugin with all fields defined
 */
export declare function normalize(pluginDir: string, pluginJson?: PluginJson): NormalizedPlugin;
//# sourceMappingURL=normalize.d.ts.map