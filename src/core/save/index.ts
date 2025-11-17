/**
 * Save Coordinator
 *
 * Main save operation that coordinates all save modules.
 * Integrates validation, conflict resolution, file copying, and output generation.
 *
 * Spec: docs/spec/007-save-operation-rules.md
 */

import type { TuiState } from '../../tui/state.js';
import type { NormalizedPluginFormatInternal } from '../../types/normalized.js';
import { getSelection } from '../../tui/state.js';
import { validateSave } from './validator.js';
import {
  getOutputPaths,
  outputDirExists,
  deleteOutputDir,
  createOutputStructure,
  type OutputPaths,
} from './directory.js';
import {
  resolvePathConflicts,
  resolveMcpConflicts,
  type ResolvedItem,
} from './conflicts.js';
import { copyComponentFiles, copySkillDirectories } from './copier.js';
import { generateMarketplace, writeMarketplaceJson } from './marketplace.js';
import {
  generatePluginJson,
  writePluginJson,
  writeNormalizedJson,
} from './outputs.js';
import type { NormalizedHook } from '../hooks-loader.js';
import type { NormalizedMcp } from '../mcp-loader.js';

/**
 * Save options
 */
export interface SaveOptions {
  /** Output directory (default: ./output/curated-plugin) */
  outputDir?: string;
  /** Plugin name (default: curated-plugin) */
  pluginName?: string;
  /** Overwrite if output directory exists (default: false) */
  overwrite?: boolean;
  /** Owner name for marketplace (default: User) */
  ownerName?: string;
  /** Owner email for marketplace */
  ownerEmail?: string;
}

/**
 * Save result
 */
export interface SaveResult {
  success: boolean;
  outputDir: string;
  errors: string[];
  stats: {
    commands: number;
    agents: number;
    skills: number;
    hooks: number;
    mcps: number;
  };
}

/**
 * Build aggregated normalized plugin from selections
 *
 * @param state - TUI state with selections
 * @param pluginName - Name for the curated plugin
 * @returns Normalized plugin with all selected components
 */
function buildAggregatedPlugin(
  state: TuiState,
  pluginName: string
): {
  normalized: NormalizedPluginFormatInternal;
  sourceRoots: Map<string, string>;
} {
  // Collect all selected items across plugins
  const allCommands: Array<{ pluginName: string; path: string }> = [];
  const allAgents: Array<{ pluginName: string; path: string }> = [];
  const allSkills: Array<{ pluginName: string; path: string }> = [];
  const allHooks: NormalizedHook[] = [];
  const allMcps: Array<{ pluginName: string; mcpName: string; mcp: NormalizedMcp }> = [];

  const sourceRoots = new Map<string, string>();

  for (const plugin of state.plugins) {
    const selection = getSelection(state, plugin.name);
    sourceRoots.set(plugin.name, plugin.source);

    // Collect commands
    selection.commands.forEach((cmd) => {
      allCommands.push({ pluginName: plugin.name, path: cmd });
    });

    // Collect agents
    selection.agents.forEach((agent) => {
      allAgents.push({ pluginName: plugin.name, path: agent });
    });

    // Collect skills
    selection.skills.forEach((skill) => {
      allSkills.push({ pluginName: plugin.name, path: skill });
    });

    // Collect hooks (preserve as-is, merge later)
    Array.from(selection.hooks).forEach((hookIndex) => {
      const hook = plugin.hooks[hookIndex];
      if (hook) {
        allHooks.push(hook);
      }
    });

    // Collect MCPs
    Array.from(selection.mcps).forEach((mcpIndex) => {
      const mcp = plugin.mcps[mcpIndex];
      if (mcp) {
        allMcps.push({ pluginName: plugin.name, mcpName: mcp.name, mcp });
      }
    });
  }

  // Resolve conflicts
  const resolvedCommands = resolvePathConflicts(allCommands);
  const resolvedAgents = resolvePathConflicts(allAgents);
  const resolvedSkills = resolvePathConflicts(allSkills);

  const mcpConflicts = resolveMcpConflicts(
    allMcps.map((m) => ({ pluginName: m.pluginName, mcpName: m.mcpName }))
  );

  // Build normalized plugin
  const normalized: NormalizedPluginFormatInternal = {
    name: pluginName,
    source: '', // Will be set to output directory
    version: '0.0.0',
    description: 'Curated plugin with selected components',
    author: { name: '', email: '', url: '' },
    homepage: '',
    repository: '',
    license: '',
    keywords: [],
    commands: resolvedCommands.map((r) => r.resolved),
    agents: resolvedAgents.map((r) => r.resolved),
    skills: resolvedSkills.map((r) => r.resolved),
    hooks: allHooks,
    mcps: allMcps.map((m) => {
      const key = `${m.pluginName}:${m.mcpName}`;
      const resolved = mcpConflicts.get(key);
      return {
        ...m.mcp,
        name: resolved?.resolved || m.mcpName,
      };
    }),
  };

  return { normalized, sourceRoots };
}

