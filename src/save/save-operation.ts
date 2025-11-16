import * as fs from 'fs';
import * as path from 'path';
import { Selection, SelectionState } from '../utils/selection-state';
import { denormalizePlugin } from '../transformation/denormalize';
import { ClaudeCodeNormalizedPlugin } from '../types/normalized';

export interface SaveOptions {
  outputDir: string;
  pluginName: string;
  overwrite?: boolean;
}

export interface SaveResult {
  success: boolean;
  outputPath: string;
  message: string;
  stats: {
    commandsCount: number;
    agentsCount: number;
    skillsCount: number;
    hooksCount: number;
    mcpsCount: number;
  };
}

/**
 * Save operation following spec: 007-save-operation-rules.md
 */
export async function saveSelection(
  selectionState: SelectionState,
  options: SaveOptions
): Promise<SaveResult> {
  // Check if there's any selection
  if (!selectionState.hasSelection()) {
    return {
      success: false,
      outputPath: '',
      message: '⚠ No hay componentes seleccionados',
      stats: {
        commandsCount: 0,
        agentsCount: 0,
        skillsCount: 0,
        hooksCount: 0,
        mcpsCount: 0
      }
    };
  }

  const outputPath = path.resolve(options.outputDir);
  const pluginName = options.pluginName;

  // Check if output directory exists
  if (fs.existsSync(outputPath) && !options.overwrite) {
    return {
      success: false,
      outputPath,
      message: 'Output directory exists. Use --overwrite to replace it.',
      stats: {
        commandsCount: 0,
        agentsCount: 0,
        skillsCount: 0,
        hooksCount: 0,
        mcpsCount: 0
      }
    };
  }

  // Create output directory structure
  const pluginOutputPath = path.join(outputPath, 'plugins', pluginName);
  const marketplacePath = path.join(outputPath, '.claude-plugin');

  // Remove existing if overwrite
  if (fs.existsSync(outputPath) && options.overwrite) {
    fs.rmSync(outputPath, { recursive: true, force: true });
  }

  // Create directories
  fs.mkdirSync(marketplacePath, { recursive: true });
  fs.mkdirSync(path.join(pluginOutputPath, '.claude-plugin'), { recursive: true });

  const selection = selectionState.getSelection();

  // Create normalized plugin representation
  const normalizedPlugin = createNormalizedFromSelection(selection, pluginName);

  // Generate official plugin.json (denormalize)
  const officialPlugin = denormalizePlugin(normalizedPlugin);

  // Copy component files
  await copyComponentFiles(selection, pluginOutputPath);

  // Write marketplace.json
  const marketplace = {
    name: `${pluginName}-marketplace`,
    owner: {
      name: 'User',
      email: '[email protected]'
    },
    plugins: [
      {
        name: pluginName,
        source: `./plugins/${pluginName}`
      }
    ]
  };

  fs.writeFileSync(
    path.join(marketplacePath, 'marketplace.json'),
    JSON.stringify(marketplace, null, 2)
  );

  // Write official plugin.json
  fs.writeFileSync(
    path.join(pluginOutputPath, '.claude-plugin/plugin.json'),
    JSON.stringify(officialPlugin, null, 2)
  );

  // Write normalized-plugin.json (for debugging)
  fs.writeFileSync(
    path.join(outputPath, 'normalized-plugin.json'),
    JSON.stringify(normalizedPlugin, null, 2)
  );

  // Generate success message
  const stats = {
    commandsCount: selection.commands.length,
    agentsCount: selection.agents.length,
    skillsCount: selection.skills.length,
    hooksCount: selection.hooks.length,
    mcpsCount: selection.mcps.length
  };

  const message = generateSuccessMessage(outputPath, pluginName, stats);

  return {
    success: true,
    outputPath,
    message,
    stats
  };
}

/**
 * Create normalized plugin from selection
 */
function createNormalizedFromSelection(
  selection: Selection,
  pluginName: string
): ClaudeCodeNormalizedPlugin {
  // Merge metadata from first selected plugin (if any)
  const firstPlugin = selection.commands[0]?.plugin ||
                     selection.agents[0]?.plugin ||
                     selection.skills[0]?.plugin ||
                     selection.hooks[0]?.plugin ||
                     selection.mcps[0]?.plugin;

  const metadata = firstPlugin || {
    name: pluginName,
    source: '',
    version: '0.0.0',
    description: '',
    author: { name: '', email: '', url: '' },
    homepage: '',
    repository: '',
    license: '',
    keywords: []
  };

  return {
    name: metadata.name, // Preserve original plugin name
    source: metadata.source,
    version: metadata.version,
    description: metadata.description,
    author: metadata.author,
    homepage: metadata.homepage,
    repository: metadata.repository,
    license: metadata.license,
    keywords: metadata.keywords,
    commands: selection.commands.map(s => s.component.path),
    agents: selection.agents.map(s => s.component.path),
    skills: selection.skills.map(s => s.component.path),
    hooks: selection.hooks.map(s => ({
      id: s.hook.id,
      event: s.hook.event as any,
      ...(s.hook.matcher && { matcher: s.hook.matcher }),
      config: s.hook.config as any
    })) as any,
    mcps: selection.mcps.map(s => ({
      id: s.mcp.id,
      name: s.mcp.name,
      config: s.mcp.config
    }))
  };
}

/**
 * Copy component files to output directory
 */
async function copyComponentFiles(selection: Selection, outputDir: string): Promise<void> {
  // Copy commands
  for (const { plugin, component } of selection.commands) {
    const sourcePath = path.join(plugin.source, component.path);
    const destPath = path.join(outputDir, component.path);
    const destDir = path.dirname(destPath);

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(sourcePath, destPath);
  }

  // Copy agents
  for (const { plugin, component } of selection.agents) {
    const sourcePath = path.join(plugin.source, component.path);
    const destPath = path.join(outputDir, component.path);
    const destDir = path.dirname(destPath);

    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(sourcePath, destPath);
  }

  // Copy skills (directories)
  for (const { plugin, component } of selection.skills) {
    const sourcePath = path.join(plugin.source, component.path);
    const destPath = path.join(outputDir, component.path);

    // Copy directory recursively
    fs.cpSync(sourcePath, destPath, { recursive: true });
  }
}

/**
 * Generate success message
 */
function generateSuccessMessage(
  outputPath: string,
  pluginName: string,
  stats: SaveResult['stats']
): string {
  return `
✓ Plugin guardado exitosamente

Archivos generados:
  • .claude-plugin/marketplace.json     (marketplace oficial)
  • plugins/${pluginName}/              (plugin con componentes)
  • normalized-plugin.json              (normalizado - para testing)

Componentes incluidos:
  • ${stats.commandsCount} commands
  • ${stats.agentsCount} agents
  • ${stats.skillsCount} skills
  • ${stats.hooksCount} hooks
  • ${stats.mcpsCount} MCPs

Ubicación: ${outputPath}

Instalación:
  /plugin marketplace add ${outputPath}
  /plugin install ${pluginName}
`;
}
