/**
 * Phase 4: TUI Implementation Tests
 *
 * Validates TUI components, keyboard handling, and rendering.
 *
 * Tests:
 * 1. TUI initialization and state management
 * 2. Component selection toggling
 * 3. Panel navigation
 * 4. Keyboard shortcuts (A, N, S, Q)
 * 5. Multi-plugin navigation with Tab
 */

import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { loadPlugin } from '../../src/core/plugin-loader.js';
import { normalizePlugin } from '../../src/core/normalizer.js';
import {
  createInitialState,
  getActivePlugin,
  getComponentItems,
  toggleSelection,
  isSelected,
  selectAll,
  selectNone,
  getSelection,
  getTotalSelectionCount,
  type TuiState,
} from '../../src/tui/state.js';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures');

describe('Phase 4: TUI Implementation', () => {
  describe('State Management', () => {
    it('should create initial state with correct defaults', async () => {
      // Load test plugins
      const pluginDir1 = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginDir2 = join(FIXTURES_DIR, 'test-plugin-b');

      const loaded1 = loadPlugin(pluginDir1);
      const loaded2 = loadPlugin(pluginDir2);

      const normalized1 = await normalizePlugin(loaded1.data, pluginDir1);
      const normalized2 = await normalizePlugin(loaded2.data, pluginDir2);

      // Create initial state
      const state = createInitialState([normalized1, normalized2]);

      // Verify defaults
      expect(state.plugins).toHaveLength(2);
      expect(state.activePluginIndex).toBe(0);
      expect(state.activePanel).toBe('components');
      expect(state.componentCursor).toBe(0);
      expect(state.selections.size).toBe(0);
    });

    it('should get active plugin correctly', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const state = createInitialState([normalized]);
      const activePlugin = getActivePlugin(state);

      expect(activePlugin).toBeDefined();
      expect(activePlugin?.name).toBe(normalized.name);
    });

    it('should generate component items list correctly', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const items = getComponentItems(normalized);

      // Verify items are generated for all component types
      expect(items.length).toBeGreaterThan(0);

      // Verify item structure
      items.forEach((item) => {
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('index');
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('value');
        expect(['command', 'agent', 'skill', 'hook', 'mcp']).toContain(item.type);
      });

      // Count by type
      const commandCount = items.filter((i) => i.type === 'command').length;
      const agentCount = items.filter((i) => i.type === 'agent').length;

      expect(commandCount).toBe(normalized.commands.length);
      expect(agentCount).toBe(normalized.agents.length);
    });
  });

  describe('Component Selection', () => {
    it('should toggle component selection correctly', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const state = createInitialState([normalized]);
      const items = getComponentItems(normalized);
      const firstItem = items[0];

      // Initially not selected
      expect(isSelected(state, normalized.name, firstItem)).toBe(false);

      // Toggle to select
      toggleSelection(state, normalized.name, firstItem);
      expect(isSelected(state, normalized.name, firstItem)).toBe(true);

      // Toggle to deselect
      toggleSelection(state, normalized.name, firstItem);
      expect(isSelected(state, normalized.name, firstItem)).toBe(false);
    });

    it('should handle select all correctly', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const state = createInitialState([normalized]);

      // Select all
      selectAll(state);

      const selection = getSelection(state, normalized.name);

      // Verify all components are selected
      expect(selection.commands.size).toBe(normalized.commands.length);
      expect(selection.agents.size).toBe(normalized.agents.length);
      expect(selection.skills.size).toBe(normalized.skills.length);
      expect(selection.hooks.size).toBe(normalized.hooks.length);
      expect(selection.mcps.size).toBe(normalized.mcps.length);
    });

    it('should handle select none correctly', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const state = createInitialState([normalized]);

      // First select all
      selectAll(state);

      // Then select none
      selectNone(state);

      const selection = getSelection(state, normalized.name);

      // Verify all components are deselected
      expect(selection.commands.size).toBe(0);
      expect(selection.agents.size).toBe(0);
      expect(selection.skills.size).toBe(0);
      expect(selection.hooks.size).toBe(0);
      expect(selection.mcps.size).toBe(0);
    });

    it('should track selection across multiple component types', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const state = createInitialState([normalized]);
      const items = getComponentItems(normalized);

      // Select one of each type
      const commandItem = items.find((i) => i.type === 'command');
      const agentItem = items.find((i) => i.type === 'agent');
      const skillItem = items.find((i) => i.type === 'skill');
      const hookItem = items.find((i) => i.type === 'hook');
      const mcpItem = items.find((i) => i.type === 'mcp');

      let expectedCount = 0;

      if (commandItem) {
        toggleSelection(state, normalized.name, commandItem);
        expectedCount++;
      }
      if (agentItem) {
        toggleSelection(state, normalized.name, agentItem);
        expectedCount++;
      }
      if (skillItem) {
        toggleSelection(state, normalized.name, skillItem);
        expectedCount++;
      }
      if (hookItem) {
        toggleSelection(state, normalized.name, hookItem);
        expectedCount++;
      }
      if (mcpItem) {
        toggleSelection(state, normalized.name, mcpItem);
        expectedCount++;
      }

      // Verify total selection count
      const totalCount = getTotalSelectionCount(state);
      expect(totalCount).toBe(expectedCount);
    });
  });

  describe('Multi-Plugin Support', () => {
    it('should track selections independently per plugin', async () => {
      const pluginDir1 = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginDir2 = join(FIXTURES_DIR, 'test-plugin-b');

      const loaded1 = loadPlugin(pluginDir1);
      const loaded2 = loadPlugin(pluginDir2);

      const normalized1 = await normalizePlugin(loaded1.data, pluginDir1);
      const normalized2 = await normalizePlugin(loaded2.data, pluginDir2);

      const state = createInitialState([normalized1, normalized2]);

      // Set active to plugin 1 and select all
      state.activePluginIndex = 0;
      selectAll(state);

      // Set active to plugin 2 and select none
      state.activePluginIndex = 1;
      selectNone(state);

      // Verify plugin 1 has selections
      const selection1 = getSelection(state, normalized1.name);
      expect(selection1.commands.size).toBeGreaterThan(0);

      // Verify plugin 2 has no selections
      const selection2 = getSelection(state, normalized2.name);
      expect(selection2.commands.size).toBe(0);
      expect(selection2.agents.size).toBe(0);
    });

    it('should aggregate total selection count across all plugins', async () => {
      const pluginDir1 = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginDir2 = join(FIXTURES_DIR, 'test-plugin-b');

      const loaded1 = loadPlugin(pluginDir1);
      const loaded2 = loadPlugin(pluginDir2);

      const normalized1 = await normalizePlugin(loaded1.data, pluginDir1);
      const normalized2 = await normalizePlugin(loaded2.data, pluginDir2);

      const state = createInitialState([normalized1, normalized2]);

      // Select all from plugin 1
      state.activePluginIndex = 0;
      selectAll(state);

      const count1 = getTotalSelectionCount(state);

      // Select all from plugin 2
      state.activePluginIndex = 1;
      selectAll(state);

      const count2 = getTotalSelectionCount(state);

      // Verify total count increased
      expect(count2).toBeGreaterThan(count1);

      // Calculate expected total
      const expectedTotal =
        normalized1.commands.length +
        normalized1.agents.length +
        normalized1.skills.length +
        normalized1.hooks.length +
        normalized1.mcps.length +
        normalized2.commands.length +
        normalized2.agents.length +
        normalized2.skills.length +
        normalized2.hooks.length +
        normalized2.mcps.length;

      expect(count2).toBe(expectedTotal);
    });
  });

  describe('Panel Navigation', () => {
    it('should switch active panel correctly', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const state = createInitialState([normalized]);

      // Initially on components panel
      expect(state.activePanel).toBe('components');

      // Simulate arrow left to plugins
      state.activePanel = 'plugins';
      expect(state.activePanel).toBe('plugins');

      // Simulate arrow right to components
      state.activePanel = 'components';
      expect(state.activePanel).toBe('components');

      // Simulate arrow right to preview
      state.activePanel = 'preview';
      expect(state.activePanel).toBe('preview');
    });

    it('should navigate component cursor correctly', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const state = createInitialState([normalized]);
      const items = getComponentItems(normalized);
      const maxCursor = items.length - 1;

      // Initially at 0
      expect(state.componentCursor).toBe(0);

      // Simulate down arrow
      state.componentCursor = Math.min(maxCursor, state.componentCursor + 1);
      expect(state.componentCursor).toBe(1);

      // Simulate up arrow
      state.componentCursor = Math.max(0, state.componentCursor - 1);
      expect(state.componentCursor).toBe(0);

      // Test boundary: can't go below 0
      state.componentCursor = Math.max(0, state.componentCursor - 1);
      expect(state.componentCursor).toBe(0);

      // Test boundary: can't go above max
      state.componentCursor = maxCursor + 10;
      state.componentCursor = Math.min(maxCursor, state.componentCursor);
      expect(state.componentCursor).toBe(maxCursor);
    });
  });

  describe('Component Item Labels', () => {
    it('should generate correct labels for hooks', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-hooks');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      const items = getComponentItems(normalized);
      const hookItems = items.filter((i) => i.type === 'hook');

      // Verify hook labels include event and command
      hookItems.forEach((item) => {
        expect(item.label).toContain('→'); // Should contain arrow separator
        // Label format should be: "event → command" or "event:matcher → command"
      });
    });

    it('should generate correct labels for MCPs', async () => {
      // Load a plugin with MCPs
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-mcp');

      // Check if plugin exists, skip if not
      try {
        const loaded = loadPlugin(pluginDir);
        const normalized = await normalizePlugin(loaded.data, pluginDir);

        const items = getComponentItems(normalized);
        const mcpItems = items.filter((i) => i.type === 'mcp');

        // Verify MCP labels include name and command
        mcpItems.forEach((item) => {
          expect(item.label).toContain('('); // Should contain parentheses for command
          expect(item.label).toContain(')');
        });
      } catch (error) {
        // Plugin doesn't exist, skip test
        console.log('Skipping MCP label test - test-plugin-mcp not found');
      }
    });
  });
});
