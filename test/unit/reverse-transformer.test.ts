import { describe, it, expect } from 'vitest';
import { omitDefaults } from '../../src/lib/reverse-transformer';

describe('Reverse Transformer', () => {
  describe('omitDefaults', () => {
    it('should remove default version', () => {
      const plugin = {
        name: 'test',
        version: '0.0.0',
        description: 'A plugin'
      };

      const result = omitDefaults(plugin);
      expect(result.version).toBeUndefined();
      expect(result.name).toBe('test');
      expect(result.description).toBe('A plugin');
    });

    it('should remove empty strings', () => {
      const plugin = {
        name: 'test',
        homepage: '',
        repository: '',
        license: ''
      };

      const result = omitDefaults(plugin);
      expect(result.homepage).toBeUndefined();
      expect(result.repository).toBeUndefined();
      expect(result.license).toBeUndefined();
    });

    it('should remove empty arrays', () => {
      const plugin = {
        name: 'test',
        commands: [],
        agents: [],
        keywords: []
      };

      const result = omitDefaults(plugin);
      expect(result.commands).toBeUndefined();
      expect(result.agents).toBeUndefined();
      expect(result.keywords).toBeUndefined();
    });

    it('should keep non-default values', () => {
      const plugin = {
        name: 'test',
        version: '1.0.0',
        description: 'A plugin',
        commands: ['./cmd1.md'],
        keywords: ['test']
      };

      const result = omitDefaults(plugin);
      expect(result.version).toBe('1.0.0');
      expect(result.description).toBe('A plugin');
      expect(result.commands).toEqual(['./cmd1.md']);
      expect(result.keywords).toEqual(['test']);
    });
  });
});
