import { describe, test, expect } from 'vitest';
import { mergePlugins } from '../src/lib/save.js';
import { normalizePlugin } from '../src/lib/normalize.js';
import { reverseTransform } from '../src/lib/reverse.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Multi-Plugin Conflict Resolution', () => {
  test('should resolve command name conflicts with namespace prefix', async () => {
    const pluginADir = path.join(__dirname, 'fixtures', 'test-plugin-a');
    const pluginBDir = path.join(__dirname, 'fixtures', 'test-plugin-b');

    const pluginAJson = JSON.parse(
      await fs.readFile(path.join(pluginADir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );
    const pluginBJson = JSON.parse(
      await fs.readFile(path.join(pluginBDir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );

    const pluginA = await normalizePlugin(pluginAJson, pluginADir);
    const pluginB = await normalizePlugin(pluginBJson, pluginBDir);

    const merged = mergePlugins([pluginA, pluginB]);

    // Both plugins have "build.md" - should be prefixed
    expect(merged.commands).toContain('commands/build.md'); // First one keeps original
    expect(merged.commands).toContain('commands/test-plugin-b--build.md'); // Second one gets prefix

    // Plugin A unique commands should be preserved
    expect(merged.commands).toContain('commands/deploy.md');

    // Plugin B unique commands should be preserved
    expect(merged.commands).toContain('commands/test.md');
  });

  test('should resolve agent name conflicts with namespace prefix', async () => {
    const pluginADir = path.join(__dirname, 'fixtures', 'test-plugin-a');
    const pluginBDir = path.join(__dirname, 'fixtures', 'test-plugin-b');

    const pluginAJson = JSON.parse(
      await fs.readFile(path.join(pluginADir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );
    const pluginBJson = JSON.parse(
      await fs.readFile(path.join(pluginBDir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );

    const pluginA = await normalizePlugin(pluginAJson, pluginADir);
    const pluginB = await normalizePlugin(pluginBJson, pluginBDir);

    const merged = mergePlugins([pluginA, pluginB]);

    // Both plugins have "reviewer.md" - should be prefixed
    expect(merged.agents).toContain('agents/reviewer.md'); // First one keeps original
    expect(merged.agents).toContain('agents/test-plugin-b--reviewer.md'); // Second one gets prefix
  });

  test('should resolve skill directory conflicts with namespace prefix', async () => {
    const pluginADir = path.join(__dirname, 'fixtures', 'test-plugin-a');
    const pluginBDir = path.join(__dirname, 'fixtures', 'test-plugin-b');

    const pluginAJson = JSON.parse(
      await fs.readFile(path.join(pluginADir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );
    const pluginBJson = JSON.parse(
      await fs.readFile(path.join(pluginBDir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );

    const pluginA = await normalizePlugin(pluginAJson, pluginADir);
    const pluginB = await normalizePlugin(pluginBJson, pluginBDir);

    const merged = mergePlugins([pluginA, pluginB]);

    // Both plugins have "chrome-devtools" skill - should be prefixed
    expect(merged.skills).toContain('skills/chrome-devtools'); // First one keeps original
    expect(merged.skills).toContain('skills/test-plugin-b--chrome-devtools'); // Second one gets prefix
  });

  test('should merge hooks from same event into single array', async () => {
    const pluginADir = path.join(__dirname, 'fixtures', 'test-plugin-a');
    const pluginBDir = path.join(__dirname, 'fixtures', 'test-plugin-b');

    const pluginAJson = JSON.parse(
      await fs.readFile(path.join(__dirname, 'fixtures', 'test-plugin-a/.claude-plugin/plugin.json'), 'utf-8')
    );
    const pluginBJson = JSON.parse(
      await fs.readFile(path.join(__dirname, 'fixtures', 'test-plugin-b/.claude-plugin/plugin.json'), 'utf-8')
    );

    const pluginA = await normalizePlugin(pluginAJson, pluginADir);
    const pluginB = await normalizePlugin(pluginBJson, pluginBDir);

    const merged = mergePlugins([pluginA, pluginB]);

    // Both plugins have SessionStart hook - should merge
    const sessionStartHooks = merged.hooks.filter(h => h.event === 'SessionStart');
    expect(sessionStartHooks.length).toBe(2);

    // Verify both hook commands are present
    const commands = sessionStartHooks.map(h => h.command);
    expect(commands).toContain('${CLAUDE_PLUGIN_ROOT}/hooks/setup-a.sh');
    expect(commands).toContain('${CLAUDE_PLUGIN_ROOT}/hooks/setup-b.sh');
  });

  test('should resolve MCP name conflicts with namespace prefix', async () => {
    const pluginADir = path.join(__dirname, 'fixtures', 'test-plugin-a');
    const pluginBDir = path.join(__dirname, 'fixtures', 'test-plugin-b');

    const pluginAJson = JSON.parse(
      await fs.readFile(path.join(pluginADir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );
    const pluginBJson = JSON.parse(
      await fs.readFile(path.join(pluginBDir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );

    const pluginA = await normalizePlugin(pluginAJson, pluginADir);
    const pluginB = await normalizePlugin(pluginBJson, pluginBDir);

    const merged = mergePlugins([pluginA, pluginB]);

    // Both plugins have "tavily" MCP - should be prefixed
    const mcpNames = merged.mcps.map(m => m.name);
    expect(mcpNames).toContain('tavily'); // First one keeps original
    expect(mcpNames).toContain('test-plugin-b--tavily'); // Second one gets prefix

    // Verify configs are different
    const tavilyA = merged.mcps.find(m => m.name === 'tavily');
    const tavilyB = merged.mcps.find(m => m.name === 'test-plugin-b--tavily');
    expect(tavilyA?.env?.KEY).toBe('A');
    expect(tavilyB?.env?.KEY).toBe('B');
  });

  test('should transform merged plugin correctly to official format', async () => {
    const pluginADir = path.join(__dirname, 'fixtures', 'test-plugin-a');
    const pluginBDir = path.join(__dirname, 'fixtures', 'test-plugin-b');

    const pluginAJson = JSON.parse(
      await fs.readFile(path.join(pluginADir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );
    const pluginBJson = JSON.parse(
      await fs.readFile(path.join(pluginBDir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );

    const pluginA = await normalizePlugin(pluginAJson, pluginADir);
    const pluginB = await normalizePlugin(pluginBJson, pluginBDir);

    const merged = mergePlugins([pluginA, pluginB]);
    const official = reverseTransform(merged);

    // Verify official format structure
    expect(official.name).toBe('curated-plugin');
    expect(official.commands).toBeDefined();
    expect(official.commands?.length).toBe(4); // build (2), deploy, test

    // Verify hooks are grouped by event
    expect(official.hooks).toBeDefined();
    expect(official.hooks?.SessionStart).toBeDefined();
    expect(official.hooks?.SessionStart?.length).toBe(1);
    expect(official.hooks?.SessionStart?.[0].hooks?.length).toBe(2);

    // Verify MCPs use name as key
    expect(official.mcpServers).toBeDefined();
    expect(official.mcpServers?.['tavily']).toBeDefined();
    expect(official.mcpServers?.['test-plugin-b--tavily']).toBeDefined();
  });
});
