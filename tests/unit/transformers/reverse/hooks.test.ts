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
        type: 'shell',
        command: 'echo "Hello"',
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      SessionStart: [
        {
          hooks: [
            {
              type: 'shell',
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
        type: 'shell',
        command: 'echo "Before Bash"',
        matcher: {
          toolName: 'Bash',
        },
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      PreToolUse: [
        {
          matcher: {
            toolName: 'Bash',
          },
          hooks: [
            {
              type: 'shell',
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
        type: 'shell',
        command: 'echo "First"',
      },
      {
        event: 'SessionStart',
        type: 'shell',
        command: 'echo "Second"',
      },
      {
        event: 'SessionEnd',
        type: 'shell',
        command: 'echo "End"',
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      SessionStart: [
        {
          hooks: [
            {
              type: 'shell',
              command: 'echo "First"',
            },
            {
              type: 'shell',
              command: 'echo "Second"',
            },
          ],
        },
      ],
      SessionEnd: [
        {
          hooks: [
            {
              type: 'shell',
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
        type: 'shell',
        command: 'echo "Bash hook"',
        matcher: {
          toolName: 'Bash',
        },
      },
      {
        event: 'PreToolUse',
        type: 'shell',
        command: 'echo "Read hook"',
        matcher: {
          toolName: 'Read',
        },
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      PreToolUse: [
        {
          matcher: {
            toolName: 'Bash',
          },
          hooks: [
            {
              type: 'shell',
              command: 'echo "Bash hook"',
            },
          ],
        },
        {
          matcher: {
            toolName: 'Read',
          },
          hooks: [
            {
              type: 'shell',
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
        type: 'shell',
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
              type: 'shell',
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
        type: 'shell',
        command: 'echo "Start 1"',
      },
      {
        event: 'SessionStart',
        type: 'shell',
        command: 'echo "Start 2"',
      },
      {
        event: 'PreToolUse',
        type: 'shell',
        command: 'echo "Bash"',
        matcher: { toolName: 'Bash' },
      },
      {
        event: 'PreToolUse',
        type: 'shell',
        command: 'echo "Bash 2"',
        matcher: { toolName: 'Bash' },
      },
      {
        event: 'PostToolUse',
        type: 'shell',
        command: 'echo "After"',
        matcher: { toolName: 'Write' },
      },
    ];

    const result = transformHooks(hooks);

    expect(result).toEqual({
      SessionStart: [
        {
          hooks: [
            { type: 'shell', command: 'echo "Start 1"' },
            { type: 'shell', command: 'echo "Start 2"' },
          ],
        },
      ],
      PreToolUse: [
        {
          matcher: { toolName: 'Bash' },
          hooks: [
            { type: 'shell', command: 'echo "Bash"' },
            { type: 'shell', command: 'echo "Bash 2"' },
          ],
        },
      ],
      PostToolUse: [
        {
          matcher: { toolName: 'Write' },
          hooks: [{ type: 'shell', command: 'echo "After"' }],
        },
      ],
    });
  });
});
