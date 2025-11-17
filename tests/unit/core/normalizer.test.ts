/**
 * Normalization Tests
 *
 * Tests the normalizePlugin function which transforms official plugin format
 * to normalized internal format.
 *
 * Spec: docs/spec/001-normalization-protocol.md
 * Spec: docs/spec/005-transformation-rules.md
 */

import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { readFileSync } from 'fs';
import { normalizePlugin } from '../../../src/core/normalizer.js';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures');

function loadPluginJson(pluginName: string): any {
  const pluginPath = join(FIXTURES_DIR, pluginName, '.claude-plugin/plugin.json');
  return JSON.parse(readFileSync(pluginPath, 'utf-8'));
}

describe('Plugin Normalization', () => {
  describe('Metadata Defaults', () => {
    it('should use directory name when name is missing', async () => {
      const pluginData = {}; // No name field
      const pluginDir = '/path/to/my-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.name).toBe('my-plugin');
    });

    it('should use provided name over directory name', async () => {
      const pluginData = { name: 'custom-name' };
      const pluginDir = '/path/to/my-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.name).toBe('custom-name');
    });

    it('should default version to "0.0.0"', async () => {
      const pluginData = { name: 'test-plugin' };
      const pluginDir = '/path/to/test-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.version).toBe('0.0.0');
    });

    it('should preserve provided version', async () => {
      const pluginData = {
        name: 'test-plugin',
        version: '1.2.3',
      };
      const pluginDir = '/path/to/test-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.version).toBe('1.2.3');
    });

    it('should default description to empty string', async () => {
      const pluginData = { name: 'test-plugin' };
      const pluginDir = '/path/to/test-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.description).toBe('');
    });

    it('should preserve provided description', async () => {
      const pluginData = {
        name: 'test-plugin',
        description: 'A test plugin',
      };
      const pluginDir = '/path/to/test-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.description).toBe('A test plugin');
    });

    it('should default author fields to empty strings', async () => {
      const pluginData = { name: 'test-plugin' };
      const pluginDir = '/path/to/test-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.author).toEqual({
        name: '',
        email: '',
        url: '',
      });
    });

    it('should merge partial author information', async () => {
      const pluginData = {
        name: 'test-plugin',
        author: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };
      const pluginDir = '/path/to/test-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.author).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        url: '',
      });
    });

    it('should default optional metadata fields', async () => {
      const pluginData = { name: 'test-plugin' };
      const pluginDir = '/path/to/test-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.homepage).toBe('');
      expect(result.repository).toBe('');
      expect(result.license).toBe('');
      expect(result.keywords).toEqual([]);
    });

    it('should preserve all provided metadata', async () => {
      const pluginData = {
        name: 'test-plugin',
        version: '2.1.0',
        description: 'Test plugin for normalization',
        author: {
          name: 'Test Author',
          email: 'test@example.com',
          url: 'https://example.com',
        },
        homepage: 'https://docs.example.com',
        repository: 'https://github.com/user/plugin',
        license: 'MIT',
        keywords: ['test', 'normalization'],
      };
      const pluginDir = '/path/to/test-plugin';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.name).toBe('test-plugin');
      expect(result.version).toBe('2.1.0');
      expect(result.description).toBe('Test plugin for normalization');
      expect(result.author).toEqual({
        name: 'Test Author',
        email: 'test@example.com',
        url: 'https://example.com',
      });
      expect(result.homepage).toBe('https://docs.example.com');
      expect(result.repository).toBe('https://github.com/user/plugin');
      expect(result.license).toBe('MIT');
      expect(result.keywords).toEqual(['test', 'normalization']);
    });
  });

  describe('Component Auto-Discovery', () => {
    it('should auto-discover commands from default directory', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a');

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.commands).toContain('commands/build.md');
      expect(result.commands).toContain('commands/test.md');
      expect(result.commands.length).toBeGreaterThanOrEqual(2);
    });

    it('should auto-discover agents from default directory', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a');

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.agents).toContain('agents/coder.md');
      expect(result.agents.length).toBeGreaterThanOrEqual(1);
    });

    it('should auto-discover skills from default directory', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a');

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.skills).toContain('skills/hello-skill');
      expect(result.skills.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty arrays when no components exist', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');
      const pluginData = { name: 'test-plugin-minimal' };

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.commands).toEqual([]);
      expect(result.agents).toEqual([]);
      expect(result.skills).toEqual([]);
    });
  });

  describe('Custom Paths (Additive Behavior)', () => {
    it('should add custom command paths to auto-discovered commands', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = {
        name: 'test-plugin-a',
        commands: ['./custom/extra-cmd.md'], // Custom path (array doesn't require file to exist)
      };

      const result = await normalizePlugin(pluginData, pluginDir);

      // Should include both auto-discovered AND custom paths
      expect(result.commands).toContain('commands/build.md'); // Auto-discovered
      expect(result.commands).toContain('commands/test.md'); // Auto-discovered
      expect(result.commands).toContain('custom/extra-cmd.md'); // Custom
    });

    it('should handle custom paths as array', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = {
        name: 'test-plugin-a',
        commands: ['./custom/cmd1.md', './custom/cmd2.md'],
      };

      const result = await normalizePlugin(pluginData, pluginDir);

      // Should include both auto-discovered AND custom array paths
      expect(result.commands).toContain('commands/build.md'); // Auto-discovered
      expect(result.commands).toContain('custom/cmd1.md'); // Custom 1
      expect(result.commands).toContain('custom/cmd2.md'); // Custom 2
    });

    it('should normalize custom paths (remove leading ./)', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');
      const pluginData = {
        name: 'test',
        commands: ['./my-commands/test.md'], // Use array so file doesn't need to exist
        agents: ['./my-agents/agent1.md', './my-agents/agent2.md'],
      };

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.commands).toContain('my-commands/test.md'); // ./ removed
      expect(result.agents).toContain('my-agents/agent1.md'); // ./ removed
      expect(result.agents).toContain('my-agents/agent2.md'); // ./ removed
    });
  });

  describe('Hooks Normalization', () => {
    it('should normalize inline hooks configuration', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a'); // Load actual plugin.json with hooks

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.hooks).toBeInstanceOf(Array);
      expect(result.hooks.length).toBeGreaterThan(0);

      // Check first hook structure
      const firstHook = result.hooks[0];
      expect(firstHook).toHaveProperty('event');
      expect(firstHook).toHaveProperty('type');
      expect(firstHook).toHaveProperty('command');
      expect(firstHook.type).toBe('command');
    });

    it('should extract hook event from configuration', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a');

      const result = await normalizePlugin(pluginData, pluginDir);

      const events = result.hooks.map(h => h.event);
      expect(events).toContain('SessionStart');
      expect(events).toContain('PreToolUse');
    });

    it('should preserve hook matchers', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a');

      const result = await normalizePlugin(pluginData, pluginDir);

      const preToolUseHook = result.hooks.find(h => h.event === 'PreToolUse');
      expect(preToolUseHook).toBeDefined();
      expect(preToolUseHook?.matcher).toBe('Bash');
    });

    it('should return empty array when no hooks configured', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');
      const pluginData = { name: 'test-plugin-minimal' };

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.hooks).toEqual([]);
    });
  });

  describe('MCPs Normalization', () => {
    it('should normalize inline MCP servers configuration', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a'); // Load actual plugin.json with mcpServers

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.mcps).toBeInstanceOf(Array);
      expect(result.mcps.length).toBeGreaterThan(0);

      // Check first MCP structure
      const firstMcp = result.mcps[0];
      expect(firstMcp).toHaveProperty('name');
      expect(firstMcp).toHaveProperty('command');
    });

    it('should extract MCP name from server key', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a');

      const result = await normalizePlugin(pluginData, pluginDir);

      const mcpNames = result.mcps.map(m => m.name);
      expect(mcpNames).toContain('test-server');
    });

    it('should preserve MCP configuration details', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a');

      const result = await normalizePlugin(pluginData, pluginDir);

      const testServer = result.mcps.find(m => m.name === 'test-server');
      expect(testServer).toBeDefined();
      expect(testServer?.command).toBe('node');
      expect(testServer?.args).toEqual(['server.js']);
      expect(testServer?.env).toEqual({ PORT: '3000' });
    });

    it('should return empty array when no MCPs configured', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');
      const pluginData = { name: 'test-plugin-minimal' };

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.mcps).toEqual([]);
    });
  });

  describe('Source Path Tracking', () => {
    it('should set source to absolute plugin directory path', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginData = loadPluginJson('test-plugin-a');

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.source).toBe(pluginDir);
      expect(result.source).toContain('test-plugin-a');
    });
  });

  describe('Edge Cases', () => {
    it('should handle plugin with only name field', async () => {
      const pluginData = { name: 'minimal' };
      const pluginDir = '/path/to/minimal';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.name).toBe('minimal');
      expect(result.version).toBe('0.0.0');
      expect(result.description).toBe('');
      expect(result.commands).toEqual([]);
      expect(result.agents).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.hooks).toEqual([]);
      expect(result.mcps).toEqual([]);
    });

    it('should handle empty author object', async () => {
      const pluginData = {
        name: 'test',
        author: {},
      };
      const pluginDir = '/path/to/test';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.author).toEqual({
        name: '',
        email: '',
        url: '',
      });
    });

    it('should handle empty keywords array', async () => {
      const pluginData = {
        name: 'test',
        keywords: [],
      };
      const pluginDir = '/path/to/test';

      const result = await normalizePlugin(pluginData, pluginDir);

      expect(result.keywords).toEqual([]);
    });
  });
});
