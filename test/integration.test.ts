import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import { normalizePlugin } from '../src/lib/normalize';
import { reverseTransform } from '../src/lib/reverse';
import { saveSelection, ComponentSelection } from '../src/lib/save';
import { NormalizedPlugin } from '../src/types/normalized';

describe('Integration Test Suite', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const outputDir = path.join(__dirname, '../output-test');

  afterAll(async () => {
    // Cleanup test output
    try {
      await fs.rm(outputDir, { recursive: true, force: true });
    } catch {}
  });

  describe('Full Workflow: Load → Select → Save → Verify', () => {
    it('should load test-plugin without errors', async () => {
      const pluginDir = path.join(fixturesDir, 'test-plugin');
      const normalized = await normalizePlugin(pluginDir);

      expect(normalized).toBeDefined();
      expect(normalized.name).toBe('test-plugin');
      expect(normalized.version).toBe('1.2.3');
      expect(normalized.description).toBe('Comprehensive test plugin');
    });

    it('should discover all 15 components', async () => {
      const pluginDir = path.join(fixturesDir, 'test-plugin');
      const normalized = await normalizePlugin(pluginDir);

      // 3 commands
      expect(normalized.commands.length).toBe(3);
      expect(normalized.commands).toContain('commands/analyze.md');
      expect(normalized.commands).toContain('commands/optimize.md');
      expect(normalized.commands).toContain('commands/nested/deep-cmd.md');

      // 2 agents
      expect(normalized.agents.length).toBe(2);
      expect(normalized.agents).toContain('agents/reviewer.md');
      expect(normalized.agents).toContain('agents/context-agent.md');

      // 3 skills
      expect(normalized.skills.length).toBe(3);
      expect(normalized.skills).toContain('skills/skill-alpha');
      expect(normalized.skills).toContain('skills/skill-beta');
      expect(normalized.skills).toContain('skills/skill-gamma');

      // 4 hooks
      expect(normalized.hooks.length).toBe(4);
      const sessionStartHooks = normalized.hooks.filter(h => h.event === 'SessionStart');
      expect(sessionStartHooks.length).toBe(2);

      // 3 MCPs
      expect(normalized.mcps.length).toBe(3);
      expect(normalized.mcps.map(m => m.name)).toContain('tavily');
      expect(normalized.mcps.map(m => m.name)).toContain('filesystem');
      expect(normalized.mcps.map(m => m.name)).toContain('github');
    });

    it('should save selection and generate all output files', async () => {
      const pluginDir = path.join(fixturesDir, 'test-plugin');
      const normalized = await normalizePlugin(pluginDir);

      const selection: ComponentSelection = {
        commands: ['commands/analyze.md'],
        agents: ['agents/reviewer.md'],
        skills: ['skills/skill-alpha'],
        hooks: normalized.hooks.filter(h => h.event === 'SessionStart' && h.command === '/setup-env.sh'),
        mcps: normalized.mcps.filter(m => m.name === 'tavily'),
      };

      const selections = new Map<string, ComponentSelection>();
      selections.set(normalized.name, selection);

      await saveSelection([normalized], selections, {
        outputDir,
        pluginName: 'curated-plugin',
      });

      // Verify marketplace.json exists
      const marketplacePath = path.join(outputDir, '.claude-plugin/marketplace.json');
      const marketplaceExists = await fs.access(marketplacePath).then(() => true).catch(() => false);
      expect(marketplaceExists).toBe(true);

      // Verify plugin.json exists
      const pluginJsonPath = path.join(outputDir, 'plugins/curated-plugin/.claude-plugin/plugin.json');
      const pluginJsonExists = await fs.access(pluginJsonPath).then(() => true).catch(() => false);
      expect(pluginJsonExists).toBe(true);

      // Verify normalized-plugin.json exists
      const normalizedPath = path.join(outputDir, 'normalized-plugin.json');
      const normalizedExists = await fs.access(normalizedPath).then(() => true).catch(() => false);
      expect(normalizedExists).toBe(true);
    });

    it('should generate valid plugin.json in official format', async () => {
      const pluginJsonPath = path.join(outputDir, 'plugins/curated-plugin/.claude-plugin/plugin.json');
      const content = await fs.readFile(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(content);

      // Verify required fields
      expect(pluginJson.name).toBeDefined();
      expect(pluginJson.commands).toBeDefined();
      expect(Array.isArray(pluginJson.commands)).toBe(true);
      expect(pluginJson.commands.length).toBe(1);
      expect(pluginJson.commands[0]).toBe('./commands/analyze.md');

      // Verify hooks are in nested format
      expect(pluginJson.hooks).toBeDefined();
      expect(pluginJson.hooks.SessionStart).toBeDefined();
      expect(Array.isArray(pluginJson.hooks.SessionStart)).toBe(true);

      // Verify MCPs are in object format
      expect(pluginJson.mcpServers).toBeDefined();
      expect(pluginJson.mcpServers.tavily).toBeDefined();
      expect(pluginJson.mcpServers.tavily.command).toBe('npx');
    });

    it('should copy selected component files', async () => {
      // Verify command file was copied
      const commandPath = path.join(outputDir, 'plugins/curated-plugin/commands/analyze.md');
      const commandExists = await fs.access(commandPath).then(() => true).catch(() => false);
      expect(commandExists).toBe(true);

      // Verify agent file was copied
      const agentPath = path.join(outputDir, 'plugins/curated-plugin/agents/reviewer.md');
      const agentExists = await fs.access(agentPath).then(() => true).catch(() => false);
      expect(agentExists).toBe(true);

      // Verify skill directory was copied
      const skillPath = path.join(outputDir, 'plugins/curated-plugin/skills/skill-alpha/SKILL.md');
      const skillExists = await fs.access(skillPath).then(() => true).catch(() => false);
      expect(skillExists).toBe(true);

      // Verify helpers.ts was also copied (skill directory copy)
      const helperPath = path.join(outputDir, 'plugins/curated-plugin/skills/skill-alpha/helpers.ts');
      const helperExists = await fs.access(helperPath).then(() => true).catch(() => false);
      expect(helperExists).toBe(true);
    });
  });

  describe('Multi-Plugin Selection with Conflict Resolution', () => {
    it('should handle command name conflicts with namespace prefixing', async () => {
      const pluginADir = path.join(fixturesDir, 'test-plugin-a');
      const pluginBDir = path.join(fixturesDir, 'test-plugin-b');

      const pluginA = await normalizePlugin(pluginADir);
      const pluginB = await normalizePlugin(pluginBDir);

      const selectionA: ComponentSelection = {
        commands: ['commands/build.md'],
        agents: [],
        skills: [],
        hooks: [],
        mcps: [],
      };

      const selectionB: ComponentSelection = {
        commands: ['commands/build.md'],
        agents: [],
        skills: [],
        hooks: [],
        mcps: [],
      };

      const selections = new Map<string, ComponentSelection>();
      selections.set(pluginA.name, selectionA);
      selections.set(pluginB.name, selectionB);

      const testOutputDir = path.join(outputDir, 'conflict-test');
      await saveSelection([pluginA, pluginB], selections, {
        outputDir: testOutputDir,
        pluginName: 'conflict-plugin',
      });

      // Verify both files were saved with namespace prefixes
      const fileAPath = path.join(testOutputDir, 'plugins/conflict-plugin/commands/test-plugin-a--build.md');
      const fileBPath = path.join(testOutputDir, 'plugins/conflict-plugin/commands/test-plugin-b--build.md');

      const fileAExists = await fs.access(fileAPath).then(() => true).catch(() => false);
      const fileBExists = await fs.access(fileBPath).then(() => true).catch(() => false);

      expect(fileAExists).toBe(true);
      expect(fileBExists).toBe(true);

      // Verify plugin.json has both commands with namespace prefixes
      const pluginJsonPath = path.join(testOutputDir, 'plugins/conflict-plugin/.claude-plugin/plugin.json');
      const content = await fs.readFile(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(content);

      expect(pluginJson.commands).toContain('./commands/test-plugin-a--build.md');
      expect(pluginJson.commands).toContain('./commands/test-plugin-b--build.md');
    });

    it('should handle skill directory conflicts with namespace prefixing', async () => {
      const pluginADir = path.join(fixturesDir, 'test-plugin-a');
      const pluginBDir = path.join(fixturesDir, 'test-plugin-b');

      const pluginA = await normalizePlugin(pluginADir);
      const pluginB = await normalizePlugin(pluginBDir);

      const selectionA: ComponentSelection = {
        commands: [],
        agents: [],
        skills: ['skills/chrome-devtools'],
        hooks: [],
        mcps: [],
      };

      const selectionB: ComponentSelection = {
        commands: [],
        agents: [],
        skills: ['skills/chrome-devtools'],
        hooks: [],
        mcps: [],
      };

      const selections = new Map<string, ComponentSelection>();
      selections.set(pluginA.name, selectionA);
      selections.set(pluginB.name, selectionB);

      const testOutputDir = path.join(outputDir, 'skill-conflict-test');
      await saveSelection([pluginA, pluginB], selections, {
        outputDir: testOutputDir,
        pluginName: 'skill-conflict-plugin',
      });

      // Verify both skill directories were saved with namespace prefixes
      const skillAPath = path.join(testOutputDir, 'plugins/skill-conflict-plugin/skills/test-plugin-a--chrome-devtools/SKILL.md');
      const skillBPath = path.join(testOutputDir, 'plugins/skill-conflict-plugin/skills/test-plugin-b--chrome-devtools/SKILL.md');

      const skillAExists = await fs.access(skillAPath).then(() => true).catch(() => false);
      const skillBExists = await fs.access(skillBPath).then(() => true).catch(() => false);

      expect(skillAExists).toBe(true);
      expect(skillBExists).toBe(true);
    });

    it('should merge hooks from same event without conflicts', async () => {
      const pluginADir = path.join(fixturesDir, 'test-plugin-a');
      const pluginBDir = path.join(fixturesDir, 'test-plugin-b');

      const pluginA = await normalizePlugin(pluginADir);
      const pluginB = await normalizePlugin(pluginBDir);

      const selectionA: ComponentSelection = {
        commands: [],
        agents: [],
        skills: [],
        hooks: pluginA.hooks.filter(h => h.event === 'SessionStart'),
        mcps: [],
      };

      const selectionB: ComponentSelection = {
        commands: [],
        agents: [],
        skills: [],
        hooks: pluginB.hooks.filter(h => h.event === 'SessionStart'),
        mcps: [],
      };

      const selections = new Map<string, ComponentSelection>();
      selections.set(pluginA.name, selectionA);
      selections.set(pluginB.name, selectionB);

      const testOutputDir = path.join(outputDir, 'hooks-merge-test');
      await saveSelection([pluginA, pluginB], selections, {
        outputDir: testOutputDir,
        pluginName: 'hooks-merge-plugin',
      });

      // Verify plugin.json has merged hooks
      const pluginJsonPath = path.join(testOutputDir, 'plugins/hooks-merge-plugin/.claude-plugin/plugin.json');
      const content = await fs.readFile(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(content);

      expect(pluginJson.hooks.SessionStart).toBeDefined();
      expect(Array.isArray(pluginJson.hooks.SessionStart)).toBe(true);
      expect(pluginJson.hooks.SessionStart.length).toBeGreaterThan(0);

      // Find the hooks array
      const hooksArray = pluginJson.hooks.SessionStart[0].hooks;
      expect(hooksArray.length).toBe(2);
      expect(hooksArray.some((h: any) => h.command === '/setup-a.sh')).toBe(true);
      expect(hooksArray.some((h: any) => h.command === '/setup-b.sh')).toBe(true);
    });

    it('should handle MCP name conflicts with namespace prefixing', async () => {
      const pluginADir = path.join(fixturesDir, 'test-plugin-a');
      const pluginBDir = path.join(fixturesDir, 'test-plugin-b');

      const pluginA = await normalizePlugin(pluginADir);
      const pluginB = await normalizePlugin(pluginBDir);

      const selectionA: ComponentSelection = {
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: pluginA.mcps,
      };

      const selectionB: ComponentSelection = {
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: pluginB.mcps,
      };

      const selections = new Map<string, ComponentSelection>();
      selections.set(pluginA.name, selectionA);
      selections.set(pluginB.name, selectionB);

      const testOutputDir = path.join(outputDir, 'mcp-conflict-test');
      await saveSelection([pluginA, pluginB], selections, {
        outputDir: testOutputDir,
        pluginName: 'mcp-conflict-plugin',
      });

      // Verify plugin.json has both MCPs with namespace prefixes
      const pluginJsonPath = path.join(testOutputDir, 'plugins/mcp-conflict-plugin/.claude-plugin/plugin.json');
      const content = await fs.readFile(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(content);

      expect(pluginJson.mcpServers['test-plugin-a--tavily']).toBeDefined();
      expect(pluginJson.mcpServers['test-plugin-b--tavily']).toBeDefined();
      expect(pluginJson.mcpServers['test-plugin-a--tavily'].env.KEY).toBe('A');
      expect(pluginJson.mcpServers['test-plugin-b--tavily'].env.KEY).toBe('B');
    });
  });

  describe('Reverse Transformation', () => {
    it('should omit default values in official format', async () => {
      const pluginDir = path.join(fixturesDir, 'test-plugin-a');
      const normalized = await normalizePlugin(pluginDir);

      // Manually set some fields to defaults
      normalized.version = '0.0.0';
      normalized.description = '';
      normalized.homepage = '';
      normalized.keywords = [];

      const official = reverseTransform(normalized);

      // Verify defaults are omitted
      expect(official.version).toBeUndefined();
      expect(official.description).toBeUndefined();
      expect(official.homepage).toBeUndefined();
      expect(official.keywords).toBeUndefined();

      // Name should always be present
      expect(official.name).toBe('test-plugin-a');
    });

    it('should add ./ prefix to component paths', async () => {
      const pluginDir = path.join(fixturesDir, 'test-plugin');
      const normalized = await normalizePlugin(pluginDir);

      const selection: ComponentSelection = {
        commands: ['commands/analyze.md'],
        agents: ['agents/reviewer.md'],
        skills: ['skills/skill-alpha'],
        hooks: [],
        mcps: [],
      };

      const selections = new Map<string, ComponentSelection>();
      selections.set(normalized.name, selection);

      const testOutputDir = path.join(outputDir, 'prefix-test');
      await saveSelection([normalized], selections, {
        outputDir: testOutputDir,
        pluginName: 'prefix-test-plugin',
      });

      const pluginJsonPath = path.join(testOutputDir, 'plugins/prefix-test-plugin/.claude-plugin/plugin.json');
      const content = await fs.readFile(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(content);

      // All paths should start with ./
      expect(pluginJson.commands[0]).toMatch(/^\.\//)
      expect(pluginJson.agents[0]).toMatch(/^\.\//);
      expect(pluginJson.skills[0]).toMatch(/^\.\//);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error when saving empty selection', async () => {
      const pluginDir = path.join(fixturesDir, 'test-plugin');
      const normalized = await normalizePlugin(pluginDir);

      const selection: ComponentSelection = {
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: [],
      };

      const selections = new Map<string, ComponentSelection>();
      selections.set(normalized.name, selection);

      await expect(
        saveSelection([normalized], selections, {
          outputDir: path.join(outputDir, 'empty-test'),
          pluginName: 'empty-plugin',
        })
      ).rejects.toThrow('No components selected');
    });
  });
});
