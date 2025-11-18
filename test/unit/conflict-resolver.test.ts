import { describe, it, expect } from 'vitest';
import {
  resolveCommandConflicts,
  resolveAgentConflicts,
  resolveSkillConflicts,
  resolveMcpConflicts,
  mergeHooksByEvent,
  resolveHookScriptConflicts,
  getHookScriptPath,
  ComponentSelection,
  HookSelection,
  McpSelection
} from '../../src/lib/conflict-resolver';

describe('Conflict Resolver', () => {
  describe('resolveCommandConflicts', () => {
    it('should not rename when no conflicts', () => {
      const commands: ComponentSelection[] = [
        {
          pluginName: 'plugin-a',
          sourcePath: '/path/to/plugin-a',
          relPath: 'commands/test.md'
        },
        {
          pluginName: 'plugin-b',
          sourcePath: '/path/to/plugin-b',
          relPath: 'commands/other.md'
        }
      ];

      const resolved = resolveCommandConflicts(commands);

      expect(resolved[0].destPath).toBe('commands/test.md');
      expect(resolved[0].wasRenamed).toBe(false);
      expect(resolved[1].destPath).toBe('commands/other.md');
      expect(resolved[1].wasRenamed).toBe(false);
    });

    it('should rename when filenames conflict', () => {
      const commands: ComponentSelection[] = [
        {
          pluginName: 'plugin-a',
          sourcePath: '/path/to/plugin-a',
          relPath: 'commands/test.md'
        },
        {
          pluginName: 'plugin-b',
          sourcePath: '/path/to/plugin-b',
          relPath: 'commands/test.md'
        }
      ];

      const resolved = resolveCommandConflicts(commands);

      expect(resolved[0].destPath).toBe('commands/plugin-a--test.md');
      expect(resolved[0].wasRenamed).toBe(true);
      expect(resolved[1].destPath).toBe('commands/plugin-b--test.md');
      expect(resolved[1].wasRenamed).toBe(true);
    });

    it('should handle subdirectories correctly', () => {
      const commands: ComponentSelection[] = [
        {
          pluginName: 'plugin-a',
          sourcePath: '/path/to/plugin-a',
          relPath: 'commands/sub/test.md'
        },
        {
          pluginName: 'plugin-b',
          sourcePath: '/path/to/plugin-b',
          relPath: 'commands/other/test.md'
        }
      ];

      const resolved = resolveCommandConflicts(commands);

      expect(resolved[0].destPath).toBe('commands/sub/plugin-a--test.md');
      expect(resolved[0].wasRenamed).toBe(true);
      expect(resolved[1].destPath).toBe('commands/other/plugin-b--test.md');
      expect(resolved[1].wasRenamed).toBe(true);
    });

    it('should preserve file extensions', () => {
      const commands: ComponentSelection[] = [
        {
          pluginName: 'plugin-a',
          sourcePath: '/path/to/plugin-a',
          relPath: 'commands/test.md'
        },
        {
          pluginName: 'plugin-b',
          sourcePath: '/path/to/plugin-b',
          relPath: 'commands/test.md'
        }
      ];

      const resolved = resolveCommandConflicts(commands);

      expect(resolved[0].destPath).toMatch(/\.md$/);
      expect(resolved[1].destPath).toMatch(/\.md$/);
    });
  });

  describe('resolveAgentConflicts', () => {
    it('should not rename when no conflicts', () => {
      const agents: ComponentSelection[] = [
        {
          pluginName: 'plugin-a',
          sourcePath: '/path/to/plugin-a',
          relPath: 'agents/agent1.md'
        },
        {
          pluginName: 'plugin-b',
          sourcePath: '/path/to/plugin-b',
          relPath: 'agents/agent2.md'
        }
      ];

      const resolved = resolveAgentConflicts(agents);

      expect(resolved[0].destPath).toBe('agents/agent1.md');
      expect(resolved[0].wasRenamed).toBe(false);
      expect(resolved[1].destPath).toBe('agents/agent2.md');
      expect(resolved[1].wasRenamed).toBe(false);
    });

    it('should rename when filenames conflict', () => {
      const agents: ComponentSelection[] = [
        {
          pluginName: 'plugin-a',
          sourcePath: '/path/to/plugin-a',
          relPath: 'agents/helper.md'
        },
        {
          pluginName: 'plugin-b',
          sourcePath: '/path/to/plugin-b',
          relPath: 'agents/helper.md'
        }
      ];

      const resolved = resolveAgentConflicts(agents);

      expect(resolved[0].destPath).toBe('agents/plugin-a--helper.md');
      expect(resolved[0].wasRenamed).toBe(true);
      expect(resolved[1].destPath).toBe('agents/plugin-b--helper.md');
      expect(resolved[1].wasRenamed).toBe(true);
    });
  });

  describe('resolveSkillConflicts', () => {
    it('should not rename when no conflicts', () => {
      const skills: ComponentSelection[] = [
        {
          pluginName: 'plugin-a',
          sourcePath: '/path/to/plugin-a',
          relPath: 'skills/skill-one'
        },
        {
          pluginName: 'plugin-b',
          sourcePath: '/path/to/plugin-b',
          relPath: 'skills/skill-two'
        }
      ];

      const resolved = resolveSkillConflicts(skills);

      expect(resolved[0].destPath).toBe('skills/skill-one');
      expect(resolved[0].wasRenamed).toBe(false);
      expect(resolved[1].destPath).toBe('skills/skill-two');
      expect(resolved[1].wasRenamed).toBe(false);
    });

    it('should rename when directory names conflict', () => {
      const skills: ComponentSelection[] = [
        {
          pluginName: 'plugin-a',
          sourcePath: '/path/to/plugin-a',
          relPath: 'skills/helper'
        },
        {
          pluginName: 'plugin-b',
          sourcePath: '/path/to/plugin-b',
          relPath: 'skills/helper'
        }
      ];

      const resolved = resolveSkillConflicts(skills);

      expect(resolved[0].destPath).toBe('skills/plugin-a--helper');
      expect(resolved[0].wasRenamed).toBe(true);
      expect(resolved[1].destPath).toBe('skills/plugin-b--helper');
      expect(resolved[1].wasRenamed).toBe(true);
    });

    it('should handle nested skill directories', () => {
      const skills: ComponentSelection[] = [
        {
          pluginName: 'plugin-a',
          sourcePath: '/path/to/plugin-a',
          relPath: 'skills/category/helper'
        },
        {
          pluginName: 'plugin-b',
          sourcePath: '/path/to/plugin-b',
          relPath: 'skills/other/helper'
        }
      ];

      const resolved = resolveSkillConflicts(skills);

      expect(resolved[0].destPath).toBe('skills/category/plugin-a--helper');
      expect(resolved[0].wasRenamed).toBe(true);
      expect(resolved[1].destPath).toBe('skills/other/plugin-b--helper');
      expect(resolved[1].wasRenamed).toBe(true);
    });
  });

  describe('resolveMcpConflicts', () => {
    it('should not rename when no conflicts', () => {
      const mcps: McpSelection[] = [
        {
          pluginName: 'plugin-a',
          name: 'server-one',
          command: 'node',
          args: ['index.js']
        },
        {
          pluginName: 'plugin-b',
          name: 'server-two',
          command: 'python',
          args: ['server.py']
        }
      ];

      const resolved = resolveMcpConflicts(mcps);

      expect(resolved[0].name).toBe('server-one');
      expect(resolved[1].name).toBe('server-two');
    });

    it('should rename when MCP names conflict', () => {
      const mcps: McpSelection[] = [
        {
          pluginName: 'plugin-a',
          name: 'my-server',
          command: 'node',
          args: ['index.js']
        },
        {
          pluginName: 'plugin-b',
          name: 'my-server',
          command: 'python',
          args: ['server.py']
        }
      ];

      const resolved = resolveMcpConflicts(mcps);

      expect(resolved[0].name).toBe('plugin-a--my-server');
      expect(resolved[1].name).toBe('plugin-b--my-server');
    });

    it('should preserve other MCP properties', () => {
      const mcps: McpSelection[] = [
        {
          pluginName: 'plugin-a',
          name: 'server',
          command: 'node',
          args: ['index.js'],
          env: { PORT: '3000' }
        },
        {
          pluginName: 'plugin-b',
          name: 'server',
          command: 'python',
          args: ['server.py'],
          env: { HOST: 'localhost' }
        }
      ];

      const resolved = resolveMcpConflicts(mcps);

      expect(resolved[0].command).toBe('node');
      expect(resolved[0].args).toEqual(['index.js']);
      expect(resolved[0].env).toEqual({ PORT: '3000' });
      expect(resolved[1].command).toBe('python');
      expect(resolved[1].args).toEqual(['server.py']);
      expect(resolved[1].env).toEqual({ HOST: 'localhost' });
    });
  });

  describe('mergeHooksByEvent', () => {
    it('should preserve all hooks', () => {
      const hooks: HookSelection[] = [
        {
          pluginName: 'plugin-a',
          event: 'session-start',
          type: 'command',
          command: 'init.sh'
        },
        {
          pluginName: 'plugin-b',
          event: 'session-start',
          type: 'command',
          command: 'setup.sh'
        },
        {
          pluginName: 'plugin-a',
          event: 'tool-call',
          type: 'command',
          command: 'validate.sh'
        }
      ];

      const merged = mergeHooksByEvent(hooks);

      expect(merged).toHaveLength(3);
      expect(merged).toEqual(hooks);
    });

    it('should preserve hook order', () => {
      const hooks: HookSelection[] = [
        {
          pluginName: 'plugin-a',
          event: 'session-start',
          type: 'command',
          command: 'first.sh'
        },
        {
          pluginName: 'plugin-b',
          event: 'session-start',
          type: 'command',
          command: 'second.sh'
        }
      ];

      const merged = mergeHooksByEvent(hooks);

      expect(merged[0].command).toBe('first.sh');
      expect(merged[1].command).toBe('second.sh');
    });
  });

  describe('resolveHookScriptConflicts', () => {
    it('should not rename when no conflicts', () => {
      const hooks: HookSelection[] = [
        {
          pluginName: 'plugin-a',
          event: 'session-start',
          type: 'command',
          command: 'hooks/init.sh'
        },
        {
          pluginName: 'plugin-b',
          event: 'session-start',
          type: 'command',
          command: 'hooks/setup.sh'
        }
      ];

      const resolved = resolveHookScriptConflicts(hooks);

      expect(resolved[0].command).toBe('hooks/init.sh');
      expect(resolved[1].command).toBe('hooks/setup.sh');
    });

    it('should rename when script paths conflict', () => {
      const hooks: HookSelection[] = [
        {
          pluginName: 'plugin-a',
          event: 'session-start',
          type: 'command',
          command: 'hooks/init.sh'
        },
        {
          pluginName: 'plugin-b',
          event: 'tool-call',
          type: 'command',
          command: 'hooks/init.sh'
        }
      ];

      const resolved = resolveHookScriptConflicts(hooks);

      expect(resolved[0].command).toBe('hooks/plugin-a--init.sh');
      expect(resolved[1].command).toBe('hooks/plugin-b--init.sh');
    });

    it('should not rename system commands', () => {
      const hooks: HookSelection[] = [
        {
          pluginName: 'plugin-a',
          event: 'session-start',
          type: 'command',
          command: 'npx vitest'
        },
        {
          pluginName: 'plugin-b',
          event: 'session-start',
          type: 'command',
          command: 'node index.js'
        },
        {
          pluginName: 'plugin-c',
          event: 'session-start',
          type: 'command',
          command: '/usr/bin/python'
        }
      ];

      const resolved = resolveHookScriptConflicts(hooks);

      expect(resolved[0].command).toBe('npx vitest');
      expect(resolved[1].command).toBe('node index.js');
      expect(resolved[2].command).toBe('/usr/bin/python');
    });

    it('should handle ${CLAUDE_PLUGIN_ROOT}/ prefix', () => {
      const hooks: HookSelection[] = [
        {
          pluginName: 'plugin-a',
          event: 'session-start',
          type: 'command',
          command: '${CLAUDE_PLUGIN_ROOT}/hooks/init.sh'
        },
        {
          pluginName: 'plugin-b',
          event: 'session-start',
          type: 'command',
          command: '${CLAUDE_PLUGIN_ROOT}/hooks/init.sh'
        }
      ];

      const resolved = resolveHookScriptConflicts(hooks);

      expect(resolved[0].command).toBe('hooks/plugin-a--init.sh');
      expect(resolved[1].command).toBe('hooks/plugin-b--init.sh');
    });

    it('should preserve matcher and timeout', () => {
      const hooks: HookSelection[] = [
        {
          pluginName: 'plugin-a',
          event: 'tool-call',
          type: 'command',
          command: 'hooks/validate.sh',
          matcher: '*.ts',
          timeout: 5000
        },
        {
          pluginName: 'plugin-b',
          event: 'tool-call',
          type: 'command',
          command: 'hooks/validate.sh',
          matcher: '*.js',
          timeout: 3000
        }
      ];

      const resolved = resolveHookScriptConflicts(hooks);

      expect(resolved[0].matcher).toBe('*.ts');
      expect(resolved[0].timeout).toBe(5000);
      expect(resolved[1].matcher).toBe('*.js');
      expect(resolved[1].timeout).toBe(3000);
    });
  });

  describe('getHookScriptPath', () => {
    it('should return null for empty command', () => {
      expect(getHookScriptPath('')).toBeNull();
    });

    it('should return null for system commands', () => {
      expect(getHookScriptPath('npx vitest')).toBeNull();
      expect(getHookScriptPath('node index.js')).toBeNull();
      expect(getHookScriptPath('/usr/bin/python')).toBeNull();
    });

    it('should return path for local scripts', () => {
      expect(getHookScriptPath('hooks/init.sh')).toBe('hooks/init.sh');
      expect(getHookScriptPath('scripts/setup.sh')).toBe('scripts/setup.sh');
    });

    it('should remove ${CLAUDE_PLUGIN_ROOT}/ prefix', () => {
      expect(getHookScriptPath('${CLAUDE_PLUGIN_ROOT}/hooks/init.sh'))
        .toBe('hooks/init.sh');
      expect(getHookScriptPath('${CLAUDE_PLUGIN_ROOT}/scripts/test.sh'))
        .toBe('scripts/test.sh');
    });
  });
});
