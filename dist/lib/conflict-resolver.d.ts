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
export declare function resolveCommandConflicts(commands: ComponentSelection[]): ResolvedComponent[];
/**
 * Resolves filename conflicts for agents by adding namespace prefix
 * @param agents Array of agent selections
 * @returns Array of resolved agents with destination paths
 */
export declare function resolveAgentConflicts(agents: ComponentSelection[]): ResolvedComponent[];
/**
 * Resolves directory name conflicts for skills by adding namespace prefix
 * @param skills Array of skill selections
 * @returns Array of resolved skills with destination paths
 */
export declare function resolveSkillConflicts(skills: ComponentSelection[]): ResolvedComponent[];
/**
 * Resolves MCP name conflicts by adding namespace prefix
 * @param mcps Array of MCP selections
 * @returns Array of resolved MCPs with updated names
 */
export declare function resolveMcpConflicts(mcps: McpSelection[]): McpSelection[];
/**
 * Merges hooks by event while preserving selection order
 * No conflicts - hooks can coexist for the same event
 * @param hooks Array of hook selections
 * @returns Merged hooks array
 */
export declare function mergeHooksByEvent(hooks: HookSelection[]): HookSelection[];
/**
 * Resolves hook script filename conflicts by adding namespace prefix
 * @param hooks Array of hook selections
 * @returns Array of hooks with updated command paths
 */
export declare function resolveHookScriptConflicts(hooks: HookSelection[]): HookSelection[];
/**
 * Gets the destination script path for a hook command
 * Handles both ${CLAUDE_PLUGIN_ROOT}/ prefix and plain paths
 * @param command Hook command string
 * @returns Relative script path
 */
export declare function getHookScriptPath(command: string): string | null;
//# sourceMappingURL=conflict-resolver.d.ts.map