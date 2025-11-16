/**
 * Transformation tests (Official → Normalized)
 * Based on docs/spec/005-transformation-rules.md
 *
 * This file tests the forward transformation logic that is already implemented
 * in src/normalize.ts. These tests validate the 16 requirements from spec 005.
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { normalize } from '../src/normalize';
import { PluginJson, NormalizedPlugin } from '../src/types';

const TEST_FIXTURES_DIR = path.join(__dirname, 'fixtures', 'transform');

describe('Transformation Rules (005)', () => {
  beforeAll(() => {
    // Create test fixtures directory
    if (!fs.existsSync(TEST_FIXTURES_DIR)) {
      fs.mkdirSync(TEST_FIXTURES_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup test fixtures
    if (fs.existsSync(TEST_FIXTURES_DIR)) {
      fs.rmSync(TEST_FIXTURES_DIR, { recursive: true, force: true });
    }
  });

  // ============================================================================
  // 005::Example::1 - Commands/Agents String path transformation
  // ============================================================================
  test('005::Example::1: String path transformation for commands', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'string-path-test');
    fs.mkdirSync(pluginDir, { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'custom-dir'), { recursive: true });
    fs.writeFileSync(path.join(pluginDir, 'custom-dir', 'cmd1.md'), '# Command 1');
    fs.writeFileSync(path.join(pluginDir, 'custom-dir', 'cmd2.md'), '# Command 2');

    const pluginJson: PluginJson = {
      commands: 'custom-dir',
    };

    const normalized = normalize(pluginDir, pluginJson);

    expect(normalized.commands).toContain('custom-dir/cmd1.md');
    expect(normalized.commands).toContain('custom-dir/cmd2.md');
    expect(normalized.commands.length).toBeGreaterThanOrEqual(2);
  });

  // ============================================================================
  // 005::Example::2 - Commands/Agents Array (no transformation)
  // ============================================================================
  test('005::Example::2: Array paths preserved as-is', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'array-path-test');
    fs.mkdirSync(pluginDir, { recursive: true });
    fs.writeFileSync(path.join(pluginDir, 'cmd1.md'), '# Command 1');
    fs.writeFileSync(path.join(pluginDir, 'cmd2.md'), '# Command 2');

    const pluginJson: PluginJson = {
      commands: ['cmd1.md', 'cmd2.md'],
    };

    const normalized = normalize(pluginDir, pluginJson);

    expect(normalized.commands).toContain('cmd1.md');
    expect(normalized.commands).toContain('cmd2.md');
  });

  // ============================================================================
  // 005::Example::3 - Skills Discovery (undefined → discovered array)
  // ============================================================================
  test('005::Example::3: Skills auto-discovery', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'skills-discovery-test');
    fs.mkdirSync(path.join(pluginDir, 'skills', 'skill-a'), { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'skills', 'skill-b'), { recursive: true });
    fs.writeFileSync(path.join(pluginDir, 'skills', 'skill-a', 'SKILL.md'), '# Skill A');
    fs.writeFileSync(path.join(pluginDir, 'skills', 'skill-b', 'SKILL.md'), '# Skill B');

    const pluginJson: PluginJson = {};

    const normalized = normalize(pluginDir, pluginJson);

    expect(normalized.skills).toContain('skills/skill-a');
    expect(normalized.skills).toContain('skills/skill-b');
    expect(normalized.skills.length).toBe(2);
  });

  // ============================================================================
  // 005::Example::4 - Hooks nested to flat array transformation
  // ============================================================================
  test('005::Example::4: Hooks nested to flat array transformation', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'hooks-transform-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {
      hooks: {
        SessionStart: [
          {
            hooks: [
              { type: 'command', command: '/setup.sh' },
            ],
          },
        ],
        PostToolUse: [
          {
            matcher: 'Write|Edit',
            hooks: [
              { type: 'command', command: '/format.sh' },
            ],
          },
        ],
      },
    };

    const normalized = normalize(pluginDir, pluginJson);

    expect(normalized.hooks.length).toBe(2);

    const sessionStartHook = normalized.hooks.find(h => h.event === 'SessionStart');
    expect(sessionStartHook).toBeDefined();
    expect(sessionStartHook?.command).toBe('/setup.sh');
    expect(sessionStartHook?.type).toBe('command');
    expect(sessionStartHook?.matcher).toBeUndefined();

    const postToolUseHook = normalized.hooks.find(h => h.event === 'PostToolUse');
    expect(postToolUseHook).toBeDefined();
    expect(postToolUseHook?.command).toBe('/format.sh');
    expect(postToolUseHook?.matcher).toBe('Write|Edit');
  });

  // ============================================================================
  // 005::Example::5 - MCPs object to array transformation
  // ============================================================================
  test('005::Example::5: MCPs object to array transformation', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'mcps-transform-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {
      mcpServers: {
        tavily: {
          command: 'npx',
          args: ['-y', '@tavily/mcp-server'],
          env: { TAVILY_API_KEY: '${TAVILY_API_KEY}' },
        },
        filesystem: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem', '/path'],
        },
      },
    };

    const normalized = normalize(pluginDir, pluginJson);

    expect(normalized.mcps.length).toBe(2);

    const tavily = normalized.mcps.find(m => m.name === 'tavily');
    expect(tavily).toBeDefined();
    expect(tavily?.command).toBe('npx');
    expect(tavily?.args).toEqual(['-y', '@tavily/mcp-server']);
    expect(tavily?.env?.TAVILY_API_KEY).toBe('${TAVILY_API_KEY}');

    const filesystem = normalized.mcps.find(m => m.name === 'filesystem');
    expect(filesystem).toBeDefined();
    expect(filesystem?.command).toBe('npx');
    expect(filesystem?.env).toEqual({});
  });

  // ============================================================================
  // 005::Example::6 - Complete example (official → normalized)
  // ============================================================================
  test('005::Example::6: Complete transformation example', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'complete-transform-test');
    fs.mkdirSync(path.join(pluginDir, 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'skills', 'skill-a'), { recursive: true });
    fs.mkdirSync(path.join(pluginDir, 'hooks'), { recursive: true });

    fs.writeFileSync(path.join(pluginDir, 'scripts', 'cmd1.md'), '# Command 1');
    fs.writeFileSync(path.join(pluginDir, 'scripts', 'cmd2.md'), '# Command 2');
    fs.writeFileSync(path.join(pluginDir, 'skills', 'skill-a', 'SKILL.md'), '# Skill A');

    const hooksJson = {
      hooks: {
        SessionStart: [
          {
            hooks: [
              { type: 'command', command: '/init.sh' },
            ],
          },
        ],
      },
    };
    fs.writeFileSync(
      path.join(pluginDir, 'hooks', 'custom.json'),
      JSON.stringify(hooksJson, null, 2)
    );

    const pluginJson: PluginJson = {
      name: 'my-plugin',
      commands: 'scripts',
      hooks: 'hooks/custom.json',
    };

    const normalized = normalize(pluginDir, pluginJson);

    expect(normalized.name).toBe('my-plugin');
    expect(normalized.source).toBe(pluginDir);
    expect(normalized.version).toBe('0.0.0');
    expect(normalized.description).toBe('');
    expect(normalized.commands).toContain('scripts/cmd1.md');
    expect(normalized.commands).toContain('scripts/cmd2.md');
    expect(normalized.agents).toEqual([]);
    expect(normalized.skills).toContain('skills/skill-a');
    expect(normalized.hooks.length).toBe(1);
    expect(normalized.hooks[0].event).toBe('SessionStart');
    expect(normalized.mcps).toEqual([]);
  });

  // ============================================================================
  // 005::Invariant::1 - No undefined values
  // ============================================================================
  test('005::Invariant::1: No undefined values guarantee', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'invariant-1-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {};
    const normalized = normalize(pluginDir, pluginJson);

    // Check all fields are defined
    expect(normalized.name).toBeDefined();
    expect(normalized.source).toBeDefined();
    expect(normalized.version).toBeDefined();
    expect(normalized.description).toBeDefined();
    expect(normalized.author).toBeDefined();
    expect(normalized.homepage).toBeDefined();
    expect(normalized.repository).toBeDefined();
    expect(normalized.license).toBeDefined();
    expect(normalized.keywords).toBeDefined();
    expect(normalized.commands).toBeDefined();
    expect(normalized.agents).toBeDefined();
    expect(normalized.skills).toBeDefined();
    expect(normalized.hooks).toBeDefined();
    expect(normalized.mcps).toBeDefined();
  });

  // ============================================================================
  // 005::Invariant::2 - Arrays never undefined
  // ============================================================================
  test('005::Invariant::2: Arrays never undefined', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'invariant-2-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {};
    const normalized = normalize(pluginDir, pluginJson);

    expect(Array.isArray(normalized.commands)).toBe(true);
    expect(Array.isArray(normalized.agents)).toBe(true);
    expect(Array.isArray(normalized.skills)).toBe(true);
    expect(Array.isArray(normalized.hooks)).toBe(true);
    expect(Array.isArray(normalized.mcps)).toBe(true);
    expect(Array.isArray(normalized.keywords)).toBe(true);
  });

  // ============================================================================
  // 005::Invariant::3 - Flat structure for hooks/mcps
  // ============================================================================
  test('005::Invariant::3: Flat structure for hooks/mcps', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'invariant-3-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {
      hooks: {
        SessionStart: [{ hooks: [{ type: 'command', command: '/test.sh' }] }],
      },
      mcpServers: {
        test: { command: 'test-cmd' },
      },
    };

    const normalized = normalize(pluginDir, pluginJson);

    // Hooks should be flat array
    expect(Array.isArray(normalized.hooks)).toBe(true);
    normalized.hooks.forEach(hook => {
      expect(hook.event).toBeDefined();
      expect(hook.type).toBeDefined();
      expect(hook.command).toBeDefined();
    });

    // MCPs should be flat array
    expect(Array.isArray(normalized.mcps)).toBe(true);
    normalized.mcps.forEach(mcp => {
      expect(mcp.name).toBeDefined();
      expect(mcp.command).toBeDefined();
    });
  });

  // ============================================================================
  // 005::Invariant::4 - Event extraction from original keys
  // ============================================================================
  test('005::Invariant::4: Event extraction from original keys', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'invariant-4-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {
      hooks: {
        SessionStart: [{ hooks: [{ type: 'command', command: '/start.sh' }] }],
        Stop: [{ hooks: [{ type: 'command', command: '/stop.sh' }] }],
      },
    };

    const normalized = normalize(pluginDir, pluginJson);

    const sessionStart = normalized.hooks.find(h => h.event === 'SessionStart');
    expect(sessionStart).toBeDefined();
    expect(sessionStart?.event).toBe('SessionStart');

    const stop = normalized.hooks.find(h => h.event === 'Stop');
    expect(stop).toBeDefined();
    expect(stop?.event).toBe('Stop');
  });

  // ============================================================================
  // 005::Invariant::5 - Name extraction for MCPs
  // ============================================================================
  test('005::Invariant::5: Name extraction for MCPs', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'invariant-5-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {
      mcpServers: {
        tavily: { command: 'npx' },
        github: { command: 'npx' },
      },
    };

    const normalized = normalize(pluginDir, pluginJson);

    expect(normalized.mcps.find(m => m.name === 'tavily')).toBeDefined();
    expect(normalized.mcps.find(m => m.name === 'github')).toBeDefined();
  });

  // ============================================================================
  // 005::Invariant::6 - Field preservation
  // ============================================================================
  test('005::Invariant::6: Field preservation guarantee', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'invariant-6-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {
      hooks: {
        SessionStart: [{
          hooks: [{
            type: 'command',
            command: '/test.sh',
            customField: 'customValue',
            timeout: 30,
          }],
        }],
      },
      mcpServers: {
        custom: {
          command: 'node',
          args: ['server.js'],
          customConfig: { key: 'value' },
        },
      },
    };

    const normalized = normalize(pluginDir, pluginJson);

    // Check hook custom fields preserved
    const hook = normalized.hooks[0];
    expect((hook as any).customField).toBe('customValue');
    expect(hook.timeout).toBe(30);

    // Check MCP custom fields preserved
    const mcp = normalized.mcps[0];
    expect((mcp as any).customConfig).toEqual({ key: 'value' });
  });

  // ============================================================================
  // 005::Invariant::7 - Path normalization (leading ./ removed)
  // ============================================================================
  test('005::Invariant::7: Path normalization rule', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'invariant-7-test');
    fs.mkdirSync(path.join(pluginDir, 'commands'), { recursive: true });
    fs.writeFileSync(path.join(pluginDir, 'commands', 'test.md'), '# Test');

    const pluginJson: PluginJson = {
      commands: ['./commands/test.md'],
    };

    const normalized = normalize(pluginDir, pluginJson);

    // Paths should not have leading ./
    normalized.commands.forEach(cmd => {
      expect(cmd.startsWith('./')).toBe(false);
    });
  });

  // ============================================================================
  // 005::EdgeCase::1 - Empty plugin
  // ============================================================================
  test('005::EdgeCase::1: Empty plugin', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'edge-empty-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {};
    const normalized = normalize(pluginDir, pluginJson);

    expect(normalized.name).toBe('edge-empty-test');
    expect(normalized.source).toBe(pluginDir);
    expect(normalized.version).toBe('0.0.0');
    expect(normalized.description).toBe('');
    expect(normalized.author).toEqual({ name: '', email: '', url: '' });
    expect(normalized.homepage).toBe('');
    expect(normalized.repository).toBe('');
    expect(normalized.license).toBe('');
    expect(normalized.keywords).toEqual([]);
    expect(normalized.commands).toEqual([]);
    expect(normalized.agents).toEqual([]);
    expect(normalized.skills).toEqual([]);
    expect(normalized.hooks).toEqual([]);
    expect(normalized.mcps).toEqual([]);
  });

  // ============================================================================
  // 005::EdgeCase::2 - Multiple hooks same event
  // ============================================================================
  test('005::EdgeCase::2: Multiple hooks same event', () => {
    const pluginDir = path.join(TEST_FIXTURES_DIR, 'edge-multi-hooks-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {
      hooks: {
        Stop: [
          {
            hooks: [
              { type: 'command', command: '/first.sh' },
              { type: 'command', command: '/second.sh' },
            ],
          },
        ],
      },
    };

    const normalized = normalize(pluginDir, pluginJson);

    const stopHooks = normalized.hooks.filter(h => h.event === 'Stop');
    expect(stopHooks.length).toBe(2);
    expect(stopHooks[0].command).toBe('/first.sh');
    expect(stopHooks[1].command).toBe('/second.sh');
  });

  // ============================================================================
  // 005::EdgeCase::3 - MCP name collisions (handled by TUI/save, not normalization)
  // ============================================================================
  test('005::EdgeCase::3: MCP name collisions note', () => {
    // This is a note in the spec that collision handling is responsibility
    // of application logic (TUI/save), NOT the normalization process.
    // Normalization just extracts names as-is.

    const pluginDir = path.join(TEST_FIXTURES_DIR, 'edge-mcp-collision-test');
    fs.mkdirSync(pluginDir, { recursive: true });

    const pluginJson: PluginJson = {
      mcpServers: {
        tavily: { command: 'npx', args: ['-y', '@tavily/mcp-server'] },
      },
    };

    const normalized = normalize(pluginDir, pluginJson);

    // Normalization just extracts the name
    expect(normalized.mcps[0].name).toBe('tavily');

    // Note: Collision handling happens during save operation when
    // multiple plugins have MCPs with same name
  });
});
