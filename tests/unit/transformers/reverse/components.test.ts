import { describe, it, expect } from 'vitest';
import { transformCommands, transformAgents, transformSkills } from '../../../../src/transformers/reverse/components.js';

describe('transformCommands', () => {
  it('should return undefined for empty array', () => {
    const result = transformCommands([]);
    expect(result).toBeUndefined();
  });

  it('should transform single command', () => {
    const result = transformCommands(['./commands/build.md']);
    expect(result).toEqual(['./commands/build.md']);
  });

  it('should transform multiple commands', () => {
    const result = transformCommands(['./commands/build.md', './commands/test.md']);
    expect(result).toEqual(['./commands/build.md', './commands/test.md']);
  });
});

describe('transformAgents', () => {
  it('should return undefined for empty array', () => {
    const result = transformAgents([]);
    expect(result).toBeUndefined();
  });

  it('should transform single agent', () => {
    const result = transformAgents(['./agents/coder.md']);
    expect(result).toEqual(['./agents/coder.md']);
  });

  it('should transform multiple agents', () => {
    const result = transformAgents(['./agents/coder.md', './agents/reviewer.md']);
    expect(result).toEqual(['./agents/coder.md', './agents/reviewer.md']);
  });
});

describe('transformSkills', () => {
  it('should return undefined for empty array', () => {
    const result = transformSkills([]);
    expect(result).toBeUndefined();
  });

  it('should transform single skill', () => {
    const result = transformSkills(['./skills/hello-skill']);
    expect(result).toEqual(['./skills/hello-skill']);
  });

  it('should transform multiple skills', () => {
    const result = transformSkills(['./skills/hello-skill', './skills/goodbye-skill']);
    expect(result).toEqual(['./skills/hello-skill', './skills/goodbye-skill']);
  });
});
