import * as path from 'path';
import * as fs from 'fs/promises';
import { NormalizedPlugin } from '../types/normalized';
import { reverseTransform } from './reverse';

export interface ComponentSelection {
  commands: string[];
  agents: string[];
  skills: string[];
  hooks: any[];
  mcps: any[];
}

export interface SaveOptions {
  outputDir: string;
  pluginName: string;
  marketplaceName?: string;
  marketplaceOwner?: { name: string; email: string };
}

/**
 * Save selected components to output directory
 *
 * Generates:
 * 1. .claude-plugin/marketplace.json
 * 2. plugins/<pluginName>/.claude-plugin/plugin.json (official format)
 * 3. normalized-plugin.json (for debugging)
 *
 * Based on docs/spec/007-save-operation-rules.md
 */
export async function saveSelection(
  plugins: NormalizedPlugin[],
  selections: Map<string, ComponentSelection>,
  options: SaveOptions
): Promise<void> {
  const { outputDir, pluginName } = options;

  // 1. Validate selection is not empty
  if (!hasAnySelection(selections)) {
    throw new Error('No components selected');
  }

  // 2. Merge selections from all plugins
  const merged = mergeSelections(plugins, selections);

  // 3. Create output directory structure
  await createOutputStructure(outputDir, pluginName);

  // 4. Copy component files
  await copyComponentFiles(plugins, selections, outputDir, pluginName);

  // 5. Generate normalized format (for debugging)
  const normalizedPath = path.join(outputDir, 'normalized-plugin.json');
  await fs.writeFile(normalizedPath, JSON.stringify(merged, null, 2));

  // 6. Generate official plugin.json
  const official = reverseTransform(merged);
  const pluginJsonPath = path.join(outputDir, 'plugins', pluginName, '.claude-plugin/plugin.json');
  await fs.writeFile(pluginJsonPath, JSON.stringify(official, null, 2));

  // 7. Generate marketplace.json
  const marketplace = generateMarketplace(options);
  const marketplacePath = path.join(outputDir, '.claude-plugin/marketplace.json');
  await fs.writeFile(marketplacePath, JSON.stringify(marketplace, null, 2));
}

/**
 * Check if there is any selection
 */
