export type { ClaudeCodePluginManifest as PluginJson } from './plugin';
export type { ClaudeCodeNormalizedPlugin as NormalizedPlugin } from './normalized';

export interface Hook {
  event: string;
  type: 'command' | 'agent';
  command?: string;
  agent?: string;
  matcher?: string;
  [key: string]: any;
}

export interface Mcp {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  [key: string]: any;
}

export interface PluginMetadata {
  name: string;
  source: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
    url: string;
  };
  homepage: string;
  repository: string;
  license: string;
  keywords: string[];
}

export interface ComponentSelection {
  pluginName: string;
  commands: string[];
  agents: string[];
  skills: string[];
  hooks: Hook[];
  mcps: Mcp[];
}
