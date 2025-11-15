import * as fs from 'fs';
import * as path from 'path';
import { NormalizedPlugin } from '../types/normalized';
import { SelectionState } from '../tui/app';

export interface CuratedOutput {
  commands: string[];
  agents: string[];
  skills: string[];
  hooks: any[];
  mcps: any[];
}

/**
 * Generate curated output from selection state
 */
export function generateCuratedOutput(
  plugins: NormalizedPlugin[],
  selection: SelectionState
): CuratedOutput {
  const output: CuratedOutput = {
    commands: [],
    agents: [],
    skills: [],
    hooks: [],
    mcps: [],
  };

  for (const plugin of plugins) {
    const sel = selection[plugin.name];
    if (!sel) continue;

    // Add selected commands
    output.commands.push(...Array.from(sel.commands));

    // Add selected agents
    output.agents.push(...Array.from(sel.agents));

    // Add selected skills
    output.skills.push(...Array.from(sel.skills));

    // Add selected hooks (with full config)
    for (const hookId of sel.hooks) {
      const hook = plugin.hooks.find(h => h.id === hookId);
      if (hook) {
        output.hooks.push(hook);
      }
    }

    // Add selected MCPs (with full config)
    for (const mcpId of sel.mcps) {
      const mcp = plugin.mcps.find(m => m.id === mcpId);
      if (mcp) {
        output.mcps.push(mcp);
      }
    }
  }

  return output;
}

/**
 * Save curated selection to file
 */
export async function saveSelection(
  outputPath: string,
  plugins: NormalizedPlugin[],
  selection: SelectionState
): Promise<void> {
  const output = generateCuratedOutput(plugins, selection);

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  // Write JSON file
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(output, null, 2),
    'utf-8'
  );
}

/**
 * Check if there are any selections
 */
export function hasSelections(selection: SelectionState): boolean {
  for (const pluginSel of Object.values(selection)) {
    if (
      pluginSel.commands.size > 0 ||
      pluginSel.agents.size > 0 ||
      pluginSel.skills.size > 0 ||
      pluginSel.hooks.size > 0 ||
      pluginSel.mcps.size > 0
    ) {
      return true;
    }
  }
  return false;
}
