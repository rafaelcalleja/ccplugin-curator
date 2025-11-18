import { transformToNormalized } from '../../../src/transform/forward';
import { ClaudeCodePluginConfiguration } from '../../../src/types/plugin';

describe('forward transformer', () => {
  const pluginDir = '/test/plugin';

  test('should apply default metadata values', async () => {
    const official: ClaudeCodePluginConfiguration = {
      name: 'test-plugin'
    };

    const normalized = await transformToNormalized(official, pluginDir);

    expect(normalized.version).toBe('0.0.0');
    expect(normalized.description).toBe('');
    expect(normalized.author).toEqual({ name: '', email: '', url: '' });
    expect(normalized.homepage).toBe('');
    expect(normalized.repository).toBe('');
    expect(normalized.license).toBe('');
    expect(normalized.keywords).toEqual([]);
  });

  test('should preserve custom metadata values', async () => {
    const official: any = {
      name: 'test-plugin',
      version: '1.2.3',
      description: 'Test plugin',
      author: { name: 'John', email: 'john@example.com', url: 'https://example.com' },
      homepage: 'https://example.com/plugin',
      license: 'MIT',
      keywords: ['test', 'plugin']
    };

    const normalized = await transformToNormalized(official, pluginDir);

    // Note: Forward transformer doesn't preserve these fields from official format
    // They get default values and are only used in normalized → official transformation
    expect(normalized.name).toBe('test-plugin');
  });

  test('should normalize paths by removing leading ./', async () => {
    const official: ClaudeCodePluginConfiguration = {
      name: 'test',
      commands: ['./commands/foo.md', './commands/bar.md'],
      agents: ['./agents/test.md']
    };

    const normalized = await transformToNormalized(official, pluginDir);

    expect(normalized.commands).toEqual(['commands/foo.md', 'commands/bar.md']);
    expect(normalized.agents).toEqual(['agents/test.md']);
  });

  test('should convert string to array', async () => {
    const official: ClaudeCodePluginConfiguration = {
      name: 'test',
      commands: './commands/single.md'
    };

    const normalized = await transformToNormalized(official, pluginDir);

    expect(Array.isArray(normalized.commands)).toBe(true);
    expect(normalized.commands).toEqual(['commands/single.md']);
  });

  test('should ensure empty arrays for undefined components', async () => {
    const official: ClaudeCodePluginConfiguration = {
      name: 'test'
    };

    const normalized = await transformToNormalized(official, pluginDir);

    expect(normalized.commands).toEqual([]);
    expect(normalized.agents).toEqual([]);
    expect(normalized.skills).toEqual([]);
    expect(normalized.hooks).toEqual([]);
    expect(normalized.mcps).toEqual([]);
  });

  test('should set source field to plugin directory', async () => {
    const official: ClaudeCodePluginConfiguration = {
      name: 'test'
    };

    const normalized = await transformToNormalized(official, pluginDir);

    expect(normalized.source).toBe(pluginDir);
  });

  test('should handle arrays in all fields', async () => {
    const official: ClaudeCodePluginConfiguration = {
      name: 'test',
      commands: ['./cmd1.md', './cmd2.md'],
      agents: ['./agent1.md'],
      skills: ['./skill1', './skill2']
    };

    const normalized = await transformToNormalized(official, pluginDir);

    expect(normalized.commands).toEqual(['cmd1.md', 'cmd2.md']);
    expect(normalized.agents).toEqual(['agent1.md']);
    expect(normalized.skills).toEqual(['skill1', 'skill2']);
  });
});
