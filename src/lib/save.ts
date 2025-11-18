import fs from 'fs/promises';
import path from 'path';
import type { NormalizedPluginInternalFormat } from '../types/normalized.js';
import type { ClaudeCodeMarketplace } from '../types/marketplace.js';
import { reverseTransform } from './reverse.js';
import {
  validateOfficialFormat,
  validateNormalizedFormat,
  validateMarketplaceFormat,
} from './validate.js';

interface SaveOptions {
  outputDir: string;
  pluginName: string;
  marketplaceName?: string;
  ownerName?: string;
  ownerEmail?: string;
}

interface SaveResult {
  success: boolean;
  errors: string[];
  outputPath?: string;
  stats?: {
    commands: number;
    agents: number;
    skills: number;
    hooks: number;
    mcps: number;
  };
}

/**
 * Save curated plugin to output directory
 * Implements rules from 007-save-operation-rules.md
 */
export async function savePlugin(
  selection: NormalizedPluginInternalFormat,
  options: SaveOptions
): Promise<SaveResult> {
  const errors: string[] = [];

  // 1. Validate selection is non-empty
  const totalItems =
    selection.commands.length +
    selection.agents.length +
    selection.skills.length +
    selection.hooks.length +
    selection.mcps.length;

  if (totalItems === 0) {
    return {
      success: false,
      errors: ['No components selected'],
    };
  }

  // 2. Create output directory structure
  const outputPath = path.join(options.outputDir, options.pluginName);
  const pluginPath = path.join(outputPath, 'plugins', options.pluginName);

  try {
    await fs.mkdir(path.join(pluginPath, '.claude-plugin'), { recursive: true });
    await fs.mkdir(path.join(pluginPath, 'commands'), { recursive: true });
    await fs.mkdir(path.join(pluginPath, 'agents'), { recursive: true });
    await fs.mkdir(path.join(pluginPath, 'skills'), { recursive: true });
  } catch (err: any) {
    return {
      success: false,
      errors: [`Failed to create output directory: ${err.message}`],
    };
  }

  // 3. Apply reverse transformation
  const officialFormat = reverseTransform(selection);

  // 4. Validate official format
  const officialValidation = await validateOfficialFormat(officialFormat);
  if (!officialValidation.valid) {
    return {
      success: false,
      errors: ['Invalid official format', ...officialValidation.errors],
    };
  }

  // 5. Validate normalized format
  const normalizedValidation = await validateNormalizedFormat(selection);
  if (!normalizedValidation.valid) {
    return {
      success: false,
      errors: ['Invalid normalized format', ...normalizedValidation.errors],
    };
  }

  // 6. Copy component files
  try {
    await copyCommands(selection.commands, selection.source, pluginPath);
    await copyAgents(selection.agents, selection.source, pluginPath);
    await copySkills(selection.skills, selection.source, pluginPath);
    await copyHookScripts(selection.hooks, selection.source, pluginPath);
  } catch (err: any) {
    return {
      success: false,
      errors: [`Failed to copy component files: ${err.message}`],
    };
  }

  // 7. Generate marketplace.json
  const marketplace: ClaudeCodeMarketplace = {
    name: options.marketplaceName || 'curated-plugins',
    owner: {
      name: options.ownerName || 'User',
      email: options.ownerEmail || 'user@example.com',
    },
    plugins: [
      {
        name: options.pluginName,
        source: `./plugins/${options.pluginName}`,
      },
    ],
  };

  const marketplaceValidation = await validateMarketplaceFormat(marketplace);
  if (!marketplaceValidation.valid) {
    return {
      success: false,
      errors: ['Invalid marketplace format', ...marketplaceValidation.errors],
    };
  }

  // 8. Write output files
  try {
    // Create .claude-plugin directory first
    await fs.mkdir(path.join(outputPath, '.claude-plugin'), { recursive: true });
    
    // Write marketplace.json
    await fs.writeFile(
      path.join(outputPath, '.claude-plugin', 'marketplace.json'),
      JSON.stringify(marketplace, null, 2)
    );

    // Write plugin.json (official format)
    await fs.writeFile(
      path.join(pluginPath, '.claude-plugin', 'plugin.json'),
      JSON.stringify(officialFormat, null, 2)
    );

    // Write normalized-plugin.json (for debugging)
    await fs.writeFile(
      path.join(outputPath, 'normalized-plugin.json'),
      JSON.stringify(selection, null, 2)
    );
  } catch (err: any) {
    return {
      success: false,
      errors: [`Failed to write output files: ${err.message}`],
    };
  }

  return {
    success: true,
    errors: [],
    outputPath,
    stats: {
      commands: selection.commands.length,
      agents: selection.agents.length,
      skills: selection.skills.length,
      hooks: selection.hooks.length,
      mcps: selection.mcps.length,
    },
  };
}

/**
 * Copy command files to output directory
 */
async function copyCommands(
  commands: string[],
  sourceRoot: string,
  targetRoot: string
): Promise<void> {
  for (const cmd of commands) {
    const sourcePath = path.join(sourceRoot, cmd);
    const targetPath = path.join(targetRoot, cmd);

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
  }
}

/**
 * Copy agent files to output directory
 */
async function copyAgents(
  agents: string[],
  sourceRoot: string,
  targetRoot: string
): Promise<void> {
  for (const agent of agents) {
    const sourcePath = path.join(sourceRoot, agent);
    const targetPath = path.join(targetRoot, agent);

    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
  }
}

