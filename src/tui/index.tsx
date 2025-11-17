/**
 * TUI Entry Point
 *
 * Exports TUI components and render function.
 */

import React from 'react';
import { render } from 'ink';
import { App } from './App.js';
import type { NormalizedPluginFormatInternal } from '../types/normalized.js';
import type { TuiState } from './state.js';

export { App } from './App.js';
export * from './state.js';

/**
 * Render TUI and return control instance
 */
export function renderTui(
  plugins: NormalizedPluginFormatInternal[],
  onSave?: (state: TuiState) => void | Promise<void>
) {
  return render(<App plugins={plugins} onSave={onSave} />);
}
