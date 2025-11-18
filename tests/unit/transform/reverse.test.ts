import { transformToOfficial } from '../../../src/transform/reverse';
import { NormalizedPluginConfiguration } from '../../../src/types/normalized';

describe('reverse transformer', () => {
  it('should omit default values', () => {
    const normalized: NormalizedPluginConfiguration = {
      name: 'test-plugin',
      source: '/test/path',
      version: '0.0.0', // default
      description: '', // default
      author: { name: '', email: '', url: '' }, // default
      homepage: '', // default
      repository: '', // default
      license: '', // default
      keywords: [], // default
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: []
    };

    const official = transformToOfficial(normalized);

    expect(official.name).toBe('test-plugin');
    expect(official.commands).toBeUndefined();
    expect(official.agents).toBeUndefined();
    expect((official as any).version).toBeUndefined();
    expect((official as any).description).toBeUndefined();
  });

  it('should include non-default values', () => {
    const normalized: NormalizedPluginConfiguration = {
      name: 'test-plugin',
      source: '/test/path',
      version: '1.0.0', // non-default
      description: 'A test plugin', // non-default
      author: { name: '', email: '', url: '' },
      homepage: '', repository: '', license: '',
      keywords: ['test', 'plugin'], // non-default
      commands: ['commands/foo.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: []
    };

    const official = transformToOfficial(normalized);

    expect((official as any).version).toBe('1.0.0');
    expect((official as any).description).toBe('A test plugin');
    expect((official as any).keywords).toEqual(['test', 'plugin']);
  });

  it('should add ./ prefix to paths', () => {
    const normalized: NormalizedPluginConfiguration = {
      name: 'test-plugin',
      source: '/test/path',
      version: '0.0.0',
      description: '',
      author: { name: '', email: '', url: '' },
      homepage: '', repository: '', license: '',
      keywords: [],
      commands: ['commands/foo.md', 'commands/bar.md'],
      agents: ['agents/test.md'],
      skills: ['skills/my-skill'],
      hooks: [],
      mcps: []
    };

    const official = transformToOfficial(normalized);

    expect(official.commands).toEqual(['./commands/foo.md', './commands/bar.md']);
    expect(official.agents).toEqual(['./agents/test.md']);
    expect(official.skills).toEqual(['./skills/my-skill']);
  });

  it('should omit empty arrays', () => {
    const normalized: NormalizedPluginConfiguration = {
      name: 'test-plugin',
      source: '/test/path',
      version: '0.0.0',
      description: '',
      author: { name: '', email: '', url: '' },
      homepage: '', repository: '', license: '',
      keywords: [],
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: []
    };

    const official = transformToOfficial(normalized);

    expect(official.commands).toBeUndefined();
    expect(official.agents).toBeUndefined();
    expect(official.skills).toBeUndefined();
    expect(official.hooks).toBeUndefined();
    expect(official.mcpServers).toBeUndefined();
  });
});
