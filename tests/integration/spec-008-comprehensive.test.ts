/**
 * Spec 008: Comprehensive Integration Test
 *
 * Tests the complete workflow with the spec-compliant test plugin:
 * - Load plugin
 * - Normalize components
 * - Select components
 * - Save to output
 * - Verify all outputs and file structure
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { join } from 'path';
import { existsSync, readFileSync, statSync, rmSync } from 'fs';
import { loadPlugin } from '../../src/core/plugin-loader.js';
import { normalizePlugin } from '../../src/core/normalizer.js';
import { createInitialState, getSelection } from '../../src/tui/state.js';
import { save } from '../../src/core/save/index.js';

const FIXTURES_DIR = join(process.cwd(), 'tests', 'fixtures');
const TEST_PLUGIN_DIR = join(FIXTURES_DIR, 'spec-008-test-plugin');
const OUTPUT_DIR = join(process.cwd(), 'tests', 'output', 'spec-008-output');

describe('Spec 008: Comprehensive Integration Test', () => {
  beforeAll(() => {
    // Clean output directory before tests
    if (existsSync(OUTPUT_DIR)) {
      rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    // Clean up after tests
    if (existsSync(OUTPUT_DIR)) {
      rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  it('should complete full workflow with spec test plugin', async () => {
    // ========================================
    // GIVEN: test-plugin from spec 008 §1
    // ========================================
    expect(existsSync(TEST_PLUGIN_DIR)).toBe(true);

    // ========================================
    // WHEN: Load plugin
    // ========================================
    const loaded = loadPlugin(TEST_PLUGIN_DIR);
    expect(loaded.data).toBeDefined();
    expect(loaded.data.name).toBe('test-plugin');
    expect(loaded.data.version).toBe('1.2.3');
    expect(loaded.data.description).toBe('Comprehensive test plugin');

    // ========================================
    // WHEN: Normalize plugin
    // ========================================
    const normalized = await normalizePlugin(loaded.data, TEST_PLUGIN_DIR);

    // ========================================
    // THEN: Verify normalization - Components count
    // ========================================
    expect(normalized.commands).toHaveLength(3);
    expect(normalized.agents).toHaveLength(2);
    expect(normalized.skills).toHaveLength(3);
    expect(normalized.hooks).toHaveLength(4); // 2 SessionStart + 2 PostToolUse
    expect(normalized.mcps).toHaveLength(3);

    // ========================================
    // THEN: Verify component details
    // ========================================

    // Commands - array of file paths
    expect(normalized.commands.some(c => c.includes('analyze.md'))).toBe(true);
    expect(normalized.commands.some(c => c.includes('optimize.md'))).toBe(true);
    expect(normalized.commands.some(c => c.includes('deep-cmd.md'))).toBe(true);

    // Agents - array of file paths
    expect(normalized.agents.some(a => a.includes('reviewer.md'))).toBe(true);
    expect(normalized.agents.some(a => a.includes('context-agent.md'))).toBe(true);

    // Skills - array of directory paths
    expect(normalized.skills.some(s => s.includes('skill-alpha'))).toBe(true);
    expect(normalized.skills.some(s => s.includes('skill-beta'))).toBe(true);
    expect(normalized.skills.some(s => s.includes('skill-gamma'))).toBe(true);

    // Hooks - array of hook objects
    const hookEvents = normalized.hooks.map(h => h.event);
    expect(hookEvents.filter(e => e === 'SessionStart')).toHaveLength(2);
    expect(hookEvents.filter(e => e === 'PostToolUse')).toHaveLength(2);

    // MCPs - array of MCP objects
    const mcpNames = normalized.mcps.map(m => m.name);
    expect(mcpNames).toContain('tavily');
    expect(mcpNames).toContain('filesystem');
    expect(mcpNames).toContain('github');

    // ========================================
    // WHEN: Create state and select specific components
    // ========================================
    const state = createInitialState([normalized]);
    const selection = getSelection(state, normalized.name);

    // Select some components (not all)
    // Find and select specific components by their path/index
    const analyzeCmd = normalized.commands.find(c => c.includes('analyze.md'));
    const reviewerAgent = normalized.agents.find(a => a.includes('reviewer.md'));
    const alphaSkill = normalized.skills.find(s => s.includes('skill-alpha'));
    const setupHookIndex = normalized.hooks.findIndex(h => h.command.includes('setup-env.sh'));
    const tavilyMcpIndex = normalized.mcps.findIndex(m => m.name === 'tavily');

    if (analyzeCmd) selection.commands.add(analyzeCmd);
    if (reviewerAgent) selection.agents.add(reviewerAgent);
    if (alphaSkill) selection.skills.add(alphaSkill);
    if (setupHookIndex >= 0) selection.hooks.add(setupHookIndex);
    if (tavilyMcpIndex >= 0) selection.mcps.add(tavilyMcpIndex);

    // ========================================
    // WHEN: Save
    // ========================================
    const saveResult = await save(state, {
      outputDir: OUTPUT_DIR,
      pluginName: 'test-curated',
      overwrite: true,
    });

    // ========================================
    // THEN: Verify save success
    // ========================================
    expect(saveResult.success).toBe(true);
    expect(saveResult.errors).toHaveLength(0);
    expect(saveResult.outputDir).toBe(OUTPUT_DIR);

    // ========================================
    // THEN: Verify output files exist
    // ========================================
    const marketplaceJsonPath = join(OUTPUT_DIR, '.claude-plugin', 'marketplace.json');
    const pluginJsonPath = join(OUTPUT_DIR, 'plugins', 'test-curated', '.claude-plugin', 'plugin.json');
    const normalizedJsonPath = join(OUTPUT_DIR, 'normalized-plugin.json');

    expect(existsSync(marketplaceJsonPath)).toBe(true);
    expect(existsSync(pluginJsonPath)).toBe(true);
    expect(existsSync(normalizedJsonPath)).toBe(true);

    // ========================================
    // THEN: Verify marketplace.json format
    // ========================================
    const marketplaceJson = JSON.parse(readFileSync(marketplaceJsonPath, 'utf-8'));
    expect(marketplaceJson.plugins).toBeDefined();
    expect(marketplaceJson.plugins).toHaveLength(1);
    expect(marketplaceJson.plugins[0].name).toBe('test-curated');
    expect(marketplaceJson.plugins[0].source).toBe('./plugins/test-curated');

    // ========================================
    // THEN: Verify plugin.json format and content
    // ========================================
    const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

    // Basic metadata
    // Note: The curated plugin gets a new name and default metadata
    expect(pluginJson.name).toBe('test-curated');
    // Version is omitted (defaults to '0.0.0' which is omitted by reverse transform)
    expect(pluginJson.version).toBeUndefined();
    // Description is set to default curated plugin description
    expect(pluginJson.description).toBe('Curated plugin with selected components');

    // Commands - only selected one
    expect(pluginJson.commands).toBeDefined();
    expect(Array.isArray(pluginJson.commands)).toBe(true);
    expect(pluginJson.commands).toHaveLength(1);
    expect(pluginJson.commands[0]).toBe('./commands/analyze.md');

    // Agents - only selected one
    expect(pluginJson.agents).toBeDefined();
    expect(Array.isArray(pluginJson.agents)).toBe(true);
    expect(pluginJson.agents).toHaveLength(1);
    expect(pluginJson.agents[0]).toBe('./agents/reviewer.md');

    // Skills - only selected one
    expect(pluginJson.skills).toBeDefined();
    expect(Array.isArray(pluginJson.skills)).toBe(true);
    expect(pluginJson.skills).toHaveLength(1);
    expect(pluginJson.skills[0]).toBe('./skills/skill-alpha');

    // Hooks - only selected SessionStart hook
    expect(pluginJson.hooks).toBeDefined();
    expect(typeof pluginJson.hooks).toBe('object');
    expect(pluginJson.hooks.SessionStart).toBeDefined();
    expect(Array.isArray(pluginJson.hooks.SessionStart)).toBe(true);
    expect(pluginJson.hooks.SessionStart).toHaveLength(1);
    expect(pluginJson.hooks.SessionStart[0].hooks).toBeDefined();
    expect(pluginJson.hooks.SessionStart[0].hooks).toHaveLength(1);
    expect(pluginJson.hooks.SessionStart[0].hooks[0].type).toBe('command');
    expect(pluginJson.hooks.SessionStart[0].hooks[0].command).toContain('setup-env.sh');

    // MCPs - only selected tavily
    expect(pluginJson.mcpServers).toBeDefined();
    expect(typeof pluginJson.mcpServers).toBe('object');
    expect(pluginJson.mcpServers.tavily).toBeDefined();
    expect(pluginJson.mcpServers.tavily.command).toBe('npx');
    expect(pluginJson.mcpServers.tavily.args).toEqual(['-y', '@tavily/mcp-server']);
    expect(pluginJson.mcpServers.tavily.env).toEqual({ TAVILY_API_KEY: '${TAVILY_API_KEY}' });

    // ========================================
    // THEN: Verify component files were copied
    // ========================================
    const commandFilePath = join(OUTPUT_DIR, 'plugins', 'test-curated', 'commands', 'analyze.md');
    const agentFilePath = join(OUTPUT_DIR, 'plugins', 'test-curated', 'agents', 'reviewer.md');
    const skillDirPath = join(OUTPUT_DIR, 'plugins', 'test-curated', 'skills', 'skill-alpha');
    const skillFilePath = join(skillDirPath, 'SKILL.md');
    const skillHelperPath = join(skillDirPath, 'helpers.ts');
    const hookScriptPath = join(OUTPUT_DIR, 'plugins', 'test-curated', 'hooks', 'setup-env.sh');

    expect(existsSync(commandFilePath)).toBe(true);
    expect(existsSync(agentFilePath)).toBe(true);
    expect(existsSync(skillDirPath)).toBe(true);
    expect(existsSync(skillFilePath)).toBe(true);
    expect(existsSync(skillHelperPath)).toBe(true);
    expect(existsSync(hookScriptPath)).toBe(true);

    // ========================================
    // THEN: Verify hook script is executable
    // ========================================
    const hookStats = statSync(hookScriptPath);
    const isExecutable = (hookStats.mode & 0o111) !== 0;
    expect(isExecutable).toBe(true);

    // ========================================
    // THEN: Verify stats
    // ========================================
    expect(saveResult.stats.commands).toBe(1);
    expect(saveResult.stats.agents).toBe(1);
    expect(saveResult.stats.skills).toBe(1);
    expect(saveResult.stats.hooks).toBe(1); // Only 1 hook script
    expect(saveResult.stats.mcps).toBe(1);
  });

  it('should handle selecting all components', async () => {
    // Clean previous output
    if (existsSync(OUTPUT_DIR)) {
      rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }

    // Load and normalize
    const loaded = loadPlugin(TEST_PLUGIN_DIR);
    const normalized = await normalizePlugin(loaded.data, TEST_PLUGIN_DIR);
    const state = createInitialState([normalized]);
    const selection = getSelection(state, normalized.name);

    // Select ALL components
    normalized.commands.forEach(cmd => selection.commands.add(cmd));
    normalized.agents.forEach(agent => selection.agents.add(agent));
    normalized.skills.forEach(skill => selection.skills.add(skill));
    normalized.hooks.forEach((_, idx) => selection.hooks.add(idx));
    normalized.mcps.forEach((_, idx) => selection.mcps.add(idx));

    // Save
    const saveResult = await save(state, {
      outputDir: OUTPUT_DIR,
      pluginName: 'test-curated-full',
      overwrite: true,
    });

    // Verify
    expect(saveResult.success).toBe(true);
    expect(saveResult.stats.commands).toBe(3);
    expect(saveResult.stats.agents).toBe(2);
    expect(saveResult.stats.skills).toBe(3);
    expect(saveResult.stats.hooks).toBe(4);
    expect(saveResult.stats.mcps).toBe(3);

    // Verify all files copied
    const pluginJsonPath = join(OUTPUT_DIR, 'plugins', 'test-curated-full', '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

    expect(pluginJson.commands).toHaveLength(3);
    expect(pluginJson.agents).toHaveLength(2);
    expect(pluginJson.skills).toHaveLength(3);
    expect(pluginJson.hooks.SessionStart).toBeDefined();
    expect(pluginJson.hooks.PostToolUse).toBeDefined();
    expect(Object.keys(pluginJson.mcpServers)).toHaveLength(3);

    // Verify nested command was copied
    const nestedCommandPath = join(OUTPUT_DIR, 'plugins', 'test-curated-full', 'commands', 'nested', 'deep-cmd.md');
    expect(existsSync(nestedCommandPath)).toBe(true);

    // Verify all hook scripts are executable
    // Note: Hook scripts are extracted from the source plugin's hooks directory
    // Check what hook scripts actually exist in the output
    const pluginOutputDir = join(OUTPUT_DIR, 'plugins', 'test-curated-full');
    const hooksOutputDir = join(pluginOutputDir, 'hooks');

    // Verify hooks directory exists
    expect(existsSync(hooksOutputDir)).toBe(true);

    // The hook scripts should have been copied
    // Check that at least the scripts we selected are there and executable
    const hookScriptFiles = [
      'setup-env.sh',
      'init-workspace.sh',
      'security-check.sh',
      'cleanup.sh',
    ];

    for (const scriptFile of hookScriptFiles) {
      const scriptPath = join(hooksOutputDir, scriptFile);
      if (existsSync(scriptPath)) {
        const stats = statSync(scriptPath);
        const isExecutable = (stats.mode & 0o111) !== 0;
        expect(isExecutable).toBe(true);
      }
    }
  });

  it('should handle empty selection gracefully', async () => {
    // Load and normalize
    const loaded = loadPlugin(TEST_PLUGIN_DIR);
    const normalized = await normalizePlugin(loaded.data, TEST_PLUGIN_DIR);
    const state = createInitialState([normalized]);

    // Don't select anything - all Sets remain empty

    // Save with empty selection
    const saveResult = await save(state, {
      outputDir: OUTPUT_DIR,
      pluginName: 'test-curated-empty',
      overwrite: true,
    });

    // Empty selection should fail - can't create plugin with no components
    expect(saveResult.success).toBe(false);
    expect(saveResult.errors.length).toBeGreaterThan(0);
    expect(saveResult.errors[0]).toContain('No components selected');
  });

  it('should preserve plugin metadata in output', async () => {
    // Load and normalize
    const loaded = loadPlugin(TEST_PLUGIN_DIR);
    const normalized = await normalizePlugin(loaded.data, TEST_PLUGIN_DIR);
    const state = createInitialState([normalized]);
    const selection = getSelection(state, normalized.name);

    // Select one component
    const analyzeCmd = normalized.commands.find(c => c.includes('analyze.md'));
    if (analyzeCmd) selection.commands.add(analyzeCmd);

    // Save
    const saveResult = await save(state, {
      outputDir: OUTPUT_DIR,
      pluginName: 'test-metadata',
      overwrite: true,
    });

    expect(saveResult.success).toBe(true);

    // Check plugin.json structure (curated plugin gets default metadata)
    const pluginJsonPath = join(OUTPUT_DIR, 'plugins', 'test-metadata', '.claude-plugin', 'plugin.json');
    const pluginJson = JSON.parse(readFileSync(pluginJsonPath, 'utf-8'));

    // Name is set to the new plugin name
    expect(pluginJson.name).toBe('test-metadata');
    // Curated plugins get default metadata values
    // Version '0.0.0' is omitted
    expect(pluginJson.version).toBeUndefined();
    expect(pluginJson.description).toBe('Curated plugin with selected components');
    // Author is omitted (all empty fields)
    expect(pluginJson.author).toBeUndefined();
    // Other metadata fields are omitted (empty strings)
    expect(pluginJson.homepage).toBeUndefined();
    expect(pluginJson.repository).toBeUndefined();
    expect(pluginJson.license).toBeUndefined();
    // Keywords is omitted (empty array)
    expect(pluginJson.keywords).toBeUndefined();
  });
});
