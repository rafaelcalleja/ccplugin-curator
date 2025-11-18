import * as path from 'path';
import * as fs from 'fs/promises';
import { loadPlugin } from '../../src/loader/pluginLoader';
import { transformToNormalized } from '../../src/transform/forward';
import { savePlugin } from '../../src/saver/save';
import { SelectionState } from '../../src/tui/state/SelectionState';

describe('Multi-Plugin Conflict Resolution', () => {
  const fixturesDir = path.join(__dirname, '../fixtures');
  const pluginADir = path.join(fixturesDir, 'test-plugin-a');
  const pluginBDir = path.join(fixturesDir, 'test-plugin-b');
  const outputDir = path.join(__dirname, '../output/conflicts-test');

  beforeEach(async () => {
    // Clean output directory
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist yet
    }
  });

  afterEach(async () => {
    // Clean up output directory
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  test('should resolve command name conflicts with namespace prefix', async () => {
    // Load both plugins
    const loadedA = await loadPlugin(pluginADir);
    const loadedB = await loadPlugin(pluginBDir);

    const normalizedA = await transformToNormalized(loadedA.config, loadedA.pluginDir);
    const normalizedB = await transformToNormalized(loadedB.config, loadedB.pluginDir);

    // Create selection with conflicting commands
    const plugins = [normalizedA, normalizedB];
    const selectionState = new SelectionState(plugins);

    // Select build.md from both (CONFLICT)
    normalizedA.commands.forEach((cmd, idx) => {
      if (cmd.includes('build.md')) {
        selectionState.toggle({
          pluginName: normalizedA.name,
          type: 'command',
          path: cmd,
          index: idx
        });
      }
    });

    normalizedB.commands.forEach((cmd, idx) => {
      if (cmd.includes('build.md')) {
        selectionState.toggle({
          pluginName: normalizedB.name,
          type: 'command',
          path: cmd,
          index: idx
        });
      }
    });

    // Select deploy.md from A and test.md from B (NO CONFLICT)
    normalizedA.commands.forEach((cmd, idx) => {
      if (cmd.includes('deploy.md')) {
        selectionState.toggle({
          pluginName: normalizedA.name,
          type: 'command',
          path: cmd,
          index: idx
        });
      }
    });

    normalizedB.commands.forEach((cmd, idx) => {
      if (cmd.includes('test.md')) {
        selectionState.toggle({
          pluginName: normalizedB.name,
          type: 'command',
          path: cmd,
          index: idx
        });
      }
    });

    const merged = selectionState.buildMergedPlugin('curated-plugin');
    const sourcePlugins = new Map();
    sourcePlugins.set(normalizedA.name, normalizedA);
    sourcePlugins.set(normalizedB.name, normalizedB);

    const result = await savePlugin(merged, sourcePlugins, {
      outputDir,
      pluginName: 'curated-plugin'
    });

    // Verify namespaced files were created
    const commandsDir = path.join(result.filesDir, 'commands');
    const commands = await fs.readdir(commandsDir);

    // Both build.md files should have namespace prefix
    expect(commands).toContain('test-plugin-a--build.md');
    expect(commands).toContain('test-plugin-b--build.md');

    // Non-conflicting files should also have prefix for consistency
    expect(commands.some(c => c.includes('deploy.md'))).toBe(true);
    expect(commands.some(c => c.includes('test.md'))).toBe(true);
  });

  test('should resolve agent name conflicts with namespace prefix', async () => {
    const loadedA = await loadPlugin(pluginADir);
    const loadedB = await loadPlugin(pluginBDir);

    const normalizedA = await transformToNormalized(loadedA.config, loadedA.pluginDir);
    const normalizedB = await transformToNormalized(loadedB.config, loadedB.pluginDir);

    const plugins = [normalizedA, normalizedB];
    const selectionState = new SelectionState(plugins);

    // Select reviewer.md from both (CONFLICT)
    normalizedA.agents.forEach((agent, idx) => {
      selectionState.toggle({
        pluginName: normalizedA.name,
        type: 'agent',
        path: agent,
        index: idx
      });
    });

    normalizedB.agents.forEach((agent, idx) => {
      selectionState.toggle({
        pluginName: normalizedB.name,
        type: 'agent',
        path: agent,
        index: idx
      });
    });

    const merged = selectionState.buildMergedPlugin('curated-plugin');
    const sourcePlugins = new Map();
    sourcePlugins.set(normalizedA.name, normalizedA);
    sourcePlugins.set(normalizedB.name, normalizedB);

    const result = await savePlugin(merged, sourcePlugins, {
      outputDir,
      pluginName: 'curated-plugin'
    });

    // Verify namespaced agent files
    const agentsDir = path.join(result.filesDir, 'agents');
    const agents = await fs.readdir(agentsDir);

    expect(agents).toContain('test-plugin-a--reviewer.md');
    expect(agents).toContain('test-plugin-b--reviewer.md');
  });

  test('should resolve skill directory conflicts with namespace prefix', async () => {
    const loadedA = await loadPlugin(pluginADir);
    const loadedB = await loadPlugin(pluginBDir);

    const normalizedA = await transformToNormalized(loadedA.config, loadedA.pluginDir);
    const normalizedB = await transformToNormalized(loadedB.config, loadedB.pluginDir);

    const plugins = [normalizedA, normalizedB];
    const selectionState = new SelectionState(plugins);

    // Select chrome-devtools skill from both (CONFLICT)
    normalizedA.skills.forEach((skill, idx) => {
      selectionState.toggle({
        pluginName: normalizedA.name,
        type: 'skill',
        path: skill,
        index: idx
      });
    });

    normalizedB.skills.forEach((skill, idx) => {
      selectionState.toggle({
        pluginName: normalizedB.name,
        type: 'skill',
        path: skill,
        index: idx
      });
    });

    const merged = selectionState.buildMergedPlugin('curated-plugin');
    const sourcePlugins = new Map();
    sourcePlugins.set(normalizedA.name, normalizedA);
    sourcePlugins.set(normalizedB.name, normalizedB);

    const result = await savePlugin(merged, sourcePlugins, {
      outputDir,
      pluginName: 'curated-plugin'
    });

    // Verify namespaced skill directories
    const skillsDir = path.join(result.filesDir, 'skills');
    const skills = await fs.readdir(skillsDir);

    expect(skills).toContain('test-plugin-a--chrome-devtools');
    expect(skills).toContain('test-plugin-b--chrome-devtools');

    // Verify SKILL.md exists in both directories
    const skillAFile = path.join(skillsDir, 'test-plugin-a--chrome-devtools', 'SKILL.md');
    const skillBFile = path.join(skillsDir, 'test-plugin-b--chrome-devtools', 'SKILL.md');

    expect(await fs.access(skillAFile).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(skillBFile).then(() => true).catch(() => false)).toBe(true);
  });

  test('should merge hooks with same event into single event group', async () => {
    const loadedA = await loadPlugin(pluginADir);
    const loadedB = await loadPlugin(pluginBDir);

    const normalizedA = await transformToNormalized(loadedA.config, loadedA.pluginDir);
    const normalizedB = await transformToNormalized(loadedB.config, loadedB.pluginDir);

    const plugins = [normalizedA, normalizedB];
    const selectionState = new SelectionState(plugins);

    // Select all hooks (both have SessionStart)
    normalizedA.hooks.forEach((hook, idx) => {
      selectionState.toggle({
        pluginName: normalizedA.name,
        type: 'hook',
        path: hook.command,
        index: idx
      });
    });

    normalizedB.hooks.forEach((hook, idx) => {
      selectionState.toggle({
        pluginName: normalizedB.name,
        type: 'hook',
        path: hook.command,
        index: idx
      });
    });

    const merged = selectionState.buildMergedPlugin('curated-plugin');
    const sourcePlugins = new Map();
    sourcePlugins.set(normalizedA.name, normalizedA);
    sourcePlugins.set(normalizedB.name, normalizedB);

    const result = await savePlugin(merged, sourcePlugins, {
      outputDir,
      pluginName: 'curated-plugin'
    });

    // Read the generated plugin.json
    const pluginContent = await fs.readFile(result.pluginJson, 'utf-8');
    const plugin = JSON.parse(pluginContent);

    // Verify hooks are merged under SessionStart event
    if (plugin.hooks && typeof plugin.hooks === 'object' && 'hooks' in plugin.hooks) {
      const sessionStartHooks = plugin.hooks.hooks['SessionStart'];
      expect(sessionStartHooks).toBeDefined();

      // Should have both setup-a.sh and setup-b.sh in the same event
      const allHooks = sessionStartHooks.flatMap((entry: any) => entry.hooks || []);
      const commands = allHooks.map((h: any) => h.command);

      expect(commands.some((c: string) => c.includes('setup-a.sh'))).toBe(true);
      expect(commands.some((c: string) => c.includes('setup-b.sh'))).toBe(true);
    }
  });

  test('should resolve MCP server name conflicts with namespace prefix', async () => {
    const loadedA = await loadPlugin(pluginADir);
    const loadedB = await loadPlugin(pluginBDir);

    const normalizedA = await transformToNormalized(loadedA.config, loadedA.pluginDir);
    const normalizedB = await transformToNormalized(loadedB.config, loadedB.pluginDir);

    const plugins = [normalizedA, normalizedB];
    const selectionState = new SelectionState(plugins);

    // Select all MCPs (both have 'tavily' - CONFLICT)
    normalizedA.mcps.forEach((mcp, idx) => {
      selectionState.toggle({
        pluginName: normalizedA.name,
        type: 'mcp',
        path: mcp.name,
        index: idx
      });
    });

    normalizedB.mcps.forEach((mcp, idx) => {
      selectionState.toggle({
        pluginName: normalizedB.name,
        type: 'mcp',
        path: mcp.name,
        index: idx
      });
    });

    const merged = selectionState.buildMergedPlugin('curated-plugin');
    const sourcePlugins = new Map();
    sourcePlugins.set(normalizedA.name, normalizedA);
    sourcePlugins.set(normalizedB.name, normalizedB);

    const result = await savePlugin(merged, sourcePlugins, {
      outputDir,
      pluginName: 'curated-plugin'
    });

    // Read the generated plugin.json
    const pluginContent = await fs.readFile(result.pluginJson, 'utf-8');
    const plugin = JSON.parse(pluginContent);

    // Verify MCP servers have namespace prefix
    if (plugin.mcpServers) {
      expect(plugin.mcpServers['test-plugin-a--tavily']).toBeDefined();
      expect(plugin.mcpServers['test-plugin-b--tavily']).toBeDefined();

      // Verify they have different env values
      expect(plugin.mcpServers['test-plugin-a--tavily'].env.KEY).toBe('A');
      expect(plugin.mcpServers['test-plugin-b--tavily'].env.KEY).toBe('B');
    }
  });
});
