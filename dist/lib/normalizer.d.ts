import type { NormalizedPlugin } from '../types/normalized';
/**
 * Normalizes a plugin from official Claude Code format to internal format
 * @param pluginPath Absolute path to plugin directory (.claude-plugin parent)
 * @returns Normalized plugin object
 */
export declare function normalizePlugin(pluginPath: string): Promise<NormalizedPlugin>;
/**
 * Auto-discovers commands using default glob pattern
 * @param pluginPath Absolute path to plugin directory
 * @returns Array of relative command paths (without ./ prefix)
 */
export declare function autoDiscoverCommands(pluginPath: string): Promise<string[]>;
/**
 * Auto-discovers agents using default glob pattern
 * @param pluginPath Absolute path to plugin directory
 * @returns Array of relative agent paths (without ./ prefix)
 */
export declare function autoDiscoverAgents(pluginPath: string): Promise<string[]>;
/**
 * Auto-discovers skills using default glob pattern
 * Skills returns parent directory paths, NOT file paths
 * @param pluginPath Absolute path to plugin directory
 * @returns Array of relative skill directory paths (without ./ prefix)
 */
export declare function autoDiscoverSkills(pluginPath: string): Promise<string[]>;
/**
 * Parses hooks configuration (file or inline object)
 * @param pluginPath Absolute path to plugin directory
 * @param hooksConfig Hooks configuration (string | object | undefined)
 * @returns Array of normalized hooks
 */
export declare function parseHooks(pluginPath: string, hooksConfig: string | object | undefined): Promise<Array<{
    event: string;
    type: 'command';
    command: string;
    matcher?: string;
    timeout?: number;
    [key: string]: any;
}>>;
/**
 * Parses MCP servers configuration (file or inline object)
 * @param pluginPath Absolute path to plugin directory
 * @param mcpConfig MCP configuration (string | object | undefined)
 * @returns Array of normalized MCPs
 */
export declare function parseMcps(pluginPath: string, mcpConfig: string | object | undefined): Promise<Array<{
    name: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
    [key: string]: any;
}>>;
//# sourceMappingURL=normalizer.d.ts.map