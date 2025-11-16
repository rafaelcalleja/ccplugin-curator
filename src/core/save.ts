/**
 * Save Operation Module
 * Handles saving curated plugin selection
 * Implements: docs/spec/007-save-operation-rules.md
 */

import * as fs from 'fs';
import * as path from 'path';
import type { NormalizedPlugin } from '../types/normalized';
import { denormalizePlugin } from './denormalize';

export interface SaveOptions {
  outputDir: string;
  pluginName?: string;
  overwrite?: boolean;
}

export interface SaveResult {
  success: boolean;
  message: string;
  paths?: {
    marketplace: string;
    plugin: string;
    normalized: string;
    outputDir: string;
  };
  counts?: {
    commands: number;
    agents: number;
    skills: number;
    hooks: number;
    mcps: number;
  };
}

/**
 * Save curated plugin selection
 */
export async function saveSelection(
  selection: NormalizedPlugin,
  options: SaveOptions
): Promise<SaveResult> {
  // Validate selection is non-empty
  const isEmpty = isEmptySelection(selection);
  if (isEmpty) {
    return {
      success: false,
      message: '⚠ No hay componentes seleccionados',
    };
  }

  const pluginName = options.pluginName || 'curated-plugin';
  const outputDir = path.resolve(options.outputDir);
  const pluginDir = path.join(outputDir, 'plugins', pluginName);
  const pluginConfigDir = path.join(pluginDir, '.claude-plugin');
  const marketplaceDir = path.join(outputDir, '.claude-plugin');

  // Check if output directory exists
  if (fs.existsSync(outputDir) && !options.overwrite) {
    return {
      success: false,
      message: `Output directory exists: ${outputDir}\nUse overwrite option to replace.`,
    };
  }

  // Create output directories
  fs.mkdirSync(pluginConfigDir, { recursive: true });
  fs.mkdirSync(marketplaceDir, { recursive: true });

  // Copy component files
  await copyComponents(selection, pluginDir);

  // Apply reverse transformation
  const officialFormat = denormalizePlugin(selection);

  // Generate marketplace.json
  const marketplace = generateMarketplace(pluginName);
  const marketplacePath = path.join(marketplaceDir, 'marketplace.json');
  fs.writeFileSync(marketplacePath, JSON.stringify(marketplace, null, 2));

  // Generate plugin.json (official format)
  const pluginJsonPath = path.join(pluginConfigDir, 'plugin.json');
  fs.writeFileSync(pluginJsonPath, JSON.stringify(officialFormat, null, 2));

  // Generate normalized-plugin.json (for debugging)
  const normalizedPath = path.join(outputDir, 'normalized-plugin.json');
  fs.writeFileSync(normalizedPath, JSON.stringify(selection, null, 2));

  // Calculate counts
  const counts = {
    commands: selection.commands.length,
    agents: selection.agents.length,
    skills: selection.skills.length,
    hooks: selection.hooks.length,
    mcps: selection.mcps.length,
  };

  return {
    success: true,
    message: generateSuccessMessage(outputDir, counts),
    paths: {
      marketplace: marketplacePath,
      plugin: pluginJsonPath,
      normalized: normalizedPath,
      outputDir,
    },
    counts,
  };
}

/**
 * Check if selection is empty
 */
function isEmptySelection(selection: NormalizedPlugin): boolean {
  return (
    selection.commands.length === 0 &&
    selection.agents.length === 0 &&
    selection.skills.length === 0 &&
    selection.hooks.length === 0 &&
    selection.mcps.length === 0
  );
}

/**
 * Copy component files to output directory
 */
async function copyComponents(
  selection: NormalizedPlugin,
  outputDir: string
): Promise<void> {
  // Copy commands
  for (const cmdPath of selection.commands) {
    const srcPath = path.join(selection.source, cmdPath);
    const destPath = path.join(outputDir, cmdPath);
    copyFile(srcPath, destPath);
  }

  // Copy agents
  for (const agentPath of selection.agents) {
    const srcPath = path.join(selection.source, agentPath);
    const destPath = path.join(outputDir, agentPath);
    copyFile(srcPath, destPath);
  }

  // Copy skills (directories)
  for (const skillPath of selection.skills) {
    const srcPath = path.join(selection.source, skillPath);
    const destPath = path.join(outputDir, skillPath);
    copyDirectory(srcPath, destPath);
  }
}

/**
 * Copy a single file
 */
