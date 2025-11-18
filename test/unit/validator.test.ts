import { describe, it, expect } from 'vitest';
import { validateMarketplaceName, validateEmail } from '../../src/lib/validator';

describe('Validator', () => {
  describe('validateMarketplaceName', () => {
    it('should accept valid kebab-case names', () => {
      expect(validateMarketplaceName('my-plugin')).toBe(true);
      expect(validateMarketplaceName('test-123')).toBe(true);
      expect(validateMarketplaceName('abc')).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(validateMarketplaceName('ab')).toBe(false); // too short
      expect(validateMarketplaceName('My-Plugin')).toBe(false); // uppercase
      expect(validateMarketplaceName('my_plugin')).toBe(false); // underscore
      expect(validateMarketplaceName('my plugin')).toBe(false); // space
    });
  });

  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
  });
});
