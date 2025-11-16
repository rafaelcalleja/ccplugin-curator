/**
 * Save operation - implements dual output generation
 * Based on 007-save-operation-rules.md
 */

import { mkdir, writeFile, copyFile, cp } from 'fs/promises';
import { join, dirname, basename } from 'path';
import type { NormalizedPluginFormat } from '../types/normalized.js';
import { officialize } from '../transform/officialize.js';

interface Selection {
  [pluginName: string]: {
    commands: Set<string>;
    agents: Set<string>;
    skills: Set<string>;
    hooks: Set<number>;
    mcps: Set<number>;
  };
}

/**
 * Save the selection to output directory
 */
export async function saveSelection(
  plugins: NormalizedPluginFormat[],
  selection: Selection
): Promise<void> {
  const outputDir = join(process.cwd(), 'output/curated-plugin');

  // Build normalized plugin from selection
  const normalizedPlugin = buildNormalizedFromSelection(plugins, selection);

  // Check if selection is empty
  const isEmpty =
    normalizedPlugin.commands.length === 0 &&
    normalizedPlugin.agents.length === 0 &&
    normalizedPlugin.skills.length === 0 &&
    normalizedPlugin.hooks.length === 0 &&
    normalizedPlugin.mcps.length === 0;

  if (isEmpty) {
    console.log('⚠ No hay componentes seleccionados');
    return;
  }

  // Create output directories
  await mkdir(join(outputDir, '.claude-plugin'), { recursive: true });
  await mkdir(join(outputDir, 'plugins/curated-plugin/.claude-plugin'), {
    recursive: true,
  });

  // 1. Generate marketplace.json
  const marketplace = {
    name: 'curated-plugins',
    owner: {
      name: 'User',
      email: 'user@example.com',
    },
    plugins: [
      {
        name: 'curated-plugin',
        source: './plugins/curated-plugin',
      },
    ],
  };

  await writeFile(
    join(outputDir, '.claude-plugin/marketplace.json'),
    JSON.stringify(marketplace, null, 2)
  );

  // 2. Generate official plugin.json
  const officialPlugin = officialize(normalizedPlugin);
  await writeFile(
    join(outputDir, 'plugins/curated-plugin/.claude-plugin/plugin.json'),
    JSON.stringify(officialPlugin, null, 2)
  );

  // 3. Generate normalized-plugin.json (for debugging)
  await writeFile(
    join(outputDir, 'normalized-plugin.json'),
    JSON.stringify(normalizedPlugin, null, 2)
  );

  // 4. Copy component files
  await copyComponentFiles(
    plugins,
    selection,
    join(outputDir, 'plugins/curated-plugin')
  );

  // 5. Show success message
  console.log('✓ Plugin guardado exitosamente');
  console.log();
  console.log('Archivos generados:');
  console.log('  • .claude-plugin/marketplace.json');
  console.log('  • plugins/curated-plugin/');
  console.log('  • normalized-plugin.json');
  console.log();
  console.log('Ubicación:', outputDir);
  console.log();
  console.log('Instalación:');
  console.log(`  /plugin marketplace add ${outputDir}`);
  console.log('  /plugin install curated-plugin');
}

/**
 * Build normalized plugin from selection
 */
function buildNormalizedFromSelection(
  plugins: NormalizedPluginFormat[],
  selection: Selection
): NormalizedPluginFormat {
  const result: NormalizedPluginFormat = {
    name: 'curated-plugin',
    source: join(process.cwd(), 'output/curated-plugin/plugins/curated-plugin'),
    version: '0.0.0',
    description: 'Curated plugin components',
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
    const sel = selection[plugin.name];
    if (!sel) continue;

    // Add selected commands
    result.commands.push(...Array.from(sel.commands));

    // Add selected agents
    result.agents.push(...Array.from(sel.agents));

    // Add selected skills
    result.skills.push(...Array.from(sel.skills));

    // Add selected hooks
    for (const hookIndex of sel.hooks) {
      const hook = plugin.hooks[hookIndex];
      if (hook) {
        result.hooks.push(hook);
      }
    }

    // Add selected MCPs
    for (const mcpIndex of sel.mcps) {
      const mcp = plugin.mcps[mcpIndex];
      if (mcp) {
        result.mcps.push(mcp);
      }
    }
  }

  return result;
}

/**
 * Copy component files to output directory
 */
async function copyComponentFiles(
  plugins: NormalizedPluginFormat[],
  selection: Selection,
  outputDir: string
): Promise<void> {
  for (const plugin of plugins) {
    const sel = selection[plugin.name];
    if (!sel) continue;

    // Copy commands
    for (const cmd of sel.commands) {
      const srcPath = join(plugin.source, cmd);
      const destPath = join(outputDir, cmd);
      await mkdir(dirname(destPath), { recursive: true });
      await copyFile(srcPath, destPath);
    }

    // Copy agents
    for (const agent of sel.agents) {
      const srcPath = join(plugin.source, agent);
      const destPath = join(outputDir, agent);
      await mkdir(dirname(destPath), { recursive: true });
      await copyFile(srcPath, destPath);
    }

    // Copy skills (directories)
    for (const skill of sel.skills) {
      const srcPath = join(plugin.source, skill);
      const destPath = join(outputDir, skill);
      await cp(srcPath, destPath, { recursive: true });
    }
  }
}
