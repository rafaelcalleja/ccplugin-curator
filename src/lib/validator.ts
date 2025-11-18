import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';
import pluginSchema from '../../schemas/plugin.schema.json';
import normalizedSchema from '../../schemas/normalized-plugin.schema.json';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Compile schemas
const validatePlugin = ajv.compile(pluginSchema);
const validateNormalized = ajv.compile(normalizedSchema);

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validates plugin.json against official format schema
 * @param plugin Plugin object to validate
 * @returns Validation result
 */
export function validateOfficialFormat(plugin: any): ValidationResult {
  const valid = validatePlugin(plugin);

  if (!valid && validatePlugin.errors) {
    return {
      valid: false,
      errors: validatePlugin.errors.map(err =>
        `${err.instancePath} ${err.message}`
      )
    };
  }

  return { valid: true };
}

/**
 * Validates normalized plugin against internal format schema
 * @param plugin Normalized plugin object to validate
 * @returns Validation result
 */
export function validateNormalizedFormat(plugin: any): ValidationResult {
  const valid = validateNormalized(plugin);

  if (!valid && validateNormalized.errors) {
    return {
      valid: false,
      errors: validateNormalized.errors.map(err =>
        `${err.instancePath} ${err.message}`
      )
    };
  }

  return { valid: true };
}

/**
 * Validates marketplace name format
 * Must be kebab-case, 3-50 characters
 * @param name Marketplace name to validate
 * @returns True if valid
 */
export function validateMarketplaceName(name: string): boolean {
  const pattern = /^[a-z0-9-]{3,50}$/;
  return pattern.test(name);
}

/**
 * Validates email format
 * @param email Email address to validate
 * @returns True if valid
 */
export function validateEmail(email: string): boolean {
  // Basic email validation
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Validates that directory exists and contains plugin files
 * @param dirPath Directory path to validate
 * @returns True if valid plugin directory
 */
export function validateDirectory(dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) {
    return false;
  }

  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) {
    return false;
  }

  return true;
}

/**
 * Validates that directory contains a Claude Code plugin
 * @param dirPath Directory path to validate
 * @returns True if contains .claude-plugin/plugin.json
 */
export function validatePluginDirectory(dirPath: string): boolean {
  if (!validateDirectory(dirPath)) {
    return false;
  }

  const pluginJsonPath = path.join(dirPath, '.claude-plugin', 'plugin.json');
  return fs.existsSync(pluginJsonPath);
}

/**
 * Discovers and counts plugin directories in a path
 * @param dirPath Directory to scan
 * @returns Number of plugins found
 */
export function discoverPlugins(dirPath: string): number {
  if (!validateDirectory(dirPath)) {
    return 0;
  }

  let count = 0;
  const entries = fs.readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (validatePluginDirectory(fullPath)) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Gets list of all plugin directories in a path
 * @param dirPath Directory to scan
 * @returns Array of plugin directory paths
 */
export function listPluginDirectories(dirPath: string): string[] {
  if (!validateDirectory(dirPath)) {
    return [];
  }

  const plugins: string[] = [];
  const entries = fs.readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && validatePluginDirectory(fullPath)) {
      plugins.push(fullPath);
    }
  }

  return plugins;
}
