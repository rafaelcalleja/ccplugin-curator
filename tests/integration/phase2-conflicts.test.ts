/**
 * Integration Tests: Phase 2 - Multi-Plugin Conflicts
 *
 * Tests comprehensive conflict resolution for:
 * - MCP server name conflicts
 * - Skill directory conflicts
 * - Hook event merging
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { save, type SaveOptions } from '../../dist/core/save/index.js';
import { normalizePlugin } from '../../dist/core/normalizer.js';
import { loadPlugin } from '../../dist/core/plugin-loader.js';
import { createInitialState, getSelection } from '../../dist/tui/state.js';
import type { TuiState } from '../../dist/tui/state.js';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures');
const OUTPUT_DIR = join(process.cwd(), 'tests/output');

describe('Phase 2: Multi-Plugin Conflict Resolution', () => {
  describe('MCP Server Conflicts', () => {
    it('should apply namespace prefix to conflicting MCP servers', async () => {
      // Load two plugins with same MCP server name
      const plugin1Dir = join(FIXTURES_DIR, 'test-plugin-a');
      const plugin2Dir = join(FIXTURES_DIR, 'test-plugin-b');

      const loaded1 = loadPlugin(plugin1Dir);
      const loaded2 = loadPlugin(plugin2Dir);

      const normalized1 = await normalizePlugin(loaded1.data, plugin1Dir);
      const normalized2 = await normalizePlugin(loaded2.data, plugin2Dir);

      // Create state with selections from both
      const state: TuiState = createInitialState([normalized1, normalized2]);
      const sel1 = getSelection(state, normalized1.name);
      const sel2 = getSelection(state, normalized2.name);

      // Select conflicting MCP "test-server" from both plugins
      sel1.mcps.add(0); // test-server from plugin-a
      sel2.mcps.add(0); // test-server from plugin-b (same name, different config)

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'mcp-conflicts'),
        pluginName: 'mcp-conflicts',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.stats.mcps).toBe(2);

      // Read generated plugin.json
      const pluginJsonPath = join(OUTPUT_DIR, 'mcp-conflicts/plugins/mcp-conflicts/.claude-plugin/plugin.json');
      const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

      // Verify MCPs have namespace prefixes
      expect(pluginJson.mcpServers).toBeDefined();
      expect(pluginJson.mcpServers['test-plugin-a--test-server']).toBeDefined();
      expect(pluginJson.mcpServers['test-plugin-b--test-server']).toBeDefined();

      // Verify different configs are preserved
      expect(pluginJson.mcpServers['test-plugin-a--test-server'].args).toEqual(['server.js']);
      expect(pluginJson.mcpServers['test-plugin-b--test-server'].args).toEqual(['server-b.js']);
    });

    it('should NOT apply namespace prefix to non-conflicting MCPs', async () => {
      // Load two plugins with different MCP names
      const plugin1Dir = join(FIXTURES_DIR, 'test-plugin-a');
      const plugin2Dir = join(FIXTURES_DIR, 'test-plugin-b');

      const loaded1 = loadPlugin(plugin1Dir);
      const loaded2 = loadPlugin(plugin2Dir);

      const normalized1 = await normalizePlugin(loaded1.data, plugin1Dir);
      const normalized2 = await normalizePlugin(loaded2.data, plugin2Dir);

      const state: TuiState = createInitialState([normalized1, normalized2]);
      const sel1 = getSelection(state, normalized1.name);
      const sel2 = getSelection(state, normalized2.name);

      // Select non-conflicting MCPs
      sel1.mcps.add(0); // test-server from plugin-a
      sel2.mcps.add(1); // unique-server from plugin-b (no conflict)

      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'mcp-no-conflicts'),
        pluginName: 'mcp-no-conflicts',
        overwrite: true,
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      const pluginJsonPath = join(OUTPUT_DIR, 'mcp-no-conflicts/plugins/mcp-no-conflicts/.claude-plugin/plugin.json');
      const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

      // Non-conflicting MCPs should use original names (no namespace prefix)
      expect(pluginJson.mcpServers['test-server']).toBeDefined();
      expect(pluginJson.mcpServers['unique-server']).toBeDefined();
      // Should NOT have namespace prefixes since there's no conflict
      expect(pluginJson.mcpServers['test-plugin-a--test-server']).toBeUndefined();
      expect(pluginJson.mcpServers['test-plugin-b--unique-server']).toBeUndefined();
    });
  });

  describe('Hook Event Merging', () => {
    it('should merge multiple hooks for the same event from different plugins', async () => {
      // Load plugins with hooks on same event
      const plugin1Dir = join(FIXTURES_DIR, 'test-plugin-a');
      const plugin2Dir = join(FIXTURES_DIR, 'test-plugin-b');

      const loaded1 = loadPlugin(plugin1Dir);
      const loaded2 = loadPlugin(plugin2Dir);

      const normalized1 = await normalizePlugin(loaded1.data, plugin1Dir);
      const normalized2 = await normalizePlugin(loaded2.data, plugin2Dir);

      const state: TuiState = createInitialState([normalized1, normalized2]);
      const sel1 = getSelection(state, normalized1.name);
      const sel2 = getSelection(state, normalized2.name);

      // Select SessionStart hooks from both plugins
      sel1.hooks.add(0); // SessionStart: echo 'Session started'
      sel2.hooks.add(0); // SessionStart: echo 'Plugin B started'

      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'hook-merging'),
        pluginName: 'hook-merging',
        overwrite: true,
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      const pluginJsonPath = join(OUTPUT_DIR, 'hook-merging/plugins/hook-merging/.claude-plugin/plugin.json');
      const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

      // Verify both hooks are in the same SessionStart event
      expect(pluginJson.hooks.SessionStart).toBeDefined();
      expect(pluginJson.hooks.SessionStart[0].hooks.length).toBe(2);

      const commands = pluginJson.hooks.SessionStart[0].hooks.map((h: any) => h.command);
      expect(commands).toContain("echo 'Session started'");
      expect(commands).toContain("echo 'Plugin B started'");
    });
  });
});