function hasAnySelection(selections: Map<string, ComponentSelection>): boolean {
  for (const selection of selections.values()) {
    if (
      selection.commands.length > 0 ||
      selection.agents.length > 0 ||
      selection.skills.length > 0 ||
      selection.hooks.length > 0 ||
      selection.mcps.length > 0
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Merge selections from all plugins into a single normalized plugin
 * Handles conflicts with namespace prefixing
 */
function mergeSelections(
  plugins: NormalizedPlugin[],
  selections: Map<string, ComponentSelection>
): NormalizedPlugin {
  const merged: NormalizedPlugin = {
    name: 'curated-plugin',
    source: '',
    version: '0.0.9',
    description: 'Curated plugin from multiple sources',
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

  const commandNames = new Map<string, string[]>(); // filename -> [plugin names]
  const agentNames = new Map<string, string[]>();
  const skillNames = new Map<string, string[]>();
  const mcpNames = new Map<string, string[]>();

  // First pass: detect conflicts
  for (const plugin of plugins) {
    const selection = selections.get(plugin.name);
    if (!selection) continue;

    for (const cmd of selection.commands) {
      const filename = path.basename(cmd);
      if (!commandNames.has(filename)) commandNames.set(filename, []);
      commandNames.get(filename)!.push(plugin.name);
    }

    for (const agent of selection.agents) {
      const filename = path.basename(agent);
      if (!agentNames.has(filename)) agentNames.set(filename, []);
      agentNames.get(filename)!.push(plugin.name);
    }

    for (const skill of selection.skills) {
      const dirname = path.basename(skill);
      if (!skillNames.has(dirname)) skillNames.set(dirname, []);
      skillNames.get(dirname)!.push(plugin.name);
    }

    for (const mcp of selection.mcps) {
      const name = mcp.name;
      if (!mcpNames.has(name)) mcpNames.set(name, []);
      mcpNames.get(name)!.push(plugin.name);
    }
  }

  // Second pass: merge with namespace prefixing where needed
  for (const plugin of plugins) {
    const selection = selections.get(plugin.name);
    if (!selection) continue;

    // Merge commands
    for (const cmd of selection.commands) {
      const filename = path.basename(cmd);
      const hasConflict = commandNames.get(filename)!.length > 1;
      const newPath = hasConflict
        ? path.join(path.dirname(cmd), `${plugin.name}--${filename}`)
        : cmd;
      merged.commands.push(newPath);
    }

    // Merge agents
    for (const agent of selection.agents) {
      const filename = path.basename(agent);
      const hasConflict = agentNames.get(filename)!.length > 1;
      const newPath = hasConflict
        ? path.join(path.dirname(agent), `${plugin.name}--${filename}`)
        : agent;
      merged.agents.push(newPath);
    }

    // Merge skills
    for (const skill of selection.skills) {
      const dirname = path.basename(skill);
      const hasConflict = skillNames.get(dirname)!.length > 1;
      const newPath = hasConflict
        ? path.join(path.dirname(skill), `${plugin.name}--${dirname}`)
        : skill;
      merged.skills.push(newPath);
    }

    // Merge hooks (no namespace prefix, merge is valid)
    merged.hooks.push(...selection.hooks);

    // Merge MCPs (namespace prefix on name)
    for (const mcp of selection.mcps) {
      const hasConflict = mcpNames.get(mcp.name)!.length > 1;
      const newMcp = hasConflict
        ? { ...mcp, name: `${plugin.name}--${mcp.name}` }
        : mcp;
      merged.mcps.push(newMcp);
    }
  }

  return merged;
}

/**
 * Create output directory structure
 */
async function createOutputStructure(outputDir: string, pluginName: string): Promise<void> {
  const dirs = [
    outputDir,
    path.join(outputDir, '.claude-plugin'),
    path.join(outputDir, 'plugins'),
    path.join(outputDir, 'plugins', pluginName),
    path.join(outputDir, 'plugins', pluginName, '.claude-plugin'),
    path.join(outputDir, 'plugins', pluginName, 'commands'),
    path.join(outputDir, 'plugins', pluginName, 'agents'),
    path.join(outputDir, 'plugins', pluginName, 'skills'),
  ];

  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Copy component files to output directory
 */
async function copyComponentFiles(
  plugins: NormalizedPlugin[],
  selections: Map<string, ComponentSelection>,
  outputDir: string,
  pluginName: string
): Promise<void> {
  const commandNames = new Map<string, string[]>();
  const agentNames = new Map<string, string[]>();
  const skillNames = new Map<string, string[]>();

  // Detect conflicts (same logic as mergeSelections)
  for (const plugin of plugins) {
    const selection = selections.get(plugin.name);
    if (!selection) continue;

    for (const cmd of selection.commands) {
      const filename = path.basename(cmd);
      if (!commandNames.has(filename)) commandNames.set(filename, []);
      commandNames.get(filename)!.push(plugin.name);
    }

    for (const agent of selection.agents) {
      const filename = path.basename(agent);
      if (!agentNames.has(filename)) agentNames.set(filename, []);
      agentNames.get(filename)!.push(plugin.name);
    }

    for (const skill of selection.skills) {
      const dirname = path.basename(skill);
      if (!skillNames.has(dirname)) skillNames.set(dirname, []);
      skillNames.get(dirname)!.push(plugin.name);
    }
  }

  // Copy files with conflict resolution
  for (const plugin of plugins) {
    const selection = selections.get(plugin.name);
    if (!selection) continue;

    // Copy commands
    for (const cmd of selection.commands) {
      const sourcePath = path.join(plugin.source, cmd);
      const filename = path.basename(cmd);
      const hasConflict = commandNames.get(filename)!.length > 1;
      const destFilename = hasConflict ? `${plugin.name}--${filename}` : filename;
      const destPath = path.join(outputDir, 'plugins', pluginName, 'commands', destFilename);
      await fs.copyFile(sourcePath, destPath);
    }

    // Copy agents
    for (const agent of selection.agents) {
      const sourcePath = path.join(plugin.source, agent);
      const filename = path.basename(agent);
      const hasConflict = agentNames.get(filename)!.length > 1;
      const destFilename = hasConflict ? `${plugin.name}--${filename}` : filename;
      const destPath = path.join(outputDir, 'plugins', pluginName, 'agents', destFilename);
      await fs.copyFile(sourcePath, destPath);
    }

    // Copy skills (directories)
    for (const skill of selection.skills) {
      const sourcePath = path.join(plugin.source, skill);
      const dirname = path.basename(skill);
      const hasConflict = skillNames.get(dirname)!.length > 1;
      const destDirname = hasConflict ? `${plugin.name}--${dirname}` : dirname;
      const destPath = path.join(outputDir, 'plugins', pluginName, 'skills', destDirname);
      await fs.cp(sourcePath, destPath, { recursive: true });
    }
  }
}

/**
 * Generate marketplace.json
 */
function generateMarketplace(options: SaveOptions): any {
  return {
    name: options.marketplaceName || 'curated-plugins',
    owner: options.marketplaceOwner || { name: 'User', email: 'user@example.com' },
    plugins: [
      {
        name: options.pluginName,
        source: `./plugins/${options.pluginName}`,
      },
    ],
  };
}
