import * as path from 'path';
import type { NormalizedPlugin } from '../types/normalized';
import { toOfficialFormat, omitDefaults } from './reverse-transformer';
import { validateOfficialFormat, validateNormalizedFormat } from './validator';
import {
  resolveCommandConflicts,
  resolveAgentConflicts,
  resolveSkillConflicts,
  resolveMcpConflicts,
  resolveHookScriptConflicts,
  getHookScriptPath,
  type ComponentSelection,
  type HookSelection,
  type McpSelection
} from './conflict-resolver';
import {
  ensureDirectory,
  removeDirectory,
  writeJson,
  copyFile,
  copyDirectory,
  copyHookScript,
  exists
} from './file-ops';

export interface SaveConfig {
  marketplaceName: string;
  pluginName: string;
  outputDirectory: string;
  authorEmail?: string;
}

export interface Selection {
  plugins: SelectionPlugin[];
}

export interface SelectionPlugin {
  normalized: NormalizedPlugin;
  commands: string[];    // Selected command paths
  agents: string[];      // Selected agent paths
  skills: string[];      // Selected skill paths
  hooks: any[];          // Selected hooks
  mcps: any[];           // Selected MCPs
}

export interface SaveResult {
  success: boolean;
  outputPath?: string;
  errors?: string[];
  stats?: {
    commands: number;
    agents: number;
    skills: number;
    hooks: number;
    mcps: number;
  };
}

/**
 * Saves the curated plugin selection to disk
 * @param selection User's component selections
 * @param config Save configuration
 * @returns Save result
 */
export async function save(selection: Selection, config: SaveConfig): Promise<SaveResult> {
  try {
    // Validate non-empty selection
    if (!hasSelections(selection)) {
      return {
        success: false,
        errors: ['No components selected']
      };
    }

    // Prepare output directory
    const outputPath = path.resolve(config.outputDirectory);
    const pluginDir = path.join(outputPath, 'plugins', config.pluginName);

    // Check if output exists
    if (exists(outputPath)) {
      // In CLI mode, would prompt user here
      // For now, we'll remove and recreate
      removeDirectory(outputPath);
    }

    // Create directory structure
    ensureDirectory(path.join(outputPath, '.claude-plugin'));
    ensureDirectory(path.join(pluginDir, '.claude-plugin'));
    ensureDirectory(path.join(pluginDir, 'commands'));
    ensureDirectory(path.join(pluginDir, 'agents'));
    ensureDirectory(path.join(pluginDir, 'skills'));
    ensureDirectory(path.join(pluginDir, 'hooks'));

    // Merge selections from all plugins
    const merged = mergeSelections(selection);

    // Resolve conflicts
    const resolvedCommands = resolveCommandConflicts(merged.commands);
    const resolvedAgents = resolveAgentConflicts(merged.agents);
    const resolvedSkills = resolveSkillConflicts(merged.skills);
    const resolvedMcps = resolveMcpConflicts(merged.mcps);
    const resolvedHooks = resolveHookScriptConflicts(merged.hooks);

    // Copy component files
    for (const cmd of resolvedCommands) {
      const sourcePath = path.join(cmd.sourcePath, cmd.relPath);
      const destPath = path.join(pluginDir, cmd.destPath);
      copyFile(sourcePath, destPath);
    }

    for (const agent of resolvedAgents) {
      const sourcePath = path.join(agent.sourcePath, agent.relPath);
      const destPath = path.join(pluginDir, agent.destPath);
      copyFile(sourcePath, destPath);
    }

    for (const skill of resolvedSkills) {
      const sourcePath = path.join(skill.sourcePath, skill.relPath);
      const destPath = path.join(pluginDir, skill.destPath);
      copyDirectory(sourcePath, destPath);
    }

    // Copy hook script files
    const copiedScripts = new Set<string>();
    for (const hook of resolvedHooks) {
      const scriptPath = getHookScriptPath(hook.command);
      if (scriptPath && !copiedScripts.has(scriptPath)) {
        const sourcePath = path.join(hook.sourcePath, scriptPath);
        const destPath = path.join(pluginDir, scriptPath);
        if (exists(sourcePath)) {
          copyHookScript(sourcePath, destPath);
          copiedScripts.add(scriptPath);
        }
      }
    }

    // Build normalized plugin object
    const normalizedPlugin: any = {
      name: config.pluginName,
      source: pluginDir,
      version: '0.0.0',
      description: `Curated plugin from ${selection.plugins.length} source(s)`,
      author: {
        name: '',
        email: config.authorEmail || '',
        url: ''
      },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: resolvedCommands.map(c => c.destPath),
      agents: resolvedAgents.map(a => a.destPath),
      skills: resolvedSkills.map(s => s.destPath),
      hooks: resolvedHooks.map(h => ({
        event: h.event,
        type: h.type,
        command: h.command,
        ...(h.matcher && { matcher: h.matcher }),
        ...(h.timeout && { timeout: h.timeout })
      })),
      mcps: resolvedMcps.map(m => ({
        name: m.name,
        command: m.command,
        ...(m.args && { args: m.args }),
        ...(m.env && { env: m.env })
      }))
    };

    // Validate normalized format
    const normalizedValidation = validateNormalizedFormat(normalizedPlugin);
    if (!normalizedValidation.valid) {
      return {
        success: false,
        errors: normalizedValidation.errors
      };
    }

    // Transform to official format
    let officialPlugin = toOfficialFormat(normalizedPlugin);
    officialPlugin = omitDefaults(officialPlugin);

    // Validate official format
    const officialValidation = validateOfficialFormat(officialPlugin);
    if (!officialValidation.valid) {
      return {
        success: false,
        errors: officialValidation.errors
      };
    }

    // Write output files
    writeJson(
      path.join(pluginDir, '.claude-plugin', 'plugin.json'),
      officialPlugin
    );

    writeJson(
      path.join(outputPath, 'normalized-plugin.json'),
      normalizedPlugin
    );

    // Generate marketplace.json
    const marketplaceJson = {
      name: config.marketplaceName,
      owner: {
        name: '',
        email: config.authorEmail || ''
      },
      plugins: [
        {
          name: config.pluginName,
          source: `./plugins/${config.pluginName}`
        }
      ]
    };

    writeJson(
      path.join(outputPath, '.claude-plugin', 'marketplace.json'),
      marketplaceJson
    );

    // Return success
    return {
      success: true,
      outputPath,
      stats: {
        commands: resolvedCommands.length,
        agents: resolvedAgents.length,
        skills: resolvedSkills.length,
        hooks: resolvedHooks.length,
        mcps: resolvedMcps.length
      }
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)]
    };
  }
}

