/**
 * Integration Test: Multi-Plugin Conflicts
 * Implements: docs/spec/008-integration-test-spec.md (multi-plugin scenario)
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { normalizePlugin } from '../../src/core/normalize';
import { mergeSelections, saveSelection } from '../../src/core/save';
import type { PluginJson } from '../../src/types/plugin';
import type { NormalizedPlugin } from '../../src/types/normalized';

describe('Multi-Plugin Conflicts', () => {
  const testPluginADir = path.join(
    __dirname,
    '../../test-fixtures/test-plugin-a'
  );
  const testPluginBDir = path.join(
    __dirname,
    '../../test-fixtures/test-plugin-b'
  );
  const outputDir = path.join(__dirname, '../../test-output-conflicts');

  let pluginA: NormalizedPlugin;
  let pluginB: NormalizedPlugin;
  let merged: NormalizedPlugin;

  beforeAll(async () => {
    // Load plugin A
    const pluginAJsonPath = path.join(
      testPluginADir,
      '.claude-plugin',
      'plugin.json'
    );
    const pluginAJson: PluginJson = JSON.parse(
      fs.readFileSync(pluginAJsonPath, 'utf-8')
    );
    pluginA = await normalizePlugin(testPluginADir, pluginAJson);

    // Load plugin B
    const pluginBJsonPath = path.join(
      testPluginBDir,
      '.claude-plugin',
      'plugin.json'
    );
    const pluginBJson: PluginJson = JSON.parse(
      fs.readFileSync(pluginBJsonPath, 'utf-8')
    );
    pluginB = await normalizePlugin(testPluginBDir, pluginBJson);

    // Merge selections
    merged = mergeSelections([pluginA, pluginB]);
  });

  afterAll(() => {
    // Cleanup test output
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  test('load two plugins with conflicts', () => {
    expect(pluginA).toBeDefined();
    expect(pluginB).toBeDefined();
    expect(pluginA.name).toBe('test-plugin-a');
    expect(pluginB.name).toBe('test-plugin-b');
  });

  test('commands have namespace prefix for conflicts', () => {
    // Plugin A has: build.md, deploy.md
    // Plugin B has: build.md (conflict), test.md

    expect(merged.commands).toContain('commands/test-plugin-a--build.md');
    expect(merged.commands).toContain('commands/deploy.md');
    expect(merged.commands).toContain('commands/test-plugin-b--build.md');
    expect(merged.commands).toContain('commands/test.md');
  });

  test('agents have namespace prefix for conflicts', () => {
    // Both plugins have: reviewer.md (conflict)

    expect(merged.agents).toContain('agents/test-plugin-a--reviewer.md');
    expect(merged.agents).toContain('agents/test-plugin-b--reviewer.md');
  });

  test('skills have namespace prefix for conflicts', () => {
    // Both plugins have: skills/chrome-devtools/ (conflict)

    expect(merged.skills).toContain(
      'skills/test-plugin-a--chrome-devtools'
    );
    expect(merged.skills).toContain(
      'skills/test-plugin-b--chrome-devtools'
    );
  });

  test('MCPs have namespace prefix for conflicts', () => {
    // Both plugins have MCP "tavily" with different configs (conflict)

    const tavilyA = merged.mcps.find(
      (m) => m.name === 'test-plugin-a--tavily'
    );
    const tavilyB = merged.mcps.find(
      (m) => m.name === 'test-plugin-b--tavily'
    );

    expect(tavilyA).toBeDefined();
    expect(tavilyB).toBeDefined();
    expect(tavilyA?.env?.KEY).toBe('A');
    expect(tavilyB?.env?.KEY).toBe('B');
  });

  test('hooks are merged for same event', () => {
    // Both plugins have SessionStart hooks → should merge

    const sessionStartHooks = merged.hooks.filter(
      (h) => h.event === 'SessionStart'
    );

    expect(sessionStartHooks).toHaveLength(2);
    expect(sessionStartHooks.some((h) => h.command === '/setup-a.sh')).toBe(
      true
    );
    expect(sessionStartHooks.some((h) => h.command === '/setup-b.sh')).toBe(
      true
    );
  });

  test('save and verify output structure', async () => {
    const result = await saveSelection(merged, {
      outputDir,
      pluginName: 'merged-plugin',
      overwrite: true,
      sourceMappings: [
        { pluginName: 'test-plugin-a', sourceDir: testPluginADir },
        { pluginName: 'test-plugin-b', sourceDir: testPluginBDir },
      ],
    });

    expect(result.success).toBe(true);

    const pluginJsonPath = path.join(
      outputDir,
      'plugins',
      'merged-plugin',
      '.claude-plugin',
      'plugin.json'
    );
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));

    // Verify commands array
    expect(pluginJson.commands).toBeInstanceOf(Array);
    expect(pluginJson.commands).toHaveLength(4);

    // Verify agents array
    expect(pluginJson.agents).toBeInstanceOf(Array);
    expect(pluginJson.agents).toHaveLength(2);

    // Verify skills array
    expect(pluginJson.skills).toBeInstanceOf(Array);
    expect(pluginJson.skills).toHaveLength(2);

    // Verify hooks object
    expect(pluginJson.hooks).toBeInstanceOf(Object);
    expect(pluginJson.hooks.SessionStart).toBeDefined();
    expect(pluginJson.hooks.SessionStart[0].hooks).toHaveLength(2);

    // Verify MCPs object
    expect(pluginJson.mcpServers).toBeInstanceOf(Object);
    expect(pluginJson.mcpServers['test-plugin-a--tavily']).toBeDefined();
    expect(pluginJson.mcpServers['test-plugin-b--tavily']).toBeDefined();
  });
});
