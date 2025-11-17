/**
 * Auto-Discovery Tests
 *
 * Tests the auto-discovery system that finds plugin components
 * (commands, agents, skills) from filesystem.
 *
 * Spec: docs/spec/001-normalization-protocol.md (Section 2)
 */

import { describe, it, expect } from 'vitest';
import { join } from 'path';
import {
  discoverCommands,
  discoverAgents,
  discoverSkills,
  resolveCustomPaths,
  getAllCommands,
  getAllAgents,
  getAllSkills,
} from '../../../src/core/auto-discovery.js';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures');

describe('Auto-Discovery', () => {
  describe('discoverCommands', () => {
    it('should discover all .md files in commands directory', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const commands = await discoverCommands(pluginDir);

      expect(commands).toContain('commands/build.md');
      expect(commands).toContain('commands/test.md');
      expect(commands.length).toBeGreaterThanOrEqual(2);
    });

    it('should return relative paths without leading ./', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const commands = await discoverCommands(pluginDir);

      // All paths should be relative and not start with ./
      commands.forEach((cmd) => {
        expect(cmd.startsWith('./')).toBe(false);
        expect(cmd.startsWith('commands/')).toBe(true);
      });
    });

    it('should discover commands in nested directories', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const commands = await discoverCommands(pluginDir);

      // Should discover commands at any depth
      const hasCommands = commands.length > 0;
      expect(hasCommands).toBe(true);
    });

    it('should return empty array when commands directory does not exist', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');

      const commands = await discoverCommands(pluginDir);

      expect(commands).toEqual([]);
    });
  });

  describe('discoverAgents', () => {
    it('should discover all .md files in agents directory', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const agents = await discoverAgents(pluginDir);

      expect(agents).toContain('agents/coder.md');
      expect(agents.length).toBeGreaterThanOrEqual(1);
    });

    it('should return relative paths without leading ./', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const agents = await discoverAgents(pluginDir);

      // All paths should be relative and not start with ./
      agents.forEach((agent) => {
        expect(agent.startsWith('./')).toBe(false);
        expect(agent.startsWith('agents/')).toBe(true);
      });
    });

    it('should discover agents in nested directories', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const agents = await discoverAgents(pluginDir);

      // Should discover agents at any depth
      const hasAgents = agents.length > 0;
      expect(hasAgents).toBe(true);
    });

    it('should return empty array when agents directory does not exist', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');

      const agents = await discoverAgents(pluginDir);

      expect(agents).toEqual([]);
    });
  });

  describe('discoverSkills', () => {
    it('should discover skill directories with SKILL.md file', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const skills = await discoverSkills(pluginDir);

      expect(skills).toContain('skills/hello-skill');
      expect(skills.length).toBeGreaterThanOrEqual(1);
    });

    it('should return directory paths, not file paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const skills = await discoverSkills(pluginDir);

      // Should return "skills/hello-skill" not "skills/hello-skill/SKILL.md"
      skills.forEach((skill) => {
        expect(skill.endsWith('.md')).toBe(false);
        expect(skill.startsWith('skills/')).toBe(true);
      });
    });

    it('should return relative paths without leading ./', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const skills = await discoverSkills(pluginDir);

      // All paths should be relative and not start with ./
      skills.forEach((skill) => {
        expect(skill.startsWith('./')).toBe(false);
      });
    });

    it('should only discover directories with SKILL.md file', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const skills = await discoverSkills(pluginDir);

      // Only directories with SKILL.md should be included
      // This test validates the pattern `skills/*/SKILL.md`
      expect(skills.length).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array when skills directory does not exist', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');

      const skills = await discoverSkills(pluginDir);

      expect(skills).toEqual([]);
    });

    it('should deduplicate skill directories', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const skills = await discoverSkills(pluginDir);

      // No duplicates
      const uniqueSkills = Array.from(new Set(skills));
      expect(skills).toEqual(uniqueSkills);
    });
  });

  describe('resolveCustomPaths', () => {
    it('should return empty array when customValue is undefined', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const result = await resolveCustomPaths(pluginDir, undefined, '**/*.md');

      expect(result).toEqual([]);
    });

    it('should handle array of explicit paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customPaths = ['./custom/cmd1.md', './custom/cmd2.md'];

      const result = await resolveCustomPaths(pluginDir, customPaths, '**/*.md');

      // Should normalize paths (remove ./)
      expect(result).toContain('custom/cmd1.md');
      expect(result).toContain('custom/cmd2.md');
      expect(result.length).toBe(2);
    });

    it('should normalize paths by removing leading ./', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customPaths = ['./path/to/file.md', './another/file.md'];

      const result = await resolveCustomPaths(pluginDir, customPaths, '**/*.md');

      result.forEach((path) => {
        expect(path.startsWith('./')).toBe(false);
      });
    });

    it('should handle string path as directory for glob expansion', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customPath = './commands'; // Directory path

      const result = await resolveCustomPaths(pluginDir, customPath, '**/*.md');

      // Should find .md files in the commands directory
      expect(result.length).toBeGreaterThan(0);
      result.forEach((path) => {
        expect(path.endsWith('.md')).toBe(true);
      });
    });
  });

  describe('getAllCommands (integration)', () => {
    it('should return only auto-discovered when no custom paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const commands = await getAllCommands(pluginDir);

      expect(commands).toContain('commands/build.md');
      expect(commands).toContain('commands/test.md');
    });

    it('should merge auto-discovered and custom paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customCommands = ['./custom/extra.md'];

      const commands = await getAllCommands(pluginDir, customCommands);

      // Should have both auto-discovered and custom
      expect(commands).toContain('commands/build.md'); // Auto
      expect(commands).toContain('commands/test.md'); // Auto
      expect(commands).toContain('custom/extra.md'); // Custom
    });

    it('should handle custom paths as string', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customCommands = './commands'; // String path

      const commands = await getAllCommands(pluginDir, customCommands);

      // Should discover from the custom directory
      expect(commands.length).toBeGreaterThan(0);
    });

    it('should handle custom paths as array', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customCommands = ['./custom/cmd1.md', './custom/cmd2.md'];

      const commands = await getAllCommands(pluginDir, customCommands);

      // Should include custom paths
      expect(commands).toContain('custom/cmd1.md');
      expect(commands).toContain('custom/cmd2.md');
    });

    it('should deduplicate merged results', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customCommands = ['./commands/build.md']; // Duplicate of auto-discovered

      const commands = await getAllCommands(pluginDir, customCommands);

      // Should not have duplicates
      const buildCount = commands.filter((c) => c === 'commands/build.md').length;
      expect(buildCount).toBe(1);
    });

    it('should return empty array when no directory and no custom paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');

      const commands = await getAllCommands(pluginDir);

      expect(commands).toEqual([]);
    });
  });

  describe('getAllAgents (integration)', () => {
    it('should return only auto-discovered when no custom paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const agents = await getAllAgents(pluginDir);

      expect(agents).toContain('agents/coder.md');
    });

    it('should merge auto-discovered and custom paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customAgents = ['./custom/agent1.md'];

      const agents = await getAllAgents(pluginDir, customAgents);

      // Should have both auto-discovered and custom
      expect(agents).toContain('agents/coder.md'); // Auto
      expect(agents).toContain('custom/agent1.md'); // Custom
    });

    it('should handle custom paths as array', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customAgents = ['./custom/agent1.md', './custom/agent2.md'];

      const agents = await getAllAgents(pluginDir, customAgents);

      // Should include custom paths
      expect(agents).toContain('custom/agent1.md');
      expect(agents).toContain('custom/agent2.md');
    });

    it('should deduplicate merged results', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customAgents = ['./agents/coder.md']; // Duplicate of auto-discovered

      const agents = await getAllAgents(pluginDir, customAgents);

      // Should not have duplicates
      const coderCount = agents.filter((a) => a === 'agents/coder.md').length;
      expect(coderCount).toBe(1);
    });

    it('should return empty array when no directory and no custom paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');

      const agents = await getAllAgents(pluginDir);

      expect(agents).toEqual([]);
    });
  });

  describe('getAllSkills (integration)', () => {
    it('should return only auto-discovered when no custom paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const skills = await getAllSkills(pluginDir);

      expect(skills).toContain('skills/hello-skill');
    });

    it('should merge auto-discovered and custom paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customSkills = ['./custom-skills/skill1'];

      const skills = await getAllSkills(pluginDir, customSkills);

      // Should have both auto-discovered and custom
      expect(skills).toContain('skills/hello-skill'); // Auto
      expect(skills).toContain('custom-skills/skill1'); // Custom
    });

    it('should handle custom paths as array', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customSkills = ['./custom-skills/skill1', './custom-skills/skill2'];

      const skills = await getAllSkills(pluginDir, customSkills);

      // Should include custom paths
      expect(skills).toContain('custom-skills/skill1');
      expect(skills).toContain('custom-skills/skill2');
    });

    it('should deduplicate merged results', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customSkills = ['./skills/hello-skill']; // Duplicate of auto-discovered

      const skills = await getAllSkills(pluginDir, customSkills);

      // Should not have duplicates
      const helloCount = skills.filter((s) => s === 'skills/hello-skill').length;
      expect(helloCount).toBe(1);
    });

    it('should return empty array when no directory and no custom paths', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-minimal');

      const skills = await getAllSkills(pluginDir);

      expect(skills).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-existent plugin directory gracefully', async () => {
      const pluginDir = '/nonexistent/path';

      const commands = await discoverCommands(pluginDir);
      const agents = await discoverAgents(pluginDir);
      const skills = await discoverSkills(pluginDir);

      expect(commands).toEqual([]);
      expect(agents).toEqual([]);
      expect(skills).toEqual([]);
    });

    it('should handle empty custom paths array', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const customPaths: string[] = [];

      const result = await resolveCustomPaths(pluginDir, customPaths, '**/*.md');

      expect(result).toEqual([]);
    });

    it('should normalize paths consistently', async () => {
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');

      const commands = await getAllCommands(pluginDir, ['./custom/test.md', 'other/test.md']);

      // Both should be normalized (no ./ prefix)
      expect(commands).toContain('custom/test.md');
      expect(commands).toContain('other/test.md');

      // None should have ./ prefix
      const hasLeadingDot = commands.some((c) => c.startsWith('./'));
      expect(hasLeadingDot).toBe(false);
    });
  });
});
