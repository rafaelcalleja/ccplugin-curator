// Main exports for programmatic usage
export { scanAndNormalizePlugins, normalizePlugin } from './lib/normalize';
export { reverseTransform, mergeNormalizedPlugins } from './lib/reverse-transform';
export { saveCuratedPlugin, buildCuratedPlugin } from './lib/save';
export {
  discoverCommands,
  discoverAgents,
  discoverSkills,
  discoverHooks,
  discoverMcpServers,
} from './lib/auto-discovery';

// Type exports
export type { NormalizedPluginInternalFormat } from './types/normalized';
export type { SelectionState } from './components/App';
