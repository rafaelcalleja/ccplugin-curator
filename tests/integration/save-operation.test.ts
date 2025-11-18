/**
 * Integration Tests: Save Operation
 *
 * Tests the complete save workflow including:
 * - Plugin loading and normalization
 * - File copying with conflict resolution
 * - Hook script copying with executable permissions
 * - Output generation (plugin.json, marketplace.json)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, rmSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import { save, type SaveOptions } from '../../dist/core/save/index.js';
import { normalizePlugin } from '../../dist/core/normalizer.js';
import { loadPlugin } from '../../dist/core/plugin-loader.js';
import { createInitialState, getSelection } from '../../dist/tui/state.js';
import type { TuiState } from '../../dist/tui/state.js';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures');
const OUTPUT_DIR = join(process.cwd(), 'tests/output');

describe('Save Operation - Integration Tests', () => {
  // beforeEach(() => {
  //   // Clean output directory before each test
  //   if (existsSync(OUTPUT_DIR)) {
  //     rmSync(OUTPUT_DIR, { recursive: true, force: true });
  //   }
  // });

  // afterEach(() => {
  //   // Clean up after tests
  //   if (existsSync(OUTPUT_DIR)) {
  //     rmSync(OUTPUT_DIR, { recursive: true, force: true });
  //   }
  // });

  describe('Basic Save Operation', () => {
    it('should save a simple plugin with commands', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create TUI state with all commands selected
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);
      selection.commands.add(normalized.commands[1]);

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'simple-plugin'),
        pluginName: 'simple-plugin',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify result
      if (!result.success) {
        console.error('Save failed:', result.errors);
      }
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.stats.commands).toBe(2);

      // Verify output structure (per spec 007 §3)
      expect(existsSync(join(OUTPUT_DIR, 'simple-plugin'))).toBe(true);
      expect(existsSync(join(OUTPUT_DIR, 'simple-plugin/.claude-plugin/marketplace.json'))).toBe(true);
      expect(existsSync(join(OUTPUT_DIR, 'simple-plugin/plugins/simple-plugin/.claude-plugin/plugin.json'))).toBe(true);
      expect(existsSync(join(OUTPUT_DIR, 'simple-plugin/plugins/simple-plugin/commands/build.md'))).toBe(true);
      expect(existsSync(join(OUTPUT_DIR, 'simple-plugin/plugins/simple-plugin/commands/test.md'))).toBe(true);
    });

    it('should fail if output directory exists and overwrite is false', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'test-overwrite'),
        pluginName: 'test-overwrite',
        overwrite: false,
      };

      // First save should succeed
      const result1 = await save(state, options);
      expect(result1.success).toBe(true);

      // Second save should fail
      const result2 = await save(state, options);
      expect(result2.success).toBe(false);
      expect(result2.errors[0]).toContain('Output directory already exists');
    });

    it('should overwrite if overwrite option is true', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'test-overwrite2'),
        pluginName: 'test-overwrite2',
        overwrite: true,
      };

      // First save
      const result1 = await save(state, options);
      expect(result1.success).toBe(true);

      // Second save with overwrite should succeed
      const result2 = await save(state, options);
      expect(result2.success).toBe(true);
      expect(result2.errors).toEqual([]);
    });
  });

  describe('Hook Script Handling', () => {
    it('should copy hook scripts with executable permissions', async () => {
      // Load plugin with hook scripts
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-hooks');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state and select all hooks
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);
      selection.hooks.add(0); // SessionStart hook
      selection.hooks.add(1); // PreToolUse hook

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'hooks-plugin'),
        pluginName: 'hooks-plugin',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.stats.hooks).toBe(2);

      // Verify hook scripts were copied (per spec 007 §3)
      const script1Path = join(OUTPUT_DIR, 'hooks-plugin/plugins/hooks-plugin/hooks/session-start.sh');
      const script2Path = join(OUTPUT_DIR, 'hooks-plugin/plugins/hooks-plugin/hooks/pre-bash.sh');

      expect(existsSync(script1Path)).toBe(true);
      expect(existsSync(script2Path)).toBe(true);

      // Verify executable permissions (0o755 = rwxr-xr-x)
      const stat1 = statSync(script1Path);
      const stat2 = statSync(script2Path);

      // Check that owner has execute permission (bit 6 set in mode)
      expect((stat1.mode & 0o100) !== 0).toBe(true); // Owner execute
      expect((stat2.mode & 0o100) !== 0).toBe(true); // Owner execute

      // Verify script content
      const content1 = readFileSync(script1Path, 'utf-8');
      expect(content1).toContain('Session started from script');

      const content2 = readFileSync(script2Path, 'utf-8');
      expect(content2).toContain('Before bash');
    });

    it('should update hook commands with script paths', async () => {
      // Load plugin with hook scripts
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-hooks');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state and select hooks
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.hooks.add(0); // SessionStart hook

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'hooks-paths'),
        pluginName: 'hooks-paths',
        overwrite: true,
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      // Read generated plugin.json (per spec 007 §3)
      const pluginJsonPath = join(OUTPUT_DIR, 'hooks-paths/plugins/hooks-paths/.claude-plugin/plugin.json');
      const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

      // Verify hook command references the script with ${CLAUDE_PLUGIN_ROOT}
      expect(pluginJson.hooks.SessionStart).toBeDefined();
      expect(pluginJson.hooks.SessionStart[0].hooks[0].command).toBe('${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh');
    });

    it('should handle hook script conflicts with namespace prefixing', async () => {
      // Load two plugins with conflicting hook script paths
      const plugin1Dir = join(FIXTURES_DIR, 'test-plugin-hooks');
      const plugin2Dir = join(FIXTURES_DIR, 'test-plugin-hooks2');

      const loaded1 = loadPlugin(plugin1Dir);
      const loaded2 = loadPlugin(plugin2Dir);

      const normalized1 = await normalizePlugin(loaded1.data, plugin1Dir);
      const normalized2 = await normalizePlugin(loaded2.data, plugin2Dir);

      // Create state with both plugins
      const state: TuiState = createInitialState([normalized1, normalized2]);

      // Select hooks from both plugins (both have hooks/session-start.sh)
      const sel1 = getSelection(state, normalized1.name); sel1.hooks.add(0); // test-plugin-hooks SessionStart
      const sel2 = getSelection(state, normalized2.name); sel2.hooks.add(0); // test-plugin-hooks2 SessionStart

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'hooks-conflict'),
        pluginName: 'hooks-conflict',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.stats.hooks).toBe(2);

      // Verify both scripts were copied with namespace prefixes (per spec 007 §3)
      const script1Path = join(OUTPUT_DIR, 'hooks-conflict/plugins/hooks-conflict/hooks/test-plugin-hooks--session-start.sh');
      const script2Path = join(OUTPUT_DIR, 'hooks-conflict/plugins/hooks-conflict/hooks/test-plugin-hooks2--session-start.sh');

      expect(existsSync(script1Path)).toBe(true);
      expect(existsSync(script2Path)).toBe(true);

      // Verify content to ensure correct scripts were copied
      const content1 = readFileSync(script1Path, 'utf-8');
      const content2 = readFileSync(script2Path, 'utf-8');

      expect(content1).toContain('Session started from script'); // from plugin 1
      expect(content2).toContain('Session started from plugin 2'); // from plugin 2

      // Verify hook commands were updated with resolved paths and ${CLAUDE_PLUGIN_ROOT}
      const pluginJsonPath = join(OUTPUT_DIR, 'hooks-conflict/plugins/hooks-conflict/.claude-plugin/plugin.json');
      const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

      const hookCommands = pluginJson.hooks.SessionStart.flatMap((h: any) =>
        h.hooks.map((hook: any) => hook.command)
      );

      expect(hookCommands).toContain('${CLAUDE_PLUGIN_ROOT}/hooks/test-plugin-hooks--session-start.sh');
      expect(hookCommands).toContain('${CLAUDE_PLUGIN_ROOT}/hooks/test-plugin-hooks2--session-start.sh');
    });

    it('should preserve system command hooks without copying', async () => {
      // Load plugin with system command hooks (echo commands)
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state and select hooks
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.hooks.add(0); // echo 'Session started'

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'system-hooks'),
        pluginName: 'system-hooks',
        overwrite: true,
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      // Verify no hook scripts were copied (only system commands) (per spec 007 §3)
      const hooksDir = join(OUTPUT_DIR, 'system-hooks/plugins/system-hooks/hooks');
      expect(existsSync(hooksDir)).toBe(false);

      // Verify plugin.json still has the echo commands
      const pluginJsonPath = join(OUTPUT_DIR, 'system-hooks/plugins/system-hooks/.claude-plugin/plugin.json');
      const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

      expect(pluginJson.hooks.SessionStart[0].hooks[0].command).toBe("echo 'Session started'");
    });
  });

  describe('Multi-Plugin Aggregation', () => {
    it('should aggregate components from multiple plugins', async () => {
      // Load multiple plugins
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
      sel1.commands.add(normalized1.commands[0]); // build.md from plugin-a
      sel2.commands.add(normalized2.commands[0]); // deploy.md from plugin-b

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'multi-plugin'),
        pluginName: 'multi-plugin',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.stats.commands).toBe(2);

      // Verify files from both plugins were copied with namespace prefixes (per spec 007 §7.3)
      // Both plugins have build.md, so they get namespace prefixes
      expect(existsSync(join(OUTPUT_DIR, 'multi-plugin/plugins/multi-plugin/commands/test-plugin-a--build.md'))).toBe(true);
      expect(existsSync(join(OUTPUT_DIR, 'multi-plugin/plugins/multi-plugin/commands/test-plugin-b--build.md'))).toBe(true);
    });
  });
});