/**
 * Checks if selection has any selected components
 */
function hasSelections(selection: Selection): boolean {
  for (const plugin of selection.plugins) {
    if (plugin.commands.length > 0 ||
        plugin.agents.length > 0 ||
        plugin.skills.length > 0 ||
        plugin.hooks.length > 0 ||
        plugin.mcps.length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Merges selections from all plugins into unified arrays
 */
function mergeSelections(selection: Selection): {
  commands: ComponentSelection[];
  agents: ComponentSelection[];
  skills: ComponentSelection[];
  hooks: (HookSelection & { sourcePath: string })[];
  mcps: McpSelection[];
} {
  const commands: ComponentSelection[] = [];
  const agents: ComponentSelection[] = [];
  const skills: ComponentSelection[] = [];
  const hooks: (HookSelection & { sourcePath: string })[] = [];
  const mcps: McpSelection[] = [];

  for (const plugin of selection.plugins) {
    const pluginName = plugin.normalized.name;
    const sourcePath = plugin.normalized.source;

    // Add commands
    for (const relPath of plugin.commands) {
      commands.push({ pluginName, sourcePath, relPath });
    }

    // Add agents
    for (const relPath of plugin.agents) {
      agents.push({ pluginName, sourcePath, relPath });
    }

    // Add skills
    for (const relPath of plugin.skills) {
      skills.push({ pluginName, sourcePath, relPath });
    }

    // Add hooks
    for (const hook of plugin.hooks) {
      hooks.push({
        pluginName,
        sourcePath,
        ...hook
      });
    }

    // Add MCPs
    for (const mcp of plugin.mcps) {
      mcps.push({
        pluginName,
        ...mcp
      });
    }
  }

  return { commands, agents, skills, hooks, mcps };
}
