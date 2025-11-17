import { describe, it, expect } from 'vitest';
import { transformMcps } from '../../../../src/transformers/reverse/mcps.js';
import type { NormalizedMcp } from '../../../../src/types/normalized.js';

describe('transformMcps', () => {
  it('should return undefined for empty array', () => {
    const mcps: NormalizedMcp[] = [];
    const result = transformMcps(mcps);
    expect(result).toBeUndefined();
  });

  it('should transform single MCP', () => {
    const mcps: NormalizedMcp[] = [
      {
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
      },
    ];

    const result = transformMcps(mcps);

    expect(result).toEqual({
      'test-server': {
        command: 'node',
        args: ['server.js'],
      },
    });
  });

  it('should transform MCP with env variables', () => {
    const mcps: NormalizedMcp[] = [
      {
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
        env: {
          PORT: '3000',
          NODE_ENV: 'production',
        },
      },
    ];

    const result = transformMcps(mcps);

    expect(result).toEqual({
      'test-server': {
        command: 'node',
        args: ['server.js'],
        env: {
          PORT: '3000',
          NODE_ENV: 'production',
        },
      },
    });
  });

  it('should transform multiple MCPs', () => {
    const mcps: NormalizedMcp[] = [
      {
        name: 'server-a',
        command: 'node',
        args: ['a.js'],
      },
      {
        name: 'server-b',
        command: 'python',
        args: ['b.py'],
        env: { DEBUG: 'true' },
      },
    ];

    const result = transformMcps(mcps);

    expect(result).toEqual({
      'server-a': {
        command: 'node',
        args: ['a.js'],
      },
      'server-b': {
        command: 'python',
        args: ['b.py'],
        env: { DEBUG: 'true' },
      },
    });
  });

  it('should not include name field in output object', () => {
    const mcps: NormalizedMcp[] = [
      {
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
      },
    ];

    const result = transformMcps(mcps);

    expect(result?.['test-server']).not.toHaveProperty('name');
  });
});
