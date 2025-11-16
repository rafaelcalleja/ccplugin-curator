import { describe, test, expect } from 'vitest';
import { loadPlugin, getPluginComponents } from '../src/scanner/plugin-scanner';
import * as path from 'path';

const TEST_PLUGIN_DIR = path.resolve(__dirname, '../test-fixtures/test-plugin');

describe('Scanner Tests', () => {
  describe('loadPlugin', () => {
    test('Loads test plugin correctly', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('test-plugin');
      expect(plugin.version).toBe('1.2.3');
      expect(plugin.description).toBe('Comprehensive test plugin');
      expect(plugin.source).toBe(TEST_PLUGIN_DIR);
    });

    test('Plugin metadata is normalized', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);

      expect(plugin.author).toBeDefined();
      expect(plugin.author.name).toBe('Test Author');
      expect(plugin.author.email).toBe('test@example.com');
      expect(plugin.author.url).toBe('https://example.com');

      expect(plugin.homepage).toBe('https://example.com/test-plugin');
      expect(plugin.repository).toBe('https://github.com/test/test-plugin');
      expect(plugin.license).toBe('MIT');
      expect(plugin.keywords).toEqual(['testing', 'integration']);
    });

    test('Commands are discovered', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);

      // Should discover all .md files in commands/ directory
      expect(plugin.commands).toBeDefined();
      expect(plugin.commands.length).toBeGreaterThanOrEqual(3);

      // Should include nested commands
      const hasNestedCommand = plugin.commands.some(c => c.includes('nested'));
      expect(hasNestedCommand).toBe(true);
    });

    test('Agents are discovered', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);

      expect(plugin.agents).toBeDefined();
      expect(plugin.agents).toHaveLength(2);

      const agentNames = plugin.agents.map(a => path.basename(a, '.md'));
      expect(agentNames).toContain('reviewer');
      expect(agentNames).toContain('context-agent');
    });

    test('Skills are discovered', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);

      expect(plugin.skills).toBeDefined();
      expect(plugin.skills).toHaveLength(3);

      const skillNames = plugin.skills.map(s => path.basename(s));
      expect(skillNames).toContain('skill-alpha');
      expect(skillNames).toContain('skill-beta');
      expect(skillNames).toContain('skill-gamma');
    });

    test('Hooks are normalized to array', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);

      expect(plugin.hooks).toBeDefined();
      expect(Array.isArray(plugin.hooks)).toBe(true);
      expect(plugin.hooks.length).toBeGreaterThan(0);

      // Each hook should have an ID
      plugin.hooks.forEach((hook: any) => {
        expect(hook.id).toBeDefined();
        expect(hook.id).toContain('test-plugin:');
        expect(hook.event).toBeDefined();
        expect(hook.config).toBeDefined();
      });
    });

    test('MCPs are normalized to array', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);

      expect(plugin.mcps).toBeDefined();
      expect(Array.isArray(plugin.mcps)).toBe(true);
      expect(plugin.mcps).toHaveLength(3);

      // Each MCP should have an ID and name
      plugin.mcps.forEach((mcp: any) => {
        expect(mcp.id).toBeDefined();
        expect(mcp.id).toContain('test-plugin:mcp:');
        expect(mcp.name).toBeDefined();
        expect(mcp.config).toBeDefined();
        expect(mcp.config.command).toBeDefined();
      });

      const mcpNames = plugin.mcps.map((m: any) => m.name);
      expect(mcpNames).toContain('tavily');
      expect(mcpNames).toContain('filesystem');
      expect(mcpNames).toContain('github');
    });
  });

  describe('getPluginComponents', () => {
    test('Returns all component types', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);
      const components = getPluginComponents(plugin);

      expect(components.commands).toBeDefined();
      expect(components.agents).toBeDefined();
      expect(components.skills).toBeDefined();
      expect(components.hooks).toBeDefined();
      expect(components.mcps).toBeDefined();
    });

    test('Commands have correct structure', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);
      const components = getPluginComponents(plugin);

      expect(components.commands).toHaveLength(3);

      components.commands.forEach(cmd => {
        expect(cmd.id).toBeDefined();
        expect(cmd.type).toBe('command');
        expect(cmd.path).toBeDefined();
        expect(cmd.name).toBeDefined();
        expect(cmd.selected).toBe(false);
      });
    });

    test('Agents have correct structure', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);
      const components = getPluginComponents(plugin);

      expect(components.agents).toHaveLength(2);

      components.agents.forEach(agent => {
        expect(agent.id).toBeDefined();
        expect(agent.type).toBe('agent');
        expect(agent.path).toBeDefined();
        expect(agent.name).toBeDefined();
        expect(agent.selected).toBe(false);
      });
    });

    test('Skills have correct structure', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);
      const components = getPluginComponents(plugin);

      expect(components.skills).toHaveLength(3);

      components.skills.forEach(skill => {
        expect(skill.id).toBeDefined();
        expect(skill.type).toBe('skill');
        expect(skill.path).toBeDefined();
        expect(skill.name).toBeDefined();
        expect(skill.selected).toBe(false);
      });
    });

    test('Hooks have display names', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);
      const components = getPluginComponents(plugin);

      expect(components.hooks.length).toBeGreaterThan(0);

      components.hooks.forEach(hook => {
        expect(hook.id).toBeDefined();
        expect(hook.event).toBeDefined();
        expect(hook.config).toBeDefined();
        expect(hook.displayName).toBeDefined();
        expect(hook.selected).toBe(false);

        // Display name should follow format: event:matcher → action
        expect(hook.displayName).toContain('→');
      });
    });

    test('MCPs have display names and details', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);
      const components = getPluginComponents(plugin);

      expect(components.mcps).toHaveLength(3);

      components.mcps.forEach(mcp => {
        expect(mcp.id).toBeDefined();
        expect(mcp.name).toBeDefined();
        expect(mcp.config).toBeDefined();
        expect(mcp.displayName).toBeDefined();
        expect(mcp.selected).toBe(false);
      });
    });

    test('Component IDs are unique', async () => {
      const plugin = await loadPlugin(TEST_PLUGIN_DIR);
      const components = getPluginComponents(plugin);

      const allIds = [
        ...components.commands.map(c => c.id),
        ...components.agents.map(a => a.id),
        ...components.skills.map(s => s.id),
        ...components.hooks.map(h => h.id),
        ...components.mcps.map(m => m.id)
      ];

      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });
});
