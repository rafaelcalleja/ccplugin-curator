import { describe, test, expect } from 'vitest';
import { denormalizePlugin } from '../src/transformation/denormalize';
import { ClaudeCodeNormalizedPlugin } from '../src/types/normalized';

describe('Transformation Tests', () => {
  describe('denormalizePlugin', () => {
    test('Minimal plugin - only name', () => {
      const normalized: ClaudeCodeNormalizedPlugin = {
        name: 'minimal-plugin',
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
        mcps: []
      };

      const official = denormalizePlugin(normalized);

      expect(official.name).toBe('minimal-plugin');
      expect(official.version).toBeUndefined(); // Default omitted
      expect(official.description).toBeUndefined(); // Empty omitted
      expect(official.author).toBeUndefined(); // Empty author omitted
      expect(official.commands).toBeUndefined(); // Empty array omitted
      expect(official.agents).toBeUndefined(); // Empty array omitted
      expect(official.hooks).toBeUndefined(); // Empty array omitted
      expect(official.mcpServers).toBeUndefined(); // Empty array omitted
    });

    test('Full plugin with all fields', () => {
      const normalized: ClaudeCodeNormalizedPlugin = {
        name: 'full-plugin',
        source: '/path/to/plugin',
        version: '1.2.3',
        description: 'A full plugin',
        author: { name: 'John Doe', email: 'john@example.com', url: 'https://example.com' },
        homepage: 'https://example.com',
        repository: 'https://github.com/user/plugin',
        license: 'MIT',
        keywords: ['test', 'plugin'],
        commands: ['commands/cmd1.md', 'commands/cmd2.md'],
        agents: ['agents/agent1.md'],
        skills: ['skills/skill1'],
        hooks: [
          {
            id: 'full-plugin:SessionStart:0',
            event: 'SessionStart' as any,
            config: {
              type: 'command',
              command: '/init.sh'
            }
          }
        ] as any,
        mcps: [
          {
            id: 'full-plugin:mcp:tavily',
            name: 'tavily',
            config: {
              command: 'npx',
              args: ['-y', '@tavily/mcp-server'],
              env: { TAVILY_API_KEY: '${TAVILY_API_KEY}' }
            }
          }
        ]
      };

      const official = denormalizePlugin(normalized);

      expect(official.name).toBe('full-plugin');
      expect(official.version).toBe('1.2.3');
      expect(official.description).toBe('A full plugin');
      expect(official.author).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        url: 'https://example.com'
      });
      expect(official.homepage).toBe('https://example.com');
      expect(official.repository).toBe('https://github.com/user/plugin');
      expect(official.license).toBe('MIT');
      expect(official.keywords).toEqual(['test', 'plugin']);

      // Commands should have ./ prefix
      expect(official.commands).toEqual(['./commands/cmd1.md', './commands/cmd2.md']);

      // Agents should have ./ prefix
      expect(official.agents).toEqual(['./agents/agent1.md']);

      // Skills should NOT be included (auto-discovery only)

      // Hooks should be grouped by event
      expect(official.hooks).toBeDefined();
      expect(official.hooks?.SessionStart).toBeDefined();

      // MCPs should be object with name as key
      expect(official.mcpServers).toBeDefined();
      expect(official.mcpServers?.tavily).toBeDefined();
      expect(official.mcpServers?.tavily).toEqual({
        command: 'npx',
        args: ['-y', '@tavily/mcp-server'],
        env: { TAVILY_API_KEY: '${TAVILY_API_KEY}' }
      });
    });

    test('Partial author - only some fields', () => {
      const normalized: ClaudeCodeNormalizedPlugin = {
        name: 'test-plugin',
        source: '/path',
        version: '0.0.0',
        description: '',
        author: { name: 'John Doe', email: '', url: 'https://example.com' },
        homepage: '',
        repository: '',
        license: '',
        keywords: [],
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: []
      };

      const official = denormalizePlugin(normalized);

      expect(official.author).toEqual({
        name: 'John Doe',
        url: 'https://example.com'
        // email should be omitted (empty string)
      });
    });

    test('Hooks grouped correctly by event', () => {
      const normalized: ClaudeCodeNormalizedPlugin = {
        name: 'test-plugin',
        source: '/path',
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
        hooks: [
          {
            id: 'test-plugin:SessionStart:0',
            event: 'SessionStart' as any,
            config: { type: 'command', command: '/init1.sh' }
          },
          {
            id: 'test-plugin:SessionStart:1',
            event: 'SessionStart' as any,
            config: { type: 'command', command: '/init2.sh' }
          },
          {
            id: 'test-plugin:PostToolUse:0',
            event: 'PostToolUse' as any,
            matcher: 'Write',
            config: { type: 'command', command: '/format.sh' }
          }
        ] as any,
        mcps: []
      };

      const official = denormalizePlugin(normalized);

      expect(official.hooks).toBeDefined();
      expect(official.hooks?.SessionStart).toBeDefined();
      expect(official.hooks?.SessionStart).toHaveLength(1);
      expect(official.hooks?.SessionStart![0].hooks).toHaveLength(2);

      expect(official.hooks?.PostToolUse).toBeDefined();
      expect(official.hooks?.PostToolUse).toHaveLength(1);
      expect(official.hooks?.PostToolUse![0].matcher).toBe('Write');
      expect(official.hooks?.PostToolUse![0].hooks).toHaveLength(1);
    });

    test('MCPs with empty env are omitted', () => {
      const normalized: ClaudeCodeNormalizedPlugin = {
        name: 'test-plugin',
        source: '/path',
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
        mcps: [
          {
            id: 'test-plugin:mcp:filesystem',
            name: 'filesystem',
            config: {
              command: 'npx',
              args: ['-y', '@modelcontextprotocol/server-filesystem'],
              env: {}
            }
          }
        ]
      };

      const official = denormalizePlugin(normalized);

      expect(official.mcpServers).toBeDefined();
      expect(official.mcpServers?.filesystem).toBeDefined();
      expect(official.mcpServers?.filesystem.env).toBeUndefined(); // Empty env omitted
    });

    test('Arrays with ./ prefix added', () => {
      const normalized: ClaudeCodeNormalizedPlugin = {
        name: 'test-plugin',
        source: '/path',
        version: '0.0.0',
        description: '',
        author: { name: '', email: '', url: '' },
        homepage: '',
        repository: '',
        license: '',
        keywords: [],
        commands: ['commands/cmd1.md', './commands/cmd2.md'],
        agents: ['agents/agent1.md'],
        skills: [],
        hooks: [],
        mcps: []
      };

      const official = denormalizePlugin(normalized);

      expect(official.commands).toEqual(['./commands/cmd1.md', './commands/cmd2.md']);
      expect(official.agents).toEqual(['./agents/agent1.md']);
    });
  });
});
