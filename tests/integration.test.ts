import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { scanPlugins, loadPlugin } from '../src/scanner/plugin-scanner';
import { saveSelection } from '../src/save/save-operation';
import { SelectionState } from '../src/utils/selection-state';
import { getPluginComponents } from '../src/scanner/plugin-scanner';

const TEST_PLUGIN_DIR = path.resolve(__dirname, '../test-fixtures/test-plugin');
const OUTPUT_DIR = path.resolve(__dirname, '../test-output');

describe('Integration Tests - Full Workflow', () => {
  beforeAll(() => {
    // Clean output directory before tests
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  afterAll(() => {
    // Clean up after tests
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  test('Can load test-plugin without errors', async () => {
    const plugin = await loadPlugin(TEST_PLUGIN_DIR);

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('test-plugin');
    expect(plugin.version).toBe('1.2.3');
    expect(plugin.description).toBe('Comprehensive test plugin');
  });

  test('All components visible after loading', async () => {
    const plugin = await loadPlugin(TEST_PLUGIN_DIR);
    const components = getPluginComponents(plugin);

    // Commands: analyze.md, optimize.md, nested/deep-cmd.md
    expect(components.commands).toHaveLength(3);

    // Agents: reviewer.md, context-agent.md
    expect(components.agents).toHaveLength(2);

    // Skills: skill-alpha, skill-beta, skill-gamma
    expect(components.skills).toHaveLength(3);

    // Hooks: 2 for SessionStart, 1 for PostToolUse:Bash, 1 for PostToolUse:Write = 4
    expect(components.hooks).toHaveLength(4);

    // MCPs: tavily, filesystem, github
    expect(components.mcps).toHaveLength(3);
  });

  test('Full workflow: load → select → save → verify', async () => {
    // 1. Load plugin
    const plugins = await scanPlugins(path.dirname(TEST_PLUGIN_DIR));
    expect(plugins).toHaveLength(1);

    const plugin = plugins[0];

    // 2. Create selection state
    const allComponents = new Map();
    allComponents.set(plugin.name, getPluginComponents(plugin));
    const selectionState = new SelectionState(plugins, allComponents);

    // 3. Select components
    const components = allComponents.get(plugin.name)!;

    // Select: analyze.md command
    const analyzeCmd = components.commands.find(c => c.name === 'analyze');
    expect(analyzeCmd).toBeDefined();
    selectionState.toggleSelection(analyzeCmd!.id);

    // Select: reviewer.md agent
    const reviewerAgent = components.agents.find(a => a.name === 'reviewer');
    expect(reviewerAgent).toBeDefined();
    selectionState.toggleSelection(reviewerAgent!.id);

    // Select: skill-alpha
    const alphaSkill = components.skills.find(s => s.name === 'skill-alpha');
    expect(alphaSkill).toBeDefined();
    selectionState.toggleSelection(alphaSkill!.id);

    // Select: first SessionStart hook
    const sessionStartHook = components.hooks.find(h => h.event === 'SessionStart');
    expect(sessionStartHook).toBeDefined();
    selectionState.toggleSelection(sessionStartHook!.id);

    // Select: tavily MCP
    const tavilyMcp = components.mcps.find(m => m.name === 'tavily');
    expect(tavilyMcp).toBeDefined();
    selectionState.toggleSelection(tavilyMcp!.id);

    expect(selectionState.getSelectionCount()).toBe(5);

    // 4. Save
    const result = await saveSelection(selectionState, {
      outputDir: OUTPUT_DIR,
      pluginName: 'curated-plugin',
      overwrite: true
    });

    expect(result.success).toBe(true);
    expect(result.stats.commandsCount).toBe(1);
    expect(result.stats.agentsCount).toBe(1);
    expect(result.stats.skillsCount).toBe(1);
    expect(result.stats.hooksCount).toBe(1);
    expect(result.stats.mcpsCount).toBe(1);

    // 5. Verify output files exist
    const marketplacePath = path.join(OUTPUT_DIR, '.claude-plugin/marketplace.json');
    const pluginJsonPath = path.join(OUTPUT_DIR, 'plugins/curated-plugin/.claude-plugin/plugin.json');
    const normalizedPath = path.join(OUTPUT_DIR, 'normalized-plugin.json');

    expect(fs.existsSync(marketplacePath)).toBe(true);
    expect(fs.existsSync(pluginJsonPath)).toBe(true);
    expect(fs.existsSync(normalizedPath)).toBe(true);

    // 6. Verify marketplace.json
    const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf-8'));
    expect(marketplace.plugins).toHaveLength(1);
    expect(marketplace.plugins[0].name).toBe('curated-plugin');
    expect(marketplace.plugins[0].source).toBe('./plugins/curated-plugin');

    // 7. Verify plugin.json (official format)
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
    expect(pluginJson.name).toBe('test-plugin'); // Should preserve original plugin name
    expect(pluginJson.version).toBe('1.2.3');
    expect(pluginJson.description).toBe('Comprehensive test plugin');
    expect(pluginJson.commands).toBeDefined();
    expect(pluginJson.commands).toHaveLength(1);
    expect(pluginJson.agents).toBeDefined();
    expect(pluginJson.agents).toHaveLength(1);
    expect(pluginJson.hooks).toBeDefined();
    expect(pluginJson.hooks.SessionStart).toBeDefined();
    expect(pluginJson.mcpServers).toBeDefined();
    expect(pluginJson.mcpServers.tavily).toBeDefined();

    // 8. Verify files were copied
    const commandPath = path.join(OUTPUT_DIR, 'plugins/curated-plugin/commands/analyze.md');
    const agentPath = path.join(OUTPUT_DIR, 'plugins/curated-plugin/agents/reviewer.md');
    const skillPath = path.join(OUTPUT_DIR, 'plugins/curated-plugin/skills/skill-alpha/SKILL.md');

    expect(fs.existsSync(commandPath)).toBe(true);
    expect(fs.existsSync(agentPath)).toBe(true);
    expect(fs.existsSync(skillPath)).toBe(true);
  });

  test('Edge case: Save with no selection', async () => {
    const plugins = await scanPlugins(path.dirname(TEST_PLUGIN_DIR));
    const allComponents = new Map();
    allComponents.set(plugins[0].name, getPluginComponents(plugins[0]));
    const selectionState = new SelectionState(plugins, allComponents);

    const result = await saveSelection(selectionState, {
      outputDir: OUTPUT_DIR,
      pluginName: 'empty-plugin',
      overwrite: true
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('No hay componentes seleccionados');
  });

  test('Hooks transform correctly', async () => {
    const plugin = await loadPlugin(TEST_PLUGIN_DIR);
    const allComponents = new Map();
    allComponents.set(plugin.name, getPluginComponents(plugin));
    const selectionState = new SelectionState([plugin], allComponents);

    const components = allComponents.get(plugin.name)!;

    // Select both SessionStart hooks
    selectionState.toggleSelection(components.hooks[0].id); // SessionStart: /setup-env.sh
    selectionState.toggleSelection(components.hooks[1].id); // SessionStart: /init-workspace.sh

    const result = await saveSelection(selectionState, {
      outputDir: path.join(OUTPUT_DIR, 'hooks-test'),
      pluginName: 'hooks-plugin',
      overwrite: true
    });

    expect(result.success).toBe(true);

    const pluginJsonPath = path.join(OUTPUT_DIR, 'hooks-test/plugins/hooks-plugin/.claude-plugin/plugin.json');
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));

    expect(pluginJson.hooks).toBeDefined();
    expect(pluginJson.hooks.SessionStart).toBeDefined();
    expect(pluginJson.hooks.SessionStart).toHaveLength(1);
    expect(pluginJson.hooks.SessionStart[0].hooks).toHaveLength(2);
  });

  test('MCPs transform correctly', async () => {
    const plugin = await loadPlugin(TEST_PLUGIN_DIR);
    const allComponents = new Map();
    allComponents.set(plugin.name, getPluginComponents(plugin));
    const selectionState = new SelectionState([plugin], allComponents);

    const components = allComponents.get(plugin.name)!;

    // Select tavily MCP
    const tavilyMcp = components.mcps.find(m => m.name === 'tavily');
    expect(tavilyMcp).toBeDefined();
    selectionState.toggleSelection(tavilyMcp!.id);

    const result = await saveSelection(selectionState, {
      outputDir: path.join(OUTPUT_DIR, 'mcp-test'),
      pluginName: 'mcp-plugin',
      overwrite: true
    });

    expect(result.success).toBe(true);

    const pluginJsonPath = path.join(OUTPUT_DIR, 'mcp-test/plugins/mcp-plugin/.claude-plugin/plugin.json');
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));

    expect(pluginJson.mcpServers).toBeDefined();
    expect(pluginJson.mcpServers.tavily).toBeDefined();
    expect(pluginJson.mcpServers.tavily.command).toBe('npx');
    expect(pluginJson.mcpServers.tavily.args).toEqual(['-y', '@tavily/mcp-server']);
    expect(pluginJson.mcpServers.tavily.env).toEqual({ TAVILY_API_KEY: '${TAVILY_API_KEY}' });
  });

  test('Default values are omitted', async () => {
    const plugin = await loadPlugin(TEST_PLUGIN_DIR);

    // Modify plugin to have default values
    plugin.version = '0.0.0';
    plugin.description = '';
    plugin.author = { name: '', email: '', url: '' };

    const allComponents = new Map();
    allComponents.set(plugin.name, getPluginComponents(plugin));
    const selectionState = new SelectionState([plugin], allComponents);

    const components = allComponents.get(plugin.name)!;

    // Select one command
    selectionState.toggleSelection(components.commands[0].id);

    const result = await saveSelection(selectionState, {
      outputDir: path.join(OUTPUT_DIR, 'defaults-test'),
      pluginName: 'defaults-plugin',
      overwrite: true
    });

    expect(result.success).toBe(true);

    const pluginJsonPath = path.join(OUTPUT_DIR, 'defaults-test/plugins/defaults-plugin/.claude-plugin/plugin.json');
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));

    // Default values should be omitted
    expect(pluginJson.version).toBeUndefined();
    expect(pluginJson.description).toBeUndefined();
    expect(pluginJson.author).toBeUndefined();
  });
});
