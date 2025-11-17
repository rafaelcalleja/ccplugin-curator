import { describe, it, expect } from 'vitest';
import { transformHooks } from '../../../../src/transformers/reverse/hooks.js';
import type { NormalizedHook } from '../../../../src/types/normalized.js';

describe('transformHooks', () => {
  it('should return undefined for empty array', () => {
    const hooks: NormalizedHook[] = [];
    const result = transformHooks(hooks);
    expect(result).toBeUndefined();
  });

  it('should transform single hook without matcher', () => {
    const hooks: NormalizedHook[] = [
      {
        event: 'SessionStart',
        type: 'command',
        command: 'echo "Hello"',
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      SessionStart: [
        {
          hooks: [
            {
              type: 'command',
              command: 'echo "Hello"',
            },
          ],
        },
      ],
    });
  });

  it('should transform hook with matcher', () => {
    const hooks: NormalizedHook[] = [
      {
        event: 'PreToolUse',
        type: 'command',
        command: 'echo "Before Bash"',
        matcher: 'Bash',
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      PreToolUse: [
        {
          matcher: 'Bash',
          hooks: [
            {
              type: 'command',
              command: 'echo "Before Bash"',
            },
          ],
        },
      ],
    });
  });

  it('should group hooks by event and matcher', () => {
    const hooks: NormalizedHook[] = [
      {
        event: 'SessionStart',
        type: 'command',
        command: 'echo "First"',
      },
      {
        event: 'SessionStart',
        type: 'command',
        command: 'echo "Second"',
      },
      {
        event: 'SessionEnd',
        type: 'command',
        command: 'echo "End"',
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      SessionStart: [
        {
          hooks: [
            {
              type: 'command',
              command: 'echo "First"',
            },
            {
              type: 'command',
              command: 'echo "Second"',
            },
          ],
        },
      ],
      SessionEnd: [
        {
          hooks: [
            {
              type: 'command',
              command: 'echo "End"',
            },
          ],
        },
      ],
    });
  });

  it('should create separate groups for different matchers', () => {
    const hooks: NormalizedHook[] = [
      {
        event: 'PreToolUse',
        type: 'command',
        command: 'echo "Bash hook"',
        matcher: 'Bash',
      },
      {
        event: 'PreToolUse',
        type: 'command',
        command: 'echo "Read hook"',
        matcher: 'Read',
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      PreToolUse: [
        {
          matcher: 'Bash',
          hooks: [
            {
              type: 'command',
              command: 'echo "Bash hook"',
            },
          ],
        },
        {
          matcher: 'Read',
          hooks: [
            {
              type: 'command',
              command: 'echo "Read hook"',
            },
          ],
        },
      ],
    });
  });

  it('should preserve all hook properties except event and matcher', () => {
    const hooks: NormalizedHook[] = [
      {
        event: 'SessionStart',
        type: 'command',
        command: 'npm install',
        description: 'Install dependencies',
        continueOnError: true,
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      SessionStart: [
        {
          hooks: [
            {
              type: 'command',
              command: 'npm install',
              description: 'Install dependencies',
              continueOnError: true,
            },
          ],
        },
      ],
    });
  });

  it('should handle complex scenario with multiple events and matchers', () => {
    const hooks: NormalizedHook[] = [
      {
        event: 'SessionStart',
        type: 'command',
        command: 'echo "Start 1"',
      },
      {
        event: 'SessionStart',
        type: 'command',
        command: 'echo "Start 2"',
      },
      {
        event: 'PreToolUse',
        type: 'command',
        command: 'echo "Bash"',
        matcher: 'Bash',
      },
      {
        event: 'PreToolUse',
        type: 'command',
        command: 'echo "Bash 2"',
        matcher: 'Bash',
      },
      {
        event: 'PostToolUse',
        type: 'command',
        command: 'echo "After"',
        matcher: 'Write',
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      SessionStart: [
        {
          hooks: [
            { type: 'command', command: 'echo "Start 1"' },
            { type: 'command', command: 'echo "Start 2"' },
          ],
        },
      ],
      PreToolUse: [
        {
          matcher: 'Bash',
          hooks: [
            { type: 'command', command: 'echo "Bash"' },
            { type: 'command', command: 'echo "Bash 2"' },
          ],
        },
      ],
      PostToolUse: [
        {
          matcher: 'Write',
          hooks: [{ type: 'command', command: 'echo "After"' }],
        },
      ],
    });
  });
});
