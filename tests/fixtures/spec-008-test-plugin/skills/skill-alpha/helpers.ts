/**
 * Helper utilities for Skill Alpha
 */

export function processData(input: string): string {
  return input.toUpperCase();
}

export function validateInput(input: string): boolean {
  return input.length > 0;
}
