/**
 * Type definitions for Claude Code plugin formats
 * Based on docs/spec/001-normalization-protocol.md and 002-plugin-format-spec.md
 */

// ============================================================================
// Official Plugin Format (Claude Code)
// ============================================================================

/**
 * Official plugin.json format (Claude Code)
 * All fields are optional with defaults
 */
export interface PluginJson {
  name?: string; // Default: directory basename
  version?: string;
  description?: string;
  author?: Author | Partial<Author>;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  commands?: string | string[]; // Default: "./commands/**/*.md" glob
  agents?: string | string[]; // Default: "./agents/**/*.md" glob
  skills?: string | string[]; // Default: "./skills/*/SKILL.md" parent dirs
  hooks?: string | HooksConfig; // Default: "./hooks/hooks.json" OR "./settings.json"
  mcpServers?: string | McpServersConfig; // Default: "./.mcp.json"
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
  matcher?: string; // Tool pattern (optional, for PreToolUse/PostToolUse)
  hooks: HookAction[];
}

export interface HookAction {
  type: 'command';
  command: string;
  timeout?: number;
  [key: string]: any; // Additional fields preserved
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
  [key: string]: any; // Additional fields preserved
}

// ============================================================================
// Normalized Plugin Format (Internal)
// ============================================================================

/**
 * Normalized plugin format (curator internal)
 * All fields are always defined (no undefined values)
 */
export interface NormalizedPlugin {
  name: string; // Always present
  source: string; // Absolute path to plugin directory
  version: string; // Default: "0.0.0"
  description: string; // Default: ""
  author: Author; // Default: all empty strings
  homepage: string; // Default: ""
  repository: string; // Default: ""
  license: string; // Default: ""
  keywords: string[]; // Default: []
  commands: string[]; // ALWAYS array, never undefined
  agents: string[]; // ALWAYS array, never undefined
  skills: string[]; // ALWAYS array, never undefined
  hooks: Hook[]; // ALWAYS array, never undefined
  mcps: Mcp[]; // ALWAYS array, never undefined
}

/**
 * Normalized hook format (flat array)
 */
export interface Hook {
  event: string; // Extracted from hooks.json event key
  type: 'command'; // Only "command" is supported
  command: string; // command path
  matcher?: string; // Optional tool matcher
  timeout?: number; // Optional timeout in seconds
  [key: string]: any; // Preserve additional fields
}

/**
 * Normalized MCP format (flat array)
 */
export interface Mcp {
  name: string; // Extracted from mcpServers key
  command: string; // Executable command
  args?: string[]; // Optional arguments
  env?: Record<string, string>; // Optional env vars
  [key: string]: any; // Preserve additional fields
}

// ============================================================================
// Utility Types
// ============================================================================

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
