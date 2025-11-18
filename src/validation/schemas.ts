/**
 * Schema Validation Module
 * Implements: docs/decisions/001-json-schema-to-typescript.md
 * Provides runtime validation using Ajv
 */

import Ajv from 'ajv';
import * as fs from 'fs';
import * as path from 'path';
import type { PluginJson } from '../types/plugin';
import type { NormalizedPlugin } from '../types/normalized';

// Initialize Ajv
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
});

// Load schemas
const schemasDir = path.resolve(__dirname, '../../schemas');
const pluginSchemaPath = path.join(schemasDir, 'plugin.schema.json');
const normalizedSchemaPath = path.join(schemasDir, 'normalized-plugin.schema.json');

let pluginSchema: any;
let normalizedSchema: any;

try {
  pluginSchema = JSON.parse(fs.readFileSync(pluginSchemaPath, 'utf-8'));
  normalizedSchema = JSON.parse(fs.readFileSync(normalizedSchemaPath, 'utf-8'));
} catch (error) {
  console.warn('Warning: Could not load JSON schemas for validation');
}

// Compile validators
const validatePluginJsonSchema = pluginSchema ? ajv.compile(pluginSchema) : null;
const validateNormalizedPluginSchema = normalizedSchema ? ajv.compile(normalizedSchema) : null;

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Validate PluginJson (official format)
 */
export function validatePluginJson(data: unknown): ValidationResult {
  if (!validatePluginJsonSchema) {
    // Schema not loaded - skip validation
    return { valid: true };
  }

  const valid = validatePluginJsonSchema(data);

  if (valid) {
    return { valid: true };
  }

  const errors: ValidationError[] = (validatePluginJsonSchema.errors || []).map((err) => ({
    field: err.instancePath || err.schemaPath || 'unknown',
    message: err.message || 'Validation error',
    value: err.data,
  }));

  return {
    valid: false,
    errors,
  };
}

/**
 * Validate NormalizedPlugin (internal format)
 */
export function validateNormalizedPlugin(data: unknown): ValidationResult {
  if (!validateNormalizedPluginSchema) {
    // Schema not loaded - skip validation
    return { valid: true };
  }

  const valid = validateNormalizedPluginSchema(data);

  if (valid) {
    return { valid: true };
  }

  const errors: ValidationError[] = (validateNormalizedPluginSchema.errors || []).map((err) => ({
    field: err.instancePath || err.schemaPath || 'unknown',
    message: err.message || 'Validation error',
    value: err.data,
  }));

  return {
    valid: false,
    errors,
  };
}

/**
 * Format validation errors for user display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'Validation failed';
  }

  const lines = ['Validation errors:'];
  for (const error of errors) {
    lines.push(`  - ${error.field}: ${error.message}`);
  }

  return lines.join('\n');
}

/**
 * Assert valid PluginJson or throw
 */
export function assertValidPluginJson(data: unknown): asserts data is PluginJson {
  const result = validatePluginJson(data);
  if (!result.valid) {
    throw new Error(formatValidationErrors(result.errors || []));
  }
}

/**
 * Assert valid NormalizedPlugin or throw
 */
export function assertValidNormalizedPlugin(data: unknown): asserts data is NormalizedPlugin {
  const result = validateNormalizedPlugin(data);
  if (!result.valid) {
    throw new Error(formatValidationErrors(result.errors || []));
  }
}
