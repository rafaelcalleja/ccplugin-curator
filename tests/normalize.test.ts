/**
 * Tests for plugin normalization
 * Validates requirements from docs/spec/001-normalization-protocol.md
 */

import { normalize } from '../src/normalize';
import { NormalizedPlugin, PluginJson } from '../src/types';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Helper to create temporary test directories
function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ccplugin-test-'));
}

function cleanupTempDir(dir: string): void {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('Plugin Normalization', () => {
  describe('001::Invariant::10 - All normalized plugins MUST have all fields defined', () => {
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

  describe('001::Invariant::11 - All array fields MUST be arrays', () => {
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

  describe('001::Invariant::12 - All component paths MUST be relative to plugin source directory', () => {
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

  describe('001::Invariant::14 - source field MUST be absolute path to plugin directory', () => {
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

  describe('001::Invariant::1,6,7,8,9,17,18 - Auto-discovery ALWAYS occurs and custom paths COMPLEMENT it', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('001::Invariant::2 - should load commands from commands/ directory EVEN with custom paths', () => {
      // Create filesystem structure
      const commandsDir = path.join(tempDir, 'commands');
      const customDir = path.join(tempDir, 'custom');
      fs.mkdirSync(commandsDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });
      fs.writeFileSync(path.join(commandsDir, 'default.md'), '# Default');
      fs.writeFileSync(path.join(customDir, 'cmd.md'), '# Custom');

      const pluginJson: PluginJson = {
        name: 'test',
        commands: './custom/cmd.md',
      };

      const result = normalize(tempDir, pluginJson);

      // BOTH custom and auto-discovered should be present
      expect(result.commands).toContain('custom/cmd.md'); // Custom path
      expect(result.commands).toContain('commands/default.md'); // Auto-discovered
      expect(result.commands.length).toBe(2);
    });

    it('001::Invariant::6,8,18 - should auto-discover commands even when not defined in plugin.json', () => {
      const commandsDir = path.join(tempDir, 'commands');
      fs.mkdirSync(commandsDir, { recursive: true });
      fs.writeFileSync(path.join(commandsDir, 'cmd1.md'), '# Cmd1');
      fs.writeFileSync(path.join(commandsDir, 'cmd2.md'), '# Cmd2');

      const pluginJson: PluginJson = { name: 'test' };

      const result = normalize(tempDir, pluginJson);

      expect(result.commands).toContain('commands/cmd1.md');
      expect(result.commands).toContain('commands/cmd2.md');
      expect(result.commands.length).toBe(2);
    });

    it('001::Invariant::7,9,17 - custom paths are ADDED to auto-discovered paths', () => {
      const commandsDir = path.join(tempDir, 'commands');
      const scriptsDir = path.join(tempDir, 'scripts');
      fs.mkdirSync(commandsDir, { recursive: true });
      fs.mkdirSync(scriptsDir, { recursive: true });
      fs.writeFileSync(path.join(commandsDir, 'auto1.md'), '# Auto1');
      fs.writeFileSync(path.join(commandsDir, 'auto2.md'), '# Auto2');
      fs.writeFileSync(path.join(scriptsDir, 'custom.md'), '# Custom');

      const pluginJson: PluginJson = {
        name: 'test',
        commands: ['./scripts/custom.md'],
      };

      const result = normalize(tempDir, pluginJson);

      // All paths should be present
      expect(result.commands).toContain('scripts/custom.md'); // Custom
      expect(result.commands).toContain('commands/auto1.md'); // Auto-discovered
      expect(result.commands).toContain('commands/auto2.md'); // Auto-discovered
      expect(result.commands.length).toBe(3);
    });

    it('should work the same for agents', () => {
      const agentsDir = path.join(tempDir, 'agents');
      const customDir = path.join(tempDir, 'custom-agents');
      fs.mkdirSync(agentsDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });
      fs.writeFileSync(path.join(agentsDir, 'agent1.md'), '# Agent1');
      fs.writeFileSync(path.join(customDir, 'agent2.md'), '# Agent2');

      const pluginJson: PluginJson = {
        name: 'test',
        agents: './custom-agents/agent2.md',
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.agents).toContain('agents/agent1.md');
      expect(result.agents).toContain('custom-agents/agent2.md');
      expect(result.agents.length).toBe(2);
    });
  });

  describe('001::Invariant::4,5,13 - Path normalization and array support', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('001::Invariant::4 - custom commands follow same naming rules', () => {
      const customDir = path.join(tempDir, 'custom-commands');
      fs.mkdirSync(customDir, { recursive: true });
      fs.writeFileSync(path.join(customDir, 'deploy.md'), '# Deploy');

      const pluginJson: PluginJson = {
        name: 'test',
        commands: './custom-commands/deploy.md',
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.commands).toContain('custom-commands/deploy.md');
      // Path should not start with ./
      result.commands.forEach(cmd => {
        expect(cmd.startsWith('./')).toBe(false);
      });
    });

    it('001::Invariant::5 - multiple paths can be specified as arrays', () => {
      const dir1 = path.join(tempDir, 'dir1');
      const dir2 = path.join(tempDir, 'dir2');
      fs.mkdirSync(dir1, { recursive: true });
      fs.mkdirSync(dir2, { recursive: true });
      fs.writeFileSync(path.join(dir1, 'cmd1.md'), '# Cmd1');
      fs.writeFileSync(path.join(dir2, 'cmd2.md'), '# Cmd2');

      const pluginJson: PluginJson = {
        name: 'test',
        commands: ['./dir1/cmd1.md', './dir2/cmd2.md'],
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.commands).toContain('dir1/cmd1.md');
      expect(result.commands).toContain('dir2/cmd2.md');
      expect(result.commands.length).toBeGreaterThanOrEqual(2);
    });

    it('001::Invariant::13 - paths in normalized format do NOT start with ./', () => {
      const pluginJson: PluginJson = {
        name: 'test',
        commands: ['./commands/cmd1.md', './commands/cmd2.md'],
        agents: './agents/agent.md',
      };

      const result = normalize(tempDir, pluginJson);

      result.commands.forEach(cmd => {
        expect(cmd.startsWith('./')).toBe(false);
      });
      result.agents.forEach(agent => {
        expect(agent.startsWith('./')).toBe(false);
      });
    });
  });

  describe('001::Invariant::15,19 - Hooks normalization', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('001::Invariant::19 - hooks can be inline object and normalized to flat array', () => {
      const pluginJson: PluginJson = {
        name: 'test',
        hooks: {
          SessionStart: [
            {
              hooks: [
                {
                  type: 'command',
                  command: '/setup.sh',
                },
              ],
            },
          ],
          PostToolUse: [
            {
              matcher: 'Write|Edit',
              hooks: [
                {
                  type: 'command',
                  command: '/format.sh',
                },
              ],
            },
          ],
        },
      };

      const result = normalize(tempDir, pluginJson);

      expect(Array.isArray(result.hooks)).toBe(true);
      expect(result.hooks.length).toBe(2);

      const sessionStart = result.hooks.find(h => h.event === 'SessionStart');
      expect(sessionStart).toBeDefined();
      expect(sessionStart?.type).toBe('command');
      expect(sessionStart?.command).toBe('/setup.sh');

      const postToolUse = result.hooks.find(h => h.event === 'PostToolUse');
      expect(postToolUse).toBeDefined();
      expect(postToolUse?.type).toBe('command');
      expect(postToolUse?.command).toBe('/format.sh');
      expect(postToolUse?.matcher).toBe('Write|Edit');
    });

    it('001::Invariant::19 - hooks can be string path to JSON file', () => {
      const hooksDir = path.join(tempDir, 'hooks');
      fs.mkdirSync(hooksDir, { recursive: true });

      const hooksConfig = {
        SessionStart: [
          {
            hooks: [
              {
                type: 'command',
                command: '/init.sh',
              },
            ],
          },
        ],
      };

      fs.writeFileSync(
        path.join(hooksDir, 'hooks.json'),
        JSON.stringify(hooksConfig)
      );

      const pluginJson: PluginJson = {
        name: 'test',
        hooks: './hooks/hooks.json',
      };

      const result = normalize(tempDir, pluginJson);

      expect(Array.isArray(result.hooks)).toBe(true);
      expect(result.hooks.length).toBe(1);
      expect(result.hooks[0].event).toBe('SessionStart');
      expect(result.hooks[0].command).toBe('/init.sh');
    });

    it('001::Invariant::15 - hooks normalized to flat array preserving fields', () => {
      const pluginJson: PluginJson = {
        name: 'test',
        hooks: {
          Stop: [
            {
              hooks: [
                {
                  type: 'command',
                  command: '/cleanup.sh',
                  timeout: 30,
                  customField: 'value',
                },
              ],
            },
          ],
        },
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.hooks[0].event).toBe('Stop');
      expect(result.hooks[0].type).toBe('command');
      expect(result.hooks[0].command).toBe('/cleanup.sh');
      expect(result.hooks[0].timeout).toBe(30);
      expect((result.hooks[0] as any).customField).toBe('value');
    });
  });

  describe('001::Invariant::15,20 - MCPs normalization', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('001::Invariant::20 - MCPs can be inline object and normalized to array', () => {
      const pluginJson: PluginJson = {
        name: 'test',
        mcpServers: {
          tavily: {
            command: 'npx',
            args: ['-y', '@tavily/mcp-server'],
            env: {
              TAVILY_API_KEY: '${TAVILY_API_KEY}',
            },
          },
          filesystem: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/path'],
          },
        },
      };

      const result = normalize(tempDir, pluginJson);

      expect(Array.isArray(result.mcps)).toBe(true);
      expect(result.mcps.length).toBe(2);

      const tavily = result.mcps.find(m => m.name === 'tavily');
      expect(tavily).toBeDefined();
      expect(tavily?.command).toBe('npx');
      expect(tavily?.args).toEqual(['-y', '@tavily/mcp-server']);
      expect(tavily?.env).toEqual({ TAVILY_API_KEY: '${TAVILY_API_KEY}' });

      const filesystem = result.mcps.find(m => m.name === 'filesystem');
      expect(filesystem).toBeDefined();
      expect(filesystem?.command).toBe('npx');
      expect(filesystem?.env).toEqual({});
    });

    it('001::Invariant::20 - MCPs can be string path to JSON file', () => {
      const mcpConfig = {
        tavily: {
          command: 'npx',
          args: ['-y', '@tavily/mcp-server'],
          env: {},
        },
      };

      fs.writeFileSync(path.join(tempDir, '.mcp.json'), JSON.stringify(mcpConfig));

      const pluginJson: PluginJson = {
        name: 'test',
        mcpServers: './.mcp.json',
      };

      const result = normalize(tempDir, pluginJson);

      expect(Array.isArray(result.mcps)).toBe(true);
      expect(result.mcps.length).toBe(1);
      expect(result.mcps[0].name).toBe('tavily');
    });

    it('001::Invariant::15 - MCPs normalized to array preserving fields', () => {
      const pluginJson: PluginJson = {
        name: 'test',
        mcpServers: {
          'custom-server': {
            command: 'node',
            args: ['server.js'],
            env: {},
            customConfig: {
              timeout: 5000,
            },
          },
        },
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.mcps[0].name).toBe('custom-server');
      expect(result.mcps[0].command).toBe('node');
      expect((result.mcps[0] as any).customConfig).toEqual({ timeout: 5000 });
    });
  });

  describe('001::Invariant::16 - Skills can be defined or auto-discovered', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should auto-discover skills from skills/*/SKILL.md pattern', () => {
      const skillsDir = path.join(tempDir, 'skills');
      const skillA = path.join(skillsDir, 'skill-a');
      const skillB = path.join(skillsDir, 'skill-b');
      fs.mkdirSync(skillA, { recursive: true });
      fs.mkdirSync(skillB, { recursive: true });
      fs.writeFileSync(path.join(skillA, 'SKILL.md'), '# Skill A');
      fs.writeFileSync(path.join(skillB, 'SKILL.md'), '# Skill B');

      const pluginJson: PluginJson = { name: 'test' };

      const result = normalize(tempDir, pluginJson);

      expect(result.skills).toContain('skills/skill-a');
      expect(result.skills).toContain('skills/skill-b');
      expect(result.skills.length).toBe(2);
    });

    it('should allow skills to be defined as string', () => {
      const skillsDir = path.join(tempDir, 'custom-skills');
      fs.mkdirSync(skillsDir, { recursive: true });

      const pluginJson: PluginJson = {
        name: 'test',
        skills: './custom-skills',
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.skills).toContain('custom-skills');
    });

    it('should allow skills to be defined as array', () => {
      const pluginJson: PluginJson = {
        name: 'test',
        skills: ['./skills/skill-a', './skills/skill-b'],
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.skills).toContain('skills/skill-a');
      expect(result.skills).toContain('skills/skill-b');
    });

    it('should complement auto-discovered skills with custom paths', () => {
      const skillsDir = path.join(tempDir, 'skills');
      const customDir = path.join(tempDir, 'custom-skills');
      const skillA = path.join(skillsDir, 'skill-a');
      fs.mkdirSync(skillA, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });
      fs.writeFileSync(path.join(skillA, 'SKILL.md'), '# Skill A');

      const pluginJson: PluginJson = {
        name: 'test',
        skills: './custom-skills',
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.skills).toContain('skills/skill-a'); // Auto-discovered
      expect(result.skills).toContain('custom-skills'); // Custom
      expect(result.skills.length).toBe(2);
    });
  });

  describe('001::Example::1 - Complete Example - Official to Normalized transformation', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should transform minimal plugin with auto-discovery', () => {
      // Create filesystem structure
      const commandsDir = path.join(tempDir, 'commands');
      const agentsDir = path.join(tempDir, 'agents');
      const skillsDir = path.join(tempDir, 'skills');
      const hooksDir = path.join(tempDir, 'hooks');

      fs.mkdirSync(commandsDir, { recursive: true });
      fs.mkdirSync(agentsDir, { recursive: true });
      fs.mkdirSync(path.join(skillsDir, 'skill-a'), { recursive: true });
      fs.mkdirSync(path.join(skillsDir, 'skill-b'), { recursive: true });
      fs.mkdirSync(hooksDir, { recursive: true });

      fs.writeFileSync(path.join(commandsDir, 'analyze.md'), '# Analyze');
      fs.writeFileSync(path.join(commandsDir, 'build.md'), '# Build');
      fs.writeFileSync(path.join(agentsDir, 'reviewer.md'), '# Reviewer');
      fs.writeFileSync(path.join(skillsDir, 'skill-a', 'SKILL.md'), '# Skill A');
      fs.writeFileSync(path.join(skillsDir, 'skill-b', 'SKILL.md'), '# Skill B');

      const hooksConfig = {
        SessionStart: [
          {
            hooks: [
              {
                type: 'command',
                command: '/setup.sh',
              },
            ],
          },
        ],
      };
      fs.writeFileSync(
        path.join(hooksDir, 'hooks.json'),
        JSON.stringify(hooksConfig)
      );

      const mcpConfig = {
        tavily: {
          command: 'npx',
          args: ['-y', '@tavily/mcp-server'],
          env: {},
        },
      };
      fs.writeFileSync(path.join(tempDir, '.mcp.json'), JSON.stringify(mcpConfig));

      // Minimal plugin.json (only name)
      const pluginJson: PluginJson = {
        name: 'my-plugin',
      };

      const result = normalize(tempDir, pluginJson);

      // Verify all fields are defined
      expect(result.name).toBe('my-plugin');
      expect(result.source).toBe(tempDir);
      expect(result.version).toBe('0.0.0');
      expect(result.description).toBe('');
      expect(result.author).toEqual({ name: '', email: '', url: '' });
      expect(result.homepage).toBe('');
      expect(result.repository).toBe('');
      expect(result.license).toBe('');
      expect(result.keywords).toEqual([]);

      // Verify auto-discovered components
      expect(result.commands).toContain('commands/analyze.md');
      expect(result.commands).toContain('commands/build.md');
      expect(result.agents).toContain('agents/reviewer.md');
      expect(result.skills).toContain('skills/skill-a');
      expect(result.skills).toContain('skills/skill-b');

      // Verify hooks
      expect(result.hooks.length).toBe(1);
      expect(result.hooks[0].event).toBe('SessionStart');
      expect(result.hooks[0].command).toBe('/setup.sh');

      // Verify MCPs
      expect(result.mcps.length).toBe(1);
      expect(result.mcps[0].name).toBe('tavily');
    });
  });

  describe('001::Example::2 - Commands Supplementation', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should complement auto-discovered commands with custom paths', () => {
      const commandsDir = path.join(tempDir, 'commands');
      const customDir = path.join(tempDir, 'custom');
      fs.mkdirSync(commandsDir, { recursive: true });
      fs.mkdirSync(customDir, { recursive: true });
      fs.writeFileSync(path.join(commandsDir, 'default.md'), '# Default');
      fs.writeFileSync(path.join(customDir, 'cmd.md'), '# Custom');

      const pluginJson: PluginJson = {
        name: 'my-plugin',
        commands: './custom/cmd.md',
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.commands).toContain('custom/cmd.md');
      expect(result.commands).toContain('commands/default.md');
      expect(result.commands.length).toBe(2);
    });
  });

  describe('001::Example::3 - Inline Hooks Configuration transformation', () => {
    it('should transform inline hooks to flat array', () => {
      const tempDir = '/test/plugin';
      const pluginJson: PluginJson = {
        name: 'my-plugin',
        hooks: {
          SessionStart: [
            {
              hooks: [
                {
                  type: 'command',
                  command: '/setup-env.sh',
                },
              ],
            },
          ],
          PostToolUse: [
            {
              matcher: 'Write|Edit',
              hooks: [
                {
                  type: 'command',
                  command: '/format.sh',
                },
              ],
            },
          ],
        },
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.hooks.length).toBe(2);

      const sessionStart = result.hooks.find(h => h.event === 'SessionStart');
      expect(sessionStart?.type).toBe('command');
      expect(sessionStart?.command).toBe('/setup-env.sh');

      const postToolUse = result.hooks.find(h => h.event === 'PostToolUse');
      expect(postToolUse?.type).toBe('command');
      expect(postToolUse?.command).toBe('/format.sh');
      expect(postToolUse?.matcher).toBe('Write|Edit');
    });
  });

  describe('001::Example::4 - Inline MCP Configuration transformation', () => {
    it('should transform inline MCPs to array with name extracted', () => {
      const tempDir = '/test/plugin';
      const pluginJson: PluginJson = {
        name: 'my-plugin',
        mcpServers: {
          tavily: {
            command: 'npx',
            args: ['-y', '@tavily/mcp-server'],
            env: {
              TAVILY_API_KEY: '${TAVILY_API_KEY}',
            },
          },
          filesystem: {
            command: 'npx',
            args: ['-y', '@modelcontextprotocol/server-filesystem', '/allowed/path'],
          },
        },
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.mcps.length).toBe(2);

      const tavily = result.mcps.find(m => m.name === 'tavily');
      expect(tavily?.command).toBe('npx');
      expect(tavily?.args).toEqual(['-y', '@tavily/mcp-server']);
      expect(tavily?.env).toEqual({ TAVILY_API_KEY: '${TAVILY_API_KEY}' });

      const filesystem = result.mcps.find(m => m.name === 'filesystem');
      expect(filesystem?.command).toBe('npx');
      expect(filesystem?.args).toEqual([
        '-y',
        '@modelcontextprotocol/server-filesystem',
        '/allowed/path',
      ]);
      expect(filesystem?.env).toEqual({});
    });
  });

  describe('001::Example::5 - Multiple Custom Paths with Auto-Discovery', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = createTempDir();
    });

    afterEach(() => {
      cleanupTempDir(tempDir);
    });

    it('should handle multiple custom paths and auto-discovery', () => {
      const commandsDir = path.join(tempDir, 'commands');
      const customCommandsDir = path.join(tempDir, 'custom-commands');
      const scriptsDir = path.join(tempDir, 'scripts');

      fs.mkdirSync(commandsDir, { recursive: true });
      fs.mkdirSync(customCommandsDir, { recursive: true });
      fs.mkdirSync(scriptsDir, { recursive: true });

      fs.writeFileSync(path.join(commandsDir, 'analyze.md'), '# Analyze');
      fs.writeFileSync(path.join(commandsDir, 'build.md'), '# Build');
      fs.writeFileSync(path.join(customCommandsDir, 'deploy.md'), '# Deploy');
      fs.writeFileSync(path.join(scriptsDir, 'cmd.md'), '# Cmd');

      const pluginJson: PluginJson = {
        name: 'my-plugin',
        commands: ['./custom-commands/deploy.md', './scripts/cmd.md'],
      };

      const result = normalize(tempDir, pluginJson);

      expect(result.commands).toContain('custom-commands/deploy.md');
      expect(result.commands).toContain('scripts/cmd.md');
      expect(result.commands).toContain('commands/analyze.md');
      expect(result.commands).toContain('commands/build.md');
      expect(result.commands.length).toBe(4);
    });
  });
});
