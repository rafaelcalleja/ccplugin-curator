import { describe, it, expect } from 'vitest';
import { transformMetadata } from '../../../../src/transformers/reverse/metadata.js';
import type { NormalizedPluginFormatInternal } from '../../../../src/types/normalized.js';

const createMinimalNormalized = (overrides?: Partial<NormalizedPluginFormatInternal>): NormalizedPluginFormatInternal => ({
  name: 'test-plugin',
  source: '/path/to/plugin',
  version: '0.0.0',
  description: '',
  author: { name: '', email: '', url: '' },
  homepage: '',
  repository: '',
  license: '',
  keywords: [],
  commands: [],
  agents: [],
  skills: [],
  hooks: [],
  mcps: [],
  ...overrides,
});

describe('transformMetadata', () => {
  it('should include name (always required)', () => {
    const normalized = createMinimalNormalized({ name: 'test-plugin' });
    const result = transformMetadata(normalized);
    expect(result).toHaveProperty('name', 'test-plugin');
  });

  it('should omit version if "0.0.0"', () => {
    const normalized = createMinimalNormalized({ version: '0.0.0' });
    const result = transformMetadata(normalized);
    expect(result).not.toHaveProperty('version');
  });

  it('should include version if not "0.0.0"', () => {
    const normalized = createMinimalNormalized({ version: '1.2.3' });
    const result = transformMetadata(normalized);
    expect(result).toHaveProperty('version', '1.2.3');
  });

  it('should omit description if empty', () => {
    const normalized = createMinimalNormalized({ description: '' });
    const result = transformMetadata(normalized);
    expect(result).not.toHaveProperty('description');
  });

  it('should include description if non-empty', () => {
    const normalized = createMinimalNormalized({ description: 'A test plugin' });
    const result = transformMetadata(normalized);
    expect(result).toHaveProperty('description', 'A test plugin');
  });

  it('should omit author if all fields are empty', () => {
    const normalized = createMinimalNormalized({
      author: { name: '', email: '', url: '' },
    });
    const result = transformMetadata(normalized);
    expect(result).not.toHaveProperty('author');
  });

  it('should include author with only non-empty fields', () => {
    const normalized = createMinimalNormalized({
      author: { name: 'John Doe', email: '', url: 'https://example.com' },
    });
    const result = transformMetadata(normalized);
    expect(result).toHaveProperty('author');
    expect(result.author).toEqual({ name: 'John Doe', url: 'https://example.com' });
    expect(result.author).not.toHaveProperty('email');
  });

  it('should include complete author if all fields present', () => {
    const normalized = createMinimalNormalized({
      author: { name: 'John Doe', email: 'john@example.com', url: 'https://example.com' },
    });
    const result = transformMetadata(normalized);
    expect(result).toHaveProperty('author');
    expect(result.author).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      url: 'https://example.com',
    });
  });

  it('should omit homepage if empty', () => {
    const normalized = createMinimalNormalized({ homepage: '' });
    const result = transformMetadata(normalized);
    expect(result).not.toHaveProperty('homepage');
  });

  it('should include homepage if non-empty', () => {
    const normalized = createMinimalNormalized({ homepage: 'https://example.com' });
    const result = transformMetadata(normalized);
    expect(result).toHaveProperty('homepage', 'https://example.com');
  });

  it('should omit keywords if empty array', () => {
    const normalized = createMinimalNormalized({ keywords: [] });
    const result = transformMetadata(normalized);
    expect(result).not.toHaveProperty('keywords');
  });

  it('should include keywords if non-empty', () => {
    const normalized = createMinimalNormalized({ keywords: ['test', 'plugin'] });
    const result = transformMetadata(normalized);
    expect(result).toHaveProperty('keywords', ['test', 'plugin']);
  });
});
