/**
 * Integration Test: Edge Cases
 * Implements: docs/spec/008-integration-test-spec.md (edge cases scenario)
 */

import { describe, test, expect, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { saveSelection } from '../../src/core/save';
import type { NormalizedPlugin } from '../../src/types/normalized';

describe('Edge Cases', () => {
  const outputDir = path.join(__dirname, '../../test-output-edge');

  afterAll(() => {
    // Cleanup test output
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  test('save with no selection shows warning', async () => {
    const emptySelection: NormalizedPlugin = {
      name: 'empty-plugin',
      source: '/tmp/empty',
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
    };

    const result = await saveSelection(emptySelection, {
      outputDir,
      pluginName: 'empty',
      overwrite: true,
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain('No hay componentes seleccionados');
  });

  test('output directory exists requires overwrite option', async () => {
    // Create a selection with at least one component
    const selection: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/tmp/test',
      version: '1.0.0',
      description: 'Test',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/test.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    // First save to create directory
    const firstResult = await saveSelection(selection, {
      outputDir,
      pluginName: 'test',
      overwrite: true,
    });
    expect(firstResult.success).toBe(true);

    // Second save without overwrite should fail
    const secondResult = await saveSelection(selection, {
      outputDir,
      pluginName: 'test',
      overwrite: false,
    });

    expect(secondResult.success).toBe(false);
    expect(secondResult.message).toContain('Output directory exists');
  });

  test('output directory exists with overwrite option succeeds', async () => {
    const selection: NormalizedPlugin = {
      name: 'test-plugin',
      source: '/tmp/test',
      version: '1.0.0',
      description: 'Test',
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: '',
      keywords: [],
      commands: ['commands/test.md'],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };

    // First save
    await saveSelection(selection, {
      outputDir,
      pluginName: 'test2',
      overwrite: true,
    });

    // Second save with overwrite should succeed
    const result = await saveSelection(selection, {
      outputDir,
      pluginName: 'test2',
      overwrite: true,
    });

    expect(result.success).toBe(true);
  });
});
