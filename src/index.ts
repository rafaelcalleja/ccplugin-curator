// Main exports
export { scanPlugins, loadPlugin } from './scanner/plugin-scanner';
export { normalizePlugin } from './transformation/normalize';
export { denormalizePlugin } from './transformation/denormalize';
export { saveSelection } from './save/save-operation';
export { SelectionState } from './utils/selection-state';
export { PluginCuratorTUI } from './tui';

// Type exports
export type { ClaudeCodePluginManifest } from './types/plugin';
export type { ClaudeCodeNormalizedPlugin } from './types/normalized';
export type { PluginComponents, ComponentItem, HookItem, McpItem } from './scanner/plugin-scanner';
export type { Selection } from './utils/selection-state';
export type { SaveOptions, SaveResult } from './save/save-operation';