/**
 * Perform save operation
 *
 * @param state - TUI state with selections
 * @param options - Save options
 * @returns Save result
 */
export async function save(
  state: TuiState,
  options: SaveOptions = {}
): Promise<SaveResult> {
  const pluginName = options.pluginName || 'curated-plugin';
  const outputDir = options.outputDir || `./output/${pluginName}`;
  const overwrite = options.overwrite ?? false;

  const errors: string[] = [];

  // 1. Validate selection
  const validation = validateSave(state);
  if (!validation.valid) {
    return {
      success: false,
      outputDir,
      errors: validation.errors,
      stats: { commands: 0, agents: 0, skills: 0, hooks: 0, mcps: 0 },
    };
  }

  // 2. Check if output directory exists
  if (outputDirExists(outputDir)) {
    if (!overwrite) {
      return {
        success: false,
        outputDir,
        errors: [
          `Output directory already exists: ${outputDir}`,
          'Use overwrite option to replace it.',
        ],
        stats: { commands: 0, agents: 0, skills: 0, hooks: 0, mcps: 0 },
      };
    }
    // Delete existing directory
    deleteOutputDir(outputDir);
  }

  try {
    // 3. Build aggregated plugin
    const { normalized, sourceRoots } = buildAggregatedPlugin(state, pluginName);

    // 4. Get output paths
    const paths: OutputPaths = getOutputPaths(outputDir, pluginName);

    // 5. Create directory structure
    createOutputStructure(paths);

    // 6. Resolve conflicts and prepare items for copying
    const commandItems: ResolvedItem[] = [];
    const agentItems: ResolvedItem[] = [];
    const skillItems: ResolvedItem[] = [];

    for (const plugin of state.plugins) {
      const selection = getSelection(state, plugin.name);

      selection.commands.forEach((cmd) => {
        const resolved = normalized.commands.find((c) => c.includes(cmd) || c === cmd);
        if (resolved) {
          commandItems.push({ original: cmd, resolved, pluginName: plugin.name });
        }
      });

      selection.agents.forEach((agent) => {
        const resolved = normalized.agents.find((a) => a.includes(agent) || a === agent);
        if (resolved) {
          agentItems.push({ original: agent, resolved, pluginName: plugin.name });
        }
      });

      selection.skills.forEach((skill) => {
        const resolved = normalized.skills.find((s) => s.includes(skill) || s === skill);
        if (resolved) {
          skillItems.push({ original: skill, resolved, pluginName: plugin.name });
        }
      });
    }

    // 7. Copy files
    if (commandItems.length > 0) {
      copyComponentFiles(commandItems, sourceRoots, paths.pluginDir);
    }

    if (agentItems.length > 0) {
      copyComponentFiles(agentItems, sourceRoots, paths.pluginDir);
    }

    if (skillItems.length > 0) {
      copySkillDirectories(skillItems, sourceRoots, paths.pluginDir);
    }

    // 8. Generate and write plugin.json
    const pluginJson = generatePluginJson(normalized);
    writePluginJson(paths.claudePluginDir, pluginJson);

    // 9. Generate and write marketplace.json
    const marketplace = generateMarketplace(pluginName, {
      ownerName: options.ownerName,
      ownerEmail: options.ownerEmail,
    });
    writeMarketplaceJson(paths.marketplaceDir, marketplace);

    // 10. Write normalized-plugin.json (for debugging)
    writeNormalizedJson(paths.root, normalized);

    // Success!
    return {
      success: true,
      outputDir,
      errors: [],
      stats: {
        commands: normalized.commands.length,
        agents: normalized.agents.length,
        skills: normalized.skills.length,
        hooks: normalized.hooks.length,
        mcps: normalized.mcps.length,
      },
    };
  } catch (error: any) {
    errors.push(`Save failed: ${error.message}`);
    return {
      success: false,
      outputDir,
      errors,
      stats: { commands: 0, agents: 0, skills: 0, hooks: 0, mcps: 0 },
    };
  }
}

export * from './validator.js';
export * from './directory.js';
export * from './conflicts.js';
export * from './copier.js';
export * from './marketplace.js';
export * from './outputs.js';
