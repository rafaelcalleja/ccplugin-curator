import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { normalizePlugin } from '../../src/lib/normalizer';
import { save, type Selection, type SaveConfig } from '../../src/lib/save-controller';
import { validateOfficialFormat } from '../../src/lib/validator';
import { readJson } from '../../src/lib/file-ops';

const TEST_DIR = path.join(__dirname, '..', 'fixtures', 'integration-test');
const SOURCE_PLUGIN = path.join(__dirname, '..', 'fixtures', 'test-plugin');
const OUTPUT_DIR = path.join(TEST_DIR, 'output');

describe('End-to-End Integration', () => {
  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  describe('Complete workflow', () => {
    it('should normalize, save, and validate a plugin end-to-end', async () => {
      // Step 1: Normalize the source plugin
      const normalized = await normalizePlugin(SOURCE_PLUGIN);

      expect(normalized.name).toBe('test-plugin');
      expect(normalized.commands).toHaveLength(1);
      expect(normalized.agents).toHaveLength(1);

      // Step 2: Create selection
      const selection: Selection = {
        plugins: [
          {
            normalized,
            commands: normalized.commands,
            agents: normalized.agents,
            skills: normalized.skills,
            hooks: normalized.hooks,
            mcps: normalized.mcps
          }
        ]
      };

      const config: SaveConfig = {
        marketplaceName: 'test-marketplace',
        pluginName: 'curated-plugin',
        outputDirectory: OUTPUT_DIR,
        authorEmail: 'test@example.com'
      };

      // Step 3: Save the plugin
      const result = await save(selection, config);

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(path.resolve(OUTPUT_DIR));
      expect(result.stats).toBeDefined();

      // Step 4: Verify output structure
      const pluginDir = path.join(OUTPUT_DIR, 'plugins', 'curated-plugin');

      expect(fs.existsSync(pluginDir)).toBe(true);
      expect(fs.existsSync(path.join(pluginDir, '.claude-plugin', 'plugin.json'))).toBe(true);
      expect(fs.existsSync(path.join(pluginDir, 'commands', 'test-command.md'))).toBe(true);
      expect(fs.existsSync(path.join(pluginDir, 'agents', 'test-agent.md'))).toBe(true);

      // Step 5: Validate plugin.json format
      const pluginJson = readJson(path.join(pluginDir, '.claude-plugin', 'plugin.json'));
      const validation = validateOfficialFormat(pluginJson);

      expect(validation.valid).toBe(true);
      expect(pluginJson.name).toBe('curated-plugin');
      expect(pluginJson.commands).toContain('./commands/test-command.md');

      // Step 6: Verify marketplace.json
      const marketplaceJson = readJson(path.join(OUTPUT_DIR, '.claude-plugin', 'marketplace.json'));

      expect(marketplaceJson.name).toBe('test-marketplace');
      expect(marketplaceJson.owner.email).toBe('test@example.com');
      expect(marketplaceJson.plugins).toHaveLength(1);
      expect(marketplaceJson.plugins[0].name).toBe('curated-plugin');

      // Step 7: Verify file contents are preserved
      const commandContent = fs.readFileSync(
        path.join(pluginDir, 'commands', 'test-command.md'),
        'utf-8'
      );
      const originalContent = fs.readFileSync(
        path.join(SOURCE_PLUGIN, 'commands', 'test-command.md'),
        'utf-8'
      );

      expect(commandContent).toBe(originalContent);
    });

    it('should handle empty selections', async () => {
      const normalized = await normalizePlugin(SOURCE_PLUGIN);

      const selection: Selection = {
        plugins: [
          {
            normalized,
            commands: [], // No selections
            agents: [],
            skills: [],
            hooks: [],
            mcps: []
          }
        ]
      };

      const config: SaveConfig = {
        marketplaceName: 'test-marketplace',
        pluginName: 'curated-plugin',
        outputDirectory: OUTPUT_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No components selected');
    });

    it('should handle partial selections', async () => {
      const normalized = await normalizePlugin(SOURCE_PLUGIN);

      // Select only commands, not agents
      const selection: Selection = {
        plugins: [
          {
            normalized,
            commands: normalized.commands,
            agents: [], // Skip agents
            skills: [],
            hooks: [],
            mcps: []
          }
        ]
      };

      const config: SaveConfig = {
        marketplaceName: 'test-marketplace',
        pluginName: 'curated-plugin',
        outputDirectory: OUTPUT_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      expect(result.stats!.commands).toBe(1);
      expect(result.stats!.agents).toBe(0);

      const pluginDir = path.join(OUTPUT_DIR, 'plugins', 'curated-plugin');
      expect(fs.existsSync(path.join(pluginDir, 'commands', 'test-command.md'))).toBe(true);
      expect(fs.existsSync(path.join(pluginDir, 'agents', 'test-agent.md'))).toBe(false);
    });
  });

  describe('Multiple source plugins', () => {
    it('should merge components from multiple plugins', async () => {
      const normalized = await normalizePlugin(SOURCE_PLUGIN);

      // Simulate two plugins with the same source (for testing)
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              ...normalized,
              name: 'plugin-a'
            },
            commands: normalized.commands,
            agents: [],
            skills: [],
            hooks: [],
            mcps: []
          },
          {
            normalized: {
              ...normalized,
              name: 'plugin-b'
            },
            commands: [],
            agents: normalized.agents,
            skills: [],
            hooks: [],
            mcps: []
          }
        ]
      };

      const config: SaveConfig = {
        marketplaceName: 'test-marketplace',
        pluginName: 'merged-plugin',
        outputDirectory: OUTPUT_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      expect(result.stats!.commands).toBe(1);
      expect(result.stats!.agents).toBe(1);

      // Verify both components are present
      const pluginDir = path.join(OUTPUT_DIR, 'plugins', 'merged-plugin');
      expect(fs.existsSync(path.join(pluginDir, 'commands', 'test-command.md'))).toBe(true);
      expect(fs.existsSync(path.join(pluginDir, 'agents', 'test-agent.md'))).toBe(true);
    });

    it('should apply namespace prefixes to conflicting filenames', async () => {
      const normalized = await normalizePlugin(SOURCE_PLUGIN);

      // Two plugins with same command filename
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              ...normalized,
              name: 'plugin-a'
            },
            commands: normalized.commands,
            agents: [],
            skills: [],
            hooks: [],
            mcps: []
          },
          {
            normalized: {
              ...normalized,
              name: 'plugin-b'
            },
            commands: normalized.commands,
            agents: [],
            skills: [],
            hooks: [],
            mcps: []
          }
        ]
      };

      const config: SaveConfig = {
        marketplaceName: 'test-marketplace',
        pluginName: 'merged-plugin',
        outputDirectory: OUTPUT_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      expect(result.stats!.commands).toBe(2);

      // Verify namespaced files exist
      const commandsDir = path.join(OUTPUT_DIR, 'plugins', 'merged-plugin', 'commands');
      const files = fs.readdirSync(commandsDir);

      expect(files).toContain('plugin-a--test-command.md');
      expect(files).toContain('plugin-b--test-command.md');

      // Verify plugin.json references correct paths
      const pluginJson = readJson(
        path.join(OUTPUT_DIR, 'plugins', 'merged-plugin', '.claude-plugin', 'plugin.json')
      );

      expect(pluginJson.commands).toContain('./commands/plugin-a--test-command.md');
      expect(pluginJson.commands).toContain('./commands/plugin-b--test-command.md');
    });
  });

  describe('Output validation', () => {
    it('should produce valid plugin.json that passes schema validation', async () => {
      const normalized = await normalizePlugin(SOURCE_PLUGIN);

      const selection: Selection = {
        plugins: [
          {
            normalized,
            commands: normalized.commands,
            agents: normalized.agents,
            skills: [],
            hooks: [],
            mcps: []
          }
        ]
      };

      const config: SaveConfig = {
        marketplaceName: 'test-marketplace',
        pluginName: 'valid-plugin',
        outputDirectory: OUTPUT_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);

      // Load and validate plugin.json
      const pluginJson = readJson(
        path.join(OUTPUT_DIR, 'plugins', 'valid-plugin', '.claude-plugin', 'plugin.json')
      );

      const validation = validateOfficialFormat(pluginJson);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should omit default values from plugin.json', async () => {
      const normalized = await normalizePlugin(SOURCE_PLUGIN);

      const selection: Selection = {
        plugins: [
          {
            normalized,
            commands: normalized.commands,
            agents: [],
            skills: [],
            hooks: [],
            mcps: []
          }
        ]
      };

      const config: SaveConfig = {
        marketplaceName: 'test-marketplace',
        pluginName: 'minimal-plugin',
        outputDirectory: OUTPUT_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);

      const pluginJson = readJson(
        path.join(OUTPUT_DIR, 'plugins', 'minimal-plugin', '.claude-plugin', 'plugin.json')
      );

      // Default version should be omitted
      expect(pluginJson.version).toBeUndefined();

      // Empty arrays should be omitted
      expect(pluginJson.agents).toBeUndefined();
      expect(pluginJson.skills).toBeUndefined();
      expect(pluginJson.hooks).toBeUndefined();
      expect(pluginJson.mcpServers).toBeUndefined();

      // Non-empty arrays should be present
      expect(pluginJson.commands).toBeDefined();
      expect(pluginJson.commands).toHaveLength(1);
    });
  });
});
