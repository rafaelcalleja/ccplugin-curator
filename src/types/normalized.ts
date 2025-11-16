/**
 * Normalized Plugin Format (Internal)
 * Generated from schemas/normalized-plugin.schema.json
 */

export interface Hook {
  event: string;
  type: 'command';
  command: string;
  matcher?: string;
  timeout?: number;
  [key: string]: any;
}

export interface Mcp {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  [key: string]: any;
}

export interface NormalizedPlugin {
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
  commands: string[];
  agents: string[];
  skills: string[];
  hooks: Hook[];
  mcps: Mcp[];
}
