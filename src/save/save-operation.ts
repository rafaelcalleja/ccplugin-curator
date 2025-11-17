/**
 * Save operation - implements dual output generation
 * Based on 007-save-operation-rules.md
 */

import { mkdir, writeFile, copyFile, cp, rm, access } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { confirm } from '@inquirer/prompts';
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

  // Check if output directory exists (spec 007 lines 176-183)
  try {
    await access(outputDir);
    // Directory exists, ask for confirmation
    const shouldOverwrite = await confirm({
      message: 'Output directory exists. Overwrite?',
      default: true,
    });

    if (!shouldOverwrite) {
      console.log('Operation cancelled');
      return;
    }

    // Delete existing directory
    await rm(outputDir, { recursive: true, force: true });
  } catch {
    // Directory doesn't exist, continue
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

  // 5. Show success message (spec 007 lines 283-303)
  console.log('✓ Plugin guardado exitosamente');
  console.log();
  console.log('Archivos generados:');
  console.log('  • .claude-plugin/marketplace.json     (marketplace oficial - usar en Claude Code)');
  console.log('  • plugins/curated-plugin/             (plugin con componentes - oficial - usar en Claude Code)');
  console.log('  • normalized-plugin.json              (normalizado - para testing)');
  console.log();
  console.log('Componentes incluidos:');
  console.log(`  • ${normalizedPlugin.commands.length} commands`);
  console.log(`  • ${normalizedPlugin.agents.length} agents`);
  console.log(`  • ${normalizedPlugin.skills.length} skills`);
  console.log(`  • ${normalizedPlugin.hooks.length} hooks`);
  console.log(`  • ${normalizedPlugin.mcps.length} MCPs`);
  console.log();
  console.log('Ubicación:', outputDir);
  console.log();
  console.log('Instalación:');
  console.log(`  /plugin marketplace add ${outputDir}`);
  console.log('  /plugin install curated-plugin');
}

/**
 * Build normalized plugin from selection with conflict resolution
 * Implements namespace prefix for conflicting names (007 spec lines 186-206)
 * Implements hooks merging for same event (007 spec lines 231-255)
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

  // Track conflicts for namespace prefix
  const commandCounts = new Map<string, number>();
  const agentCounts = new Map<string, number>();
  const skillCounts = new Map<string, number>();
  const mcpCounts = new Map<string, number>();

  // First pass: count duplicates
  for (const plugin of plugins) {
    const sel = selection[plugin.name];
    if (!sel) continue;

    for (const cmd of sel.commands) {
      commandCounts.set(cmd, (commandCounts.get(cmd) || 0) + 1);
    }
    for (const agent of sel.agents) {
      agentCounts.set(agent, (agentCounts.get(agent) || 0) + 1);
    }
    for (const skill of sel.skills) {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    }
    for (const mcpIndex of sel.mcps) {
      const mcp = plugin.mcps[mcpIndex];
      if (mcp) {
        mcpCounts.set(mcp.name, (mcpCounts.get(mcp.name) || 0) + 1);
      }
    }
  }

  // Second pass: add with namespace prefix if conflict
  for (const plugin of plugins) {
    const sel = selection[plugin.name];
    if (!sel) continue;

    // Commands with conflict resolution
    for (const cmd of sel.commands) {
      const hasConflict = commandCounts.get(cmd)! > 1;
      const finalPath = hasConflict ? `${plugin.name}--${cmd}` : cmd;
      result.commands.push(finalPath);
    }

    // Agents with conflict resolution
    for (const agent of sel.agents) {
      const hasConflict = agentCounts.get(agent)! > 1;
      const finalPath = hasConflict ? `${plugin.name}--${agent}` : agent;
      result.agents.push(finalPath);
    }

    // Skills with conflict resolution
    for (const skill of sel.skills) {
      const hasConflict = skillCounts.get(skill)! > 1;
      const finalPath = hasConflict ? `${plugin.name}--${skill}` : skill;
      result.skills.push(finalPath);
    }

    // Hooks - merge by event (no conflicts, they merge automatically)
    for (const hookIndex of sel.hooks) {
      const hook = plugin.hooks[hookIndex];
      if (hook) {
        result.hooks.push(hook);
      }
    }

    // MCPs with conflict resolution
    for (const mcpIndex of sel.mcps) {
      const mcp = plugin.mcps[mcpIndex];
      if (mcp) {
        const hasConflict = mcpCounts.get(mcp.name)! > 1;
        const finalName = hasConflict ? `${plugin.name}--${mcp.name}` : mcp.name;
        result.mcps.push({ ...mcp, name: finalName });
      }
    }
  }

  return result;
}

/**
 * Copy component files to output directory with conflict resolution
 */
async function copyComponentFiles(
  plugins: NormalizedPluginFormat[],
  selection: Selection,
  outputDir: string
): Promise<void> {
  // Track conflicts for namespace prefix
  const commandCounts = new Map<string, number>();
  const agentCounts = new Map<string, number>();
  const skillCounts = new Map<string, number>();

  // First pass: count duplicates
  for (const plugin of plugins) {
    const sel = selection[plugin.name];
    if (!sel) continue;

    for (const cmd of sel.commands) {
      commandCounts.set(cmd, (commandCounts.get(cmd) || 0) + 1);
    }
    for (const agent of sel.agents) {
      agentCounts.set(agent, (agentCounts.get(agent) || 0) + 1);
    }
    for (const skill of sel.skills) {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    }
  }

  // Second pass: copy with namespace prefix if conflict
  for (const plugin of plugins) {
    const sel = selection[plugin.name];
    if (!sel) continue;

    // Copy commands
    for (const cmd of sel.commands) {
      const hasConflict = commandCounts.get(cmd)! > 1;
      const finalPath = hasConflict ? `${plugin.name}--${cmd}` : cmd;
      const srcPath = join(plugin.source, cmd);
      const destPath = join(outputDir, finalPath);
      await mkdir(dirname(destPath), { recursive: true });
      await copyFile(srcPath, destPath);
    }

    // Copy agents
    for (const agent of sel.agents) {
      const hasConflict = agentCounts.get(agent)! > 1;
      const finalPath = hasConflict ? `${plugin.name}--${agent}` : agent;
      const srcPath = join(plugin.source, agent);
      const destPath = join(outputDir, finalPath);
      await mkdir(dirname(destPath), { recursive: true });
      await copyFile(srcPath, destPath);
    }

    // Copy skills (directories)
    for (const skill of sel.skills) {
      const hasConflict = skillCounts.get(skill)! > 1;
      const finalPath = hasConflict ? `${plugin.name}--${skill}` : skill;
      const srcPath = join(plugin.source, skill);
      const destPath = join(outputDir, finalPath);
      await cp(srcPath, destPath, { recursive: true });
    }
  }
}
