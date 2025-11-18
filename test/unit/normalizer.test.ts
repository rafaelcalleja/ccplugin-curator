import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  normalizePlugin,
  autoDiscoverCommands,
  autoDiscoverAgents,
  autoDiscoverSkills,
  parseHooks,
  parseMcps
} from '../../src/lib/normalizer';

const TEST_FIXTURES = path.join(__dirname, '..', 'fixtures', 'test-plugin');

describe('Normalizer', () => {
  describe('normalizePlugin', () => {
    it('should normalize a valid plugin', async () => {
      const result = await normalizePlugin(TEST_FIXTURES);

      expect(result.name).toBe('test-plugin');
      expect(result.version).toBe('1.0.0');
      expect(result.description).toBe('A test plugin for unit testing');
      expect(result.source).toBe(TEST_FIXTURES);
      expect(result.author.name).toBe('Test Author');
      expect(result.homepage).toBe('https://example.com');
      expect(result.repository).toBe('https://github.com/test/test-plugin');
      expect(result.license).toBe('MIT');
      expect(result.keywords).toEqual(['test', 'example']);
    });

    it('should auto-discover commands', async () => {
      const result = await normalizePlugin(TEST_FIXTURES);

      expect(result.commands).toContain('commands/test-command.md');
    });

    it('should auto-discover agents', async () => {
      const result = await normalizePlugin(TEST_FIXTURES);

      expect(result.agents).toContain('agents/test-agent.md');
    });

    it('should throw error when plugin.json not found', async () => {
      const invalidPath = path.join(__dirname, 'non-existent');

      await expect(normalizePlugin(invalidPath)).rejects.toThrow('Plugin file not found');
    });

    it('should use directory basename as default name', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'temp-test-plugin');
      const tempPluginDir = path.join(tempDir, '.claude-plugin');

      // Create temporary plugin without name
      fs.mkdirSync(tempPluginDir, { recursive: true });
      fs.writeFileSync(
        path.join(tempPluginDir, 'plugin.json'),
        JSON.stringify({ description: 'Test' })
      );

      try {
        const result = await normalizePlugin(tempDir);
        expect(result.name).toBe('temp-test-plugin');
      } finally {
        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should default to empty values when optional fields missing', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'minimal-plugin');
      const tempPluginDir = path.join(tempDir, '.claude-plugin');

      // Create minimal plugin
      fs.mkdirSync(tempPluginDir, { recursive: true });
      fs.writeFileSync(
        path.join(tempPluginDir, 'plugin.json'),
        JSON.stringify({ name: 'minimal' })
      );

      try {
        const result = await normalizePlugin(tempDir);
        expect(result.version).toBe('0.0.0');
        expect(result.description).toBe('');
        expect(result.author.name).toBe('');
        expect(result.author.email).toBe('');
        expect(result.author.url).toBe('');
        expect(result.homepage).toBe('');
        expect(result.repository).toBe('');
        expect(result.license).toBe('');
        expect(result.keywords).toEqual([]);
        expect(result.commands).toEqual([]);
        expect(result.agents).toEqual([]);
        expect(result.skills).toEqual([]);
      } finally {
        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('autoDiscoverCommands', () => {
    it('should discover commands in commands directory', async () => {
      const commands = await autoDiscoverCommands(TEST_FIXTURES);

      expect(commands).toContain('commands/test-command.md');
    });

    it('should return empty array when commands directory does not exist', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'no-commands');
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        const commands = await autoDiscoverCommands(tempDir);
        expect(commands).toEqual([]);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should remove leading ./ from paths', async () => {
      const commands = await autoDiscoverCommands(TEST_FIXTURES);

      commands.forEach(cmd => {
        expect(cmd).not.toMatch(/^\.\//);
      });
    });
  });

  describe('autoDiscoverAgents', () => {
    it('should discover agents in agents directory', async () => {
      const agents = await autoDiscoverAgents(TEST_FIXTURES);

      expect(agents).toContain('agents/test-agent.md');
    });

    it('should return empty array when agents directory does not exist', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'no-agents');
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        const agents = await autoDiscoverAgents(tempDir);
        expect(agents).toEqual([]);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should remove leading ./ from paths', async () => {
      const agents = await autoDiscoverAgents(TEST_FIXTURES);

      agents.forEach(agent => {
        expect(agent).not.toMatch(/^\.\//);
      });
    });
  });

  describe('autoDiscoverSkills', () => {
    it('should return empty array when skills directory does not exist', async () => {
      const skills = await autoDiscoverSkills(TEST_FIXTURES);

      expect(skills).toEqual([]);
    });

    it('should discover skills with SKILL.md files', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'with-skills');
      const skillsDir = path.join(tempDir, 'skills', 'test-skill');

      fs.mkdirSync(skillsDir, { recursive: true });
      fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), '# Test Skill');

      try {
        const skills = await autoDiscoverSkills(tempDir);
        expect(skills).toContain('skills/test-skill');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should return parent directory paths, not file paths', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'skill-dirs');
      const skillsDir = path.join(tempDir, 'skills', 'my-skill');

      fs.mkdirSync(skillsDir, { recursive: true });
      fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), '# Skill');

      try {
        const skills = await autoDiscoverSkills(tempDir);
        expect(skills[0]).toBe('skills/my-skill');
        expect(skills[0]).not.toContain('SKILL.md');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });

  describe('parseHooks', () => {
    it('should return empty array when no hooks config', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'no-hooks');
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        const hooks = await parseHooks(tempDir, undefined);
        expect(hooks).toEqual([]);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should parse inline hooks configuration', async () => {
      const hooksConfig = {
        hooks: {
          'session-start': [
            {
              matcher: '*',
              hooks: [
                {
                  type: 'command',
                  command: './hooks/init.sh',
                  timeout: 5000
                }
              ]
            }
          ]
        }
      };

      const hooks = await parseHooks('/tmp', hooksConfig);

      expect(hooks).toHaveLength(1);
      expect(hooks[0].event).toBe('session-start');
      expect(hooks[0].type).toBe('command');
      expect(hooks[0].command).toBe('hooks/init.sh');
      expect(hooks[0].matcher).toBe('*');
      expect(hooks[0].timeout).toBe(5000);
    });

    it('should load hooks from file path', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'hooks-file');
      const hooksDir = path.join(tempDir, 'hooks');

      fs.mkdirSync(hooksDir, { recursive: true });
      fs.writeFileSync(
        path.join(hooksDir, 'hooks.json'),
        JSON.stringify({
          hooks: {
            'tool-call': [
              {
                matcher: '*',
                hooks: [{ type: 'command', command: 'test.sh' }]
              }
            ]
          }
        })
      );

      try {
        const hooks = await parseHooks(tempDir, 'hooks/hooks.json');
        expect(hooks).toHaveLength(1);
        expect(hooks[0].event).toBe('tool-call');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should remove leading ./ from command paths', async () => {
      const hooksConfig = {
        'session-start': [
          {
            matcher: '*',
            hooks: [{ type: 'command', command: './hooks/test.sh' }]
          }
        ]
      };

      const hooks = await parseHooks('/tmp', hooksConfig);

      expect(hooks[0].command).toBe('hooks/test.sh');
    });
  });

  describe('parseMcps', () => {
    it('should return empty array when no mcp config', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'no-mcps');
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        const mcps = await parseMcps(tempDir, undefined);
        expect(mcps).toEqual([]);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should parse inline MCP configuration', async () => {
      const mcpConfig = {
        mcpServers: {
          'test-server': {
            command: 'node',
            args: ['server.js'],
            env: {
              PORT: '3000'
            }
          }
        }
      };

      const mcps = await parseMcps('/tmp', mcpConfig);

      expect(mcps).toHaveLength(1);
      expect(mcps[0].name).toBe('test-server');
      expect(mcps[0].command).toBe('node');
      expect(mcps[0].args).toEqual(['server.js']);
      expect(mcps[0].env).toEqual({ PORT: '3000' });
    });

    it('should load MCPs from file path', async () => {
      const tempDir = path.join(__dirname, '..', 'fixtures', 'mcp-file');

      fs.mkdirSync(tempDir, { recursive: true });
      fs.writeFileSync(
        path.join(tempDir, '.mcp.json'),
        JSON.stringify({
          mcpServers: {
            'file-server': {
              command: 'python',
              args: ['-m', 'mcp']
            }
          }
        })
      );

      try {
        const mcps = await parseMcps(tempDir, undefined);
        expect(mcps).toHaveLength(1);
        expect(mcps[0].name).toBe('file-server');
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it('should ensure env is an object', async () => {
      const mcpConfig = {
        'test-server': {
          command: 'node'
        }
      };

      const mcps = await parseMcps('/tmp', mcpConfig);

      expect(mcps[0].env).toEqual({});
    });
  });
});
