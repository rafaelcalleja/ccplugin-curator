import { normalizePath, addPathPrefix, makeRelative, resolveAbsolute } from '../../../src/loader/pathResolver';

describe('pathResolver', () => {
  describe('normalizePath', () => {
    it('should remove leading ./', () => {
      expect(normalizePath('./commands/foo.md')).toBe('commands/foo.md');
    });

    it('should leave paths without ./ unchanged', () => {
      expect(normalizePath('commands/foo.md')).toBe('commands/foo.md');
    });

    it('should handle empty string', () => {
      expect(normalizePath('')).toBe('');
    });
  });

  describe('addPathPrefix', () => {
    it('should add ./ prefix to paths without it', () => {
      expect(addPathPrefix('commands/foo.md')).toBe('./commands/foo.md');
    });

    it('should not add prefix to paths that already have it', () => {
      expect(addPathPrefix('./commands/foo.md')).toBe('./commands/foo.md');
    });

    it('should not add prefix to absolute paths', () => {
      expect(addPathPrefix('/usr/bin/foo')).toBe('/usr/bin/foo');
    });
  });

  describe('resolveAbsolute', () => {
    it('should resolve relative path to absolute', () => {
      const result = resolveAbsolute('/home/user/plugin', './commands/foo.md');
      expect(result).toBe('/home/user/plugin/commands/foo.md');
    });

    it('should normalize path before resolving', () => {
      const result = resolveAbsolute('/home/user/plugin', 'commands/foo.md');
      expect(result).toBe('/home/user/plugin/commands/foo.md');
    });
  });

  describe('makeRelative', () => {
    it('should make absolute path relative to plugin dir', () => {
      const result = makeRelative('/home/user/plugin', '/home/user/plugin/commands/foo.md');
      expect(result).toBe('commands/foo.md');
    });

    it('should normalize the result', () => {
      const result = makeRelative('/home/user/plugin', '/home/user/plugin/./commands/foo.md');
      expect(result).toBe('commands/foo.md');
    });
  });
});
