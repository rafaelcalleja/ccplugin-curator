/**
 * Save Validator
 *
 * Validates that the selection is valid before saving.
 *
 * Spec: docs/spec/007-save-operation-rules.md (Section 6, 7.1)
 */

import type { TuiState } from '../../tui/state.js';
import { getTotalSelectionCount } from '../../tui/state.js';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate selection before save
 *
 * Rules:
 * - Selection must not be empty
 *
 * @param state - TUI state with selections
 * @returns Validation result
 */
export function validateSave(state: TuiState): ValidationResult {
  const errors: string[] = [];

  // Check if selection is empty
  const totalCount = getTotalSelectionCount(state);
  if (totalCount === 0) {
    errors.push('No components selected. Please select at least one component.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
