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
 * Validate selections before saving
 */
function validateSelections(curated: NormalizedPluginInternalFormat): void {
  const totalComponents =
    curated.commands.length +
    curated.agents.length +
    curated.skills.length +
    curated.hooks.length +
    curated.mcps.length;

  if (totalComponents === 0) {
    throw new Error('⚠ No hay componentes seleccionados');
  }

  // Check for duplicate paths (spec 007-save-operation-rules.md:187-191)
  const allPaths = [
    ...curated.commands,
    ...curated.agents,
    ...curated.skills,
  ];

  const pathCounts = new Map<string, number>();
  for (const p of allPaths) {
    pathCounts.set(p, (pathCounts.get(p) || 0) + 1);
  }

  const duplicates = Array.from(pathCounts.entries())
    .filter(([_, count]) => count > 1)
    .map(([path, _]) => path);

  if (duplicates.length > 0) {
    throw new Error(`⚠ Duplicate paths detected: ${duplicates.join(', ')}`);
  }
}

/**
 * Check if directory exists
 */
async function directoryExists(dir: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dir);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Copy a file from source to destination
 */
async function copyFile(sourcePath: string, destPath: string): Promise<void> {
  const destDir = path.dirname(destPath);
  await fs.mkdir(destDir, { recursive: true });
  await fs.copyFile(sourcePath, destPath);
}

/**
 * Copy a directory recursively
 */
async function copyDirectory(sourceDir: string, destDir: string): Promise<void> {
  await fs.mkdir(destDir, { recursive: true });
  await fs.cp(sourceDir, destDir, { recursive: true });
}

/**
 * Copy selected component files to output directory
 */
async function copyComponentFiles(
  plugins: NormalizedPluginInternalFormat[],
  selections: SelectionState,
  outputDir: string
): Promise<void> {
  for (const plugin of plugins) {
    const sel = selections[plugin.name];
    if (!sel) continue;

    // Copy selected commands
    for (const cmd of sel.commands) {
      const sourcePath = path.join(plugin.source, cmd);
      const destPath = path.join(outputDir, cmd);
      try {
        await copyFile(sourcePath, destPath);
      } catch (error) {
        console.error(`Warning: Could not copy command file ${cmd}:`, error);
      }
    }

    // Copy selected agents
    for (const agent of sel.agents) {
      const sourcePath = path.join(plugin.source, agent);
      const destPath = path.join(outputDir, agent);
      try {
        await copyFile(sourcePath, destPath);
      } catch (error) {
        console.error(`Warning: Could not copy agent file ${agent}:`, error);
      }
    }

    // Copy selected skills (directories)
    for (const skill of sel.skills) {
      const sourceDir = path.join(plugin.source, skill);
      const destDir = path.join(outputDir, skill);
      try {
        await copyDirectory(sourceDir, destDir);
      } catch (error) {
        console.error(`Warning: Could not copy skill directory ${skill}:`, error);
      }
    }
  }
}

/**
 * Count components in curated plugin
 */
function countComponents(curated: NormalizedPluginInternalFormat): {
  commands: number;
  agents: number;
  skills: number;
  hooks: number;
  mcps: number;
} {
  return {
    commands: curated.commands.length,
    agents: curated.agents.length,
    skills: curated.skills.length,
    hooks: curated.hooks.length,
    mcps: curated.mcps.length,
  };
}

/**
 * Generate success message
 */
export function generateSuccessMessage(
  outputDir: string,
  counts: ReturnType<typeof countComponents>,
  pluginName: string
): string {
  const messages = [
    '✓ Plugin guardado exitosamente',
    '',
    'Archivos generados:',
    '  • .claude-plugin/marketplace.json     (marketplace oficial - usar en Claude Code)',
    '  • plugins/' + pluginName + '/             (plugin con componentes - oficial - usar en Claude Code)',
    '  • normalized-plugin.json              (normalizado - para testing)',
    '',
    'Componentes incluidos:',
  ];

  if (counts.commands > 0) messages.push(`  • ${counts.commands} commands`);
  if (counts.agents > 0) messages.push(`  • ${counts.agents} agents`);
  if (counts.skills > 0) messages.push(`  • ${counts.skills} skills`);
  if (counts.hooks > 0) messages.push(`  • ${counts.hooks} hooks`);
  if (counts.mcps > 0) messages.push(`  • ${counts.mcps} MCPs`);

  messages.push('');
  messages.push(`Ubicación: ${path.resolve(outputDir)}`);
  messages.push('');
  messages.push('Instalación:');
  messages.push(`  /plugin marketplace add ${path.resolve(outputDir)}`);
  messages.push(`  /plugin install ${pluginName}`);

  return messages.join('\n');
}

