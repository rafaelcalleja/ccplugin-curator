/**
 * Tests for plugin normalization
 * Validates requirements from docs/spec/001-normalization-protocol.md
 */

import { normalize } from '../src/normalize';
import { NormalizedPlugin, PluginJson } from '../src/types';
import * as path from 'path';

describe('Plugin Normalization', () => {
  describe('001::Invariant::1 - All normalized plugins MUST have all fields defined', () => {
    it('should have all fields defined with no undefined values', () => {
      // Arrange
      const pluginDir = '/test/plugin';
      const pluginJson: PluginJson = {
        name: 'test-plugin',
      };

      // Act
      const result = normalize(pluginDir, pluginJson);

      // Assert - Check ALL fields are defined (not undefined)
      expect(result.name).toBeDefined();
      expect(result.source).toBeDefined();
      expect(result.version).toBeDefined();
      expect(result.description).toBeDefined();
      expect(result.author).toBeDefined();
      expect(result.author.name).toBeDefined();
      expect(result.author.email).toBeDefined();
      expect(result.author.url).toBeDefined();
      expect(result.homepage).toBeDefined();
      expect(result.repository).toBeDefined();
      expect(result.license).toBeDefined();
      expect(result.keywords).toBeDefined();
      expect(result.commands).toBeDefined();
      expect(result.agents).toBeDefined();
      expect(result.skills).toBeDefined();
      expect(result.hooks).toBeDefined();
      expect(result.mcps).toBeDefined();

      // No field should be undefined
      Object.values(result).forEach(value => {
        expect(value).not.toBeUndefined();
      });
    });
  });

  describe('001::Invariant::2 - All array fields MUST be arrays', () => {
    it('should have keywords as array even when undefined in input', () => {
      const pluginDir = '/test/plugin';
      const pluginJson: PluginJson = { name: 'test' };

      const result = normalize(pluginDir, pluginJson);

      expect(Array.isArray(result.keywords)).toBe(true);
      expect(Array.isArray(result.commands)).toBe(true);
      expect(Array.isArray(result.agents)).toBe(true);
      expect(Array.isArray(result.skills)).toBe(true);
      expect(Array.isArray(result.hooks)).toBe(true);
      expect(Array.isArray(result.mcps)).toBe(true);
    });
  });

  describe('001::Invariant::3 - All component paths MUST be relative to plugin source directory', () => {
    it('should remove leading ./ from paths', () => {
      const pluginDir = '/test/plugin';
      const pluginJson: PluginJson = {
        name: 'test',
        commands: ['./commands/cmd1.md', './commands/cmd2.md'],
      };

      const result = normalize(pluginDir, pluginJson);

      expect(result.commands).toEqual(['commands/cmd1.md', 'commands/cmd2.md']);
      result.commands.forEach(cmd => {
        expect(cmd.startsWith('./')).toBe(false);
      });
    });
  });

  describe('001::Invariant::5 - source field MUST be absolute path to plugin directory', () => {
    it('should set source to absolute path', () => {
      const pluginDir = '/test/plugin';
      const pluginJson: PluginJson = { name: 'test' };

      const result = normalize(pluginDir, pluginJson);

      expect(result.source).toBe(pluginDir);
      expect(path.isAbsolute(result.source)).toBe(true);
    });
  });

  describe('Metadata defaults', () => {
    it('should apply default values for missing metadata fields', () => {
      const pluginDir = '/test/plugin';
      const pluginJson: PluginJson = { name: 'test' };

      const result = normalize(pluginDir, pluginJson);

      expect(result.version).toBe('0.0.0');
      expect(result.description).toBe('');
      expect(result.author).toEqual({ name: '', email: '', url: '' });
      expect(result.homepage).toBe('');
      expect(result.repository).toBe('');
      expect(result.license).toBe('');
      expect(result.keywords).toEqual([]);
      expect(result.commands).toEqual([]);
      expect(result.agents).toEqual([]);
      expect(result.skills).toEqual([]);
      expect(result.hooks).toEqual([]);
      expect(result.mcps).toEqual([]);
    });

    it('should preserve non-default values', () => {
      const pluginDir = '/test/plugin';
      const pluginJson: PluginJson = {
        name: 'test',
        version: '1.2.3',
        description: 'Test plugin',
        license: 'MIT',
        keywords: ['test', 'plugin'],
      };

      const result = normalize(pluginDir, pluginJson);

      expect(result.version).toBe('1.2.3');
      expect(result.description).toBe('Test plugin');
      expect(result.license).toBe('MIT');
      expect(result.keywords).toEqual(['test', 'plugin']);
    });
  });
});
