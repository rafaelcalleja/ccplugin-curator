/**
 * Integration tests - Full workflow
 * Based on 008-integration-test-spec.md lines 131-184
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { rm, readFile, stat } from 'fs/promises';
import { loadPlugins } from '../src/plugin-loader.js';
import { normalize } from '../src/transform/normalize.js';
import { officialize } from '../src/transform/officialize.js';

const testPluginPath = join(process.cwd(), 'test-fixtures/test-plugin');
const outputDir = join(process.cwd(), 'output/curated-plugin');

describe('Integration Test: Full Workflow', () => {
  beforeAll(async () => {
    // Clean output directory
    try {
      await rm(outputDir, { recursive: true, force: true });
    } catch {}
  });

  afterAll(async () => {
    // Clean up after tests
    try {
      await rm(outputDir, { recursive: true, force: true });
    } catch {}
  });

  it('loads test-plugin without errors', async () => {
    const plugins = await loadPlugins(testPluginPath);
    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe('test-plugin');
  });

  it('test-plugin has EXACTLY 3 commands (not 2 or 4)', async () => {
    const plugins = await loadPlugins(testPluginPath);
    const plugin = plugins[0];

    expect(plugin.commands).toHaveLength(3);
    expect(plugin.commands).toContain('commands/analyze.md');
    expect(plugin.commands).toContain('commands/optimize.md');
    expect(plugin.commands).toContain('commands/nested/deep-cmd.md');
  });

  it('test-plugin has EXACTLY 2 agents (not 1 or 3)', async () => {
    const plugins = await loadPlugins(testPluginPath);
    const plugin = plugins[0];

    expect(plugin.agents).toHaveLength(2);
    expect(plugin.agents).toContain('agents/reviewer.md');
    expect(plugin.agents).toContain('agents/context-agent.md');
  });

  it('test-plugin has EXACTLY 3 skills (not 2 or 4)', async () => {
    const plugins = await loadPlugins(testPluginPath);
    const plugin = plugins[0];

    expect(plugin.skills).toHaveLength(3);
    expect(plugin.skills).toContain('skills/skill-alpha');
    expect(plugin.skills).toContain('skills/skill-beta');
    expect(plugin.skills).toContain('skills/skill-gamma');
  });

  it('test-plugin has EXACTLY 4 hooks (not 3 or 5)', async () => {
    const plugins = await loadPlugins(testPluginPath);
    const plugin = plugins[0];

    expect(plugin.hooks).toHaveLength(4);

    // Verify hook events
    const events = plugin.hooks.map(h => h.event);
    expect(events.filter(e => e === 'SessionStart')).toHaveLength(2);
    expect(events.filter(e => e === 'PostToolUse')).toHaveLength(2);
  });

  it('test-plugin has EXACTLY 3 MCPs (not 2 or 4)', async () => {
    const plugins = await loadPlugins(testPluginPath);
    const plugin = plugins[0];

    expect(plugin.mcps).toHaveLength(3);

    const mcpNames = plugin.mcps.map(m => m.name);
    expect(mcpNames).toContain('tavily');
    expect(mcpNames).toContain('filesystem');
    expect(mcpNames).toContain('github');
  });

  it('normalizes plugin correctly', async () => {
    const plugins = await loadPlugins(testPluginPath);
    const plugin = plugins[0];

    // Check all required fields are present (no undefined)
    expect(plugin.name).toBeDefined();
    expect(plugin.source).toBeDefined();
    expect(plugin.version).toBeDefined();
    expect(plugin.description).toBeDefined();
    expect(plugin.author).toBeDefined();
    expect(plugin.commands).toBeDefined();
    expect(plugin.agents).toBeDefined();
    expect(plugin.skills).toBeDefined();
    expect(plugin.hooks).toBeDefined();
    expect(plugin.mcps).toBeDefined();

    // All arrays must be arrays (never undefined)
    expect(Array.isArray(plugin.commands)).toBe(true);
    expect(Array.isArray(plugin.agents)).toBe(true);
    expect(Array.isArray(plugin.skills)).toBe(true);
    expect(Array.isArray(plugin.hooks)).toBe(true);
    expect(Array.isArray(plugin.mcps)).toBe(true);
  });

  it('round-trip transformation preserves data', async () => {
    const plugins = await loadPlugins(testPluginPath);
    const normalized = plugins[0];

    // Transform to official
    const official = officialize(normalized);

    // Transform back to normalized
    const roundTrip = await normalize(testPluginPath, official);

    // Check critical fields match
    expect(roundTrip.name).toBe(normalized.name);
    expect(roundTrip.version).toBe(normalized.version);
    expect(roundTrip.commands.length).toBe(normalized.commands.length);
    expect(roundTrip.agents.length).toBe(normalized.agents.length);
    expect(roundTrip.skills.length).toBe(normalized.skills.length);
    expect(roundTrip.hooks.length).toBe(normalized.hooks.length);
    expect(roundTrip.mcps.length).toBe(normalized.mcps.length);
  });

  it('official format has correct structure', async () => {
    const plugins = await loadPlugins(testPluginPath);
    const official = officialize(plugins[0]);

    // Required field
    expect(official.name).toBe('test-plugin');

    // Non-default metadata included
    expect(official.version).toBe('1.2.3');
    expect(official.description).toBe('Comprehensive test plugin');
    expect(official.license).toBe('MIT');

    // Arrays with "./" prefix
    expect(official.commands).toBeDefined();
    if (Array.isArray(official.commands)) {
      expect(official.commands.every(c => c.startsWith('./'))).toBe(true);
    }

    // Hooks grouped by event
    expect(official.hooks).toBeDefined();
    if (typeof official.hooks === 'object') {
      expect('SessionStart' in official.hooks).toBe(true);
      expect('PostToolUse' in official.hooks).toBe(true);
    }

    // MCPs as object
    expect(official.mcpServers).toBeDefined();
    if (typeof official.mcpServers === 'object') {
      expect('tavily' in official.mcpServers).toBe(true);
    }
  });
});