function copyFile(src: string, dest: string): void {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

/**
 * Copy a directory recursively
 */
function copyDirectory(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Generate marketplace.json
 */
function generateMarketplace(pluginName: string) {
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
 * Generate success message
 */
function generateSuccessMessage(
  outputDir: string,
  counts: {
    commands: number;
    agents: number;
    skills: number;
    hooks: number;
    mcps: number;
  }
): string {
  return `
✓ Plugin guardado exitosamente

Archivos generados:
  • .claude-plugin/marketplace.json     (marketplace oficial - usar en Claude Code)
  • plugins/curated-plugin/             (plugin con componentes - oficial)
  • normalized-plugin.json              (normalizado - para testing)

Componentes incluidos:
  • ${counts.commands} commands
  • ${counts.agents} agents
  • ${counts.skills} skills
  • ${counts.hooks} hooks
  • ${counts.mcps} MCPs

Ubicación: ${outputDir}

Instalación:
  /plugin marketplace add ${outputDir}
  /plugin install curated-plugin
`.trim();
}

/**
 * Merge selections from multiple plugins
 * Handles conflicts with namespace prefixes
 * Implements: docs/spec/007-save-operation-rules.md sections 7.3-7.6
 */
export function mergeSelections(selections: NormalizedPlugin[]): NormalizedPlugin {
  if (selections.length === 0) {
    throw new Error('No selections to merge');
  }

  if (selections.length === 1) {
    return selections[0];
  }

  // Start with first selection as base
  const merged: NormalizedPlugin = {
    ...selections[0],
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcps: [],
  };

  // PASS 1: Count occurrences to detect conflicts
  const commandNames = new Map<string, number>();
  const agentNames = new Map<string, number>();
  const skillNames = new Map<string, number>();
  const mcpNames = new Map<string, number>();

  for (const selection of selections) {
    for (const cmdPath of selection.commands) {
      const fileName = path.basename(cmdPath);
      commandNames.set(fileName, (commandNames.get(fileName) || 0) + 1);
    }

    for (const agentPath of selection.agents) {
      const fileName = path.basename(agentPath);
      agentNames.set(fileName, (agentNames.get(fileName) || 0) + 1);
    }

    for (const skillPath of selection.skills) {
      const skillName = path.basename(skillPath);
      skillNames.set(skillName, (skillNames.get(skillName) || 0) + 1);
    }

    for (const mcp of selection.mcps) {
      mcpNames.set(mcp.name, (mcpNames.get(mcp.name) || 0) + 1);
    }
  }

  // PASS 2: Apply namespace prefixes to ALL items with conflicts (count > 1)

  // Merge commands with conflict resolution
  for (const selection of selections) {
    for (const cmdPath of selection.commands) {
      const fileName = path.basename(cmdPath);
      const hasConflict = (commandNames.get(fileName) || 0) > 1;

      const newPath = hasConflict
        ? path.join(path.dirname(cmdPath), `${selection.name}--${fileName}`)
        : cmdPath;

      merged.commands.push(newPath);
    }
  }

  // Merge agents with conflict resolution
  for (const selection of selections) {
    for (const agentPath of selection.agents) {
      const fileName = path.basename(agentPath);
      const hasConflict = (agentNames.get(fileName) || 0) > 1;

      const newPath = hasConflict
        ? path.join(path.dirname(agentPath), `${selection.name}--${fileName}`)
        : agentPath;

      merged.agents.push(newPath);
    }
  }

  // Merge skills with conflict resolution
  for (const selection of selections) {
    for (const skillPath of selection.skills) {
      const skillName = path.basename(skillPath);
      const hasConflict = (skillNames.get(skillName) || 0) > 1;

      const newPath = hasConflict
        ? path.join(path.dirname(skillPath), `${selection.name}--${skillName}`)
        : skillPath;

      merged.skills.push(newPath);
    }
  }

  // Merge hooks (same event → merge into hooks array)
  // No conflicts - hooks with same event are merged
  for (const selection of selections) {
    merged.hooks.push(...selection.hooks);
  }

  // Merge MCPs with conflict resolution
  for (const selection of selections) {
    for (const mcp of selection.mcps) {
      const hasConflict = (mcpNames.get(mcp.name) || 0) > 1;

      const newMcp = hasConflict
        ? { ...mcp, name: `${selection.name}--${mcp.name}` }
        : mcp;

      merged.mcps.push(newMcp);
    }
  }

  return merged;
}
