import Ajv, { ErrorObject } from 'ajv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Schema validation using Ajv
 *
 * Validates plugin configurations against JSON schemas:
 * - plugin.schema.json: Official Claude Code format
 * - normalized-plugin.schema.json: Internal normalized format
 */

// Singleton Ajv instance
let ajv: Ajv | null = null;

/**
 * Get or create Ajv instance
 */
function getAjv(): Ajv {
  if (!ajv) {
    ajv = new Ajv({
      allErrors: true,
      verbose: true
    });

    // Load schemas
    const schemasDir = path.join(__dirname, '../../schemas');

    const pluginSchemaPath = path.join(schemasDir, 'plugin.schema.json');
    const normalizedSchemaPath = path.join(schemasDir, 'normalized-plugin.schema.json');

    if (fs.existsSync(pluginSchemaPath)) {
      const pluginSchema = JSON.parse(fs.readFileSync(pluginSchemaPath, 'utf-8'));
      ajv.addSchema(pluginSchema, 'plugin');
    }

    if (fs.existsSync(normalizedSchemaPath)) {
      const normalizedSchema = JSON.parse(fs.readFileSync(normalizedSchemaPath, 'utf-8'));
      ajv.addSchema(normalizedSchema, 'normalized');
    }
  }

  return ajv;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate official plugin configuration
 *
 * @param data - Plugin configuration to validate
 * @returns Validation result
 */
export function validateOfficial(data: unknown): ValidationResult {
  const validator = getAjv();
  const validate = validator.getSchema('plugin');

  if (!validate) {
    return {
      valid: false,
      errors: ['Plugin schema not loaded']
    };
  }

  const valid = validate(data);

  if (!valid && validate.errors) {
    return {
      valid: false,
      errors: formatErrors(validate.errors)
    };
  }

  return { valid: true };
}

/**
 * Validate normalized plugin configuration
 *
 * @param data - Normalized configuration to validate
 * @returns Validation result
 */
export function validateNormalized(data: unknown): ValidationResult {
  const validator = getAjv();
  const validate = validator.getSchema('normalized');

  if (!validate) {
    return {
      valid: false,
      errors: ['Normalized schema not loaded']
    };
  }

  const valid = validate(data);

  if (!valid && validate.errors) {
    return {
      valid: false,
      errors: formatErrors(validate.errors)
    };
  }

  return { valid: true };
}

/**
 * Format Ajv errors into human-readable messages
 *
 * @param errors - Array of Ajv errors
 * @returns Array of formatted error messages
 */
function formatErrors(errors: ErrorObject[]): string[] {
  return errors.map(err => {
    const path = err.instancePath || '/';
    const message = err.message || 'validation error';

    if (err.keyword === 'required') {
      return `${path}: missing required property "${err.params.missingProperty}"`;
    }

    if (err.keyword === 'type') {
      return `${path}: should be ${err.params.type}`;
    }

    if (err.keyword === 'enum') {
      return `${path}: should be one of: ${err.params.allowedValues.join(', ')}`;
    }

    return `${path}: ${message}`;
  });
}
