import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load JSON schemas
const pluginSchemaPath = path.join(__dirname, '../../schemas/plugin.schema.json');
const normalizedSchemaPath = path.join(__dirname, '../../schemas/normalized-plugin.schema.json');
const marketplaceSchemaPath = path.join(__dirname, '../../schemas/marketplace.schema.json');

let pluginSchema: any;
let normalizedSchema: any;
let marketplaceSchema: any;

async function loadSchemas() {
  if (!pluginSchema) {
    pluginSchema = JSON.parse(await fs.readFile(pluginSchemaPath, 'utf-8'));
  }
  if (!normalizedSchema) {
    normalizedSchema = JSON.parse(await fs.readFile(normalizedSchemaPath, 'utf-8'));
  }
  if (!marketplaceSchema) {
    marketplaceSchema = JSON.parse(await fs.readFile(marketplaceSchemaPath, 'utf-8'));
  }
}

/**
 * Create Ajv instance with formats support
 */
function createAjv() {
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  return ajv;
}

/**
 * Validate official plugin.json format
 */
export async function validateOfficialFormat(data: any): Promise<{ valid: boolean; errors: string[] }> {
  await loadSchemas();
  const ajv = createAjv();
  const validate = ajv.compile(pluginSchema);
  const valid = validate(data);

  return {
    valid: !!valid,
    errors: validate.errors?.map(e => `${e.instancePath} ${e.message}`) || [],
  };
}

/**
 * Validate normalized plugin format
 */
export async function validateNormalizedFormat(data: any): Promise<{ valid: boolean; errors: string[] }> {
  await loadSchemas();
  const ajv = createAjv();
  const validate = ajv.compile(normalizedSchema);
  const valid = validate(data);

  return {
    valid: !!valid,
    errors: validate.errors?.map(e => `${e.instancePath} ${e.message}`) || [],
  };
}

/**
 * Validate marketplace format
 */
export async function validateMarketplaceFormat(data: any): Promise<{ valid: boolean; errors: string[] }> {
  await loadSchemas();
  const ajv = createAjv();
  const validate = ajv.compile(marketplaceSchema);
  const valid = validate(data);

  return {
    valid: !!valid,
    errors: validate.errors?.map(e => `${e.instancePath} ${e.message}`) || [],
  };
}
