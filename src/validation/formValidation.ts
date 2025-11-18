import * as fs from 'fs/promises';
import * as path from 'path';
import { loadPluginsFromDirectory } from '../loader/pluginLoader';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate marketplace name
 * Rule: ^[a-z0-9-]+$ (3-50 chars)
 */
export function validateMarketplaceName(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Marketplace name is required' };
  }

  if (value.length < 3) {
    return { valid: false, error: 'Must be at least 3 characters' };
  }

  if (value.length > 50) {
    return { valid: false, error: 'Must be 50 characters or less' };
  }

  const pattern = /^[a-z0-9-]+$/;
  if (!pattern.test(value)) {
    return { valid: false, error: 'Only lowercase letters, numbers, and hyphens allowed' };
  }

  return { valid: true };
}

/**
 * Validate plugin name
 * Rule: Any printable (3-100 chars)
 */
export function validatePluginName(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Plugin name is required' };
  }

  const trimmed = value.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'Must be at least 3 characters' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Must be 100 characters or less' };
  }

  return { valid: true };
}

/**
 * Validate email format (optional field)
 */
export function validateEmail(value: string): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: true }; // Optional field
  }

  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate source directory exists and contains plugins
 */
export async function validateSourceDirectory(value: string): Promise<ValidationResult & { pluginCount?: number; pluginNames?: string[] }> {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'Source directory is required' };
  }

  // Expand ~ to home directory
  let dirPath = value.trim();
  if (dirPath.startsWith('~')) {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    dirPath = path.join(home, dirPath.slice(1));
  }

  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) {
      return { valid: false, error: 'Path is not a directory' };
    }
  } catch (error) {
    return { valid: false, error: 'Directory does not exist' };
  }

  // Try to load plugins from directory
  try {
    const plugins = await loadPluginsFromDirectory(dirPath);
    if (plugins.length === 0) {
      return { valid: false, error: 'No plugins found in directory' };
    }

    return {
      valid: true,
      pluginCount: plugins.length,
      pluginNames: plugins.map(p => p.name)
    };
  } catch (error) {
    return { valid: false, error: 'Failed to scan directory for plugins' };
  }
}

/**
 * Validate output directory (parent must be writable)
 */
export async function validateOutputDirectory(value: string): Promise<ValidationResult> {
  if (!value || value.trim() === '') {
    return { valid: true }; // Optional field, will use default
  }

  const dirPath = value.trim();
  const parentDir = path.dirname(dirPath);

  try {
    // Check if parent directory exists and is writable
    await fs.access(parentDir, fs.constants.W_OK);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Parent directory is not writable' };
  }
}

/**
 * Auto-fill output directory from marketplace name
 */
export function autoFillOutputDirectory(marketplaceName: string): string {
  if (!marketplaceName || marketplaceName.trim() === '') {
    return './output';
  }

  return `./output/${marketplaceName.trim()}`;
}