/**
 * Generate marketplace.json content
 */
function generateMarketplaceJson(pluginName: string): any {
  return {
    name: 'curated-plugins',
    owner: {
      name: 'User',
      email: 'user@example.com',
    },
    plugins: [
      {
        name: pluginName,
        source: `./plugins/${pluginName}`,
      },
    ],
  };
}

/**
 * Save curated plugin with dual output (official + normalized)
 * Following spec 007-save-operation-rules.md
 *
 * @param overwriteExisting - If true, automatically overwrite existing directory.
 *                             If false and directory exists, throws error.
 *                             Default: false (prompt required)
 */
export async function saveCuratedPlugin(
  plugins: NormalizedPluginInternalFormat[],
  selections: SelectionState,
  outputPath: string,
  name: string = 'curated-plugin',
  overwriteExisting: boolean = false
): Promise<string> {
  // Build curated plugin from selections
  const curated = buildCuratedPlugin(plugins, selections, name);

  // Validate selections
  validateSelections(curated);

  // Determine output directory
  // If outputPath ends with .json, use its directory
  // Otherwise, treat it as a directory
  let outputDir: string;
  if (outputPath.endsWith('.json')) {
    outputDir = path.dirname(outputPath);
  } else {
    outputDir = outputPath;
  }

  // Check if output directory exists (spec 007-save-operation-rules.md:178-183)
  if (await directoryExists(outputDir)) {
    if (!overwriteExisting) {
      throw new Error('OUTPUT_DIR_EXISTS');
    }
    // Overwrite: delete existing directory
    await fs.rm(outputDir, { recursive: true, force: true });
  }

  // Create output directory structure according to spec 007
  // output/
  // ├── .claude-plugin/
  // │   └── marketplace.json
  // ├── plugins/
  // │   └── curated-plugin/
  // │       ├── .claude-plugin/
  // │       │   └── plugin.json
  // │       └── [components]
  // └── normalized-plugin.json

  await fs.mkdir(outputDir, { recursive: true });

  // Create marketplace structure
  const marketplaceDir = path.join(outputDir, '.claude-plugin');
  await fs.mkdir(marketplaceDir, { recursive: true });

  // Create plugin directory
  const pluginDir = path.join(outputDir, 'plugins', name);
  const pluginClaudeDir = path.join(pluginDir, '.claude-plugin');
  await fs.mkdir(pluginClaudeDir, { recursive: true });

  // Transform to official format
  const official = reverseTransform(curated);

  // Write marketplace.json
  const marketplacePath = path.join(marketplaceDir, 'marketplace.json');
  const marketplaceContent = JSON.stringify(generateMarketplaceJson(name), null, 2);
  await fs.writeFile(marketplacePath, marketplaceContent, 'utf-8');

  // Write official format (plugins/curated-plugin/.claude-plugin/plugin.json)
  const officialPath = path.join(pluginClaudeDir, 'plugin.json');
  const officialContent = JSON.stringify(official, null, 2);
  await fs.writeFile(officialPath, officialContent, 'utf-8');

  // Write normalized format (normalized-plugin.json at root)
  const normalizedPath = path.join(outputDir, 'normalized-plugin.json');
  const normalizedContent = JSON.stringify(curated, null, 2);
  await fs.writeFile(normalizedPath, normalizedContent, 'utf-8');

  // Copy component files to plugins/curated-plugin/
  await copyComponentFiles(plugins, selections, pluginDir);

  // Generate and return success message
  const counts = countComponents(curated);
  return generateSuccessMessage(outputDir, counts, name);
}
