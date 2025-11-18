/**
 * Phase 5: Integration & Polish - Validation Tests
 *
 * Validates schema validation integration in save flow.
 *
 * Tests:
 * 1. Successful save generates valid plugin.json
 * 2. Successful save generates valid marketplace.json
 * 3. Validation catches empty selections
 * 4. Generated outputs conform to schemas
 * 5. Error handling and error messages
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { save, type SaveOptions } from '../../src/core/save/index.js';
import { loadPlugin } from '../../src/core/plugin-loader.js';
import { normalizePlugin } from '../../src/core/normalizer.js';
import { createInitialState, getSelection } from '../../src/tui/state.js';
import {
  validatePluginJson,
  validateMarketplaceJson,
  validateNormalizedPlugin,
} from '../../src/core/validator.js';
import type { TuiState } from '../../src/tui/state.js';

const FIXTURES_DIR = join(process.cwd(), 'tests/fixtures');
const OUTPUT_DIR = join(process.cwd(), 'tests/output');

describe('Phase 5: Integration & Polish - Validation', () => {
  // Don't clean output directory globally to avoid conflicts with other tests
  // Each test uses unique output directory

  describe('Schema Validation Integration', () => {
    it('should generate valid plugin.json that passes schema validation', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selections
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);
      selection.commands.add(normalized.commands[1]);

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'validation-plugin-json'),
        pluginName: 'validation-plugin-json',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify save succeeded
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);

      // Read generated plugin.json
      const pluginJsonPath = join(
        OUTPUT_DIR,
        'validation-plugin-json/plugins/validation-plugin-json/.claude-plugin/plugin.json'
      );
      expect(existsSync(pluginJsonPath)).toBe(true);

      const pluginJsonContent = readFileSync(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(pluginJsonContent);

      // Validate against schema
      const validation = validatePluginJson(pluginJson);

      if (!validation.valid) {
        console.error('Validation errors:', validation.errors);
      }

      expect(validation.valid).toBe(true);
      expect(validation.errors).toBeUndefined();
    });

    it('should generate valid marketplace.json that passes schema validation', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selections
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'validation-marketplace'),
        pluginName: 'validation-marketplace',
        overwrite: true,
        ownerName: 'Test Owner',
        ownerEmail: 'test@example.com',
      };

      const result = await save(state, options);

      // Verify save succeeded
      expect(result.success).toBe(true);

      // Read generated marketplace.json
      const marketplacePath = join(OUTPUT_DIR, 'validation-marketplace/.claude-plugin/marketplace.json');
      expect(existsSync(marketplacePath)).toBe(true);

      const marketplaceContent = readFileSync(marketplacePath, 'utf-8');
      const marketplace = JSON.parse(marketplaceContent);

      // Validate against schema
      const validation = validateMarketplaceJson(marketplace);

      if (!validation.valid) {
        console.error('Validation errors:', validation.errors);
      }

      expect(validation.valid).toBe(true);
      expect(validation.errors).toBeUndefined();
    });

    it('should generate valid normalized-plugin.json for debugging', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selections
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'validation-normalized'),
        pluginName: 'validation-normalized',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify save succeeded
      expect(result.success).toBe(true);

      // Read generated normalized-plugin.json
      const normalizedPath = join(OUTPUT_DIR, 'validation-normalized/normalized-plugin.json');
      expect(existsSync(normalizedPath)).toBe(true);

      const normalizedContent = readFileSync(normalizedPath, 'utf-8');
      const normalizedData = JSON.parse(normalizedContent);

      // Validate against schema
      const validation = validateNormalizedPlugin(normalizedData);

      if (!validation.valid) {
        console.error('Validation errors:', validation.errors);
      }

      expect(validation.valid).toBe(true);
      expect(validation.errors).toBeUndefined();
    });
  });

  describe('Empty Selection Validation', () => {
    it('should reject save with empty selection', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with NO selections
      const state: TuiState = createInitialState([normalized]);
      // Don't select anything

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'empty-selection'),
        pluginName: 'empty-selection',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify save failed
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('No components selected');
    });
  });

  describe('Multi-Plugin Validation', () => {
    it('should generate valid outputs for multi-plugin aggregation', async () => {
      // Load multiple test plugins
      const pluginDir1 = join(FIXTURES_DIR, 'test-plugin-a');
      const pluginDir2 = join(FIXTURES_DIR, 'test-plugin-b');

      const loaded1 = loadPlugin(pluginDir1);
      const loaded2 = loadPlugin(pluginDir2);

      const normalized1 = await normalizePlugin(loaded1.data, pluginDir1);
      const normalized2 = await normalizePlugin(loaded2.data, pluginDir2);

      // Create state with selections from both plugins
      const state: TuiState = createInitialState([normalized1, normalized2]);

      const selection1 = getSelection(state, normalized1.name);
      selection1.commands.add(normalized1.commands[0]);

      const selection2 = getSelection(state, normalized2.name);
      selection2.commands.add(normalized2.commands[0]);

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'multi-plugin-validation'),
        pluginName: 'multi-plugin-validation',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify save succeeded
      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);

      // Read and validate plugin.json
      const pluginJsonPath = join(
        OUTPUT_DIR,
        'multi-plugin-validation/plugins/multi-plugin-validation/.claude-plugin/plugin.json'
      );
      const pluginJsonContent = readFileSync(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(pluginJsonContent);

      const pluginValidation = validatePluginJson(pluginJson);
      expect(pluginValidation.valid).toBe(true);

      // Read and validate marketplace.json
      const marketplacePath = join(OUTPUT_DIR, 'multi-plugin-validation/.claude-plugin/marketplace.json');
      const marketplaceContent = readFileSync(marketplacePath, 'utf-8');
      const marketplace = JSON.parse(marketplaceContent);

      const marketplaceValidation = validateMarketplaceJson(marketplace);
      expect(marketplaceValidation.valid).toBe(true);

      // Verify aggregation (should have at least 2 commands)
      expect(pluginJson.commands.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Hook Script Validation', () => {
    it('should generate valid outputs with hook scripts and ${CLAUDE_PLUGIN_ROOT}', async () => {
      // Load plugin with hooks
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-hooks');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with hook selections
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);

      // Select command (required to have at least one component)
      selection.commands.add(normalized.commands[0]);

      // Select hooks
      normalized.hooks.forEach((_, index) => {
        selection.hooks.add(index);
      });

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'hooks-validation'),
        pluginName: 'hooks-validation',
        overwrite: true,
      };

      const result = await save(state, options);

      // Verify save succeeded
      expect(result.success).toBe(true);

      // Read and validate plugin.json
      const pluginJsonPath = join(
        OUTPUT_DIR,
        'hooks-validation/plugins/hooks-validation/.claude-plugin/plugin.json'
      );
      const pluginJsonContent = readFileSync(pluginJsonPath, 'utf-8');
      const pluginJson = JSON.parse(pluginJsonContent);

      const validation = validatePluginJson(pluginJson);

      if (!validation.valid) {
        console.error('Plugin.json validation errors:', validation.errors);
      }

      expect(validation.valid).toBe(true);

      // Verify hooks are present and transformed
      expect(pluginJson.hooks).toBeDefined();

      // Verify at least one hook command contains ${CLAUDE_PLUGIN_ROOT}
      let foundTransformedHook = false;
      for (const event of Object.values(pluginJson.hooks)) {
        if (Array.isArray(event)) {
          for (const group of event) {
            if (group.hooks) {
              for (const hook of group.hooks) {
                if (hook.command && hook.command.includes('${CLAUDE_PLUGIN_ROOT}')) {
                  foundTransformedHook = true;
                  break;
                }
              }
            }
          }
        }
      }

      expect(foundTransformedHook).toBe(true);
    });
  });

  describe('Output Directory Structure', () => {
    it('should create correct directory structure per spec 007 §3', async () => {
      // Load test plugin
      const pluginDir = join(FIXTURES_DIR, 'test-plugin-a');
      const loaded = loadPlugin(pluginDir);
      const normalized = await normalizePlugin(loaded.data, pluginDir);

      // Create state with selections
      const state: TuiState = createInitialState([normalized]);
      const selection = getSelection(state, normalized.name);
      selection.commands.add(normalized.commands[0]);

      // Save
      const options: SaveOptions = {
        outputDir: join(OUTPUT_DIR, 'structure-validation'),
        pluginName: 'structure-validation',
        overwrite: true,
      };

      const result = await save(state, options);
      expect(result.success).toBe(true);

      // Verify structure per spec 007 §3
      const outputRoot = join(OUTPUT_DIR, 'structure-validation');

      // Top-level marketplace.json
      expect(existsSync(join(outputRoot, '.claude-plugin/marketplace.json'))).toBe(true);

      // Plugin directory structure
      expect(existsSync(join(outputRoot, 'plugins/structure-validation'))).toBe(true);
      expect(
        existsSync(join(outputRoot, 'plugins/structure-validation/.claude-plugin/plugin.json'))
      ).toBe(true);

      // Normalized-plugin.json at root
      expect(existsSync(join(outputRoot, 'normalized-plugin.json'))).toBe(true);
    });
  });
});
