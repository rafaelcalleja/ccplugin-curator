import { validateOfficial, validateNormalized } from '../../../src/validator/validate';

describe('validator', () => {
  describe('validateOfficial', () => {
    test('should validate valid official plugin format', () => {
      const validPlugin = {
        name: 'test-plugin',
        commands: ['./commands/test.md'],
        agents: ['./agents/test.md']
      };

      const result = validateOfficial(validPlugin);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('should allow minimal plugin with only name', () => {
      const minimalPlugin = {
        name: 'minimal'
      };

      const result = validateOfficial(minimalPlugin);
      expect(result.valid).toBe(true);
    });

    test('should allow hooks as string path', () => {
      const plugin = {
        name: 'test',
        hooks: './hooks/hooks.json'
      };

      const result = validateOfficial(plugin);
      expect(result.valid).toBe(true);
    });

    test('should allow hooks as inline object', () => {
      const plugin = {
        name: 'test',
        hooks: {
          hooks: {
            SessionStart: [
              {
                hooks: [
                  { type: 'command' as const, command: '/test.sh' }
                ]
              }
            ]
          }
        }
      };

      const result = validateOfficial(plugin);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateNormalized', () => {
    test('should validate valid normalized plugin format', () => {
      const validNormalized = {
        name: 'test-plugin',
        source: '/test/path',
        version: '1.0.0',
        description: 'Test',
        author: { name: 'Test', email: 'test@example.com', url: 'https://example.com' },
        homepage: 'https://example.com',
        repository: 'https://github.com/test/test',
        license: 'MIT',
        keywords: ['test'],
        commands: ['commands/test.md'],
        agents: ['agents/test.md'],
        skills: ['skills/test'],
        hooks: [],
        mcps: []
      };

      const result = validateNormalized(validNormalized);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    test('should require all fields in normalized format', () => {
      const incomplete = {
        name: 'test',
        source: '/test'
        // Missing required fields
      };

      const result = validateNormalized(incomplete);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    test('should validate hooks array structure', () => {
      const withHooks = {
        name: 'test',
        source: '/test',
        version: '1.0.0',
        description: '',
        author: { name: '', email: '', url: '' },
        homepage: '',
        repository: '',
        license: '',
        keywords: [],
        commands: [],
        agents: [],
        skills: [],
        hooks: [
          {
            event: 'SessionStart',
            type: 'command' as const,
            command: '/test.sh'
          }
        ],
        mcps: []
      };

      const result = validateNormalized(withHooks);
      expect(result.valid).toBe(true);
    });

    test('should validate mcps array structure', () => {
      const withMcps = {
        name: 'test',
        source: '/test',
        version: '1.0.0',
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
        mcps: [
          {
            name: 'test-server',
            command: 'npx',
            args: ['-y', 'test-server']
          }
        ]
      };

      const result = validateNormalized(withMcps);
      expect(result.valid).toBe(true);
    });
  });
});
