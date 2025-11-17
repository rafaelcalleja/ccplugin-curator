/**
 * Schema validation using Ajv
 *
 * This module provides runtime validation for all plugin formats:
 * - Official plugin.json format
 * - Normalized internal format
 * - Marketplace configuration format
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Ajv with strict mode
const ajv = new Ajv({
  strict: true,
  allErrors: true,
  verbose: true,
});

// Add format validation (email, uri, etc.)
addFormats(ajv);

// Load schemas
const schemasDir = join(__dirname, '../../schemas');

const pluginSchema = JSON.parse(
  readFileSync(join(schemasDir, 'plugin.schema.json'), 'utf-8')
);

const normalizedSchema = JSON.parse(
  readFileSync(join(schemasDir, 'normalized-plugin.schema.json'), 'utf-8')
);

const marketplaceSchema = JSON.parse(
  readFileSync(join(schemasDir, 'marketplace.schema.json'), 'utf-8')
);

// Compile validators
const validatePlugin = ajv.compile(pluginSchema);
const validateNormalized = ajv.compile(normalizedSchema);
const validateMarketplace = ajv.compile(marketplaceSchema);

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Format Ajv errors into readable messages
 */
function formatErrors(errors: any[] | null | undefined): string[] {
  if (!errors) return [];

  return errors.map((err) => {
    const path = err.instancePath || 'root';
    const message = err.message || 'validation error';
    return `${path}: ${message}`;
  });
}

/**
 * Validate official plugin.json format
 */
export function validatePluginJson(data: unknown): ValidationResult {
  const valid = validatePlugin(data);

  return {
    valid: !!valid,
    errors: valid ? undefined : formatErrors(validatePlugin.errors),
  };
}

/**
 * Validate normalized plugin format
 */
export function validateNormalizedPlugin(data: unknown): ValidationResult {
  const valid = validateNormalized(data);

  return {
    valid: !!valid,
    errors: valid ? undefined : formatErrors(validateNormalized.errors),
  };
}

/**
 * Validate marketplace.json format
 */
export function validateMarketplaceJson(data: unknown): ValidationResult {
  const valid = validateMarketplace(data);

  return {
    valid: !!valid,
    errors: valid ? undefined : formatErrors(validateMarketplace.errors),
  };
}

/**
 * Throw error if validation fails
 */
export function assertValidPlugin(data: unknown): asserts data {
  const result = validatePluginJson(data);
  if (!result.valid) {
    throw new Error(
      `Invalid plugin.json:\n${result.errors?.join('\n')}`
    );
  }
}

/**
 * Throw error if validation fails
 */
export function assertValidNormalizedPlugin(data: unknown): asserts data {
  const result = validateNormalizedPlugin(data);
  if (!result.valid) {
    throw new Error(
      `Invalid normalized plugin:\n${result.errors?.join('\n')}`
    );
  }
}

/**
 * Throw error if validation fails
 */
export function assertValidMarketplace(data: unknown): asserts data {
  const result = validateMarketplaceJson(data);
  if (!result.valid) {
    throw new Error(
      `Invalid marketplace.json:\n${result.errors?.join('\n')}`
    );
  }
}
