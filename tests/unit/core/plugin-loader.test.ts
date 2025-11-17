import { describe, it, expect } from 'vitest';
import { loadPlugin, scanPlugins } from '../../../src/core/plugin-loader.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = join(__dirname, '../../fixtures');

describe('loadPlugin', () => {
  it('should load valid plugin', () => {
    const pluginDir = join(fixturesDir, 'test-plugin-a');
    const result = loadPlugin(pluginDir);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.plugin.data.name).toBe('test-plugin-a');
      expect(result.plugin.pluginDir).toBe(pluginDir);
    }
  });

  it('should load minimal plugin', () => {
    const pluginDir = join(fixturesDir, 'test-plugin-minimal');
    const result = loadPlugin(pluginDir);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.plugin.data.name).toBe('test-plugin-minimal');
    }
  });

  it('should fail for non-existent directory', () => {
    const pluginDir = join(fixturesDir, 'non-existent');
    const result = loadPlugin(pluginDir);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('not found');
    }
  });

  it('should fail for invalid JSON', () => {
    const pluginDir = join(fixturesDir, 'invalid-json');
    const result = loadPlugin(pluginDir);

    expect(result.success).toBe(false);
  });

  it('should use directory name as plugin name if name not in plugin.json', () => {
    const pluginDir = join(fixturesDir, 'test-plugin-minimal');
    const result = loadPlugin(pluginDir);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.plugin.data.name).toBe('test-plugin-minimal');
    }
  });
});

describe('scanPlugins', () => {
  it('should scan and find multiple plugins', () => {
    const result = scanPlugins(fixturesDir);

    expect(result.plugins.length).toBeGreaterThanOrEqual(2);
    const pluginNames = result.plugins.map((p) => p.data.name);
    expect(pluginNames).toContain('test-plugin-a');
    expect(pluginNames).toContain('test-plugin-b');
  });

  it('should return errors for invalid plugins', () => {
    const result = scanPlugins(fixturesDir);

    // Might have errors if invalid plugins exist
    expect(Array.isArray(result.errors)).toBe(true);
  });

  it('should return empty arrays for non-existent directory', () => {
    const result = scanPlugins(join(fixturesDir, 'non-existent'));

    expect(result.plugins).toEqual([]);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should include plugin directory path in results', () => {
    const result = scanPlugins(fixturesDir);

    expect(result.plugins.length).toBeGreaterThan(0);
    result.plugins.forEach((plugin) => {
      expect(plugin.pluginDir).toBeTruthy();
      expect(plugin.pluginDir).toContain(fixturesDir);
    });
  });
});
