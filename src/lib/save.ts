import fs from 'fs/promises';
import path from 'path';
import { NormalizedPluginInternalFormat } from '../types/normalized';
import { SelectionState } from '../components/App';
import { reverseTransform } from './reverse-transform';

/**
 * Build a curated plugin from selections
 */
export function buildCuratedPlugin(
  plugins: NormalizedPluginInternalFormat[],
  selections: SelectionState,
  name: string = 'curated-plugin'
): NormalizedPluginInternalFormat {
  const curated: NormalizedPluginInternalFormat = {
    name,
    source: '',
    version: '0.0.0',
    description: '',
    author: { name: '', email: '', url: '' },
    homepage: '',
    repository: '',
    license: '',
    keywords: [],
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcps: [],
  };

  for (const plugin of plugins) {
    const sel = selections[plugin.name];
    if (!sel) continue;

    // Add selected commands
    sel.commands.forEach((cmd) => {
      curated.commands.push(cmd);
    });

    // Add selected agents
    sel.agents.forEach((agent) => {
      curated.agents.push(agent);
    });

    // Add selected skills
    sel.skills.forEach((skill) => {
      curated.skills.push(skill);
    });

    // Add selected hooks
    sel.hooks.forEach((idx) => {
      const hook = plugin.hooks[idx];
      if (hook) {
        curated.hooks.push(hook);
      }
    });

    // Add selected MCPs
    sel.mcps.forEach((idx) => {
      const mcp = plugin.mcps[idx];
      if (mcp) {
        curated.mcps.push(mcp);
      }
    });
  }

  return curated;
}

/**
 * Save curated plugin to a file
 */
export async function saveCuratedPlugin(
  plugins: NormalizedPluginInternalFormat[],
  selections: SelectionState,
  outputPath: string,
  name: string = 'curated-plugin'
): Promise<void> {
  // Build curated plugin from selections
  const curated = buildCuratedPlugin(plugins, selections, name);

  // Transform back to official format
  const official = reverseTransform(curated);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  // Write to file
  const content = JSON.stringify(official, null, 2);
  await fs.writeFile(outputPath, content, 'utf-8');
}
