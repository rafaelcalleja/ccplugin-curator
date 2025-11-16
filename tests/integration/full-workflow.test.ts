/**
 * Integration Test: Full Workflow
 * Implements: docs/spec/008-integration-test-spec.md
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { normalizePlugin } from '../../src/core/normalize';
import { denormalizePlugin } from '../../src/core/denormalize';
import { saveSelection } from '../../src/core/save';
import type { PluginJson } from '../../src/types/plugin';
import type { NormalizedPlugin } from '../../src/types/normalized';

describe('Full Workflow: load → select → save → verify', () => {
  const testPluginDir = path.join(
    __dirname,
    '../../test-fixtures/test-plugin'
  );
  const outputDir = path.join(__dirname, '../../test-output');

  let normalizedPlugin: NormalizedPlugin;

  beforeAll(async () => {
    // Load test plugin
    const pluginJsonPath = path.join(
      testPluginDir,
      '.claude-plugin',
      'plugin.json'
    );
    const pluginJson: PluginJson = JSON.parse(
      fs.readFileSync(pluginJsonPath, 'utf-8')
    );

    normalizedPlugin = await normalizePlugin(testPluginDir, pluginJson);
  });

  afterAll(() => {
    // Cleanup test output
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  test('can load test-plugin without errors', () => {
    expect(normalizedPlugin).toBeDefined();
    expect(normalizedPlugin.name).toBe('test-plugin');
  });

  test('all 15 components visible (3+2+3+4+3)', () => {
    const totalComponents =
      normalizedPlugin.commands.length +
      normalizedPlugin.agents.length +
      normalizedPlugin.skills.length +
      normalizedPlugin.hooks.length +
      normalizedPlugin.mcps.length;

    expect(totalComponents).toBe(15);
  });

  test('has exactly 3 commands', () => {
    expect(normalizedPlugin.commands).toHaveLength(3);
    expect(normalizedPlugin.commands).toContain('commands/analyze.md');
    expect(normalizedPlugin.commands).toContain('commands/optimize.md');
    expect(normalizedPlugin.commands).toContain('commands/nested/deep-cmd.md');
  });

  test('has exactly 2 agents', () => {
    expect(normalizedPlugin.agents).toHaveLength(2);
    expect(normalizedPlugin.agents).toContain('agents/reviewer.md');
    expect(normalizedPlugin.agents).toContain('agents/context-agent.md');
  });

  test('has exactly 3 skills', () => {
    expect(normalizedPlugin.skills).toHaveLength(3);
    expect(normalizedPlugin.skills).toContain('skills/skill-alpha');
    expect(normalizedPlugin.skills).toContain('skills/skill-beta');
    expect(normalizedPlugin.skills).toContain('skills/skill-gamma');
  });

  test('has exactly 4 hooks', () => {
    expect(normalizedPlugin.hooks).toHaveLength(4);

    const sessionStartHooks = normalizedPlugin.hooks.filter(
      (h) => h.event === 'SessionStart'
    );
    expect(sessionStartHooks).toHaveLength(2);

    const postToolUseHooks = normalizedPlugin.hooks.filter(
      (h) => h.event === 'PostToolUse'
    );
    expect(postToolUseHooks).toHaveLength(2);
  });

  test('has exactly 3 MCPs', () => {
    expect(normalizedPlugin.mcps).toHaveLength(3);

    const mcpNames = normalizedPlugin.mcps.map((m) => m.name);
    expect(mcpNames).toContain('tavily');
    expect(mcpNames).toContain('filesystem');
    expect(mcpNames).toContain('github');
  });

  test('metadata fields are correct', () => {
    expect(normalizedPlugin.version).toBe('1.2.3');
    expect(normalizedPlugin.description).toBe('Comprehensive test plugin');
    expect(normalizedPlugin.author.name).toBe('Test Author');
    expect(normalizedPlugin.author.email).toBe('test@example.com');
    expect(normalizedPlugin.author.url).toBe('https://example.com');
    expect(normalizedPlugin.homepage).toBe(
      'https://example.com/test-plugin'
    );
    expect(normalizedPlugin.repository).toBe(
      'https://github.com/test/test-plugin'
    );
    expect(normalizedPlugin.license).toBe('MIT');
    expect(normalizedPlugin.keywords).toEqual(['testing', 'integration']);
  });

  test('save generates all output files', async () => {
    const result = await saveSelection(normalizedPlugin, {
      outputDir,
      pluginName: 'curated-plugin',
      overwrite: true,
    });

    expect(result.success).toBe(true);
    expect(result.paths).toBeDefined();

    // Verify marketplace.json exists
    expect(fs.existsSync(result.paths!.marketplace)).toBe(true);

    // Verify plugin.json exists
    expect(fs.existsSync(result.paths!.plugin)).toBe(true);

    // Verify normalized-plugin.json exists
    expect(fs.existsSync(result.paths!.normalized)).toBe(true);
  });

  test('marketplace.json is valid and contains plugin', async () => {
    await saveSelection(normalizedPlugin, {
      outputDir,
      pluginName: 'curated-plugin',
      overwrite: true,
    });

    const marketplacePath = path.join(
      outputDir,
      '.claude-plugin',
      'marketplace.json'
    );
    const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf-8'));

    expect(marketplace.name).toBe('curated-plugins');
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0].name).toBe('curated-plugin');
    expect(marketplace.plugins[0].source).toBe('./plugins/curated-plugin');
  });

  test('plugin.json is valid official format', async () => {
    await saveSelection(normalizedPlugin, {
      outputDir,
      pluginName: 'curated-plugin',
      overwrite: true,
    });

    const pluginJsonPath = path.join(
      outputDir,
      'plugins',
      'curated-plugin',
      '.claude-plugin',
      'plugin.json'
    );
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));

    expect(pluginJson.name).toBe('test-plugin');
    expect(pluginJson.version).toBe('1.2.3');
    expect(pluginJson.description).toBe('Comprehensive test plugin');
    expect(pluginJson.commands).toBeInstanceOf(Array);
    expect(pluginJson.agents).toBeInstanceOf(Array);
    expect(pluginJson.skills).toBeInstanceOf(Array);
    expect(pluginJson.hooks).toBeInstanceOf(Object);
    expect(pluginJson.mcpServers).toBeInstanceOf(Object);
  });

  test('all selected files are copied to output', async () => {
    await saveSelection(normalizedPlugin, {
      outputDir,
      pluginName: 'curated-plugin',
      overwrite: true,
    });

    const pluginDir = path.join(outputDir, 'plugins', 'curated-plugin');

    // Check commands
    expect(
      fs.existsSync(path.join(pluginDir, 'commands/analyze.md'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(pluginDir, 'commands/optimize.md'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(pluginDir, 'commands/nested/deep-cmd.md'))
    ).toBe(true);

    // Check agents
    expect(
      fs.existsSync(path.join(pluginDir, 'agents/reviewer.md'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(pluginDir, 'agents/context-agent.md'))
    ).toBe(true);

    // Check skills
    expect(
      fs.existsSync(path.join(pluginDir, 'skills/skill-alpha/SKILL.md'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(pluginDir, 'skills/skill-alpha/helpers.ts'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(pluginDir, 'skills/skill-beta/SKILL.md'))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(pluginDir, 'skills/skill-gamma/SKILL.md'))
    ).toBe(true);
  });

  test('reverse transformation produces valid plugin.json', () => {
    const officialFormat = denormalizePlugin(normalizedPlugin);

    expect(officialFormat.name).toBe('test-plugin');
    expect(officialFormat.version).toBe('1.2.3');
    expect(officialFormat.commands).toBeInstanceOf(Array);
    expect(officialFormat.commands?.length).toBe(3);
    expect(officialFormat.hooks).toBeInstanceOf(Object);
    expect(officialFormat.mcpServers).toBeInstanceOf(Object);

    // Verify hooks structure
    const hooks = officialFormat.hooks as Record<string, any>;
    expect(hooks['SessionStart']).toBeDefined();
    expect(hooks['PostToolUse']).toBeDefined();

    // Verify MCPs structure
    const mcps = officialFormat.mcpServers as Record<string, any>;
    expect(mcps['tavily']).toBeDefined();
    expect(mcps['filesystem']).toBeDefined();
    expect(mcps['github']).toBeDefined();
  });
});
