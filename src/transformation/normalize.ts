import { ClaudeCodePluginManifest } from '../types/plugin';
import { ClaudeCodeNormalizedPlugin } from '../types/normalized';
import * as path from 'path';
import * as fs from 'fs';
import { glob } from 'glob';

/**
 * Transforms a plugin from official Claude Code format to normalized internal format
 * Following spec: 005-transformation-rules.md
 */
export async function normalizePlugin(
  pluginJson: ClaudeCodePluginManifest,
  pluginDir: string
): Promise<ClaudeCodeNormalizedPlugin> {
  const absolutePluginDir = path.resolve(pluginDir);

  // Get plugin name (use directory basename if not specified)
  const name = pluginJson.name || path.basename(absolutePluginDir);

  // Normalize metadata with defaults
  const version = pluginJson.version || '0.0.0';
  const description = pluginJson.description || '';
  const author = {
    name: pluginJson.author?.name || '',
    email: pluginJson.author?.email || '',
    url: pluginJson.author?.url || ''
  };
  const homepage = pluginJson.homepage || '';
  const repository = pluginJson.repository || '';
  const license = pluginJson.license || '';
  const keywords = pluginJson.keywords || [];

  // Normalize component paths
  const commands = await normalizeComponentPaths(
    pluginJson.commands,
    absolutePluginDir,
    'commands/**/*.md'
  );

  const agents = await normalizeComponentPaths(
    pluginJson.agents,
    absolutePluginDir,
    'agents/**/*.md'
  );

  const skills = await normalizeSkillPaths(
    undefined, // Skills not in official schema, only auto-discovered
    absolutePluginDir
  );

  // Normalize hooks
  const hooks = await normalizeHooks(pluginJson.hooks, absolutePluginDir, name);

  // Normalize MCPs
  const mcps = await normalizeMcps(pluginJson.mcpServers, absolutePluginDir, name);

  return {
    name,
    source: absolutePluginDir,
    version,
    description,
    author,
    homepage,
    repository,
    license,
    keywords,
    commands,
    agents,
    skills,
    hooks,
    mcps
  };
}

/**
 * Normalize command/agent paths (string|array|undefined → array)
 */
async function normalizeComponentPaths(
  paths: string | string[] | undefined,
  pluginDir: string,
  defaultGlob: string
): Promise<string[]> {
  const results: string[] = [];

  // Auto-discovery ALWAYS happens if default directory exists
  const autoDiscovered = await glob(defaultGlob, { cwd: pluginDir });
  results.push(...autoDiscovered.map(p => removeDotSlash(p)));

  // Custom paths COMPLEMENT auto-discovery
  if (paths) {
    if (typeof paths === 'string') {
      // Single path - glob it
      const customPaths = await glob(`${paths}/**/*.md`, { cwd: pluginDir });
      results.push(...customPaths.map(p => removeDotSlash(p)));
    } else if (Array.isArray(paths)) {
      // Array of paths - add directly
      results.push(...paths.map(p => removeDotSlash(p)));
    }
  }

  // Remove duplicates and return
  return [...new Set(results)];
}

/**
 * Normalize skill paths (discovers skills with SKILL.md files)
 */
async function normalizeSkillPaths(
  skillsConfig: string | string[] | undefined,
  pluginDir: string
): Promise<string[]> {
  const results: string[] = [];

  // Auto-discovery: find all skills/*/SKILL.md
  const skillFiles = await glob('skills/*/SKILL.md', { cwd: pluginDir });
  const skillDirs = skillFiles.map(f => path.dirname(f));
  results.push(...skillDirs);

  // Custom paths COMPLEMENT auto-discovery
  if (skillsConfig) {
    if (typeof skillsConfig === 'string') {
      // Single path - glob for SKILL.md files
      const customSkills = await glob(`${skillsConfig}/*/SKILL.md`, { cwd: pluginDir });
      const customDirs = customSkills.map(f => path.dirname(f));
      results.push(...customDirs.map(p => removeDotSlash(p)));
    } else if (Array.isArray(skillsConfig)) {
      // Array of directory paths
      results.push(...skillsConfig.map(p => removeDotSlash(p)));
    }
  }

  // Remove duplicates and return
  return [...new Set(results)];
}

