import * as fs from 'fs/promises';
import * as path from 'path';
import { NormalizedPluginConfiguration } from '../types/normalized';

/**
 * File copy operations
 *
 * Implements file copying rules from Spec 007:
 * - Copy command/agent files
 * - Copy skill directories (recursive)
 * - Copy hook scripts with executable permissions (chmod +x)
 */

/**
 * Copy files for curated plugin
 *
 * @param merged - Merged normalized plugin
 * @param sourcePlugins - Map of plugin name to plugin config (for resolving source paths)
 * @param targetDir - Target directory for files
 */
export async function copyFiles(
  merged: NormalizedPluginConfiguration,
  sourcePlugins: Map<string, NormalizedPluginConfiguration>,
  targetDir: string
): Promise<void> {
  // Copy commands
  for (const cmdPath of merged.commands) {
    await copySingleFile(cmdPath, sourcePlugins, targetDir);
  }

  // Copy agents
  for (const agentPath of merged.agents) {
    await copySingleFile(agentPath, sourcePlugins, targetDir);
  }

  // Copy skills (recursive directory copy)
  for (const skillPath of merged.skills) {
    await copySkillDirectory(skillPath, sourcePlugins, targetDir);
  }

  // Copy hook scripts (with executable permissions)
  const hookScripts = new Set<string>();
  for (const hook of merged.hooks) {
    // Extract script path from command (may include ${CLAUDE_PLUGIN_ROOT}/)
    let scriptPath = hook.command.replace(/\$\{CLAUDE_PLUGIN_ROOT\}\//, '');

    // If path starts with /, it's likely a hook script
    if (scriptPath.startsWith('/')) {
      scriptPath = scriptPath.slice(1); // Remove leading /
    }

    // Only copy if it looks like a local script (not system commands like npx)
    if (!scriptPath.includes(' ') && !scriptPath.startsWith('npx')) {
      hookScripts.add(scriptPath);
    }
  }

  for (const scriptPath of hookScripts) {
    await copyHookScript(scriptPath, sourcePlugins, targetDir);
  }
}

/**
 * Copy a single file from source plugin to target directory
 */
async function copySingleFile(
  relativePath: string,
  sourcePlugins: Map<string, NormalizedPluginConfiguration>,
  targetDir: string
): Promise<void> {
  // Find source plugin that contains this file
  let sourcePath: string | null = null;

  for (const plugin of sourcePlugins.values()) {
    const possiblePath = path.join(plugin.source, relativePath);
    try {
      await fs.access(possiblePath);
      sourcePath = possiblePath;
      break;
    } catch {
      // File not in this plugin, try next
    }
  }

  if (!sourcePath) {
    console.warn(`Warning: Could not find source file for ${relativePath}`);
    return;
  }

  // Copy to target
  const targetPath = path.join(targetDir, relativePath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourcePath, targetPath);
}

/**
 * Copy a skill directory recursively
 */
async function copySkillDirectory(
  skillDir: string,
  sourcePlugins: Map<string, NormalizedPluginConfiguration>,
  targetDir: string
): Promise<void> {
  // Find source plugin that contains this skill
  let sourceSkillPath: string | null = null;

  for (const plugin of sourcePlugins.values()) {
    const possiblePath = path.join(plugin.source, skillDir);
    try {
      const stat = await fs.stat(possiblePath);
      if (stat.isDirectory()) {
        sourceSkillPath = possiblePath;
        break;
      }
    } catch {
      // Directory not in this plugin, try next
    }
  }

  if (!sourceSkillPath) {
    console.warn(`Warning: Could not find source directory for skill ${skillDir}`);
    return;
  }

  // Copy directory recursively
  const targetPath = path.join(targetDir, skillDir);
  await fs.mkdir(targetPath, { recursive: true });
  await copyDirectoryRecursive(sourceSkillPath, targetPath);
}

/**
 * Copy a hook script with executable permissions
 */
async function copyHookScript(
  scriptPath: string,
  sourcePlugins: Map<string, NormalizedPluginConfiguration>,
  targetDir: string
): Promise<void> {
  // Find source plugin that contains this script
  let sourceScriptPath: string | null = null;

  for (const plugin of sourcePlugins.values()) {
    const possiblePath = path.join(plugin.source, scriptPath);
    try {
      await fs.access(possiblePath);
      sourceScriptPath = possiblePath;
      break;
    } catch {
      // Script not in this plugin, try next
    }
  }

  if (!sourceScriptPath) {
    console.warn(`Warning: Could not find source script for ${scriptPath}`);
    return;
  }

  // Copy to target
  const targetPath = path.join(targetDir, scriptPath);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.copyFile(sourceScriptPath, targetPath);

  // Set executable permissions (chmod +x) per Spec 007 line 138
  await fs.chmod(targetPath, 0o755);
}

/**
 * Copy directory recursively (helper function)
 */
async function copyDirectoryRecursive(source: string, target: string): Promise<void> {
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(targetPath, { recursive: true });
      await copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}
