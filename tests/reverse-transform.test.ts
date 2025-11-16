/**
 * Reverse Transformation tests (Normalized → Official)
 * Based on docs/spec/006-reverse-transformation-rules.md
 *
 * This file tests the reverse transformation logic (29 requirements from spec 006).
 */

import { describe, test, expect } from '@jest/globals';
import { reverseTransform } from '../src/reverse-transform';
import { NormalizedPlugin, PluginJson } from '../src/types';

describe('Reverse Transformation Rules (006)', () => {
  // ============================================================================
  // 006::Example::1 - Metadata fields omit defaults
  // ============================================================================
  test('006::Example::1: Metadata fields - omit defaults', () => {
    const normalized: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/test/path',
      version: '0.0.0', // Default
      description: '', // Default
      author: { name: '', email: '', url: '' }, // Default
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    // Only name should be present (all others are defaults)
    expect(official.name).toBe('test-plugin');
    expect(official.version).toBeUndefined();
    expect(official.description).toBeUndefined();
    expect(official.author).toBeUndefined();
    expect(official.homepage).toBeUndefined();
    expect(official.license).toBeUndefined();
    expect(official.keywords).toBeUndefined();
  });

  // ============================================================================
  // 006::Example::2 - Metadata fields include non-default
  // ============================================================================
  test('006::Example::2: Metadata fields - include non-default', () => {
    const normalized: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/test/path',
      version: '1.2.0',
      description: 'My plugin',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: 'MIT',
      keywords: ['ai', 'tools'],
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    expect(official.version).toBe('1.2.0');
    expect(official.description).toBe('My plugin');
    expect(official.license).toBe('MIT');
    expect(official.keywords).toEqual(['ai', 'tools']);
    expect(official.author).toBeUndefined(); // Still all empty
  });

  // ============================================================================
  // 006::Example::3 - Commands & Agents explicit arrays with ./ prefix
  // ============================================================================
  test('006::Example::3: Commands & Agents - explicit arrays with ./ prefix', () => {
    const normalized: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/test/path',
      version: '0.0.0',
      description: '',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/cmd1.md', 'commands/cmd2.md'],
      agents: ['agents/agent1.md'],
      skills: [],
      hooks: [],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    expect(official.commands).toEqual(['./commands/cmd1.md', './commands/cmd2.md']);
    expect(official.agents).toEqual(['./agents/agent1.md']);
  });

  // ============================================================================
  // 006::Example::4 - Hooks array to nested object transformation
  // ============================================================================
  test('006::Example::4: Hooks - array to nested object transformation', () => {
    const normalized: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/test/path',
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
          event: 'SessionStart',
          type: 'command',
          command: '/init.sh',
        },
        {
          event: 'PostToolUse',
          type: 'command',
          command: '/format.sh',
          matcher: 'Write|Edit',
        },
      ],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    expect(official.hooks).toBeDefined();
    const hooks = official.hooks as any;
    expect(hooks.SessionStart).toBeDefined();
    expect(hooks.SessionStart).toHaveLength(1);
    expect(hooks.SessionStart[0].hooks).toHaveLength(1);
    expect(hooks.SessionStart[0].hooks[0]).toEqual({
      type: 'command',
      command: '/init.sh',
    });

    expect(hooks.PostToolUse).toBeDefined();
    expect(hooks.PostToolUse[0].matcher).toBe('Write|Edit');
    expect(hooks.PostToolUse[0].hooks[0]).toEqual({
      type: 'command',
      command: '/format.sh',
    });
  });

  // ============================================================================
  // 006::Example::5 - MCPs array to nested object transformation
  // ============================================================================
  test('006::Example::5: MCPs - array to nested object transformation', () => {
    const normalized: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/test/path',
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
          name: 'tavily',
          command: 'npx',
          args: ['-y', '@tavily/mcp-server'],
          env: { TAVILY_API_KEY: '${TAVILY_API_KEY}' },
        },
        {
          name: 'filesystem',
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/path'],
          env: {},
        },
      ],
    };

    const official = reverseTransform(normalized);

    expect(official.mcpServers).toBeDefined();
    const mcps = official.mcpServers as any;
    expect(mcps.tavily).toEqual({
      command: 'npx',
      args: ['-y', '@tavily/mcp-server'],
      env: { TAVILY_API_KEY: '${TAVILY_API_KEY}' },
    });

    // Empty env should be omitted
    expect(mcps.filesystem).toEqual({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/path'],
    });
    expect(mcps.filesystem?.env).toBeUndefined();
  });

  // ============================================================================
  // 006::Example::6 - Complete example minimal plugin
  // ============================================================================
  test('006::Example::6: Complete example - minimal plugin', () => {
    const normalized: NormalizedPlugin = {
      name: 'my-plugin',
      source: '/absolute/path',
      version: '0.0.0',
      description: '',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/cmd1.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    expect(official).toEqual({
      name: 'my-plugin',
      commands: ['./commands/cmd1.md'],
    });
  });

  // ============================================================================
  // 006::Example::7 - Complete example full-featured plugin
  // ============================================================================
  test('006::Example::7: Complete example - full-featured plugin', () => {
    const normalized: NormalizedPlugin = {
      name: 'personal-ai',
      source: '/absolute/path',
      version: '1.0.0',
      description: 'Personal AI tools',
      author: {
        name: 'John Doe',
        email: 'john@example.com',
        url: '',
      },
      homepage: 'https://example.com',
      repository: '',
      license: 'MIT',
      keywords: ['ai', 'tools'],
      commands: ['commands/analyze.md', 'commands/optimize.md'],
      agents: ['agents/context-agent.md'],
      skills: ['skills/skill-a', 'skills/skill-b'],
      hooks: [
        {
          event: 'SessionStart',
          type: 'command',
          command: '/init.sh',
        },
        {
          event: 'PostToolUse',
          type: 'command',
          command: '/format.sh',
          matcher: 'Write|Edit',
        },
      ],
      mcps: [
        {
          name: 'tavily',
          command: 'npx',
          args: ['-y', '@tavily/mcp-server'],
          env: { TAVILY_API_KEY: '${TAVILY_API_KEY}' },
        },
      ],
    };

    const official = reverseTransform(normalized);

    expect(official.name).toBe('personal-ai');
    expect(official.version).toBe('1.0.0');
    expect(official.description).toBe('Personal AI tools');
    expect(official.author).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
    });
    expect(official.author?.url).toBeUndefined(); // Empty string omitted
    expect(official.homepage).toBe('https://example.com');
    expect(official.repository).toBeUndefined(); // Empty string
    expect(official.license).toBe('MIT');
    expect(official.keywords).toEqual(['ai', 'tools']);
    expect(official.commands).toEqual(['./commands/analyze.md', './commands/optimize.md']);
    expect(official.agents).toEqual(['./agents/context-agent.md']);
    expect(official.skills).toEqual(['./skills/skill-a', './skills/skill-b']);
  });

  // ============================================================================
  // 006::Invariant::1 - Minimalism
  // ============================================================================
  test('006::Invariant::1: Minimalism - generate clean, minimal plugin.json', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/test',
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
    };

    const official = reverseTransform(normalized);

    // Should only have name
    expect(Object.keys(official).length).toBe(1);
    expect(official.name).toBe('test');
  });

  // ============================================================================
  // 006::Invariant::2-4 - Validity, Readability, Compatibility
  // ============================================================================
  test('006::Invariant::2,3,4: Output is valid, readable, and compatible', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/test',
      version: '1.0.0',
      description: 'Test plugin',
      author: { name: 'Author', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/test.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    // Should be valid JSON-serializable
    expect(() => JSON.stringify(official)).not.toThrow();

    // Should be human-readable (has name, version, description)
    expect(official.name).toBe('test');
    expect(official.version).toBe('1.0.0');
    expect(official.description).toBe('Test plugin');

    // Should be compatible (has ./ prefix for paths)
    expect(official.commands?.[0]).toMatch(/^\.\//);
  });

  // ============================================================================
  // 006::Invariant::5 - Omit default values
  // ============================================================================
  test('006::Invariant::5: Omit default values to keep plugin.json minimal', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/test',
      version: '0.0.0', // Default
      description: '', // Default
      author: { name: '', email: '', url: '' }, // Default
      homepage: '', // Default
      repository: '', // Default
      license: '', // Default
      keywords: [], // Default
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    expect(official.version).toBeUndefined();
    expect(official.description).toBeUndefined();
    expect(official.author).toBeUndefined();
    expect(official.homepage).toBeUndefined();
    expect(official.repository).toBeUndefined();
    expect(official.license).toBeUndefined();
    expect(official.keywords).toBeUndefined();
    expect(official.commands).toBeUndefined();
    expect(official.agents).toBeUndefined();
    expect(official.skills).toBeUndefined();
    expect(official.hooks).toBeUndefined();
    expect(official.mcpServers).toBeUndefined();
  });

  // ============================================================================
  // 006::Invariant::6 - Always output arrays with ./ prefix
  // ============================================================================
  test('006::Invariant::6: Always output commands/agents as explicit array with ./ prefix', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/test',
      version: '0.0.0',
      description: '',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/test.md'],
      agents: ['agents/test.md'],
      skills: ['skills/test'],
      hooks: [],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    expect(official.commands).toEqual(['./commands/test.md']);
    expect(official.agents).toEqual(['./agents/test.md']);
    expect(official.skills).toEqual(['./skills/test']);

    // All paths should start with ./
    (official.commands as string[])?.forEach(cmd => expect(cmd).toMatch(/^\.\//));
    (official.agents as string[])?.forEach(agent => expect(agent).toMatch(/^\.\//));
    (official.skills as string[])?.forEach(skill => expect(skill).toMatch(/^\.\//));
  });

  // ============================================================================
  // 006::Invariant::7 - NEVER include source field
  // ============================================================================
  test('006::Invariant::7: NEVER include source field in official format', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/absolute/path/to/plugin', // Should be omitted
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
    };

    const official = reverseTransform(normalized);

    expect((official as any).source).toBeUndefined();
  });

  // ============================================================================
  // 006::Invariant::8-14 - Transformation guarantees
  // ============================================================================
  test('006::Invariant::8-14: All transformation guarantees', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/test',
      version: '1.0.0',
      description: 'Test',
      author: { name: 'Author', email: 'author@example.com', url: '' },
      homepage: '',
      repository: '',
      license: 'MIT',
      keywords: ['test'],
      commands: ['commands/test.md'],
      agents: [],
      skills: [],
      hooks: [
        { event: 'SessionStart', type: 'command', command: '/test.sh' },
        { event: 'SessionStart', type: 'command', command: '/test2.sh' },
      ],
      mcps: [
        { name: 'test', command: 'npx', customField: 'preserved' },
      ],
    };

    const official = reverseTransform(normalized);

    // 8: Output is valid
    expect(() => JSON.stringify(official)).not.toThrow();

    // 9: Non-default metadata preserved
    expect(official.version).toBe('1.0.0');
    expect(official.description).toBe('Test');
    expect(official.license).toBe('MIT');

    // 10: Component arrays are explicit
    expect(Array.isArray(official.commands)).toBe(true);

    // 11: Hooks grouped by event correctly
    const hooks2 = official.hooks as any;
    expect(hooks2.SessionStart).toBeDefined();
    expect(hooks2.SessionStart[0].hooks).toHaveLength(2);

    // 12: MCPs keyed by name correctly
    const mcps2 = official.mcpServers as any;
    expect(mcps2.test).toBeDefined();

    // 13: Custom fields preserved
    expect(mcps2.test.customField).toBe('preserved');

    // 14: Output is minimal (empty arrays omitted)
    expect(official.agents).toBeUndefined();
    expect(official.skills).toBeUndefined();
  });

  // ============================================================================
  // 006::Invariant::15-17 - Non-guarantees (acceptable losses)
  // ============================================================================
  test('006::Invariant::15-17: Non-guarantees documented', () => {
    // These are intentional information losses that are acceptable:
    // 15: Original path format (string vs array) not preserved
    // 16: External file references (hooks.json, .mcp.json) become inline
    // 17: Cannot distinguish auto-discovered vs explicitly defined

    // Just documenting these as expected behavior
    expect(true).toBe(true);
  });

  // ============================================================================
  // 006::Invariant::18 - Preserve all fields except event when converting hooks
  // ============================================================================
  test('006::Invariant::18: Preserve all fields except event when converting hooks', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/test',
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
          event: 'SessionStart',
          type: 'command',
          command: '/test.sh',
          customField: 'customValue',
          timeout: 30,
        },
      ],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    const hooks3 = official.hooks as any;
    const hook = hooks3.SessionStart[0].hooks[0];
    expect(hook).toEqual({
      type: 'command',
      command: '/test.sh',
      customField: 'customValue',
      timeout: 30,
    });
    expect((hook as any).event).toBeUndefined(); // Event should be removed
  });

  // ============================================================================
  // 006::Invariant::19 - Preserve all fields except name when converting MCPs
  // ============================================================================
  test('006::Invariant::19: Preserve all fields except name when converting MCPs', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/test',
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
          name: 'custom',
          command: 'node',
          args: ['server.js'],
          customConfig: { timeout: 5000 },
        },
      ],
    };

    const official = reverseTransform(normalized);

    const mcps3 = official.mcpServers as any;
    expect(mcps3.custom).toEqual({
      command: 'node',
      args: ['server.js'],
      customConfig: { timeout: 5000 },
    });
    expect(mcps3.custom.name).toBeUndefined(); // Name should be removed
  });

  // ============================================================================
  // 006::EdgeCase::1 - Empty plugin
  // ============================================================================
  test('006::EdgeCase::1: Empty plugin', () => {
    const normalized: NormalizedPlugin = {
      name: 'empty-plugin',
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
      mcps: [],
    };

    const official = reverseTransform(normalized);

    expect(official).toEqual({
      name: 'empty-plugin',
    });
  });

  // ============================================================================
  // 006::EdgeCase::2 - Hooks with extra fields
  // ============================================================================
  test('006::EdgeCase::2: Hooks with extra fields', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/test',
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
          event: 'SessionStart',
          type: 'command',
          command: '/init.sh',
          customField: 'customValue',
          anotherField: 42,
        },
      ],
      mcps: [],
    };

    const official = reverseTransform(normalized);

    const hooks4 = official.hooks as any;
    const hook = hooks4.SessionStart[0].hooks[0];
    expect((hook as any).customField).toBe('customValue');
    expect((hook as any).anotherField).toBe(42);
  });

  // ============================================================================
  // 006::EdgeCase::3 - MCPs with extra fields
  // ============================================================================
  test('006::EdgeCase::3: MCPs with extra fields', () => {
    const normalized: NormalizedPlugin = {
      name: 'test',
      source: '/test',
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
          name: 'custom-server',
          command: 'node',
          args: ['server.js'],
          env: {},
          customConfig: { timeout: 5000 },
        },
      ],
    };

    const official = reverseTransform(normalized);

    const mcps4 = official.mcpServers as any;
    const mcp = mcps4['custom-server'];
    expect((mcp as any).customConfig).toEqual({ timeout: 5000 });
    expect(mcp?.env).toBeUndefined(); // Empty env omitted
  });
});
