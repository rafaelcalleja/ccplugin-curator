import { describe, it, expect } from 'vitest';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { save } from '../../dist/core/save/index.js';
import { normalizePlugin } from '../../dist/core/normalizer.js';
import { loadPlugin } from '../../dist/core/plugin-loader.js';
import { createInitialState, getSelection } from '../../dist/tui/state.js';

describe('Simple Save Test', () => {
  it('should work', async () => {
    const pluginDir = join(process.cwd(), 'tests/fixtures/test-plugin-a');
    const outputDir = join(process.cwd(), 'tests/output/simple-test');

    // Clean up
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true });
    }

    // Load and normalize
    const loaded = loadPlugin(pluginDir);
    const normalized = await normalizePlugin(loaded.data, pluginDir);

    // Create state and select items
    const state = createInitialState([normalized]);
    const selection = getSelection(state, normalized.name);
    selection.commands.add(normalized.commands[0]);

    // Save
    const result = await save(state, {
      outputDir,
      pluginName: 'simple-test',
    });

    // Check result
    console.log('Result:', JSON.stringify(result, null, 2));
    expect(result.success).toBe(true);
    expect(existsSync(outputDir)).toBe(true);

    // Clean up
    if (existsSync(outputDir)) {
      rmSync(outputDir, { recursive: true });
    }
  });
});
