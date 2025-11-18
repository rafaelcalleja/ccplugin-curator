import * as path from 'path';

export interface ComponentSelection {
  pluginName: string;
  sourcePath: string;
  relPath: string;
}

export interface ResolvedComponent extends ComponentSelection {
  destPath: string;
  wasRenamed: boolean;
}

export interface HookSelection {
  pluginName: string;
  event: string;
  type: 'command';
  command: string;
  matcher?: string;
  timeout?: number;
  [key: string]: any;
}

export interface McpSelection {
  pluginName: string;
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  [key: string]: any;
}

/**
 * Resolves filename conflicts for commands by adding namespace prefix
 * @param commands Array of command selections
 * @returns Array of resolved commands with destination paths
 */
export function resolveCommandConflicts(commands: ComponentSelection[]): ResolvedComponent[] {
  return resolveFileConflicts(commands, 'commands');
}

/**
 * Resolves filename conflicts for agents by adding namespace prefix
 * @param agents Array of agent selections
 * @returns Array of resolved agents with destination paths
 */
export function resolveAgentConflicts(agents: ComponentSelection[]): ResolvedComponent[] {
  return resolveFileConflicts(agents, 'agents');
}

/**
 * Generic function to resolve file conflicts
 * @param components Array of component selections
 * @param type Component type (commands or agents)
 * @returns Array of resolved components
 */
function resolveFileConflicts(components: ComponentSelection[], type: string): ResolvedComponent[] {
  const resolved: ResolvedComponent[] = [];
  const filenameMap = new Map<string, ComponentSelection[]>();

  // Group by filename
  for (const component of components) {
    const filename = path.basename(component.relPath);
    if (!filenameMap.has(filename)) {
      filenameMap.set(filename, []);
    }
    filenameMap.get(filename)!.push(component);
  }

  // Resolve conflicts
  for (const [filename, comps] of filenameMap.entries()) {
    if (comps.length === 1) {
      // No conflict - use original name
      resolved.push({
        ...comps[0],
        destPath: comps[0].relPath,
        wasRenamed: false
      });
    } else {
      // Conflict - apply namespace prefix
      for (const comp of comps) {
        const ext = path.extname(filename);
        const base = path.basename(filename, ext);
        const newFilename = `${comp.pluginName}--${base}${ext}`;
        const dir = path.dirname(comp.relPath);
        const destPath = path.join(dir, newFilename);

        resolved.push({
          ...comp,
          destPath,
          wasRenamed: true
        });
      }
    }
  }

  return resolved;
}

/**
 * Resolves directory name conflicts for skills by adding namespace prefix
 * @param skills Array of skill selections
 * @returns Array of resolved skills with destination paths
 */
export function resolveSkillConflicts(skills: ComponentSelection[]): ResolvedComponent[] {
  const resolved: ResolvedComponent[] = [];
  const dirnameMap = new Map<string, ComponentSelection[]>();

  // Group by directory name
  for (const skill of skills) {
    const dirname = path.basename(skill.relPath);
    if (!dirnameMap.has(dirname)) {
      dirnameMap.set(dirname, []);
    }
    dirnameMap.get(dirname)!.push(skill);
  }

  // Resolve conflicts
  for (const [dirname, comps] of dirnameMap.entries()) {
    if (comps.length === 1) {
      // No conflict - use original name
      resolved.push({
        ...comps[0],
        destPath: comps[0].relPath,
        wasRenamed: false
      });
    } else {
      // Conflict - apply namespace prefix
      for (const comp of comps) {
        const parentDir = path.dirname(comp.relPath);
        const newDirname = `${comp.pluginName}--${dirname}`;
        const destPath = path.join(parentDir, newDirname);

        resolved.push({
          ...comp,
          destPath,
          wasRenamed: true
        });
      }
    }
  }

  return resolved;
}

/**
 * Resolves MCP name conflicts by adding namespace prefix
 * @param mcps Array of MCP selections
 * @returns Array of resolved MCPs with updated names
 */
export function resolveMcpConflicts(mcps: McpSelection[]): McpSelection[] {
  const resolved: McpSelection[] = [];
  const nameMap = new Map<string, McpSelection[]>();

  // Group by MCP name
  for (const mcp of mcps) {
    if (!nameMap.has(mcp.name)) {
      nameMap.set(mcp.name, []);
    }
    nameMap.get(mcp.name)!.push(mcp);
  }

  // Resolve conflicts
  for (const [name, mcpList] of nameMap.entries()) {
    if (mcpList.length === 1) {
      // No conflict - use original name
      resolved.push(mcpList[0]);
    } else {
      // Conflict - apply namespace prefix
      for (const mcp of mcpList) {
        resolved.push({
          ...mcp,
          name: `${mcp.pluginName}--${name}`
        });
      }
    }
  }

  return resolved;
}

/**
 * Merges hooks by event while preserving selection order
 * No conflicts - hooks can coexist for the same event
 * @param hooks Array of hook selections
 * @returns Merged hooks array
 */
export function mergeHooksByEvent(hooks: HookSelection[]): HookSelection[] {
  // Hooks don't conflict - they're just merged
  // Return as-is, preserving order
  return [...hooks];
}

/**
 * Resolves hook script filename conflicts by adding namespace prefix
 * @param hooks Array of hook selections
 * @returns Array of hooks with updated command paths
 */
export function resolveHookScriptConflicts(hooks: HookSelection[]): HookSelection[] {
  const resolved: HookSelection[] = [];
  const scriptMap = new Map<string, HookSelection[]>();

  // Group by script path (only for local scripts, not system commands)
  for (const hook of hooks) {
    const command = hook.command;

    // Only process local script paths (not system commands like npx, node, etc.)
    if (command && !command.startsWith('npx') &&
        !command.startsWith('node') &&
        !command.startsWith('/usr/')) {
      const scriptPath = command.replace(/^\$\{CLAUDE_PLUGIN_ROOT\}\//, '');

      if (!scriptMap.has(scriptPath)) {
        scriptMap.set(scriptPath, []);
      }
      scriptMap.get(scriptPath)!.push(hook);
    } else {
      // System command - no conflict possible
      resolved.push(hook);
    }
  }

  // Resolve conflicts
  for (const [scriptPath, hookList] of scriptMap.entries()) {
    if (hookList.length === 1) {
      // No conflict - use original path
      resolved.push(hookList[0]);
    } else {
      // Conflict - apply namespace prefix to script filename
      for (const hook of hookList) {
        const dir = path.dirname(scriptPath);
        const filename = path.basename(scriptPath);
        const newFilename = `${hook.pluginName}--${filename}`;
        const newScriptPath = path.join(dir, newFilename);

        resolved.push({
          ...hook,
          command: newScriptPath
        });
      }
    }
  }

  return resolved;
}

/**
 * Gets the destination script path for a hook command
 * Handles both ${CLAUDE_PLUGIN_ROOT}/ prefix and plain paths
 * @param command Hook command string
 * @returns Relative script path
 */
export function getHookScriptPath(command: string): string | null {
  if (!command) return null;

  // Skip system commands
  if (command.startsWith('npx') ||
      command.startsWith('node') ||
      command.startsWith('/usr/')) {
    return null;
  }

  // Remove ${CLAUDE_PLUGIN_ROOT}/ prefix if present
  return command.replace(/^\$\{CLAUDE_PLUGIN_ROOT\}\//, '');
}
