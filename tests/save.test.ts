/**
 * Save operation tests
 * Based on docs/spec/007-save-operation-rules.md
 *
 * This file tests the save operation logic (9 requirements from spec 007).
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { savePlugin, SaveOptions } from '../src/save';
import { NormalizedPlugin } from '../src/types';

const TEST_OUTPUT_DIR = path.join(__dirname, 'fixtures', 'save-output');

describe('Save Operation Rules (007)', () => {
  beforeEach(() => {
    // Clean output directory before each test
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterEach(() => {
    // Cleanup after tests
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  // ============================================================================
  // 007::EdgeCase::1 - Empty selection
  // ============================================================================
  test('007::EdgeCase::1: Empty selection', () => {
    const emptyPlugin: NormalizedPlugin = {
      name: 'empty-selection',
      source: '/test',
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
      hooks: [],
      mcps: [],
    };

    expect(() => {
      savePlugin([emptyPlugin], {
        outputDir: TEST_OUTPUT_DIR,
        pluginName: 'test',
      });
    }).toThrow('No hay componentes seleccionados');

    // Verify no files were created
    const files = fs.readdirSync(TEST_OUTPUT_DIR);
    expect(files.length).toBe(0);
  });

  // ============================================================================
  // 007::EdgeCase::2 - Output directory exists
  // ============================================================================
  test('007::EdgeCase::2: Output directory exists', () => {
    const outputPath = path.join(TEST_OUTPUT_DIR, 'existing-dir');
    fs.mkdirSync(outputPath, { recursive: true });
    fs.writeFileSync(path.join(outputPath, 'existing-file.txt'), 'old content');

    const plugin: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/test',
      version: '1.0.0',
      description: 'Test',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/test.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    // With overwrite: true, should delete and recreate
    savePlugin([plugin], {
      outputDir: outputPath,
      pluginName: 'test',
      overwrite: true,
    });

    // Old file should be gone
    expect(fs.existsSync(path.join(outputPath, 'existing-file.txt'))).toBe(false);

    // New files should exist
    expect(fs.existsSync(path.join(outputPath, '.claude-plugin', 'marketplace.json'))).toBe(true);
  });

  // ============================================================================
  // 007::EdgeCase::3 - File name conflicts (commands & agents)
  // ============================================================================
  test('007::EdgeCase::3: File name conflicts (commands & agents)', () => {
    const fixturesDir = path.join(__dirname, 'fixtures', 'conflict-test');
    fs.mkdirSync(path.join(fixturesDir, 'plugin-a', 'commands'), { recursive: true });
    fs.mkdirSync(path.join(fixturesDir, 'plugin-b', 'commands'), { recursive: true });

    fs.writeFileSync(
      path.join(fixturesDir, 'plugin-a', 'commands', 'build.md'),
      '# Build from plugin-a'
    );
    fs.writeFileSync(
      path.join(fixturesDir, 'plugin-b', 'commands', 'build.md'),
      '# Build from plugin-b'
    );

    const pluginA: NormalizedPlugin = {
      name: 'plugin-a',
      source: path.join(fixturesDir, 'plugin-a'),
      version: '0.0.0',
      description: '',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/build.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    const pluginB: NormalizedPlugin = {
      name: 'plugin-b',
      source: path.join(fixturesDir, 'plugin-b'),
      version: '0.0.0',
      description: '',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/build.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    savePlugin([pluginA, pluginB], {
      outputDir: TEST_OUTPUT_DIR,
      pluginName: 'curated',
      overwrite: true,
    });

    // Verify directory structure created
    const pluginDir = path.join(TEST_OUTPUT_DIR, 'plugins', 'curated');
    expect(fs.existsSync(path.join(pluginDir, 'commands'))).toBe(true);

    // plugin.json should reference both with prefix
    const pluginJson = JSON.parse(
      fs.readFileSync(path.join(pluginDir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );
    expect(pluginJson.commands).toContain('./commands/plugin-a--build.md');
    expect(pluginJson.commands).toContain('./commands/plugin-b--build.md');

    // Cleanup
    fs.rmSync(fixturesDir, { recursive: true, force: true });
  });

  // ============================================================================
  // 007::EdgeCase::4 - MCP name conflicts
  // ============================================================================
  test('007::EdgeCase::4: MCP name conflicts', () => {
    const pluginA: NormalizedPlugin = {
      name: 'plugin-a',
      source: '/test/plugin-a',
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
      hooks: [],
      mcps: [
        {
          name: 'tavily',
          command: 'npx',
          env: { KEY: 'A' },
        },
      ],
    };

    const pluginB: NormalizedPlugin = {
      name: 'plugin-b',
      source: '/test/plugin-b',
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
      hooks: [],
      mcps: [
        {
          name: 'tavily',
          command: 'npx',
          env: { KEY: 'B' },
        },
      ],
    };

    savePlugin([pluginA, pluginB], {
      outputDir: TEST_OUTPUT_DIR,
      pluginName: 'curated',
      overwrite: true,
    });

    // plugin.json should have both MCPs with namespace prefix
    const pluginJson = JSON.parse(
      fs.readFileSync(
        path.join(TEST_OUTPUT_DIR, 'plugins', 'curated', '.claude-plugin', 'plugin.json'),
        'utf-8'
      )
    );

    expect(pluginJson.mcpServers['plugin-a--tavily']).toBeDefined();
    expect(pluginJson.mcpServers['plugin-a--tavily'].env.KEY).toBe('A');
    expect(pluginJson.mcpServers['plugin-b--tavily']).toBeDefined();
    expect(pluginJson.mcpServers['plugin-b--tavily'].env.KEY).toBe('B');
  });

  // ============================================================================
  // 007::EdgeCase::5 - Hook event merging
  // ============================================================================
  test('007::EdgeCase::5: Hook event merging', () => {
    const pluginA: NormalizedPlugin = {
      name: 'plugin-a',
      source: '/test/plugin-a',
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
      hooks: [
        {
          event: 'SessionStart',
          type: 'command',
          command: '/setup-a.sh',
        },
      ],
      mcps: [],
    };

    const pluginB: NormalizedPlugin = {
      name: 'plugin-b',
      source: '/test/plugin-b',
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
      hooks: [
        {
          event: 'SessionStart',
          type: 'command',
          command: '/setup-b.sh',
        },
      ],
      mcps: [],
    };

    savePlugin([pluginA, pluginB], {
      outputDir: TEST_OUTPUT_DIR,
      pluginName: 'curated',
      overwrite: true,
    });

    // plugin.json should merge hooks into same event
    const pluginJson = JSON.parse(
      fs.readFileSync(
        path.join(TEST_OUTPUT_DIR, 'plugins', 'curated', '.claude-plugin', 'plugin.json'),
        'utf-8'
      )
    );

    expect(pluginJson.hooks.SessionStart).toBeDefined();
    expect(pluginJson.hooks.SessionStart[0].hooks).toHaveLength(2);
    expect(pluginJson.hooks.SessionStart[0].hooks[0].command).toBe('/setup-a.sh');
    expect(pluginJson.hooks.SessionStart[0].hooks[1].command).toBe('/setup-b.sh');
  });

  // ============================================================================
  // 007::EdgeCase::6 - Skill directory conflicts
  // ============================================================================
  test('007::EdgeCase::6: Skill directory conflicts', () => {
    const fixturesDir = path.join(__dirname, 'fixtures', 'skill-conflict-test');
    fs.mkdirSync(path.join(fixturesDir, 'plugin-a', 'skills', 'chrome-devtools'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(fixturesDir, 'plugin-b', 'skills', 'chrome-devtools'), {
      recursive: true,
    });

    fs.writeFileSync(
      path.join(fixturesDir, 'plugin-a', 'skills', 'chrome-devtools', 'SKILL.md'),
      '# Chrome DevTools from plugin-a'
    );
    fs.writeFileSync(
      path.join(fixturesDir, 'plugin-b', 'skills', 'chrome-devtools', 'SKILL.md'),
      '# Chrome DevTools from plugin-b'
    );

    const pluginA: NormalizedPlugin = {
      name: 'plugin-a',
      source: path.join(fixturesDir, 'plugin-a'),
      version: '0.0.0',
      description: '',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: [],
      agents: [],
      skills: ['skills/chrome-devtools'],
      hooks: [],
      mcps: [],
    };

    const pluginB: NormalizedPlugin = {
      name: 'plugin-b',
      source: path.join(fixturesDir, 'plugin-b'),
      version: '0.0.0',
      description: '',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: [],
      agents: [],
      skills: ['skills/chrome-devtools'],
      hooks: [],
      mcps: [],
    };

    savePlugin([pluginA, pluginB], {
      outputDir: TEST_OUTPUT_DIR,
      pluginName: 'curated',
      overwrite: true,
    });

    // Verify directory structure created
    const pluginDir = path.join(TEST_OUTPUT_DIR, 'plugins', 'curated');
    expect(fs.existsSync(path.join(pluginDir, 'skills'))).toBe(true);

    // plugin.json should reference both with prefix
    const pluginJson = JSON.parse(
      fs.readFileSync(path.join(pluginDir, '.claude-plugin', 'plugin.json'), 'utf-8')
    );
    expect(pluginJson.skills).toContain('./skills/plugin-a--chrome-devtools');
    expect(pluginJson.skills).toContain('./skills/plugin-b--chrome-devtools');

    // Cleanup
    fs.rmSync(fixturesDir, { recursive: true, force: true });
  });

  // ============================================================================
  // 007::Invariant::1 - Validate normalized format before saving
  // ============================================================================
  test('007::Invariant::1: Validate normalized format before saving', () => {
    const invalidPlugin = {
      // Missing required fields
      name: 'test',
      source: '/test',
    } as any;

    expect(() => {
      savePlugin([invalidPlugin], {
        outputDir: TEST_OUTPUT_DIR,
        pluginName: 'test',
      });
    }).toThrow();
  });

  // ============================================================================
  // 007::Invariant::2 - Apply transformation before saving
  // ============================================================================
  test('007::Invariant::2: Apply transformation before saving', () => {
    const plugin: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/test',
      version: '1.0.0',
      description: 'Test',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/test.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    savePlugin([plugin], {
      outputDir: TEST_OUTPUT_DIR,
      pluginName: 'test',
      overwrite: true,
    });

    // Verify transformation was applied (paths have ./ prefix)
    const pluginJson = JSON.parse(
      fs.readFileSync(
        path.join(TEST_OUTPUT_DIR, 'plugins', 'test', '.claude-plugin', 'plugin.json'),
        'utf-8'
      )
    );

    expect(pluginJson.commands[0]).toMatch(/^\.\//);
  });

  // ============================================================================
  // 007::Invariant::3 - Validate official format before saving
  // ============================================================================
  test('007::Invariant::3: Validate official format before saving', () => {
    const plugin: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/test',
      version: '1.0.0',
      description: 'Test',
      author: { name: 'Author', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/test.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    savePlugin([plugin], {
      outputDir: TEST_OUTPUT_DIR,
      pluginName: 'test',
      overwrite: true,
    });

    // Verify output is valid JSON and follows schema
    const pluginJson = JSON.parse(
      fs.readFileSync(
        path.join(TEST_OUTPUT_DIR, 'plugins', 'test', '.claude-plugin', 'plugin.json'),
        'utf-8'
      )
    );

    expect(pluginJson.name).toBe('test-plugin');
    expect(pluginJson.version).toBe('1.0.0');
    expect(Array.isArray(pluginJson.commands)).toBe(true);
    expect((pluginJson as any).source).toBeUndefined(); // Source should not be in output
  });
});
