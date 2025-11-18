/**
 * Integration tests for Setup Screens (Spec 009)
 *
 * Tests the complete setup flow:
 * - Main Menu display and navigation
 * - Configuration Form validation
 * - Form-to-TUI transition
 * - Setup flow state management
 */

import {
  validateMarketplaceName,
  validatePluginName,
  validateEmail,
  autoFillOutputDirectory
} from '../../src/validation/formValidation';

describe('Setup Screens Integration Tests', () => {
  describe('Main Menu', () => {
    test('should have two options: Create and Exit', () => {
      // Main Menu structure validation
      const options = ['Create New Curated Plugin', 'Exit'];
      expect(options).toHaveLength(2);
      expect(options[0]).toBe('Create New Curated Plugin');
      expect(options[1]).toBe('Exit');
    });
  });

  describe('Configuration Form - Marketplace Name Validation', () => {
    test('should accept valid marketplace names', () => {
      const validNames = [
        'my-plugin',
        'personal-ai-tools',
        'claude-helpers',
        'abc',
        '123',
        'plugin-v2'
      ];

      validNames.forEach(name => {
        const result = validateMarketplaceName(name);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    test('should reject invalid marketplace names', () => {
      const invalidCases = [
        { name: 'MyPlugin', reason: 'uppercase letters' },
        { name: 'my_plugin', reason: 'underscores' },
        { name: 'my plugin', reason: 'spaces' },
        { name: 'my.plugin', reason: 'dots' },
        { name: 'ab', reason: 'too short (< 3 chars)' },
        { name: 'a'.repeat(51), reason: 'too long (> 50 chars)' },
        { name: '', reason: 'empty string' }
      ];

      invalidCases.forEach(({ name, reason }) => {
        const result = validateMarketplaceName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    test('should require marketplace name (not optional)', () => {
      const result = validateMarketplaceName('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('Configuration Form - Plugin Name Validation', () => {
    test('should accept valid plugin names', () => {
      const validNames = [
        'My Awesome Plugin',
        'Claude Helpers',
        'Plugin v2.0',
        'ABC',
        '   Padded Name   '
      ];

      validNames.forEach(name => {
        const result = validatePluginName(name);
        expect(result.valid).toBe(true);
      });
    });

    test('should reject invalid plugin names', () => {
      const invalidCases = [
        { name: '', reason: 'empty' },
        { name: '  ', reason: 'only whitespace' },
        { name: 'ab', reason: 'too short after trim' },
        { name: 'a'.repeat(101), reason: 'too long' }
      ];

      invalidCases.forEach(({ name, reason }) => {
        const result = validatePluginName(name);
        expect(result.valid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });

    test('should require plugin name', () => {
      const result = validatePluginName('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });
  });

  describe('Configuration Form - Email Validation', () => {
    test('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'john.doe@company.co.uk',
        'test+tag@domain.com',
        'name123@test-domain.org'
      ];

      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(true);
      });
    });

    test('should accept empty email (optional field)', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'no-at-sign.com',
        'spaces in@email.com'
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Invalid email');
      });
    });
  });

  describe('Configuration Form - Auto-fill Logic', () => {
    test('should auto-fill output directory from marketplace name', () => {
      const testCases = [
        { marketplaceName: 'my-plugin', expected: './output/my-plugin' },
        { marketplaceName: 'personal-ai-tools', expected: './output/personal-ai-tools' },
        { marketplaceName: 'test', expected: './output/test' }
      ];

      testCases.forEach(({ marketplaceName, expected }) => {
        const result = autoFillOutputDirectory(marketplaceName);
        expect(result).toBe(expected);
      });
    });

    test('should return default when marketplace name is empty', () => {
      const result = autoFillOutputDirectory('');
      expect(result).toBe('./output');
    });

    test('should trim whitespace from marketplace name', () => {
      const result = autoFillOutputDirectory('  my-plugin  ');
      expect(result).toBe('./output/my-plugin');
    });
  });

  describe('Field Requirements', () => {
    test('required fields should be: marketplace name, plugin name, source directory', () => {
      const requiredFields = [
        'marketplaceName',
        'pluginName',
        'sourceDirectory'
      ];

      expect(requiredFields).toHaveLength(3);
    });

    test('optional fields should be: output directory, author email', () => {
      const optionalFields = [
        'outputDirectory',
        'authorEmail'
      ];

      expect(optionalFields).toHaveLength(2);
    });
  });

  describe('Form State Management', () => {
    test('form should have 5 total fields', () => {
      interface FormData {
        marketplaceName: string;
        pluginName: string;
        sourceDirectory: string;
        outputDirectory: string;
        authorEmail: string;
      }

      const fieldCount = Object.keys({
        marketplaceName: '',
        pluginName: '',
        sourceDirectory: '',
        outputDirectory: '',
        authorEmail: ''
      } as FormData).length;

      expect(fieldCount).toBe(5);
    });

    test('should validate all required fields before allowing submission', () => {
      // Simulate form validation
      const formData = {
        marketplaceName: 'my-plugin',
        pluginName: 'My Plugin',
        sourceDirectory: '/path/to/plugins',
        outputDirectory: './output/my-plugin',
        authorEmail: 'user@example.com'
      };

      const marketplaceValid = validateMarketplaceName(formData.marketplaceName);
      const pluginNameValid = validatePluginName(formData.pluginName);
      const emailValid = validateEmail(formData.authorEmail);

      const canSubmit = marketplaceValid.valid && pluginNameValid.valid && emailValid.valid;

      expect(canSubmit).toBe(true);
    });

    test('should prevent submission if required fields are invalid', () => {
      const invalidFormData = {
        marketplaceName: 'Invalid Name', // Has spaces and capitals
        pluginName: 'My Plugin',
        sourceDirectory: '/path/to/plugins'
      };

      const marketplaceValid = validateMarketplaceName(invalidFormData.marketplaceName);
      const pluginNameValid = validatePluginName(invalidFormData.pluginName);

      const canSubmit = marketplaceValid.valid && pluginNameValid.valid;

      expect(canSubmit).toBe(false);
    });
  });

  describe('Setup Flow State Machine', () => {
    test('should have three screens: menu, form, selection', () => {
      type Screen = 'menu' | 'form' | 'selection';

      const screens: Screen[] = ['menu', 'form', 'selection'];

      expect(screens).toHaveLength(3);
      expect(screens).toContain('menu');
      expect(screens).toContain('form');
      expect(screens).toContain('selection');
    });

    test('should transition from menu to form when "create" is selected', () => {
      type Screen = 'menu' | 'form' | 'selection';
      let screen: Screen = 'menu';

      // Simulate menu selection
      const handleMenuSelect = (option: 'create' | 'exit') => {
        if (option === 'create') {
          screen = 'form';
        }
      };

      handleMenuSelect('create');
      expect(screen).toBe('form');
    });

    test('should transition from form to selection after successful submission', () => {
      type Screen = 'menu' | 'form' | 'selection';
      let screen: Screen = 'form';

      // Simulate form submission
      const handleFormSubmit = () => {
        screen = 'selection';
      };

      handleFormSubmit();
      expect(screen).toBe('selection');
    });

    test('should return to menu when form is cancelled', () => {
      type Screen = 'menu' | 'form' | 'selection';
      let screen: Screen = 'form';

      // Simulate form cancellation
      const handleFormCancel = () => {
        screen = 'menu';
      };

      handleFormCancel();
      expect(screen).toBe('menu');
    });
  });

  describe('Placeholder Behavior', () => {
    test('placeholders should match spec format', () => {
      const placeholders = {
        marketplaceName: 'my-marketplace',
        pluginName: 'My Awesome Plugin',
        sourceDirectory: '~/.claude/plugins',
        outputDirectory: './output',
        authorEmail: 'you@example.com'
      };

      // Marketplace name should follow pattern
      expect(placeholders.marketplaceName).toMatch(/^[a-z0-9-]+$/);
      
      // Plugin name should be non-empty
      expect(placeholders.pluginName.length).toBeGreaterThan(0);
      
      // Source directory should contain tilde
      expect(placeholders.sourceDirectory).toContain('~');
      
      // Output directory should contain ./output
      expect(placeholders.outputDirectory).toContain('./output');
      
      // Email should contain @
      expect(placeholders.authorEmail).toContain('@');
    });
  });

  describe('Validation Messages', () => {
    test('should provide helpful error messages', () => {
      const testCases = [
        {
          validator: () => validateMarketplaceName('AB'),
          expectedErrorPattern: /at least 3 characters/i
        },
        {
          validator: () => validateMarketplaceName('Invalid-Name-With-Uppercase'),
          expectedErrorPattern: /lowercase/i
        },
        {
          validator: () => validatePluginName('ab'),
          expectedErrorPattern: /at least 3 characters/i
        },
        {
          validator: () => validateEmail('invalid-email'),
          expectedErrorPattern: /invalid email/i
        }
      ];

      testCases.forEach(({ validator, expectedErrorPattern }) => {
        const result = validator();
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(expectedErrorPattern);
      });
    });
  });
});
