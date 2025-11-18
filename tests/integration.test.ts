import { describe, test, expect, beforeAll } from 'vitest';
import { normalizePlugin } from '../src/lib/normalize.js';
import { reverseTransform } from '../src/lib/reverse.js';
import { savePlugin, mergePlugins } from '../src/lib/save.js';
import { validateOfficialFormat, validateNormalizedFormat } from '../src/lib/validate.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Integration Tests', () => {
  const fixtureDir = path.join(__dirname, 'fixtures', 'test-plugin');

  test('should load and normalize test-plugin', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));

    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    expect(normalized.name).toBe('test-plugin');
    expect(normalized.version).toBe('1.2.3');
    expect(normalized.description).toBe('Comprehensive test plugin');
    expect(normalized.commands.length).toBe(3);
    expect(normalized.agents.length).toBe(2);
    expect(normalized.skills.length).toBe(3);
    expect(normalized.hooks.length).toBe(4);
    expect(normalized.mcps.length).toBe(3);
  });

  test('should validate normalized format', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    const validation = await validateNormalizedFormat(normalized);
    expect(validation.valid).toBe(true);
  });

  test('should reverse transform to official format', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    const official = reverseTransform(normalized);

    expect(official.name).toBe('test-plugin');
    expect(official.version).toBe('1.2.3');

    const validation = await validateOfficialFormat(official);
    expect(validation.valid).toBe(true);
  });

  test('should normalize hooks correctly', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    const sessionStartHooks = normalized.hooks.filter(h => h.event === 'SessionStart');
    expect(sessionStartHooks.length).toBe(2);

    const postToolUseHooks = normalized.hooks.filter(h => h.event === 'PostToolUse');
    expect(postToolUseHooks.length).toBe(2);

    // Verify specific matchers
    const bashMatcher = postToolUseHooks.find(h => h.matcher === 'Bash');
    const writeMatcher = postToolUseHooks.find(h => h.matcher === 'Write');
    expect(bashMatcher).toBeDefined();
    expect(writeMatcher).toBeDefined();
  });

  test('should normalize MCPs correctly', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    const tavilyMcp = normalized.mcps.find(m => m.name === 'tavily');
    expect(tavilyMcp).toBeDefined();
    expect(tavilyMcp?.command).toBe('npx');
    expect(tavilyMcp?.args).toContain('@tavily/mcp-server');
  });

  test('FULL WORKFLOW: load → select → save → verify', async () => {
    const pluginJsonPath = path.join(fixtureDir, '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(await fs.readFile(pluginJsonPath, 'utf-8'));
    const normalized = await normalizePlugin(pluginJson, fixtureDir);

    // STEP 1: Simulate selection (select all commands, 1 agent, 1 skill)
    const selection = {
      ...normalized,
      commands: normalized.commands,  // All 3 commands
      agents: [normalized.agents[0]],  // First agent only
      skills: [normalized.skills[0]],  // First skill only
      hooks: normalized.hooks,  // All hooks
      mcps: [normalized.mcps[0]],  // First MCP only
    };

    // STEP 2: Save operation
    const outputDir = path.join(__dirname, 'tmp', 'test-output');
    const result = await savePlugin(selection, {
      outputDir,
      pluginName: 'curated-test-plugin',
      marketplaceName: 'test-marketplace',
      ownerName: 'Test User',
      ownerEmail: 'test@example.com',
    });

    expect(result.success).toBe(true);
    expect(result.errors.length).toBe(0);

    // STEP 3: Verify marketplace.json exists and is valid
    const outputPath = path.join(outputDir, 'curated-test-plugin');
    const marketplaceJsonPath = path.join(outputPath, '.claude-plugin', 'marketplace.json');
    const marketplaceJson = JSON.parse(await fs.readFile(marketplaceJsonPath, 'utf-8'));
    expect(marketplaceJson.name).toBe('test-marketplace');
    expect(marketplaceJson.owner.name).toBe('Test User');
    expect(marketplaceJson.owner.email).toBe('test@example.com');
    expect(marketplaceJson.plugins).toHaveLength(1);
    expect(marketplaceJson.plugins[0].name).toBe('curated-test-plugin');

    // STEP 4: Verify plugin.json (official format)
    const outputPluginPath = path.join(outputPath, 'plugins', 'curated-test-plugin');
    const outputPluginJsonPath = path.join(outputPluginPath, '.claude-plugin', 'plugin.json');
    const outputPluginJson = JSON.parse(await fs.readFile(outputPluginJsonPath, 'utf-8'));
    expect(outputPluginJson.name).toBe('test-plugin');
    expect(outputPluginJson.commands).toHaveLength(3);
    expect(outputPluginJson.agents).toHaveLength(1);
    expect(outputPluginJson.skills).toHaveLength(1);

    // Verify all paths have ./ prefix (official format requirement)
    outputPluginJson.commands.forEach((cmd: string) => {
      expect(cmd).toMatch(/^\.\//);
    });
    outputPluginJson.agents.forEach((agent: string) => {
      expect(agent).toMatch(/^\.\//);
    });
    outputPluginJson.skills.forEach((skill: string) => {
      expect(skill).toMatch(/^\.\//);
    });

    // STEP 5: Verify files copied correctly
    // Commands
    for (const cmd of selection.commands) {
      const cmdPath = path.join(outputPluginPath, cmd);
      await expect(fs.access(cmdPath)).resolves.not.toThrow();
    }

    // Agents
    for (const agent of selection.agents) {
      const agentPath = path.join(outputPluginPath, agent);
      await expect(fs.access(agentPath)).resolves.not.toThrow();
    }

    // Skills
    for (const skill of selection.skills) {
      const skillPath = path.join(outputPluginPath, skill, 'SKILL.md');
      await expect(fs.access(skillPath)).resolves.not.toThrow();
    }

    // STEP 6: Verify hook scripts are executable (0o755)
    const hookScriptPaths = [
      'hooks/setup-env.sh',
      'hooks/init-workspace.sh',
      'hooks/security-check.sh',
      'hooks/cleanup.sh',
    ];

    for (const scriptPath of hookScriptPaths) {
      const fullPath = path.join(outputPluginPath, scriptPath);
      const stats = await fs.stat(fullPath);
      const mode = stats.mode & 0o777;
      expect(mode).toBe(0o755);  // Executable permissions
    }

    // STEP 7: Verify hook commands use ${CLAUDE_PLUGIN_ROOT}
    const hooks = outputPluginJson.hooks;
    expect(hooks).toBeDefined();
    const sessionStartHooks = hooks.SessionStart;
    expect(sessionStartHooks).toBeDefined();
    expect(sessionStartHooks[0].hooks).toBeDefined();
    const firstHook = sessionStartHooks[0].hooks[0];
    expect(firstHook.command).toContain('${CLAUDE_PLUGIN_ROOT}');

    // Cleanup
    await fs.rm(outputPath, { recursive: true, force: true });
  });
});
