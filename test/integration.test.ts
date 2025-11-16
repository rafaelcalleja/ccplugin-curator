import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import {
  scanAndNormalizePlugins,
  buildCuratedPlugin,
  saveCuratedPlugin,
  reverseTransform
} from '../src/index.js';
import type { SelectionState } from '../src/components/App.js';
import type { NormalizedPluginInternalFormat } from '../src/types/normalized.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const TEST_PLUGIN_DIR = path.join(FIXTURES_DIR, 'test-plugin');
const OUTPUT_DIR = path.join(__dirname, 'output');

/**
 * Test utilities
 */
async function cleanupOutput() {
  try {
    await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  } catch (error) {
    // Ignore if doesn't exist
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJSON(filePath: string): Promise<any> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

describe('Integration Tests - Complete Workflow (Spec 008)', () => {
  let plugins: NormalizedPluginInternalFormat[];

  before(async () => {
    // Clean output before tests
    await cleanupOutput();
  });

  after(async () => {
    // Clean output after tests
    await cleanupOutput();
  });

  describe('Scenario: Full workflow - Load, select, save, verify', () => {
    it('should load test-plugin successfully', async () => {
      plugins = await scanAndNormalizePlugins(FIXTURES_DIR);

      assert.strictEqual(plugins.length, 1, 'Should find exactly one plugin');
      assert.strictEqual(plugins[0].name, 'test-plugin', 'Plugin name should be test-plugin');
    });

    it('should have correct component counts', async () => {
      const plugin = plugins[0];

      assert.strictEqual(plugin.commands.length, 3, 'Should have 3 commands');
      assert.strictEqual(plugin.agents.length, 2, 'Should have 2 agents');
      assert.strictEqual(plugin.skills.length, 3, 'Should have 3 skills');
      assert.strictEqual(plugin.hooks.length, 4, 'Should have 4 hooks');
      assert.strictEqual(plugin.mcps.length, 3, 'Should have 3 MCPs');
    });

    it('should have correct plugin metadata', async () => {
      const plugin = plugins[0];

      assert.strictEqual(plugin.version, '1.2.3');
      assert.strictEqual(plugin.description, 'Comprehensive test plugin');
      assert.strictEqual(plugin.author.name, 'Test Author');
      assert.strictEqual(plugin.author.email, 'test@example.com');
      assert.strictEqual(plugin.license, 'MIT');
      assert.deepStrictEqual(plugin.keywords, ['testing', 'integration']);
    });

    it('should build curated plugin from selections', async () => {
      const plugin = plugins[0];
      const selections: SelectionState = {
        'test-plugin': {
          commands: new Set(['commands/analyze.md']),
          agents: new Set(['agents/reviewer.md']),
          skills: new Set(['skills/skill-alpha']),
          hooks: new Set([0]), // First hook: SessionStart /setup-env.sh
          mcps: new Set([0]),  // First MCP: tavily
        },
      };

      const curated = buildCuratedPlugin(plugins, selections, 'test-curated');

      assert.strictEqual(curated.name, 'test-curated');
      assert.strictEqual(curated.commands.length, 1);
      assert.strictEqual(curated.commands[0], 'commands/analyze.md');
      assert.strictEqual(curated.agents.length, 1);
      assert.strictEqual(curated.agents[0], 'agents/reviewer.md');
      assert.strictEqual(curated.skills.length, 1);
      assert.strictEqual(curated.skills[0], 'skills/skill-alpha');
      assert.strictEqual(curated.hooks.length, 1);
      assert.strictEqual(curated.hooks[0].event, 'SessionStart');
      assert.strictEqual(curated.mcps.length, 1);
      assert.strictEqual(curated.mcps[0].name, 'tavily');
    });

    it('should save curated plugin with dual output', async () => {
      const plugin = plugins[0];
      const selections: SelectionState = {
        'test-plugin': {
          commands: new Set(['commands/analyze.md']),
          agents: new Set(['agents/reviewer.md']),
          skills: new Set(['skills/skill-alpha']),
          hooks: new Set([0]),
          mcps: new Set([0]),
        },
      };

      const outputPath = path.join(OUTPUT_DIR, 'curated-plugin');
      const message = await saveCuratedPlugin(plugins, selections, outputPath, 'test-curated', true);

      // Check success message
      assert.ok(message.includes('Plugin guardado exitosamente'), 'Should return success message');
      assert.ok(message.includes('1 commands'), 'Should count commands');
      assert.ok(message.includes('1 agents'), 'Should count agents');
      assert.ok(message.includes('1 skills'), 'Should count skills');
      assert.ok(message.includes('Instalación:'), 'Should include installation instructions');
      assert.ok(message.includes('/plugin marketplace add'), 'Should include marketplace add command');
      assert.ok(message.includes('/plugin install test-curated'), 'Should include plugin install command');

      // Check marketplace.json exists
      const marketplacePath = path.join(outputPath, '.claude-plugin', 'marketplace.json');
      assert.ok(await fileExists(marketplacePath), 'marketplace.json should exist');

      // Check official format file exists (in plugins/ subdirectory)
      const officialPath = path.join(outputPath, 'plugins', 'test-curated', '.claude-plugin', 'plugin.json');
      assert.ok(await fileExists(officialPath), 'Official plugin.json should exist');

      // Check normalized format file exists
      const normalizedPath = path.join(outputPath, 'normalized-plugin.json');
      assert.ok(await fileExists(normalizedPath), 'normalized-plugin.json should exist');
    });

    it('should have correct official format output', async () => {
      const officialPath = path.join(OUTPUT_DIR, 'curated-plugin', 'plugins', 'test-curated', '.claude-plugin', 'plugin.json');
      const official = await readJSON(officialPath);

      assert.strictEqual(official.name, 'test-curated');
      assert.ok(Array.isArray(official.commands), 'commands should be array');
      assert.strictEqual(official.commands.length, 1);
      assert.ok(Array.isArray(official.agents), 'agents should be array');
      assert.strictEqual(official.agents.length, 1);
      assert.ok(Array.isArray(official.skills), 'skills should be array');
      assert.strictEqual(official.skills.length, 1);

      // CRITICAL: Paths must have "./" prefix (spec 006-reverse-transformation-rules.md:119-139)
      assert.ok(official.commands[0].startsWith('./'), 'command paths must start with "./"');
      assert.ok(official.agents[0].startsWith('./'), 'agent paths must start with "./"');
      assert.ok(official.skills[0].startsWith('./'), 'skill paths must start with "./"');

      // Hooks should be grouped by event (spec 006-reverse-transformation-rules.md:187-258)
      assert.ok(typeof official.hooks === 'object', 'hooks should be object');
      assert.ok(Array.isArray(official.hooks.SessionStart), 'SessionStart hooks should be array');

      // CRITICAL: Each event should contain matcher groups with nested "hooks" array
      const sessionStartGroup = official.hooks.SessionStart[0];
      assert.ok(sessionStartGroup.hooks, 'SessionStart group must have "hooks" array');
      assert.ok(Array.isArray(sessionStartGroup.hooks), 'SessionStart "hooks" must be array');

      // MCPs should be keyed by name
      assert.ok(typeof official.mcpServers === 'object', 'mcpServers should be object');
      assert.ok(official.mcpServers.tavily, 'tavily MCP should exist');
    });

    it('should have correct marketplace.json format', async () => {
      const marketplacePath = path.join(OUTPUT_DIR, 'curated-plugin', '.claude-plugin', 'marketplace.json');
      const marketplace = await readJSON(marketplacePath);

      assert.strictEqual(marketplace.name, 'curated-plugins');
      assert.ok(marketplace.owner, 'Should have owner');
      assert.ok(Array.isArray(marketplace.plugins), 'plugins should be array');
      assert.strictEqual(marketplace.plugins.length, 1);
      assert.strictEqual(marketplace.plugins[0].name, 'test-curated');
      assert.strictEqual(marketplace.plugins[0].source, './plugins/test-curated');
    });

    it('should copy component files correctly', async () => {
      const outputPath = path.join(OUTPUT_DIR, 'curated-plugin', 'plugins', 'test-curated');

      // Check command file copied
      const commandPath = path.join(outputPath, 'commands', 'analyze.md');
      assert.ok(await fileExists(commandPath), 'Command file should be copied');

      // Check agent file copied
      const agentPath = path.join(outputPath, 'agents', 'reviewer.md');
      assert.ok(await fileExists(agentPath), 'Agent file should be copied');

      // Check skill directory copied
      const skillPath = path.join(outputPath, 'skills', 'skill-alpha', 'SKILL.md');
      assert.ok(await fileExists(skillPath), 'Skill SKILL.md should be copied');

      const helperPath = path.join(outputPath, 'skills', 'skill-alpha', 'helpers.ts');
      assert.ok(await fileExists(helperPath), 'Skill helpers should be copied');
    });
  });

  describe('Edge Cases', () => {
    it('should throw error on empty selection', async () => {
      const emptySelections: SelectionState = {
        'test-plugin': {
          commands: new Set(),
          agents: new Set(),
          skills: new Set(),
          hooks: new Set(),
          mcps: new Set(),
        },
      };

      const outputPath = path.join(OUTPUT_DIR, 'empty-test');

      await assert.rejects(
        async () => {
          await saveCuratedPlugin(plugins, emptySelections, outputPath, 'empty', true);
        },
        {
          message: /No hay componentes seleccionados/,
        },
        'Should throw error for empty selection'
      );
    });

    it('should handle multiple selections correctly', async () => {
      const selections: SelectionState = {
        'test-plugin': {
          commands: new Set(['commands/analyze.md', 'commands/optimize.md', 'commands/nested/deep-cmd.md']),
          agents: new Set(['agents/reviewer.md', 'agents/context-agent.md']),
          skills: new Set(['skills/skill-alpha', 'skills/skill-beta', 'skills/skill-gamma']),
          hooks: new Set([0, 1, 2, 3]), // All hooks
          mcps: new Set([0, 1, 2]),      // All MCPs
        },
      };

      const curated = buildCuratedPlugin(plugins, selections, 'all-components');

      assert.strictEqual(curated.commands.length, 3, 'Should have all commands');
      assert.strictEqual(curated.agents.length, 2, 'Should have all agents');
      assert.strictEqual(curated.skills.length, 3, 'Should have all skills');
      assert.strictEqual(curated.hooks.length, 4, 'Should have all hooks');
      assert.strictEqual(curated.mcps.length, 3, 'Should have all MCPs');
    });

    it('should handle hooks with same event correctly', async () => {
      const selections: SelectionState = {
        'test-plugin': {
          commands: new Set(),
          agents: new Set(),
          skills: new Set(),
          hooks: new Set([0, 1]), // Both SessionStart hooks (no matcher)
          mcps: new Set(),
        },
      };

      const curated = buildCuratedPlugin(plugins, selections, 'hooks-test');
      const official = reverseTransform(curated);

      // Both hooks should be grouped under SessionStart (spec 006:256-273)
      assert.ok(Array.isArray(official.hooks.SessionStart), 'SessionStart should be array');
      assert.strictEqual(official.hooks.SessionStart.length, 1, 'Should have 1 matcher group');

      // The matcher group should have no matcher field (undefined matcher)
      const matcherGroup = official.hooks.SessionStart[0];
      assert.strictEqual(matcherGroup.matcher, undefined, 'No matcher should be present');

      // The matcher group should have "hooks" array with both hooks
      assert.ok(Array.isArray(matcherGroup.hooks), '"hooks" should be array');
      assert.strictEqual(matcherGroup.hooks.length, 2, 'Should have 2 hooks in group');
    });

    it('should group hooks by both event AND matcher', async () => {
      // Create a test with hooks that have:
      // - Same event, different matchers → separate groups
      // - Same event+matcher → same group
      const testHooks = [
        { event: 'PostToolUse', type: 'command', command: '/format.sh', matcher: 'Write|Edit' },
        { event: 'PostToolUse', type: 'command', command: '/lint.sh', matcher: 'Write|Edit' },
        { event: 'PostToolUse', type: 'command', command: '/check.sh', matcher: 'Bash' },
        { event: 'PostToolUse', type: 'command', command: '/log.sh' }, // No matcher
      ];

      const curated: NormalizedPluginInternalFormat = {
        name: 'hooks-grouping-test',
        source: '',
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
        hooks: testHooks,
        mcps: [],
      };

      const official = reverseTransform(curated);

      // Should have PostToolUse with 3 matcher groups
      assert.ok(Array.isArray(official.hooks.PostToolUse), 'PostToolUse should be array');
      assert.strictEqual(official.hooks.PostToolUse.length, 3, 'Should have 3 matcher groups');

      // Find each matcher group
      const writeEditGroup = official.hooks.PostToolUse.find((g: any) => g.matcher === 'Write|Edit');
      const bashGroup = official.hooks.PostToolUse.find((g: any) => g.matcher === 'Bash');
      const noMatcherGroup = official.hooks.PostToolUse.find((g: any) => g.matcher === undefined);

      // Write|Edit group should have 2 hooks
      assert.ok(writeEditGroup, 'Write|Edit group should exist');
      assert.strictEqual(writeEditGroup.hooks.length, 2, 'Write|Edit group should have 2 hooks');

      // Bash group should have 1 hook
      assert.ok(bashGroup, 'Bash group should exist');
      assert.strictEqual(bashGroup.hooks.length, 1, 'Bash group should have 1 hook');

      // No matcher group should have 1 hook
      assert.ok(noMatcherGroup, 'No matcher group should exist');
      assert.strictEqual(noMatcherGroup.hooks.length, 1, 'No matcher group should have 1 hook');
    });
  });

  describe('Validation Scenarios', () => {
    it('should preserve all hook fields in transformation', async () => {
      const selections: SelectionState = {
        'test-plugin': {
          commands: new Set(),
          agents: new Set(),
          skills: new Set(),
          hooks: new Set([2]), // PreToolUse hook with matcher
          mcps: new Set(),
        },
      };

      const curated = buildCuratedPlugin(plugins, selections, 'hook-fields-test');
      const official = reverseTransform(curated);

      // Hook should be grouped by event, then by matcher (spec 006:187-258)
      assert.ok(Array.isArray(official.hooks.PreToolUse), 'PreToolUse should be array');
      assert.strictEqual(official.hooks.PreToolUse.length, 1, 'Should have 1 matcher group');

      const matcherGroup = official.hooks.PreToolUse[0];
      assert.strictEqual(matcherGroup.matcher, 'Bash', 'Matcher should be at group level');
      assert.ok(Array.isArray(matcherGroup.hooks), 'Should have "hooks" array');
      assert.strictEqual(matcherGroup.hooks.length, 1, 'Should have 1 hook in group');

      const hook = matcherGroup.hooks[0];
      assert.strictEqual(hook.type, 'agent', 'Hook type should be preserved');
      assert.strictEqual(hook.agent, '/security-check', 'Hook agent should be preserved');
      assert.strictEqual(hook.matcher, undefined, 'Matcher should NOT be in hook (moved to group)');
    });

    it('should omit empty env from MCPs', async () => {
      const selections: SelectionState = {
        'test-plugin': {
          commands: new Set(),
          agents: new Set(),
          skills: new Set(),
          hooks: new Set(),
          mcps: new Set([1]), // filesystem MCP with empty env
        },
      };

      const curated = buildCuratedPlugin(plugins, selections, 'mcp-env-test');
      const official = reverseTransform(curated);

      // Empty env should be omitted
      assert.strictEqual(official.mcpServers.filesystem.env, undefined, 'Empty env should be omitted');
    });

    it('should omit default metadata values', async () => {
      const selections: SelectionState = {
        'test-plugin': {
          commands: new Set(['commands/analyze.md']),
          agents: new Set(),
          skills: new Set(),
          hooks: new Set(),
          mcps: new Set(),
        },
      };

      const curated = buildCuratedPlugin(plugins, selections, 'minimal-plugin');
      // Force default values
      curated.version = '0.0.0';
      curated.description = '';
      curated.keywords = [];

      const official = reverseTransform(curated);

      // Default values should be omitted
      assert.strictEqual(official.version, undefined, 'Default version should be omitted');
      assert.strictEqual(official.description, undefined, 'Empty description should be omitted');
      assert.strictEqual(official.keywords, undefined, 'Empty keywords should be omitted');
    });

    it('should handle nested command paths correctly', async () => {
      const selections: SelectionState = {
        'test-plugin': {
          commands: new Set(['commands/nested/deep-cmd.md']),
          agents: new Set(),
          skills: new Set(),
          hooks: new Set(),
          mcps: new Set(),
        },
      };

      const outputPath = path.join(OUTPUT_DIR, 'nested-test');
      await saveCuratedPlugin(plugins, selections, outputPath, 'nested-test', true);

      // Check nested command copied correctly (in plugins/ subdirectory)
      const nestedCmdPath = path.join(outputPath, 'plugins', 'nested-test', 'commands', 'nested', 'deep-cmd.md');
      assert.ok(await fileExists(nestedCmdPath), 'Nested command should be copied with structure preserved');
    });
  });

  describe('Directory Structure Validation', () => {
    it('should create proper directory structure', async () => {
      const selections: SelectionState = {
        'test-plugin': {
          commands: new Set(['commands/analyze.md']),
          agents: new Set(['agents/reviewer.md']),
          skills: new Set(['skills/skill-alpha']),
          hooks: new Set([0]),
          mcps: new Set([0]),
        },
      };

      const outputPath = path.join(OUTPUT_DIR, 'structure-test');
      await saveCuratedPlugin(plugins, selections, outputPath, 'structure-test', true);

      // Check marketplace .claude-plugin directory
      const marketplaceClaudePluginDir = path.join(outputPath, '.claude-plugin');
      const marketplaceStats = await fs.stat(marketplaceClaudePluginDir);
      assert.ok(marketplaceStats.isDirectory(), 'marketplace .claude-plugin should be a directory');

      // Check plugins directory
      const pluginsDir = path.join(outputPath, 'plugins');
      const pluginsDirStats = await fs.stat(pluginsDir);
      assert.ok(pluginsDirStats.isDirectory(), 'plugins directory should exist');

      // Check plugin .claude-plugin directory
      const pluginClaudeDir = path.join(outputPath, 'plugins', 'structure-test', '.claude-plugin');
      const pluginClaudeStats = await fs.stat(pluginClaudeDir);
      assert.ok(pluginClaudeStats.isDirectory(), 'plugin .claude-plugin should be a directory');

      // Check component directories
      const commandsDir = path.join(outputPath, 'plugins', 'structure-test', 'commands');
      const commandsStats = await fs.stat(commandsDir);
      assert.ok(commandsStats.isDirectory(), 'commands directory should exist');

      const agentsDir = path.join(outputPath, 'plugins', 'structure-test', 'agents');
      const agentsStats = await fs.stat(agentsDir);
      assert.ok(agentsStats.isDirectory(), 'agents directory should exist');

      const skillsDir = path.join(outputPath, 'plugins', 'structure-test', 'skills');
      const skillsStats = await fs.stat(skillsDir);
      assert.ok(skillsStats.isDirectory(), 'skills directory should exist');
    });
  });
});
