import type { PluginJson } from './types/index.js';
/**
 * Scan directory for Claude Code plugins
 * A plugin is identified by having a .claude-plugin/plugin.json file
 */
export declare function scanPlugins(pluginsDir: string): Promise<PluginJson[]>;
/**
 * Auto-discover plugin components
 * Searches for: commands/, agents/, skills/, hooks/hooks.json, .mcp.json
 */
export declare function autoDiscoverComponents(pluginDir: string): Promise<{
    commands: string[];
    agents: string[];
    skills: string[];
    hooks: Record<string, any> | null;
    mcps: Record<string, any> | null;
}>;
//# sourceMappingURL=scanner.d.ts.map