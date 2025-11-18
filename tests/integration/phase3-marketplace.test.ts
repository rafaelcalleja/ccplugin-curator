/**
 * Phase 3: Marketplace Output Generation Tests
 *
 * Validates marketplace.json generation according to spec 007 §3.
 *
 * Tests:
 * 1. Basic marketplace.json structure and content
 * 2. Owner information (name and email)
 * 3. Plugin source path format
 * 4. Multiple plugins in marketplace (future use case)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { save, type SaveOptions } from '../../src/core/save/index.js';
import { loadPlugin } from '../../src/core/plugin-loader.js';
import { normalizePlugin } from '../../src/core/normalizer.js';
import { createInitialState } from '../../src/tui/state.js';
import { getSelection } from '../../src/tui/state.js';
import type { TuiState } from '../../src/tui/state.js';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures');
const OUTPUT_DIR = join(process.cwd(), 'tests/output');

describe('Phase 3: Marketplace Output Generation', () => {
  // beforeEach(() => {
  //   // Clean output directory
  //   if (existsSync(OUTPUT_DIR)) {
  //     rmSync(OUTPUT_DIR, { recursive: true, force: true });
  //   }
  //   mkdirSync(OUTPUT_DIR, { recursive: true });
  // });

  // afterEach(() => {
  //   // Clean up after tests
  //   if (existsSync(OUTPUT_DIR)) {
  //     rmSync(OUTPUT_DIR, { recursive: true, force: true });
  //   }
  // });

  describe('marketplace.json generation', () => {
    it('should generate valid marketplace.json with correct structure', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selection
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]); // Select at least one command

      // Save with specific plugin name
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'my-curated-plugin'),
        pluginName: 'my-curated-plugin',
        overwrite: true,
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      // Read marketplace.json
      const marketplacePath = join(OUTPUT_DIR, 'my-curated-plugin/.claude-plugin/marketplace.json');
      expect(existsSync(marketplacePath)).toBe(true);

      const marketplaceContent = readFileSync(marketplacePath, 'utf-8');
      const marketplace = JSON.parse(marketplaceContent);

      // Verify structure per spec 007 §3
      expect(marketplace).toHaveProperty('name');
      expect(marketplace).toHaveProperty('owner');
      expect(marketplace).toHaveProperty('plugins');

      // Verify marketplace name
      expect(marketplace.name).toBe('curated-plugins');

      // Verify owner structure
      expect(marketplace.owner).toHaveProperty('name');
      expect(typeof marketplace.owner.name).toBe('string');

      // Verify plugins array
      expect(Array.isArray(marketplace.plugins)).toBe(true);
      expect(marketplace.plugins).toHaveLength(1);

      // Verify plugin entry
      const plugin = marketplace.plugins[0];
      expect(plugin).toHaveProperty('name');
      expect(plugin).toHaveProperty('source');
      expect(plugin.name).toBe('my-curated-plugin');
      expect(plugin.source).toBe('./plugins/my-curated-plugin');
    });

    it('should use default owner name when not provided', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selection
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      // Save without owner options
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'default-owner'),
        pluginName: 'default-owner',
        overwrite: true,
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      // Read marketplace.json
      const marketplacePath = join(OUTPUT_DIR, 'default-owner/.claude-plugin/marketplace.json');
      const marketplaceContent = readFileSync(marketplacePath, 'utf-8');
      const marketplace = JSON.parse(marketplaceContent);

      // Verify default owner name
      expect(marketplace.owner.name).toBe('User');
    });

    it('should include owner email when provided', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selection
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      // Save with owner information
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'with-email'),
        pluginName: 'with-email',
        overwrite: true,
        ownerName: 'John Doe',
        ownerEmail: 'john@example.com',
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      // Read marketplace.json
      const marketplacePath = join(OUTPUT_DIR, 'with-email/.claude-plugin/marketplace.json');
      const marketplaceContent = readFileSync(marketplacePath, 'utf-8');
      const marketplace = JSON.parse(marketplaceContent);

      // Verify owner information
      expect(marketplace.owner.name).toBe('John Doe');
      expect(marketplace.owner.email).toBe('john@example.com');
    });

    it('should omit email field when not provided', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selection
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      // Save with owner name but no email
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'no-email'),
        pluginName: 'no-email',
        overwrite: true,
        ownerName: 'Jane Doe',
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      // Read marketplace.json
      const marketplacePath = join(OUTPUT_DIR, 'no-email/.claude-plugin/marketplace.json');
      const marketplaceContent = readFileSync(marketplacePath, 'utf-8');
      const marketplace = JSON.parse(marketplaceContent);

      // Verify email is undefined (JSON.stringify will omit it)
      expect(marketplace.owner.name).toBe('Jane Doe');
      expect(marketplace.owner.email).toBeUndefined();
    });

    it('should generate correct source path with plugin name', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selection
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      // Save with different plugin names to verify source path format
      const testCases = [
        { pluginName: 'simple', expectedSource: './plugins/simple' },
        { pluginName: 'my-awesome-plugin', expectedSource: './plugins/my-awesome-plugin' },
        { pluginName: 'test123', expectedSource: './plugins/test123' },
      ];

      for (const testCase of testCases) {
        const options: SaveOptions = {
          outputDir: join(OUTPUT_DIR, testCase.pluginName),
          pluginName: testCase.pluginName,
          overwrite: true,
        };

        const result = await save(state, options);
        expect(result.success).toBe(true);

        // Read marketplace.json
        const marketplacePath = join(OUTPUT_DIR, `${testCase.pluginName}/.claude-plugin/marketplace.json`);
        const marketplaceContent = readFileSync(marketplacePath, 'utf-8');
        const marketplace = JSON.parse(marketplaceContent);

        // Verify source path format
        expect(marketplace.plugins[0].source).toBe(testCase.expectedSource);
      }
    });

    it('should create marketplace.json in correct location per spec 007 §3', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selection
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'location-test'),
        pluginName: 'location-test',
        overwrite: true,
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      // Verify directory structure per spec 007 §3
      const outputRoot = join(OUTPUT_DIR, 'location-test');
      const marketplaceDir = join(outputRoot, '.claude-plugin');
      const marketplacePath = join(marketplaceDir, 'marketplace.json');
      const pluginJsonPath = join(outputRoot, 'plugins/location-test/.claude-plugin/plugin.json');

      expect(existsSync(marketplacePath)).toBe(true);
      expect(existsSync(pluginJsonPath)).toBe(true);

      // Verify marketplace.json is at top level .claude-plugin directory
      const topLevelMarketplace = readFileSync(marketplacePath, 'utf-8');
      const marketplace = JSON.parse(topLevelMarketplace);

      expect(marketplace.plugins[0].source).toBe('./plugins/location-test');
    });
  });
});
