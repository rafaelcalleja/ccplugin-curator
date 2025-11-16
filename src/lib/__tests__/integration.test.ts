import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import { loadPluginJson, scanPlugins } from '../file-ops.js';
import { normalizePlugin } from '../normalize.js';
import { denormalizePlugin } from '../denormalize.js';
import { savePlugin } from '../file-ops.js';

describe('Integration Test Suite', () => {
  const testPluginPath = path.resolve('test-fixtures/test-plugin');
  const outputDir = path.resolve('test-fixtures/output');

  beforeAll(async () => {
    // Clean output directory
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch {
      // Directory doesn't exist, ignore
    }
  });

  afterAll(async () => {
    // Clean up
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  test('Full workflow: load → normalize → denormalize → save → verify', async () => {
    // 1. Load plugin
    const pluginJson = await loadPluginJson(testPluginPath);
    expect(pluginJson.name).toBe('test-plugin');
    expect(pluginJson.version).toBe('1.2.3');

    // 2. Normalize
    const normalized = await normalizePlugin(testPluginPath, pluginJson);

    // Verify normalized format
    expect(normalized.name).toBe('test-plugin');
    expect(normalized.version).toBe('1.2.3');
    expect(normalized.description).toBe('Comprehensive test plugin');
    expect(normalized.source).toBe(path.resolve(testPluginPath));

    // Verify commands discovered
    expect(normalized.commands).toContain('commands/analyze.md');
    expect(normalized.commands).toContain('commands/optimize.md');
    expect(normalized.commands).toContain('commands/nested/deep-cmd.md');

    // Verify agents discovered
    expect(normalized.agents).toContain('agents/reviewer.md');
    expect(normalized.agents).toContain('agents/context-agent.md');

    // Verify skills discovered
    expect(normalized.skills).toContain('skills/skill-alpha');
    expect(normalized.skills).toContain('skills/skill-beta');
    expect(normalized.skills).toContain('skills/skill-gamma');

    // Verify hooks normalized
    expect(normalized.hooks.length).toBe(4);
    expect(normalized.hooks).toContainEqual(
      expect.objectContaining({
        event: 'SessionStart',
        type: 'command',
        command: '/setup-env.sh',
      }),
    );
    expect(normalized.hooks).toContainEqual(
      expect.objectContaining({
        event: 'PostToolUse',
        type: 'command',
        command: '/security-check.sh',
        matcher: 'Bash',
      }),
    );

    // Verify MCPs normalized
    expect(normalized.mcps.length).toBe(3);
    expect(normalized.mcps).toContainEqual(
      expect.objectContaining({
        name: 'tavily',
        command: 'npx',
        args: ['-y', '@tavily/mcp-server'],
      }),
    );

    // 3. Denormalize (reverse transformation)
    const denormalized = denormalizePlugin(normalized);

    // Verify denormalized format
    expect(denormalized.name).toBe('test-plugin');
    expect(denormalized.version).toBe('1.2.3');
    expect(denormalized.hooks).toBeDefined();
    expect(denormalized.mcpServers).toBeDefined();

    // Verify hooks grouped by event
    expect(denormalized.hooks?.SessionStart).toBeDefined();
    expect(denormalized.hooks?.PostToolUse).toBeDefined();

    // Verify MCPs as object
    expect(denormalized.mcpServers?.tavily).toBeDefined();
    expect(denormalized.mcpServers?.filesystem).toBeDefined();
    expect(denormalized.mcpServers?.github).toBeDefined();

    // 4. Save plugin
    await savePlugin({
      outputDir,
      pluginName: 'curated-plugin',
      selection: normalized,
    });

    // 5. Verify outputs exist
    const marketplacePath = path.join(outputDir, '.claude-plugin', 'marketplace.json');
    const pluginJsonPath = path.join(
      outputDir,
      'plugins',
      'curated-plugin',
      '.claude-plugin',
      'plugin.json',
    );
    const normalizedPath = path.join(outputDir, 'normalized-plugin.json');

    await fs.access(marketplacePath);
    await fs.access(pluginJsonPath);
    await fs.access(normalizedPath);

    // 6. Verify marketplace.json
    const marketplace = JSON.parse(await fs.readFile(marketplacePath, 'utf-8'));
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0].name).toBe('curated-plugin');
    expect(marketplace.plugins[0].source).toBe('./plugins/curated-plugin');

    // 7. Verify plugin.json (official format)
    const savedPlugin = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    expect(savedPlugin.name).toBe('test-plugin');
    expect(savedPlugin.version).toBe('1.2.3');
    expect(savedPlugin.commands).toBeDefined();
    expect(savedPlugin.hooks).toBeDefined();
    expect(savedPlugin.mcpServers).toBeDefined();

    // 8. Verify component files copied
    const commandPath = path.join(
      outputDir,
      'plugins',
      'curated-plugin',
      'commands',
      'analyze.md',
    );
    const skillPath = path.join(
      outputDir,
      'plugins',
      'curated-plugin',
      'skills',
      'skill-alpha',
      'SKILL.md',
    );

    await fs.access(commandPath);
    await fs.access(skillPath);
  });

  test('Scan plugins directory', async () => {
    const plugins = await scanPlugins(path.resolve('test-fixtures'));
    expect(plugins.length).toBeGreaterThan(0);
    expect(plugins[0]).toContain('test-plugin');
  });

  test('Empty selection should not save', async () => {
    const pluginJson = await loadPluginJson(testPluginPath);
    const normalized = await normalizePlugin(testPluginPath, pluginJson);

    // Create empty selection
    const emptySelection = {
      ...normalized,
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    await savePlugin({
      outputDir: path.join(outputDir, 'empty-test'),
      pluginName: 'empty-plugin',
      selection: emptySelection,
    });

    // Verify files created but components are empty
    const pluginJsonPath = path.join(
      outputDir,
      'empty-test',
      'plugins',
      'empty-plugin',
      '.claude-plugin',
      'plugin.json',
    );
    const savedPlugin = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));

    // Empty arrays should be omitted in official format
    expect(savedPlugin.commands).toBeUndefined();
    expect(savedPlugin.agents).toBeUndefined();
    expect(savedPlugin.skills).toBeUndefined();
  });
});
