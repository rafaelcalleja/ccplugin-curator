import { describe, it, expect } from 'vitest';
import { resolvePathConflicts, resolveMcpConflicts } from '../../../src/core/save/conflicts.js';

describe('resolvePathConflicts', () => {
  it('should not modify paths when no conflicts', () => {
    const items = [
      { pluginName: 'plugin-a', path: './commands/build.md' },
      { pluginName: 'plugin-a', path: './commands/test.md' },
    ];

    const result = resolvePathConflicts(items);

    expect(result).toEqual([
      { original: './commands/build.md', resolved: './commands/build.md', pluginName: 'plugin-a' },
      { original: './commands/test.md', resolved: './commands/test.md', pluginName: 'plugin-a' },
    ]);
  });

  it('should add namespace prefix when basename conflicts', () => {
    const items = [
      { pluginName: 'plugin-a', path: './commands/build.md' },
      { pluginName: 'plugin-b', path: './commands/build.md' },
    ];

    const result = resolvePathConflicts(items);

    expect(result).toEqual([
      { original: './commands/build.md', resolved: './commands/plugin-a--build.md', pluginName: 'plugin-a' },
      { original: './commands/build.md', resolved: './commands/plugin-b--build.md', pluginName: 'plugin-b' },
    ]);
  });

  it('should handle skills (directories)', () => {
    const items = [
      { pluginName: 'plugin-a', path: './skills/hello-skill' },
      { pluginName: 'plugin-b', path: './skills/hello-skill' },
    ];

    const result = resolvePathConflicts(items);

    expect(result).toEqual([
      { original: './skills/hello-skill', resolved: './skills/plugin-a--hello-skill', pluginName: 'plugin-a' },
      { original: './skills/hello-skill', resolved: './skills/plugin-b--hello-skill', pluginName: 'plugin-b' },
    ]);
  });

  it('should handle mixed conflicts and non-conflicts', () => {
    const items = [
      { pluginName: 'plugin-a', path: './commands/build.md' },
      { pluginName: 'plugin-b', path: './commands/build.md' },
      { pluginName: 'plugin-a', path: './commands/test.md' },
      { pluginName: 'plugin-b', path: './commands/deploy.md' },
    ];

    const result = resolvePathConflicts(items);

    const buildA = result.find((r) => r.pluginName === 'plugin-a' && r.original.includes('build'));
    const buildB = result.find((r) => r.pluginName === 'plugin-b' && r.original.includes('build'));
    const test = result.find((r) => r.original.includes('test'));
    const deploy = result.find((r) => r.original.includes('deploy'));

    expect(buildA?.resolved).toBe('./commands/plugin-a--build.md');
    expect(buildB?.resolved).toBe('./commands/plugin-b--build.md');
    expect(test?.resolved).toBe('./commands/test.md'); // No conflict
    expect(deploy?.resolved).toBe('./commands/deploy.md'); // No conflict
  });

  it('should preserve directory structure in resolved path', () => {
    const items = [
      { pluginName: 'plugin-a', path: './commands/nested/build.md' },
      { pluginName: 'plugin-b', path: './commands/nested/build.md' },
    ];

    const result = resolvePathConflicts(items);

    expect(result[0].resolved).toBe('./commands/nested/plugin-a--build.md');
    expect(result[1].resolved).toBe('./commands/nested/plugin-b--build.md');
  });
});

describe('resolveMcpConflicts', () => {
  it('should not modify MCPs when no conflicts', () => {
    const mcps = [
      { pluginName: 'plugin-a', mcpName: 'server-a' },
      { pluginName: 'plugin-a', mcpName: 'server-b' },
    ];

    const result = resolveMcpConflicts(mcps);

    expect(result.size).toBe(2);
    expect(result.get('plugin-a:server-a')).toEqual({
      original: 'server-a',
      resolved: 'server-a',
      pluginName: 'plugin-a',
    });
    expect(result.get('plugin-a:server-b')).toEqual({
      original: 'server-b',
      resolved: 'server-b',
      pluginName: 'plugin-a',
    });
  });

  it('should add namespace prefix when MCP name conflicts', () => {
    const mcps = [
      { pluginName: 'plugin-a', mcpName: 'server' },
      { pluginName: 'plugin-b', mcpName: 'server' },
    ];

    const result = resolveMcpConflicts(mcps);

    expect(result.size).toBe(2);
    expect(result.get('plugin-a:server')).toEqual({
      original: 'server',
      resolved: 'plugin-a--server',
      pluginName: 'plugin-a',
    });
    expect(result.get('plugin-b:server')).toEqual({
      original: 'server',
      resolved: 'plugin-b--server',
      pluginName: 'plugin-b',
    });
  });

  it('should handle mixed conflicts and non-conflicts', () => {
    const mcps = [
      { pluginName: 'plugin-a', mcpName: 'server' },
      { pluginName: 'plugin-b', mcpName: 'server' },
      { pluginName: 'plugin-a', mcpName: 'unique-a' },
      { pluginName: 'plugin-b', mcpName: 'unique-b' },
    ];

    const result = resolveMcpConflicts(mcps);

    expect(result.size).toBe(4);

    // Conflicting server names should have namespace prefix
    expect(result.get('plugin-a:server')?.resolved).toBe('plugin-a--server');
    expect(result.get('plugin-b:server')?.resolved).toBe('plugin-b--server');

    // Unique names should not have prefix
    expect(result.get('plugin-a:unique-a')?.resolved).toBe('unique-a');
    expect(result.get('plugin-b:unique-b')?.resolved).toBe('unique-b');
  });
});
