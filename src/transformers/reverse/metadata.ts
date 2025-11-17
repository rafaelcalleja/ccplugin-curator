/**
 * Reverse Metadata Transformer
 *
 * Transforms normalized metadata back to official format.
 * Omits fields with default values to keep output minimal.
 *
 * Spec: docs/spec/006-reverse-transformation-rules.md (Section 3.1, 3.2)
 */

import type { NormalizedPluginFormatInternal } from '../../types/normalized.js';

/**
 * Author object (partial - only non-empty fields)
 */
interface PartialAuthor {
  name?: string;
  email?: string;
  url?: string;
}

/**
 * Check if author has all empty fields
 */
function isEmptyAuthor(author: { name: string; email: string; url: string }): boolean {
  return author.name === '' && author.email === '' && author.url === '';
}

/**
 * Remove empty fields from author object
 *
 * @param author - Normalized author object
 * @returns Partial author with only non-empty fields
 */
function cleanAuthor(author: { name: string; email: string; url: string }): PartialAuthor | undefined {
  if (isEmptyAuthor(author)) {
    return undefined;
  }

  const result: PartialAuthor = {};
  if (author.name !== '') result.name = author.name;
  if (author.email !== '') result.email = author.email;
  if (author.url !== '') result.url = author.url;

  return result;
}

/**
 * Transform metadata fields from normalized to official format
 *
 * Omits fields with default values:
 * - version: "0.0.0"
 * - description: ""
 * - author: all empty
 * - homepage: ""
 * - repository: ""
 * - license: ""
 * - keywords: []
 *
 * @param normalized - Normalized plugin
 * @returns Partial object with only non-default metadata fields
 */
export function transformMetadata(normalized: NormalizedPluginFormatInternal): {
  name: string;
  version?: string;
  description?: string;
  author?: PartialAuthor;
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
} {
  const result: any = {
    name: normalized.name, // Always include name (required)
  };

  // Version: omit if default
  if (normalized.version !== '0.0.0') {
    result.version = normalized.version;
  }

  // Description: omit if empty
  if (normalized.description !== '') {
    result.description = normalized.description;
  }

  // Author: omit if all fields empty, otherwise include non-empty fields
  const author = cleanAuthor(normalized.author);
  if (author) {
    result.author = author;
  }

  // Homepage: omit if empty
  if (normalized.homepage !== '') {
    result.homepage = normalized.homepage;
  }

  // Repository: omit if empty
  if (normalized.repository !== '') {
    result.repository = normalized.repository;
  }

  // License: omit if empty
  if (normalized.license !== '') {
    result.license = normalized.license;
  }

  // Keywords: omit if empty array
  if (normalized.keywords.length > 0) {
    result.keywords = normalized.keywords;
  }

  return result;
}
