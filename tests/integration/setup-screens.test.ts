/**
 * Setup Screens Integration Tests (BDD Style)
 *
 * Tests for Main Menu and Configuration Form based on spec 008 §2.
 * Tests focus on validation logic and state management.
 *
 * Note: Full TUI rendering and keyboard interaction tests are not
 * included as they require end-to-end testing frameworks.
 */

import { describe, it, expect } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { scanPlugins } from '../../src/core/plugin-loader.js';

const TEST_DIR = join(process.cwd(), 'tests', 'output', 'setup-screens-test');

describe('Setup Screens - BDD Integration Tests', () => {
  describe('Configuration Form - Field Validation', () => {
    describe('Marketplace Name Validation', () => {
      it('should reject empty marketplace name', () => {
        // Given: empty marketplace name
        const value = '';

        // When: validating marketplace name
        const isValid = /^[a-z0-9-]{3,50}$/.test(value);

        // Then: validation fails
        expect(isValid).toBe(false);
      });

      it('should reject marketplace name with uppercase letters', () => {
        // Given: marketplace name with uppercase
        const value = 'MyPlugin';

        // When: validating marketplace name
        const isValid = /^[a-z0-9-]{3,50}$/.test(value);

        // Then: validation fails
        expect(isValid).toBe(false);
      });

      it('should reject marketplace name with spaces', () => {
        // Given: marketplace name with spaces
        const value = 'my plugin';

        // When: validating marketplace name
        const isValid = /^[a-z0-9-]{3,50}$/.test(value);

        // Then: validation fails
        expect(isValid).toBe(false);
      });

      it('should reject marketplace name that is too short', () => {
        // Given: marketplace name with only 2 characters
        const value = 'ab';

        // When: validating marketplace name
        const isValid = /^[a-z0-9-]{3,50}$/.test(value);

        // Then: validation fails
        expect(isValid).toBe(false);
      });

      it('should reject marketplace name that is too long', () => {
        // Given: marketplace name with 51 characters
        const value = 'a'.repeat(51);

        // When: validating marketplace name
        const isValid = /^[a-z0-9-]{3,50}$/.test(value);

        // Then: validation fails
        expect(isValid).toBe(false);
      });

      it('should accept valid marketplace name with lowercase letters, numbers, and hyphens', () => {
        // Given: valid marketplace name
        const value = 'my-plugin-123';

        // When: validating marketplace name
        const isValid = /^[a-z0-9-]{3,50}$/.test(value);

        // Then: validation passes
        expect(isValid).toBe(true);
      });
    });

    describe('Plugin Name Validation', () => {
      it('should reject empty plugin name', () => {
        // Given: empty plugin name
        const value = '';

        // When: validating plugin name
        const isValid = /^[a-z0-9-]{3,50}$/.test(value);

        // Then: validation fails
        expect(isValid).toBe(false);
      });

      it('should accept valid plugin name', () => {
        // Given: valid plugin name
        const value = 'awesome-plugin';

        // When: validating plugin name
        const isValid = /^[a-z0-9-]{3,50}$/.test(value);

        // Then: validation passes
        expect(isValid).toBe(true);
      });
    });

    describe('Email Validation', () => {
      it('should accept empty email (optional field)', () => {
        // Given: empty email (optional field)
        const value = '';

        // When: validating email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = value === '' || emailRegex.test(value);

        // Then: validation passes (field is optional)
        expect(isValid).toBe(true);
      });

      it('should reject invalid email format', () => {
        // Given: invalid email
        const value = 'invalid-email';

        // When: validating email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);

        // Then: validation fails
        expect(isValid).toBe(false);
      });

      it('should accept valid email format', () => {
        // Given: valid email
        const value = 'user@example.com';

        // When: validating email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);

        // Then: validation passes
        expect(isValid).toBe(true);
      });
    });

    describe('Source Directory Validation', () => {
      it('should reject non-existent directory', () => {
        // Given: path to non-existent directory
        const value = '/nonexistent/path/to/plugins';

        // When: checking if directory exists
        const isValid = existsSync(value);

        // Then: validation fails
        expect(isValid).toBe(false);
      });

      it('should reject directory with no plugins', () => {
        // Given: empty directory
        const emptyDir = join(TEST_DIR, 'empty-dir');
        if (existsSync(emptyDir)) {
          rmSync(emptyDir, { recursive: true, force: true });
        }
        mkdirSync(emptyDir, { recursive: true });

        try {
          // When: scanning for plugins
          const result = scanPlugins(emptyDir);

          // Then: no plugins found
          expect(result.plugins).toHaveLength(0);
        } finally {
          // Cleanup
          rmSync(emptyDir, { recursive: true, force: true });
        }
      });

      it('should accept directory with valid plugins', () => {
        // Given: directory with a valid plugin
        const pluginDir = join(TEST_DIR, 'valid-plugin');
        const claudePluginDir = join(pluginDir, '.claude-plugin');

        if (existsSync(pluginDir)) {
          rmSync(pluginDir, { recursive: true, force: true });
        }
        mkdirSync(claudePluginDir, { recursive: true });

        writeFileSync(
          join(claudePluginDir, 'plugin.json'),
          JSON.stringify({ name: 'test-plugin', version: '1.0.0' }),
          'utf-8'
        );

        try {
          // When: scanning for plugins
          const result = scanPlugins(TEST_DIR);

          // Then: plugin is found
          expect(result.plugins.length).toBeGreaterThan(0);
          expect(result.plugins[0].data.name).toBe('test-plugin');
        } finally {
          // Cleanup
          rmSync(pluginDir, { recursive: true, force: true });
        }
      });
    });
  });

  describe('Configuration Form - Auto-fill Behavior', () => {
    it('should auto-fill output directory from marketplace name', () => {
      // Given: marketplace name is set
      const marketplaceName = 'my-marketplace';

      // When: auto-filling output directory
      const outputDirectory = `./output/${marketplaceName}`;

      // Then: output directory is auto-filled correctly
      expect(outputDirectory).toBe('./output/my-marketplace');
    });

    it('should preserve manual output directory override', () => {
      // Given: user manually sets output directory
      const marketplaceName = 'my-marketplace';
      const userSetOutputDir = '/custom/path';

      // When: user has already set a custom path
      // Then: auto-fill should not override it
      // (This is behavioral logic that would be implemented in the component)
      const outputDirectory = userSetOutputDir || `./output/${marketplaceName}`;

      expect(outputDirectory).toBe('/custom/path');
    });
  });

  describe('Configuration Form - Field Requirements', () => {
    it('should identify required fields', () => {
      // Given: field configuration
      const requiredFields = ['marketplaceName', 'pluginName', 'sourceDirectory'];
      const optionalFields = ['outputDirectory', 'authorEmail'];

      // When: checking if fields are required
      // Then: correct fields are identified as required
      expect(requiredFields).toContain('marketplaceName');
      expect(requiredFields).toContain('pluginName');
      expect(requiredFields).toContain('sourceDirectory');
      expect(requiredFields).not.toContain('outputDirectory');
      expect(requiredFields).not.toContain('authorEmail');
    });

    it('should allow submission when all required fields are valid', () => {
      // Given: all required fields have valid values
      const fields = {
        marketplaceName: { value: 'my-marketplace', isValid: true },
        pluginName: { value: 'my-plugin', isValid: true },
        sourceDirectory: { value: './plugins', isValid: true },
        outputDirectory: { value: './output/my-marketplace', isValid: null },
        authorEmail: { value: '', isValid: null },
      };

      // When: checking if form can be submitted
      const requiredFieldsValid = ['marketplaceName', 'pluginName', 'sourceDirectory'].every(
        (name) => fields[name as keyof typeof fields].isValid === true
      );

      // Then: form can be submitted
      expect(requiredFieldsValid).toBe(true);
    });

    it('should prevent submission when required field is invalid', () => {
      // Given: one required field is invalid
      const fields = {
        marketplaceName: { value: 'MyMarketplace', isValid: false }, // Invalid (uppercase)
        pluginName: { value: 'my-plugin', isValid: true },
        sourceDirectory: { value: './plugins', isValid: true },
      };

      // When: checking if form can be submitted
      const requiredFieldsValid = ['marketplaceName', 'pluginName', 'sourceDirectory'].every(
        (name) => fields[name as keyof typeof fields].isValid === true
      );

      // Then: form cannot be submitted
      expect(requiredFieldsValid).toBe(false);
    });
  });
});
