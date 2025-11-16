/**
 * Reverse transformation implementation (Normalized → Official)
 * Based on docs/spec/006-reverse-transformation-rules.md
 */
import { NormalizedPlugin, PluginJson } from './types';
/**
 * Transform a normalized plugin back to official Claude Code format
 *
 * Implements:
 * - 006::Invariant::1: Minimalism - omit defaults
 * - 006::Invariant::2: Valid Claude Code plugin format
 * - 006::Invariant::6: Always output arrays with ./ prefix
 * - 006::Invariant::7: NEVER include source field
 *
 * @param normalized - Normalized plugin format
 * @returns Official plugin.json format
 */
export declare function reverseTransform(normalized: NormalizedPlugin): PluginJson;
//# sourceMappingURL=reverse-transform.d.ts.map