# Transformation Rules (Official → Normalized)

**Version**: 1.0.0
**Last Updated**: 2025-11-15
**Purpose**: Define how to transform Claude Code official plugin format to our internal normalized format

Este documento describe cómo transformar plugins desde el formato oficial de Claude Code al formato normalizado utilizado internamente por el TUI.

---

## 1. Field Mapping

| Official Format | Normalized Format | Transformation |
|-----------------|-------------------|----------------|
| `name?: string` | `name: string` | `name ?? basename(pluginDir)` |
| `commands?: string \| string[]` | `commands: string[]` | Glob expansion + array normalization |
| `agents?: string \| string[]` | `agents: string[]` | Glob expansion + array normalization |
| `skills?: string[]` | `skills: string[]` | Glob discovery + validation |
| `hooks?: string \| object` | `hooks: Hook[]` | Parse + flatten + extract event |
| `mcpServers?: string \| object` | `mcps: Mcp[]` | Parse + extract name |

---

## 2. Transformation Steps

### 2.1 Commands/Agents (Paths → Array)

**String path:**
```typescript
// Input
{ "commands": "custom-dir" }

// Transform
glob(`${pluginRoot}/custom-dir/**/*.md`)
// → ["custom-dir/cmd1.md", "custom-dir/cmd2.md"]

// Output
{ commands: ["custom-dir/cmd1.md", "custom-dir/cmd2.md"] }
```

**Array (no transformation):**
```typescript
// Input
{ "commands": ["cmd1.md", "cmd2.md"] }

// Output (preserved as-is)
{ commands: ["cmd1.md", "cmd2.md"] }
```

---

### 2.2 Skills (Discovery)

```typescript
// Input (undefined)
{ }

// Transform
glob(`${pluginRoot}/skills/*/SKILL.md`)
  .map(path => dirname(path))  // Get parent directory
// → ["skills/skill-a", "skills/skill-b"]

// Output
{ skills: ["skills/skill-a", "skills/skill-b"] }
```

---

### 2.3 Hooks (Nested → Flat Array)

**From hooks.json file:**
```json
// Input (hooks/hooks.json)
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "/setup.sh" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "/format.sh" }
        ]
      }
    ]
  }
}
```

**Transformation steps:**
1. Flatten nested structure (event → matcher? → hooks array)
2. Extract event name from top-level key
3. Extract matcher from matcher field (if present)
4. Add event and matcher fields to each hook
5. Preserve all original hook fields

```json
// Output
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "/setup.sh"
    },
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "/format.sh",
      "matcher": "Write|Edit"
    }
  ]
}
```

**From inline configuration:**
```json
// Input (in plugin.json)
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "/init.sh" }
        ]
      }
    ]
  }
}

// Output (same transformation)
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "/init.sh"
    }
  ]
}
```

---

### 2.4 MCPs (Object → Array)

**From .mcp.json file:**
```json
// Input (.mcp.json)
{
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["-y", "@tavily/mcp-server"],
      "env": { "TAVILY_API_KEY": "${TAVILY_API_KEY}" }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    }
  }
}
```

**Transformation steps:**
1. Extract server entries from object
2. Add name field from key
3. Preserve all config fields

```json
// Output
{
  "mcps": [
    {
      "name": "tavily",
      "command": "npx",
      "args": ["-y", "@tavily/mcp-server"],
      "env": { "TAVILY_API_KEY": "${TAVILY_API_KEY}" }
    },
    {
      "name": "filesystem",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      "env": {}
    }
  ]
}
```

---

## 3. Path Normalization

All paths undergo normalization to remove leading `./`:

```typescript
function normalize(path: string): string {
  return path.replace(/^\.\//, '')
}
```

**Examples:**
- `./commands/file.md` → `commands/file.md`
- `commands/file.md` → `commands/file.md` (no change)

---

## 4. Metadata Defaults

Fields with undefined values receive defaults:

```typescript
{
  version: "0.0.0",
  description: "",
  author: { name: "", email: "", url: "" },
  homepage: "",
  repository: "",
  license: "",
  keywords: []
}
```

---

## 5. Complete Example

### Input (Official Format)

**plugin.json:**
```json
{
  "name": "my-plugin",
  "commands": "scripts",
  "hooks": "hooks/custom.json"
}
```

**hooks/custom.json:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "/init.sh" }
        ]
      }
    ]
  }
}
```

**Auto-discovered:**
- Skills: `skills/skill-a/SKILL.md` found

### Output (Normalized Format)

```json
{
  "name": "my-plugin",
  "source": "/absolute/path/to/my-plugin",
  "version": "0.0.0",
  "description": "",
  "author": { "name": "", "email": "", "url": "" },
  "homepage": "",
  "repository": "",
  "license": "",
  "keywords": [],
  "commands": ["scripts/cmd1.md", "scripts/cmd2.md"],
  "agents": [],
  "skills": ["skills/skill-a"],
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "/init.sh"
    }
  ],
  "mcps": []
}
```

---

## 6. Transformation Guarantees

1. **No undefined values**: All fields always defined
2. **Arrays never undefined**: Empty arrays `[]` used instead
3. **Flat structure**: Nested hooks/mcps converted to flat arrays
4. **Event extraction**: Hook events extracted from original keys
5. **Name extraction**: MCP names extracted from original keys
6. **Field preservation**: All original fields preserved (spread into new structure)
7. **Path normalization**: Leading `./` removed from all paths

---

## 7. Edge Cases

### Empty Plugin
```json
// Input
{}

// Output
{
  "name": "plugin-dir-name",
  "source": "/absolute/path",
  "version": "0.0.0",
  "description": "",
  "author": { "name": "", "email": "", "url": "" },
  "homepage": "",
  "repository": "",
  "license": "",
  "keywords": [],
  "commands": [],
  "agents": [],
  "skills": [],
  "hooks": [],
  "mcps": []
}
```

### Multiple Hooks Same Event
```json
// Input
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "/first.sh" },
          { "type": "command", "command": "/second.sh" }
        ]
      }
    ]
  }
}

// Output
{
  "hooks": [
    { "event": "Stop", "type": "command", "command": "/first.sh" },
    { "event": "Stop", "type": "command", "command": "/second.sh" }
  ]
}
```

### MCP Name Collisions

**Note:** If multiple plugins have MCPs with the same name (e.g., "tavily"), collision handling is responsibility of the application logic (TUI/save), NOT the normalization process.