/**
 * Normalize hooks (string|object|undefined → array with IDs)
 */
async function normalizeHooks(
  hooksConfig: string | Record<string, any> | undefined,
  pluginDir: string,
  pluginName: string
): Promise<any[]> {
  let hooksData: Record<string, any> | undefined;

  if (typeof hooksConfig === 'string') {
    // Load from file
    const hooksPath = path.join(pluginDir, hooksConfig);
    if (fs.existsSync(hooksPath)) {
      const content = fs.readFileSync(hooksPath, 'utf-8');
      const parsed = JSON.parse(content);
      hooksData = parsed.hooks || parsed;
    }
  } else if (typeof hooksConfig === 'object') {
    // Inline configuration
    hooksData = hooksConfig;
  } else {
    // Try default location
    const defaultHooksPath = path.join(pluginDir, 'hooks/hooks.json');
    if (fs.existsSync(defaultHooksPath)) {
      const content = fs.readFileSync(defaultHooksPath, 'utf-8');
      const parsed = JSON.parse(content);
      hooksData = parsed.hooks || parsed;
    }
  }

  if (!hooksData) {
    return [];
  }

  // Flatten nested structure to array
  const results: any[] = [];
  let hookIndex = 0;

  for (const [event, eventConfigs] of Object.entries(hooksData)) {
    if (!Array.isArray(eventConfigs)) continue;

    for (const eventConfig of eventConfigs) {
      const matcher = eventConfig.matcher;
      const hooksList = eventConfig.hooks || [];

      for (const hook of hooksList) {
        const normalizedHook: any = {
          id: `${pluginName}:${event}:${hookIndex++}`,
          event,
          config: { ...hook }
        };

        if (matcher) {
          normalizedHook.matcher = matcher;
        }

        results.push(normalizedHook);
      }
    }
  }

  return results;
}

/**
 * Normalize MCPs (string|object|undefined → array with IDs)
 */
async function normalizeMcps(
  mcpConfig: string | Record<string, any> | undefined,
  pluginDir: string,
  pluginName: string
): Promise<any[]> {
  let mcpData: Record<string, any> | undefined;

  if (typeof mcpConfig === 'string') {
    // Load from file
    const mcpPath = path.join(pluginDir, mcpConfig);
    if (fs.existsSync(mcpPath)) {
      const content = fs.readFileSync(mcpPath, 'utf-8');
      const parsed = JSON.parse(content);
      mcpData = parsed.mcpServers || parsed;
    }
  } else if (typeof mcpConfig === 'object') {
    // Inline configuration
    mcpData = mcpConfig;
  } else {
    // Try default location
    const defaultMcpPath = path.join(pluginDir, '.mcp.json');
    if (fs.existsSync(defaultMcpPath)) {
      const content = fs.readFileSync(defaultMcpPath, 'utf-8');
      const parsed = JSON.parse(content);
      mcpData = parsed.mcpServers || parsed;
    }
  }

  if (!mcpData) {
    return [];
  }

  // Convert object to array
  const results: any[] = [];

  for (const [name, config] of Object.entries(mcpData)) {
    results.push({
      id: `${pluginName}:mcp:${name}`,
      name,
      config: {
        command: (config as any).command,
        args: (config as any).args || [],
        env: (config as any).env || {},
        ...(config as any).cwd && { cwd: (config as any).cwd }
      }
    });
  }

  return results;
}

/**
 * Remove leading "./" from path
 */
function removeDotSlash(p: string): string {
  return p.replace(/^\.\//, '');
}
