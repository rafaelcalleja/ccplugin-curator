import * as path from 'path';
import { discoverCommands, discoverAgents, discoverSkills } from '../../../src/loader/autoDiscover';

describe('auto-discovery', () => {
  const fixturesDir = path.join(__dirname, '../../fixtures/test-plugin');

  test('should discover commands using glob pattern', async () => {
    const commands = await discoverCommands(fixturesDir);

    expect(commands.length).toBeGreaterThan(0);
    expect(commands).toContain('commands/analyze.md');
    expect(commands).toContain('commands/optimize.md');
    expect(commands).toContain('commands/nested/deep-cmd.md');
  });

  test('should discover agents using glob pattern', async () => {
    const agents = await discoverAgents(fixturesDir);

    expect(agents.length).toBeGreaterThan(0);
    expect(agents).toContain('agents/reviewer.md');
    expect(agents).toContain('agents/context-agent.md');
  });

  test('should discover skills and return parent directories', async () => {
    const skills = await discoverSkills(fixturesDir);

    expect(skills.length).toBeGreaterThan(0);
    expect(skills).toContain('skills/skill-alpha');
    expect(skills).toContain('skills/skill-beta');
    expect(skills).toContain('skills/skill-gamma');

    // Should not include SKILL.md files themselves
    skills.forEach(skill => {
      expect(skill).not.toContain('SKILL.md');
    });
  });

  test('should return empty array for non-existent directory', async () => {
    const commands = await discoverCommands('/non/existent/path');
    expect(commands).toEqual([]);
  });
});
