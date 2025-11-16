/**
 * Main exports for ccplugin-curator library
 */

export { normalizePlugin } from './lib/normalize';
export { reverseTransform } from './lib/reverse';
export { saveSelection, ComponentSelection, SaveOptions } from './lib/save';
export {
  discoverCommands,
  discoverAgents,
  discoverSkills,
  loadHooks,
  loadMCPs,
  expandPath,
  normalizePath,
} from './lib/discovery';
export { PluginCuratorTUI, TUIState } from './tui/app';
export { NormalizedPlugin } from './types/normalized';
export { PluginJson } from './types/plugin';
