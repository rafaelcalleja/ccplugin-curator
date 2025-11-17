import { describe, it, expect } from 'vitest';
import { reverseTransform } from '../../../../src/transformers/reverse/index.js';
import type { NormalizedPluginFormatInternal } from '../../../../src/types/normalized.js';

const createMinimalNormalized = (overrides?: Partial<NormalizedPluginFormatInternal>): NormalizedPluginFormatInternal => ({
  name: 'test-plugin',
  source: '/path/to/plugin',
  version: '0.0.0',
  description: '',
  author: { name: '', email: '', url: '' },
  homepage: '',
  repository: '',
  license: '',
  keywords: [],
  commands: [],
  agents: [],
  skills: [],
  hooks: [],
  mcps: [],
  ...overrides,
});

describe('reverseTransform', () => {
  it('should transform minimal plugin (only name)', () => {
    const normalized = createMinimalNormalized({ name: 'minimal-plugin' });
    const result = reverseTransform(normalized);
    expect(result).toEqual({ name: 'minimal-plugin' });
  });

  it('should transform plugin with all metadata', () => {
    const normalized = createMinimalNormalized({
      name: 'full-plugin',
      version: '1.2.3',
      description: 'A full test plugin',
      author: { name: 'John Doe', email: 'john@example.com', url: 'https://example.com' },
    });

    const result = reverseTransform(normalized);

    expect(result).toEqual({
      name: 'full-plugin',
      version: '1.2.3',
      description: 'A full test plugin',
      author: {
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://example.com',
      },
    });
  });

  it('should transform plugin with commands', () => {
    const normalized = createMinimalNormalized({
      name: 'cmd-plugin',
      commands: ['./commands/build.md', './commands/test.md'],
    });

    const result = reverseTransform(normalized);

    expect(result).toEqual({
      name: 'cmd-plugin',
      commands: ['./commands/build.md', './commands/test.md'],
    });
  });

  it('should transform plugin with agents and skills', () => {
    const normalized = createMinimalNormalized({
      name: 'agent-plugin',
      agents: ['./agents/coder.md'],
      skills: ['./skills/hello-skill'],
    });

    const result = reverseTransform(normalized);

    expect(result).toEqual({
      name: 'agent-plugin',
      agents: ['./agents/coder.md'],
      skills: ['./skills/hello-skill'],
    });
  });

  it('should transform plugin with hooks', () => {
    const normalized = createMinimalNormalized({
      name: 'hook-plugin',
      hooks: [
        {
          event: 'SessionStart',
          type: 'shell',
          command: 'echo "Hello"',
        },
      ],
    });

    const result = reverseTransform(normalized);

    expect(result).toEqual({
      name: 'hook-plugin',
      hooks: {
        SessionStart: [
          {
            hooks: [
              {
                type: 'shell',
                command: 'echo "Hello"',
              },
            ],
          },
        ],
      },
    });
  });

  it('should transform plugin with MCPs', () => {
    const normalized = createMinimalNormalized({
      name: 'mcp-plugin',
      mcps: [
        {
          name: 'test-server',
          command: 'node',
          args: ['server.js'],
          env: { PORT: '3000' },
        },
      ],
    });

    const result = reverseTransform(normalized);

    expect(result).toEqual({
      name: 'mcp-plugin',
      mcpServers: {
        'test-server': {
          command: 'node',
          args: ['server.js'],
          env: { PORT: '3000' },
        },
      },
    });
  });

  it('should transform complete plugin with all components', () => {
    const normalized = createMinimalNormalized({
      name: 'complete-plugin',
      version: '1.0.0',
      description: 'Complete test plugin',
      author: { name: 'Test Author', email: '', url: '' },
      commands: ['./commands/build.md'],
      agents: ['./agents/coder.md'],
      skills: ['./skills/hello-skill'],
      hooks: [
        {
          event: 'SessionStart',
          type: 'shell',
          command: 'npm install',
        },
      ],
      mcps: [
        {
          name: 'server',
          command: 'node',
          args: ['index.js'],
        },
      ],
    });

    const result = reverseTransform(normalized);

    expect(result).toEqual({
      name: 'complete-plugin',
      version: '1.0.0',
      description: 'Complete test plugin',
      author: { name: 'Test Author' },
      commands: ['./commands/build.md'],
      agents: ['./agents/coder.md'],
      skills: ['./skills/hello-skill'],
      hooks: {
        SessionStart: [
          {
            hooks: [
              {
                type: 'shell',
                command: 'npm install',
              },
            ],
          },
        ],
      },
      mcpServers: {
        server: {
          command: 'node',
          args: ['index.js'],
        },
      },
    });
  });
});
