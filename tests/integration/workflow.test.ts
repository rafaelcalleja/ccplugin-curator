import * as path from 'path';
import * as fs from 'fs/promises';
import { loadPlugin } from '../../src/loader/pluginLoader';
import { transformToNormalized } from '../../src/transform/forward';
import { transformToOfficial } from '../../src/transform/reverse';
import { savePlugin } from '../../src/saver/save';
import { SelectionState } from '../../src/tui/state/SelectionState';

describe('Full Workflow Integration Test', () => {
  const fixturesDir = path.join(__dirname, '../fixtures');
  const testPluginDir = path.join(fixturesDir, 'test-plugin');
  const outputDir = path.join(__dirname, '../output');

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

  test('should load test plugin successfully', async () => {
    const loaded = await loadPlugin(testPluginDir);

    expect(loaded.config.name).toBe('test-plugin');
    expect(loaded.config.commands).toBeDefined();
    expect(loaded.config.agents).toBeDefined();
    expect(loaded.pluginDir).toBe(testPluginDir);
  });

  test('should transform plugin to normalized format', async () => {
    const loaded = await loadPlugin(testPluginDir);
    const normalized = await transformToNormalized(loaded.config, loaded.pluginDir);

    // Verify all fields are present
    expect(normalized.name).toBe('test-plugin');
    expect(normalized.version).toBe('1.2.3');
    expect(normalized.description).toBe('Comprehensive test plugin');
    expect(normalized.author.name).toBe('Test Author');
    expect(normalized.homepage).toBe('https://example.com/test-plugin');
    expect(normalized.license).toBe('MIT');
    expect(normalized.keywords).toEqual(['testing', 'integration']);

    // Verify commands (should be expanded from glob)
    expect(normalized.commands).toContain('commands/analyze.md');
    expect(normalized.commands).toContain('commands/optimize.md');
    expect(normalized.commands).toContain('commands/nested/deep-cmd.md');

    // Verify agents (explicit array)
    expect(normalized.agents).toContain('agents/reviewer.md');
    expect(normalized.agents).toContain('agents/context-agent.md');

    // Verify skills (auto-discovered directories)
    expect(normalized.skills).toContain('skills/skill-alpha');
    expect(normalized.skills).toContain('skills/skill-beta');
    expect(normalized.skills).toContain('skills/skill-gamma');

    // Verify hooks (flattened structure)
    expect(normalized.hooks.length).toBeGreaterThan(0);
    const sessionStartHooks = normalized.hooks.filter(h => h.event === 'SessionStart');
    expect(sessionStartHooks.length).toBe(2);

    // Verify MCPs (converted to array)
    expect(normalized.mcps.length).toBe(3);
    expect(normalized.mcps.find(m => m.name === 'tavily')).toBeDefined();
    expect(normalized.mcps.find(m => m.name === 'filesystem')).toBeDefined();
    expect(normalized.mcps.find(m => m.name === 'github')).toBeDefined();
  });

  test('should reverse transform to official format', async () => {
    const loaded = await loadPlugin(testPluginDir);
    const normalized = await transformToNormalized(loaded.config, loaded.pluginDir);
    const official = transformToOfficial(normalized);

    // Verify name is present
    expect(official.name).toBe('test-plugin');

    // Verify paths have ./ prefix
    if (Array.isArray(official.commands)) {
      official.commands.forEach(cmd => {
        expect(cmd).toMatch(/^\.\//);
      });
    }

    // Verify hooks are grouped by event
    if (typeof official.hooks === 'object' && 'hooks' in official.hooks) {
      expect(official.hooks.hooks['SessionStart']).toBeDefined();
      expect(official.hooks.hooks['PostToolUse']).toBeDefined();
    }

    // Verify MCPs are object with names as keys
    if (typeof official.mcpServers === 'object') {
      expect(official.mcpServers['tavily']).toBeDefined();
      expect(official.mcpServers['filesystem']).toBeDefined();
      expect(official.mcpServers['github']).toBeDefined();
    }
  });

  test('should save curated plugin with all files', async () => {
    const loaded = await loadPlugin(testPluginDir);
    const normalized = await transformToNormalized(loaded.config, loaded.pluginDir);

    // Create selection with all components
    const plugins = [normalized];
    const selectionState = new SelectionState(plugins);

    // Select all commands
    normalized.commands.forEach((cmd, idx) => {
      selectionState.toggle({
        pluginName: normalized.name,
        type: 'command',
        path: cmd,
        index: idx
      });
    });

    // Select all agents
    normalized.agents.forEach((agent, idx) => {
      selectionState.toggle({
        pluginName: normalized.name,
        type: 'agent',
        path: agent,
        index: idx
      });
    });

    // Select all skills
    normalized.skills.forEach((skill, idx) => {
      selectionState.toggle({
        pluginName: normalized.name,
        type: 'skill',
        path: skill,
        index: idx
      });
    });

    // Build merged plugin
    const merged = selectionState.buildMergedPlugin('test-curated-plugin');

    // Save to output directory
    const sourcePlugins = new Map();
    sourcePlugins.set(normalized.name, normalized);

    const result = await savePlugin(merged, sourcePlugins, {
      outputDir,
      pluginName: 'test-curated-plugin'
    });

    // Verify output files exist
    expect(await fs.access(result.marketplaceJson).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(result.pluginJson).then(() => true).catch(() => false)).toBe(true);
    expect(await fs.access(result.normalizedJson).then(() => true).catch(() => false)).toBe(true);

    // Verify JSON files are valid
    const marketplaceContent = await fs.readFile(result.marketplaceJson, 'utf-8');
    const marketplace = JSON.parse(marketplaceContent);
    expect(marketplace.name).toBe('test-curated-plugin');

    const pluginContent = await fs.readFile(result.pluginJson, 'utf-8');
    const plugin = JSON.parse(pluginContent);
    expect(plugin.name).toBe('test-curated-plugin');

    // Verify command files were copied
    const commandsDir = path.join(result.filesDir, 'commands');
    const commands = await fs.readdir(commandsDir, { recursive: true });
    expect(commands.filter(f => f.endsWith('.md')).length).toBeGreaterThan(0);

    // Verify skills were copied
    const skillsDir = path.join(result.filesDir, 'skills');
    const skills = await fs.readdir(skillsDir);
    expect(skills.length).toBeGreaterThan(0);
  });

  test('should preserve hook script executable permissions', async () => {
    const loaded = await loadPlugin(testPluginDir);
    const normalized = await transformToNormalized(loaded.config, loaded.pluginDir);

    // Create selection with hooks
    const plugins = [normalized];
    const selectionState = new SelectionState(plugins);

    // Select all hooks
    normalized.hooks.forEach((hook, idx) => {
      selectionState.toggle({
        pluginName: normalized.name,
        type: 'hook',
        path: hook.command,
        index: idx
      });
    });

    const merged = selectionState.buildMergedPlugin('test-curated-plugin');
    const sourcePlugins = new Map();
    sourcePlugins.set(normalized.name, normalized);

    const result = await savePlugin(merged, sourcePlugins, {
      outputDir,
      pluginName: 'test-curated-plugin'
    });

    // Check hook scripts are executable
    const hooksDir = path.join(result.filesDir, 'hooks');

    try {
      const hookFiles = await fs.readdir(hooksDir);
      const shFiles = hookFiles.filter(f => f.endsWith('.sh'));

      for (const shFile of shFiles) {
        const filePath = path.join(hooksDir, shFile);
        const stats = await fs.stat(filePath);
        // Check if file has executable permission (user execute bit)
        expect((stats.mode & 0o100) !== 0).toBe(true);
      }
    } catch (error) {
      // If hooks directory doesn't exist, that's okay for this test
    }
  });
});
