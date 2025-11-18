import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { save, type Selection, type SaveConfig } from '../../src/lib/save-controller';
import type { NormalizedPlugin } from '../../src/types/normalized';

const TEST_DIR = path.join(__dirname, '..', 'fixtures', 'save-test');
const SOURCE_PLUGIN_DIR = path.join(__dirname, '..', 'fixtures', 'test-plugin');

describe('Save Controller', () => {
  beforeEach(() => {
    // Clean up before each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('save', () => {
    it('should return error when no components selected', async () => {
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'test-plugin',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Test',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: [],
              agents: [],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: [],
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
        outputDirectory: TEST_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No components selected');
    });

    it('should create output directory structure', async () => {
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'test-plugin',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Test',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: ['commands/test-command.md'],
              agents: [],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: ['commands/test-command.md'],
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
        outputDirectory: TEST_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, '.claude-plugin'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'plugins', 'curated-plugin'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'plugins', 'curated-plugin', '.claude-plugin'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'plugins', 'curated-plugin', 'commands'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'plugins', 'curated-plugin', 'agents'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'plugins', 'curated-plugin', 'skills'))).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'plugins', 'curated-plugin', 'hooks'))).toBe(true);
    });

    it('should copy selected commands', async () => {
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'test-plugin',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Test',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: ['commands/test-command.md'],
              agents: [],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: ['commands/test-command.md'],
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
        outputDirectory: TEST_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      const commandPath = path.join(TEST_DIR, 'plugins', 'curated-plugin', 'commands', 'test-command.md');
      expect(fs.existsSync(commandPath)).toBe(true);
    });

    it('should copy selected agents', async () => {
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'test-plugin',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Test',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: [],
              agents: ['agents/test-agent.md'],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: [],
            agents: ['agents/test-agent.md'],
            skills: [],
            hooks: [],
            mcps: []
          }
        ]
      };

      const config: SaveConfig = {
        marketplaceName: 'test-marketplace',
        pluginName: 'curated-plugin',
        outputDirectory: TEST_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      const agentPath = path.join(TEST_DIR, 'plugins', 'curated-plugin', 'agents', 'test-agent.md');
      expect(fs.existsSync(agentPath)).toBe(true);
    });

    it('should write plugin.json', async () => {
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'test-plugin',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Test',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: ['commands/test-command.md'],
              agents: [],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: ['commands/test-command.md'],
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
        outputDirectory: TEST_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      const pluginJsonPath = path.join(TEST_DIR, 'plugins', 'curated-plugin', '.claude-plugin', 'plugin.json');
      expect(fs.existsSync(pluginJsonPath)).toBe(true);

      const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
      expect(pluginJson.name).toBe('curated-plugin');
      expect(pluginJson.commands).toContain('./commands/test-command.md');
    });

    it('should write normalized-plugin.json', async () => {
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'test-plugin',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Test',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: ['commands/test-command.md'],
              agents: [],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: ['commands/test-command.md'],
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
        outputDirectory: TEST_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      const normalizedPath = path.join(TEST_DIR, 'normalized-plugin.json');
      expect(fs.existsSync(normalizedPath)).toBe(true);

      const normalized = JSON.parse(fs.readFileSync(normalizedPath, 'utf-8'));
      expect(normalized.name).toBe('curated-plugin');
      expect(normalized.commands).toContain('commands/test-command.md');
    });

    it('should write marketplace.json', async () => {
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'test-plugin',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Test',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: ['commands/test-command.md'],
              agents: [],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: ['commands/test-command.md'],
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
        outputDirectory: TEST_DIR,
        authorEmail: 'test@example.com'
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      const marketplacePath = path.join(TEST_DIR, '.claude-plugin', 'marketplace.json');
      expect(fs.existsSync(marketplacePath)).toBe(true);

      const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf-8'));
      expect(marketplace.name).toBe('test-marketplace');
      expect(marketplace.owner.email).toBe('test@example.com');
      expect(marketplace.plugins).toHaveLength(1);
      expect(marketplace.plugins[0].name).toBe('curated-plugin');
      expect(marketplace.plugins[0].source).toBe('./plugins/curated-plugin');
    });

    it('should return stats for saved components', async () => {
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'test-plugin',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Test',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: ['commands/test-command.md'],
              agents: ['agents/test-agent.md'],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: ['commands/test-command.md'],
            agents: ['agents/test-agent.md'],
            skills: [],
            hooks: [],
            mcps: []
          }
        ]
      };

      const config: SaveConfig = {
        marketplaceName: 'test-marketplace',
        pluginName: 'curated-plugin',
        outputDirectory: TEST_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.stats!.commands).toBe(1);
      expect(result.stats!.agents).toBe(1);
      expect(result.stats!.skills).toBe(0);
      expect(result.stats!.hooks).toBe(0);
      expect(result.stats!.mcps).toBe(0);
    });

    it('should handle multiple plugins with conflict resolution', async () => {
      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'plugin-a',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Plugin A',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: ['commands/test-command.md'],
              agents: [],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: ['commands/test-command.md'],
            agents: [],
            skills: [],
            hooks: [],
            mcps: []
          },
          {
            normalized: {
              name: 'plugin-b',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Plugin B',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: ['commands/test-command.md'],
              agents: [],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: ['commands/test-command.md'],
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
        outputDirectory: TEST_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      expect(result.stats!.commands).toBe(2);

      // Check that both files were created with namespaced names
      const pluginDir = path.join(TEST_DIR, 'plugins', 'curated-plugin', 'commands');
      const files = fs.readdirSync(pluginDir);
      expect(files).toContain('plugin-a--test-command.md');
      expect(files).toContain('plugin-b--test-command.md');
    });

    it('should remove existing output directory', async () => {
      // Create existing output directory
      fs.mkdirSync(TEST_DIR, { recursive: true });
      fs.writeFileSync(path.join(TEST_DIR, 'old-file.txt'), 'old content');

      const selection: Selection = {
        plugins: [
          {
            normalized: {
              name: 'test-plugin',
              source: SOURCE_PLUGIN_DIR,
              version: '1.0.0',
              description: 'Test',
              author: { name: '', email: '', url: '' },
              homepage: '',
              repository: '',
              license: '',
              keywords: [],
              commands: ['commands/test-command.md'],
              agents: [],
              skills: [],
              hooks: [],
              mcps: []
            },
            commands: ['commands/test-command.md'],
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
        outputDirectory: TEST_DIR
      };

      const result = await save(selection, config);

      expect(result.success).toBe(true);
      expect(fs.existsSync(path.join(TEST_DIR, 'old-file.txt'))).toBe(false);
    });
  });
});
