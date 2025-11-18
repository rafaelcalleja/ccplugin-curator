# Official Plugin Format (Claude Code)

**Version**: 1.0.0
**Last Updated**: 2025-11-14
**Source**: https://code.claude.com/docs/es/plugins-reference

Este documento describe el formato oficial de plugins de Claude Code. Es documentación de referencia externa.

---

## 1. Plugin Format (plugin.json)

### 1.1 PluginJson Schema (Claude Code)

From `.claude-plugin/plugin.json` - **all fields optional with defaults**.

```typescript
interface PluginJson {
  name?: string;                    // Default: directory basename
  commands?: string | string[];     // Default: "./commands/**/*.md" glob
  agents?: string | string[];       // Default: "./agents/**/*.md" glob
  skills?: string[];                // Default: "./skills/*/SKILL.md" parent dirs
  hooks?: string | object;          // Default: "./hooks/hooks.json" OR "./settings.json"
  mcpServers?: string | object;     // Default: "./.mcp.json"
}
```

### 1.2 Default Values

| Field | Omitted Value | Resolution |
|-------|---------------|------------|
| `name` | `undefined` | → `basename(pluginDir)` |
| `commands` | `undefined` | → `glob("./commands/**/*.md")` |
| `agents` | `undefined` | → `glob("./agents/**/*.md")` |
| `skills` | `undefined` | → `glob("./skills/*/SKILL.md") → parent dirs` |
| `hooks` | `undefined` | → `readFile("./hooks/hooks.json")` OR `"./settings.json"` |
| `mcpServers` | `undefined` | → `readFile("./.mcp.json")` |

### 1.3 Value Types

**String (path override)**:
```json
{ "commands": "./custom-commands" }  // → glob("./custom-commands/**/*.md")
```

**Array (explicit files)**:
```json
{ "commands": ["./cmd1.md", "./cmd2.md"] }  // → ["./cmd1.md", "./cmd2.md"]
```

---

## 2. Hooks Configuration Format

**Source**: https://code.claude.com/docs/es/hooks

### 2.1 Structure

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "script-path",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### 2.2 Fields

- **`matcher`**: Tool name pattern (optional, only for PreToolUse/PostToolUse/PreCompact/SessionStart)
- **`hooks`**: Array of hook actions
- **`type`**: Currently only `"command"` supported
- **`command`**: Script/command path
- **`timeout`**: Execution limit in seconds (default: 60)

### 2.3 Hook Script Requirements

Hook commands reference executable script files that must meet these requirements:

- **Executable permissions**: Scripts must have execute permission (`chmod +x script.sh`)
- **Directory structure**: Script files typically reside in `hooks/` directory at plugin root
- **Path resolution**: Use `${CLAUDE_PLUGIN_ROOT}` variable for portable plugin paths
- **Environment**: `CLAUDE_PLUGIN_ROOT` environment variable provides absolute path to plugin directory

### 2.4 Events

- `PreToolUse` (matcher: tool name)
- `PostToolUse` (matcher: tool name)
- `UserPromptSubmit`
- `Notification`
- `Stop`
- `SubagentStop`
- `PreCompact` (matcher: `manual`|`auto`)
- `SessionStart` (matcher: `startup`|`resume`|`clear`|`compact`)
- `SessionEnd`

### 2.5 Examples

**With matcher:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
          }
        ]
      }
    ]
  }
}
```

**Without matcher:**
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${PLUGIN_DIR}/hooks/stop-hook.ts"
          }
        ]
      }
    ]
  }
}
```

