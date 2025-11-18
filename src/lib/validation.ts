import * as fs from 'fs/promises';
import * as path from 'path';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class FieldValidator {
  /**
   * Validate marketplace name: lowercase, numbers, hyphens only (3-50 chars)
   */
  static validateMarketplaceName(value: string): ValidationResult {
    if (!value || value.length === 0) {
      return { valid: false, error: 'Marketplace name is required' };
    }

    if (value.length < 3) {
      return { valid: false, error: 'Must be at least 3 characters' };
    }

    if (value.length > 50) {
      return { valid: false, error: 'Must be at most 50 characters' };
    }

    const pattern = /^[a-z0-9-]+$/;
    if (!pattern.test(value)) {
      return { valid: false, error: 'Only lowercase letters, numbers, and hyphens allowed' };
    }

    return { valid: true };
  }

  /**
   * Validate plugin name: any printable characters (3-100 chars)
   */
  static validatePluginName(value: string): ValidationResult {
    if (!value || value.length === 0) {
      return { valid: false, error: 'Plugin name is required' };
    }

    if (value.length < 3) {
      return { valid: false, error: 'Must be at least 3 characters' };
    }

    if (value.length > 100) {
      return { valid: false, error: 'Must be at most 100 characters' };
    }

    return { valid: true };
  }

  /**
   * Validate source directory: must exist and contain plugins
   */
  static async validateSourceDirectory(value: string): Promise<ValidationResult> {
    if (!value || value.length === 0) {
      return { valid: false, error: 'Source directory is required' };
    }

    // Expand ~ to home directory
    const expandedPath = value.replace(/^~/, process.env.HOME || '~');

    try {
      const stats = await fs.stat(expandedPath);
      if (!stats.isDirectory()) {
        return { valid: false, error: 'Path is not a directory' };
      }

      // Check if directory contains any plugin-like structures
      const entries = await fs.readdir(expandedPath, { withFileTypes: true });
      const hasPlugins = entries.some((entry) => entry.isDirectory());

      if (!hasPlugins) {
        return { valid: false, error: 'Directory appears empty' };
      }

      return { valid: true };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { valid: false, error: 'Directory does not exist' };
      }
      return { valid: false, error: `Cannot access directory: ${(error as Error).message}` };
    }
  }

  /**
   * Validate output directory: parent must be writable
   */
  static async validateOutputDirectory(value: string): Promise<ValidationResult> {
    if (!value || value.length === 0) {
      // Optional field
      return { valid: true };
    }

    const expandedPath = value.replace(/^~/, process.env.HOME || '~');
    const parentDir = path.dirname(expandedPath);

    try {
      // Check if parent directory exists and is writable
      await fs.access(parentDir, fs.constants.W_OK);
      return { valid: true };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { valid: false, error: 'Parent directory does not exist' };
      }
      return { valid: false, error: 'Parent directory is not writable' };
    }
  }

  /**
   * Validate email: basic email format check (optional field)
   */
  static validateEmail(value: string): ValidationResult {
    if (!value || value.length === 0) {
      // Optional field
      return { valid: true };
    }

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) {
      return { valid: false, error: 'Invalid email format' };
    }

    return { valid: true };
  }
}

/**
 * Scan directory for plugins
 */
export async function scanForPlugins(directory: string): Promise<string[]> {
  const expandedPath = directory.replace(/^~/, process.env.HOME || '~');

  try {
    const entries = await fs.readdir(expandedPath, { withFileTypes: true });
    const plugins: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const pluginJsonPath = path.join(expandedPath, entry.name, '.claude-plugin', 'plugin.json');
        const pluginJsonExists = await fs
          .access(pluginJsonPath)
          .then(() => true)
          .catch(() => false);

        if (pluginJsonExists) {
          plugins.push(entry.name);
        }
      }
    }

    return plugins;
  } catch (error) {
    return [];
  }
}
