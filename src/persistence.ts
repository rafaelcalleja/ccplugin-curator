import fs from 'fs';
import path from 'path';
import type { ComponentSelection, NormalizedPlugin } from './types/index.js';
import type { PluginJson } from './types/index.js';

/**
 * Save curated plugin selections
 * Generates a plugin.json with selected components
 */
export async function saveCuratedPlugin(
  selections: ComponentSelection[],
  outputDir: string = './output/curated-plugin'
): Promise<string> {
  // Create output directory if it doesn't exist
  const outputPath = path.resolve(outputDir);
  fs.mkdirSync(outputPath, { recursive: true });

  // Merge all selections into a single plugin
  const mergedSelection: any = {
    name: 'curated-plugin',
    commands: [],
    agents: [],
    skills: [],
    hooks: undefined,
    mcpServers: undefined,
  };

  // Collect hooks and MCPs separately
  const allHooks: Record<string, any> = {};
  const allMcps: Record<string, any> = {};

  for (const selection of selections) {
    // Add commands
    if (selection.commands.length > 0) {
      mergedSelection.commands = Array.from(
        new Set([
          ...(Array.isArray(mergedSelection.commands)
            ? mergedSelection.commands
            : []),
          ...selection.commands,
        ])
      );
    }

    // Add agents
    if (selection.agents.length > 0) {
      mergedSelection.agents = Array.from(
        new Set([
          ...(Array.isArray(mergedSelection.agents)
            ? mergedSelection.agents
            : []),
          ...selection.agents,
        ])
      );
    }

    // Add skills
    if (selection.skills.length > 0) {
      (mergedSelection as any).skills = Array.from(
        new Set([
          ...((mergedSelection as any).skills || []),
          ...selection.skills,
        ])
      );
    }

    // Add hooks
    if (selection.hooks.length > 0) {
      for (const hook of selection.hooks) {
        if (!allHooks[hook.event]) {
          allHooks[hook.event] = [];
        }
        allHooks[hook.event].push({
          type: hook.type,
          ...(hook.command && { command: hook.command }),
          ...(hook.agent && { agent: hook.agent }),
          ...(hook.matcher && { matcher: hook.matcher }),
        });
      }
    }

    // Add MCPs
    if (selection.mcps.length > 0) {
      for (const mcp of selection.mcps) {
        allMcps[mcp.name] = {
          command: mcp.command,
          ...(mcp.args && { args: mcp.args }),
          ...(mcp.env && { env: mcp.env }),
        };
      }
    }
  }

  // Add hooks and MCPs only if they exist
  if (Object.keys(allHooks).length > 0) {
    mergedSelection.hooks = allHooks;
  }
  if (Object.keys(allMcps).length > 0) {
    mergedSelection.mcpServers = allMcps;
  }

  // Write plugin.json
  const pluginJsonPath = path.join(outputPath, 'plugin.json');
  fs.writeFileSync(pluginJsonPath, JSON.stringify(mergedSelection, null, 2));

  return pluginJsonPath;
}

/**
 * Save individual plugin selections to separate plugin.json files
 * Useful for creating separate plugins per source
 */
export async function saveCuratedPlugins(
  selections: ComponentSelection[],
  outputDir: string = './output'
): Promise<string[]> {
  const savedFiles: string[] = [];

  for (const selection of selections) {
    const pluginDirName = `curated-${selection.pluginName}`;
    const pluginOutputDir = path.join(outputDir, pluginDirName);

    fs.mkdirSync(pluginOutputDir, { recursive: true });

    const pluginJson: any = {
      name: pluginDirName,
      commands: selection.commands.length > 0 ? selection.commands : undefined,
      agents: selection.agents.length > 0 ? selection.agents : undefined,
      skills: selection.skills.length > 0 ? selection.skills : undefined,
    };

    // Add hooks if any
    if (selection.hooks.length > 0) {
      const hooksConfig: Record<string, any> = {};
      for (const hook of selection.hooks) {
        if (!hooksConfig[hook.event]) {
          hooksConfig[hook.event] = [];
        }
        hooksConfig[hook.event].push({
          type: hook.type,
          ...(hook.command && { command: hook.command }),
          ...(hook.agent && { agent: hook.agent }),
          ...(hook.matcher && { matcher: hook.matcher }),
        });
      }
      pluginJson.hooks = hooksConfig;
    }

    // Add MCPs if any
    if (selection.mcps.length > 0) {
      const mcpsConfig: Record<string, any> = {};
      for (const mcp of selection.mcps) {
        mcpsConfig[mcp.name] = {
          command: mcp.command,
          ...(mcp.args && { args: mcp.args }),
          ...(mcp.env && { env: mcp.env }),
        };
      }
      pluginJson.mcpServers = mcpsConfig;
    }

    const pluginJsonPath = path.join(pluginOutputDir, 'plugin.json');
    fs.writeFileSync(pluginJsonPath, JSON.stringify(pluginJson, null, 2));
    savedFiles.push(pluginJsonPath);
  }

  return savedFiles;
}
