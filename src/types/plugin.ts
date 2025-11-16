/**
 * Official Claude Code Plugin Format
 * Generated from schemas/plugin.schema.json
 */

export interface PluginJson {
  name?: string;
  version?: string;
  description?: string;
  author?: {
    name?: string;
    email?: string;
    url?: string;
  };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  commands?: string | string[];
  agents?: string | string[];
  skills?: string | string[];
  hooks?: string | Record<string, any>;
  mcpServers?: string | Record<string, any>;
}
