import { describe, test, expect, beforeAll } from 'vitest';
import { normalizePlugin } from '../src/lib/normalize.js';
import { reverseTransform } from '../src/lib/reverse.js';
import { savePlugin, mergePlugins } from '../src/lib/save.js';
import { validateOfficialFormat, validateNormalizedFormat } from '../src/lib/validate.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Integration Tests', () => {
  const fixtureDir = path.join(__dirname, 'fixtures', 'test-plugin');

  test('should load and normalize test-plugin', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));

    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    expect(normalized.name).toBe('test-plugin');
    expect(normalized.version).toBe('1.2.3');
    expect(normalized.description).toBe('Comprehensive test plugin');
    expect(normalized.commands.length).toBeGreaterThan(0);
    expect(normalized.agents.length).toBeGreaterThan(0);
    expect(normalized.skills.length).toBeGreaterThan(0);
    expect(normalized.hooks.length).toBeGreaterThan(0);
    expect(normalized.mcps.length).toBeGreaterThan(0);
  });

  test('should validate normalized format', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    const validation = await validateNormalizedFormat(normalized);
    expect(validation.valid).toBe(true);
  });

  test('should reverse transform to official format', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    const official = reverseTransform(normalized);

    expect(official.name).toBe('test-plugin');
    expect(official.version).toBe('1.2.3');

    const validation = await validateOfficialFormat(official);
    expect(validation.valid).toBe(true);
  });

  test('should normalize hooks correctly', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    const sessionStartHooks = normalized.hooks.filter(h => h.event === 'SessionStart');
    expect(sessionStartHooks.length).toBeGreaterThan(0);

    const postToolUseHooks = normalized.hooks.filter(h => h.event === 'PostToolUse');
    expect(postToolUseHooks.length).toBeGreaterThan(0);
    expect(postToolUseHooks[0].matcher).toBe('Write|Edit');
  });

  test('should normalize MCPs correctly', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    const tavilyMcp = normalized.mcps.find(m => m.name === 'tavily');
    expect(tavilyMcp).toBeDefined();
    expect(tavilyMcp?.command).toBe('npx');
    expect(tavilyMcp?.args).toContain('@tavily/mcp-server');
  });
});
