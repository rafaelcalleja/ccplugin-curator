/**
 * Type definitions for Claude Code plugin formats
 * Based on docs/spec/001-normalization-protocol.md and 002-plugin-format-spec.md
 */
/**
 * Official plugin.json format (Claude Code)
 * All fields are optional with defaults
 */
export interface PluginJson {
    name?: string;
    version?: string;
    description?: string;
    author?: Author | Partial<Author>;
    homepage?: string;
    repository?: string;
    license?: string;
    keywords?: string[];
    commands?: string | string[];
    agents?: string | string[];
    skills?: string | string[];
    hooks?: string | HooksConfig;
    mcpServers?: string | McpServersConfig;
}
export interface Author {
    name: string;
    email: string;
    url: string;
}
/**
 * Hooks configuration format (from hooks.json or inline)
 */
export interface HooksConfig {
    [eventName: string]: HookEventConfig[];
}
export interface HookEventConfig {
    matcher?: string;
    hooks: HookAction[];
}
export interface HookAction {
    type: 'command';
    command: string;
    timeout?: number;
    [key: string]: any;
}
/**
 * MCP servers configuration format (from .mcp.json or inline)
 */
export interface McpServersConfig {
    [serverName: string]: McpServerConfig;
}
export interface McpServerConfig {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    [key: string]: any;
}
/**
 * Normalized plugin format (curator internal)
 * All fields are always defined (no undefined values)
 */
export interface NormalizedPlugin {
    name: string;
    source: string;
    version: string;
    description: string;
    author: Author;
    homepage: string;
    repository: string;
    license: string;
    keywords: string[];
    commands: string[];
    agents: string[];
    skills: string[];
    hooks: Hook[];
    mcps: Mcp[];
}
/**
 * Normalized hook format (flat array)
 */
export interface Hook {
    event: string;
    type: 'command';
    command: string;
    matcher?: string;
    timeout?: number;
    [key: string]: any;
}
/**
 * Normalized MCP format (flat array)
 */
export interface Mcp {
    name: string;
    command: string;
    args?: string[];
    env?: Record<string, string>;
    [key: string]: any;
}
/**
 * Plugin scanning options
 */
export interface ScanOptions {
    /** Base directory to scan for plugins */
    baseDir: string;
    /** Whether to follow symlinks */
    followSymlinks?: boolean;
}
/**
 * Normalization options
 */
export interface NormalizeOptions {
    /** Plugin directory path */
    pluginDir: string;
    /** Plugin.json content (optional, will be read from file if not provided) */
    pluginJson?: PluginJson;
}
//# sourceMappingURL=types.d.ts.map