/**
 * Copy skill directories to output directory
 */
async function copySkills(
  skills: string[],
  sourceRoot: string,
  targetRoot: string
): Promise<void> {
  for (const skill of skills) {
    const sourcePath = path.join(sourceRoot, skill);
    const targetPath = path.join(targetRoot, skill);

    await fs.mkdir(targetPath, { recursive: true });
    await copyDirectory(sourcePath, targetPath);
  }
}

/**
 * Recursively copy directory
 */
async function copyDirectory(source: string, target: string): Promise<void> {
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      await copyDirectory(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

/**
 * Copy hook script files to output directory with executable permissions
 * Implements spec 007-save-operation-rules.md lines 124-139
 */
async function copyHookScripts(
  hooks: any[],
  sourceRoot: string,
  targetRoot: string
): Promise<void> {
  const hookScripts = new Set<string>();

  // Extract script paths from hook commands
  for (const hook of hooks) {
    if (hook.command) {
      const scriptPath = extractScriptPath(hook.command);
      if (scriptPath) {
        hookScripts.add(scriptPath);
      }
    }
  }

  // Copy each script file with executable permissions
  for (const scriptPath of hookScripts) {
    const sourcePath = path.join(sourceRoot, scriptPath);
    const targetPath = path.join(targetRoot, scriptPath);

    // Create hooks directory if needed
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    // Copy file
    try {
      await fs.copyFile(sourcePath, targetPath);
      // Set executable permissions (0o755)
      await fs.chmod(targetPath, 0o755);
    } catch (err) {
      // If file doesn't exist, skip (might be a system command)
      continue;
    }
  }
}

/**
 * Extract script file path from hook command
 * Returns null if command is a system command (npx, node, etc.)
 */
function extractScriptPath(command: string): string | null {
  // Remove ${CLAUDE_PLUGIN_ROOT}/ prefix if present
  let cleaned = command.replace(/\$\{CLAUDE_PLUGIN_ROOT\}\//, '');

  // Check if it's a script file path
  if (cleaned.startsWith('/')) {
    // Remove leading /
    return cleaned.substring(1);
  } else if (cleaned.startsWith('./')) {
    // Remove leading ./
    return cleaned.substring(2);
  } else if (!cleaned.includes(' ') && (cleaned.includes('/') || cleaned.endsWith('.sh') || cleaned.endsWith('.ts'))) {
    // Relative path without spaces, likely a script
    return cleaned;
  }

  // System command, not a script file
  return null;
}

/**
 * Merge multiple plugins with conflict resolution
 * Implements conflict resolution from 007-save-operation-rules.md
 */
export function mergePlugins(
  plugins: NormalizedPluginInternalFormat[]
): NormalizedPluginInternalFormat {
  if (plugins.length === 0) {
    throw new Error('No plugins to merge');
  }

  if (plugins.length === 1) {
    return plugins[0];
  }

  const merged: NormalizedPluginInternalFormat = {
    name: 'curated-plugin',
    source: '',
    version: '0.0.0',
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

  // Track seen items for conflict resolution
  const seenCommands = new Map<string, string>(); // filename -> plugin name
  const seenAgents = new Map<string, string>();
  const seenSkills = new Map<string, string>();
  const seenMcps = new Map<string, string>();

  for (const plugin of plugins) {
    // Commands: resolve conflicts with namespace prefix
    for (const cmd of plugin.commands) {
      const filename = path.basename(cmd);
      if (seenCommands.has(filename)) {
        // Conflict: add namespace prefix
        const prefixed = `commands/${plugin.name}--${filename}`;
        merged.commands.push(prefixed);
      } else {
        seenCommands.set(filename, plugin.name);
        merged.commands.push(cmd);
      }
    }

    // Agents: resolve conflicts with namespace prefix
    for (const agent of plugin.agents) {
      const filename = path.basename(agent);
      if (seenAgents.has(filename)) {
        const prefixed = `agents/${plugin.name}--${filename}`;
        merged.agents.push(prefixed);
      } else {
        seenAgents.set(filename, plugin.name);
        merged.agents.push(agent);
      }
    }

    // Skills: resolve conflicts with namespace prefix
    for (const skill of plugin.skills) {
      const dirname = path.basename(skill);
      if (seenSkills.has(dirname)) {
        const prefixed = `skills/${plugin.name}--${dirname}`;
        merged.skills.push(prefixed);
      } else {
        seenSkills.set(dirname, plugin.name);
        merged.skills.push(skill);
      }
    }

    // Hooks: merge (same event allowed)
    merged.hooks.push(...plugin.hooks);

    // MCPs: resolve conflicts with namespace prefix
    for (const mcp of plugin.mcps) {
      if (seenMcps.has(mcp.name)) {
        // Conflict: add namespace prefix
        merged.mcps.push({
          ...mcp,
          name: `${plugin.name}--${mcp.name}`,
        });
      } else {
        seenMcps.set(mcp.name, plugin.name);
        merged.mcps.push(mcp);
      }
    }

    // Merge keywords
    merged.keywords.push(...plugin.keywords);
  }

  // Deduplicate keywords
  merged.keywords = Array.from(new Set(merged.keywords));

  return merged;
}
