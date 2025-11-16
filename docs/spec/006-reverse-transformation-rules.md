# Reverse Transformation Rules (Normalized → Official)

**Version**: 1.0.0
**Last Updated**: 2025-11-15
**Purpose**: Define how to transform our internal normalized format back to Claude Code official plugin format

Este documento describe cómo transformar plugins desde el formato normalizado interno (usado por el TUI) de vuelta al formato oficial de Claude Code para generar `plugin.json`.

---

## 1. Transformation Goals

### Primary Objectives
1. **Minimalism**: Generate clean, minimal `plugin.json` files
2. **Validity**: Output must be valid Claude Code plugin format
3. **Readability**: Prefer human-readable structures when possible
4. **Compatibility**: Ensure auto-discovery still works

### Non-Goals
1. **Perfect round-trip**: We don't guarantee identical output to input (information loss is acceptable)
2. **Path reconstruction**: We don't try to detect original string paths vs arrays

---

## 2. Field Mapping (Reverse)

| Normalized Format | Official Format | Transformation |
|-------------------|-----------------|----------------|
| `name: string` | `name?: string` | Always include (required) |
| `commands: string[]` | `commands?: string \| string[]` | Array (explicit list) |
| `agents: string[]` | `agents?: string \| string[]` | Array (explicit list) |
| `skills: string[]` | `skills?: string \| string[]` | Array (explicit list) |
| `hooks: Hook[]` | `hooks?: object` | Group by event → nested object |
| `mcps: Mcp[]` | `mcpServers?: object` | Use name as key → nested object |
| `version: string` | `version?: string` | Include if not default |
| `description: string` | `description?: string` | Include if not empty |
| `author: object` | `author?: object` | Include if not all empty |
| `source: string` | ❌ OMIT | Internal field only |

---

## 3. Transformation Rules

### 3.1 Metadata Fields

**Rule**: Omit fields that have default values to keep plugin.json minimal.

```typescript
// Normalized input
{
  version: "0.0.0",        // Default
  description: "",         // Default (empty)
  author: {                // Default (all empty)
    name: "",
    email: "",
    url: ""
  },
  homepage: "",            // Default
  license: "",             // Default
  keywords: []             // Default
}

// Official output (all omitted)
{
  // Fields omitted - will use defaults
}
```

**Include only if non-default:**

```typescript
// Normalized input
{
  version: "1.2.0",           // Non-default
  description: "My plugin",   // Non-default
  license: "MIT",             // Non-default
  keywords: ["ai", "tools"]   // Non-default
}

// Official output
{
  "version": "1.2.0",
  "description": "My plugin",
  "license": "MIT",
  "keywords": ["ai", "tools"]
}
```

---

### 3.2 Author Field

**Rule**: Omit if all fields are empty strings, otherwise include with only non-empty fields.

```typescript
// All empty → Omit
{
  author: { name: "", email: "", url: "" }
}
// Output: (field omitted)

// Partial data → Include non-empty fields
{
  author: { name: "John Doe", email: "", url: "https://example.com" }
}
// Output:
{
  "author": {
    "name": "John Doe",
    "url": "https://example.com"
  }
}
```

---

### 3.3 Commands & Agents (Arrays)

**Rule**: Always output as explicit array with `"./"` prefix. Do NOT try to reconstruct string paths.

**Rationale**:
- String path → Array is destructive (we lose the original path)
- Explicit arrays are unambiguous and always work
- Trying to detect patterns adds complexity with little benefit
- `"./"` prefix is required by Claude Code validation

```typescript
// Normalized input
{
  commands: ["commands/cmd1.md", "commands/cmd2.md"],
  agents: ["agents/agent1.md"]
}

// Official output (explicit arrays with "./" prefix)
{
  "commands": ["./commands/cmd1.md", "./commands/cmd2.md"],
  "agents": ["./agents/agent1.md"]
}
```

**Empty arrays → Omit:**

```typescript
// Normalized input
{
  commands: [],
  agents: []
}

// Official output (omitted)
{
  // Fields omitted - auto-discovery will handle
}
```

---

### 3.4 Skills (Arrays)

**Rule**: Same as commands/agents - output as explicit array with `"./"` prefix. Omit if empty.

```typescript
// Normalized input
{
  skills: ["skills/skill-a", "skills/skill-b"]
}

// Official output (explicit array with "./" prefix)
{
  "skills": ["./skills/skill-a", "./skills/skill-b"]
}
```

**Empty skills → Omit:**

```typescript
// Normalized input
{ skills: [] }

// Official output (omitted)
{}
```

---

### 3.5 Hooks (Array → Nested Object)

**Transformation steps:**
1. Group hooks by `event` field
2. Within each event, group by `matcher` field (undefined matchers grouped together)
3. Remove `event` and `matcher` fields from hook configs
4. Create structure: `{ "EventName": [{ "matcher"?: string, "hooks": [...] }] }`

```typescript
// Normalized input
{
  hooks: [
    {
      event: "SessionStart",
      type: "command",
      command: "/init.sh"
    },
    {
      event: "PostToolUse",
      type: "command",
      command: "/format.sh",
      matcher: "Write|Edit"
    },
    {
      event: "SessionStart",        // Same event, no matcher
      type: "command",
      command: "/setup.sh"
    },
    {
      event: "PostToolUse",          // Same event+matcher
      type: "command",
      command: "/lint.sh",
      matcher: "Write|Edit"
    }
  ]
}

// Official output
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/init.sh"
          },
          {
            "type": "command",
            "command": "/setup.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "/format.sh"
          },
          {
            "type": "command",
            "command": "/lint.sh"
          }
        ]
      }
    ]
  }
}
```

**Empty hooks → Omit:**

```typescript
// Normalized input
{ hooks: [] }

// Official output (omitted)
{}
```

---

### 3.6 MCPs (Array → Nested Object)

**Transformation steps:**
1. Extract `name` field to use as object key
2. Remove `name` field from config object
3. Create nested structure `{ "serverName": {config} }`
4. Omit empty `env` objects

```typescript
// Normalized input
{
  mcps: [
    {
      name: "tavily",
      command: "npx",
      args: ["-y", "@tavily/mcp-server"],
      env: {
        "TAVILY_API_KEY": "${TAVILY_API_KEY}"
      }
    },
    {
      name: "filesystem",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "/path"],
      env: {}  // Empty env
    }
  ]
}

// Official output
{
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["-y", "@tavily/mcp-server"],
      "env": {
        "TAVILY_API_KEY": "${TAVILY_API_KEY}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
      // env omitted (empty object)
    }
  }
}
```

**Empty MCPs → Omit:**

```typescript
// Normalized input
{ mcps: [] }

// Official output (omitted)
{}
```

---

### 3.7 Source Field

**Rule**: NEVER include in official format (internal field only).

```typescript
// Normalized input
{
  source: "/absolute/path/to/plugin"
}

// Official output (omitted)
{
  // source field never appears in plugin.json
}
```

---

## 4. Complete Examples

### Example 1: Minimal Plugin

**Normalized input:**
```json
{
  "name": "my-plugin",
  "source": "/absolute/path",
  "version": "0.0.0",
  "description": "",
  "author": { "name": "", "email": "", "url": "" },
  "homepage": "",
  "repository": "",
  "license": "",
  "keywords": [],
  "commands": ["commands/cmd1.md"],
  "agents": [],
  "skills": [],
  "hooks": [],
  "mcps": []
}
```

**Official output:**
```json
{
  "name": "my-plugin",
  "commands": ["./commands/cmd1.md"]
}
```

**Omitted fields:**
- `version`, `description`, `author`, etc. → defaults
- `agents`, `skills`, `hooks`, `mcps` → empty
- `source` → internal only

---

### Example 2: Full-Featured Plugin

**Normalized input:**
```json
{
  "name": "personal-ai",
  "source": "/absolute/path",
  "version": "1.0.0",
  "description": "Personal AI tools",
  "author": {
    "name": "John Doe",
    "email": "john@example.com",
    "url": ""
  },
  "homepage": "https://example.com",
  "license": "MIT",
  "keywords": ["ai", "tools"],
  "commands": [
    "commands/analyze.md",
    "commands/optimize.md"
  ],
  "agents": [
    "agents/context-agent.md"
  ],
  "skills": [
    "skills/skill-a",
    "skills/skill-b"
  ],
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "/init.sh"
    },
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "/format.sh",
      "matcher": "Write|Edit"
    }
  ],
  "mcps": [
    {
      "name": "tavily",
      "command": "npx",
      "args": ["-y", "@tavily/mcp-server"],
      "env": {
        "TAVILY_API_KEY": "${TAVILY_API_KEY}"
      }
    }
  ]
}
```

**Official output:**
```json
{
  "name": "personal-ai",
  "version": "1.0.0",
  "description": "Personal AI tools",
  "author": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "homepage": "https://example.com",
  "license": "MIT",
  "keywords": ["ai", "tools"],
  "commands": [
    "./commands/analyze.md",
    "./commands/optimize.md"
  ],
  "agents": [
    "./agents/context-agent.md"
  ],
  "skills": [
    "./skills/skill-a",
    "./skills/skill-b"
  ],
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/init.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "/format.sh"
          }
        ]
      }
    ]
  },
  "mcpServers": {
    "tavily": {
      "command": "npx",
      "args": ["-y", "@tavily/mcp-server"],
      "env": {
        "TAVILY_API_KEY": "${TAVILY_API_KEY}"
      }
    }
  }
}
```

**Omitted fields:**
- `author.url` → empty string
- `source` → internal field

---

### Example 3: Multiple Hooks Same Event (No Matcher)

**Normalized input:**
```json
{
  "name": "hooks-demo",
  "hooks": [
    {
      "event": "Stop",
      "type": "command",
      "command": "/stop-hook.ts"
    },
    {
      "event": "Stop",
      "type": "command",
      "command": "/capture-all-events.ts --event-type Stop"
    }
  ]
}
```

**Official output:**
```json
{
  "name": "hooks-demo",
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/stop-hook.ts"
          },
          {
            "type": "command",
            "command": "/capture-all-events.ts --event-type Stop"
          }
        ]
      }
    ]
  }
}
```

---

### Example 4: Multiple Hooks Same Event+Matcher

**Normalized input:**
```json
{
  "name": "hooks-with-matcher",
  "hooks": [
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "/format.sh",
      "matcher": "Write|Edit"
    },
    {
      "event": "PostToolUse",
      "type": "command",
      "command": "/lint.sh",
      "matcher": "Write|Edit"
    }
  ]
}
```

**Official output:**
```json
{
  "name": "hooks-with-matcher",
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "/format.sh"
          },
          {
            "type": "command",
            "command": "/lint.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 5. Information Loss (Acceptable)

The reverse transformation is **intentionally lossy** in these cases:

### 5.1 Path Format Loss

```typescript
// Original: "commands" (string path)
// After normalize: ["commands/cmd1.md", "commands/cmd2.md"]
// After reverse: ["commands/cmd1.md", "commands/cmd2.md"]
// ❌ Lost: Original was a string path, not explicit array
```

**Decision**: Accept this loss. Explicit arrays are unambiguous and always work.

---

### 5.2 Source Location Loss

```typescript
// Original: hooks from "hooks/custom.json" file
// After normalize: [{ event: "SessionStart", ... }]
// After reverse: { "hooks": { "SessionStart": [...] } }
// ❌ Lost: Hooks are now inline, not in external file
```

**Decision**: Accept this loss. Inline configuration is simpler and more portable.

---

### 5.3 Auto-Discovery Detection

```typescript
// Original: (field omitted, auto-discovery used)
// After normalize: commands: ["commands/cmd1.md"]
// After reverse: "commands": ["commands/cmd1.md"]
// ❌ Lost: Can't distinguish between explicit array and auto-discovered
```

**Decision**: Accept this loss. Explicit is better than implicit.

---

## 6. Transformation Algorithm

### Pseudo-code

```typescript
function normalizedToOfficial(normalized: NormalizedPlugin): PluginJson {
  const output: PluginJson = {};

  // 1. Name (required)
  output.name = normalized.name;

  // 2. Metadata (only if non-default)
  if (normalized.version !== "0.0.0") {
    output.version = normalized.version;
  }
  if (normalized.description !== "") {
    output.description = normalized.description;
  }
  if (!isEmptyAuthor(normalized.author)) {
    output.author = removeEmptyFields(normalized.author);
  }
  if (normalized.homepage !== "") {
    output.homepage = normalized.homepage;
  }
  if (normalized.repository !== "") {
    output.repository = normalized.repository;
  }
  if (normalized.license !== "") {
    output.license = normalized.license;
  }
  if (normalized.keywords.length > 0) {
    output.keywords = normalized.keywords;
  }

  // 3. Commands (only if non-empty, add "./" prefix)
  if (normalized.commands.length > 0) {
    output.commands = normalized.commands.map(p => p.startsWith('./') ? p : `./${p}`);
  }

  // 4. Agents (only if non-empty, add "./" prefix)
  if (normalized.agents.length > 0) {
    output.agents = normalized.agents.map(p => p.startsWith('./') ? p : `./${p}`);
  }

  // 5. Skills (only if non-empty, add "./" prefix)
  if (normalized.skills.length > 0) {
    output.skills = normalized.skills.map(p => p.startsWith('./') ? p : `./${p}`);
  }

  // 6. Hooks (group by event)
  if (normalized.hooks.length > 0) {
    output.hooks = groupHooksByEvent(normalized.hooks);
  }

  // 7. MCPs (use name as key)
  if (normalized.mcps.length > 0) {
    output.mcpServers = mcpsToObject(normalized.mcps);
  }

  return output;
}

function groupHooksByEvent(hooks: Hook[]): Record<string, HookConfig[]> {
  const grouped: Record<string, HookConfig[]> = {};

  for (const hook of hooks) {
    const event = hook.event;
    const config = { ...hook };
    delete config.event;  // Remove event field

    if (!grouped[event]) {
      grouped[event] = [];
    }
    grouped[event].push(config);
  }

  return grouped;
}

function mcpsToObject(mcps: Mcp[]): Record<string, McpConfig> {
  const result: Record<string, McpConfig> = {};

  for (const mcp of mcps) {
    const name = mcp.name;
    const config = { ...mcp };
    delete config.name;  // Remove name field

    // Omit empty env objects
    if (config.env && Object.keys(config.env).length === 0) {
      delete config.env;
    }

    result[name] = config;
  }

  return result;
}

function isEmptyAuthor(author: Author): boolean {
  return author.name === "" &&
         author.email === "" &&
         author.url === "";
}

function removeEmptyFields(author: Author): Partial<Author> {
  const result: Partial<Author> = {};
  if (author.name !== "") result.name = author.name;
  if (author.email !== "") result.email = author.email;
  if (author.url !== "") result.url = author.url;
  return result;
}
```

---

## 7. Edge Cases

### 7.1 Empty Plugin

```json
// Normalized input
{
  "name": "empty-plugin",
  "source": "/path",
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

// Official output (minimal)
{
  "name": "empty-plugin"
}
```

---

### 7.2 Hooks with Extra Fields

**Rule**: Preserve all fields except `event` when converting.

```json
// Normalized input
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "/init.sh",
      "customField": "customValue",
      "anotherField": 42
    }
  ]
}

// Official output (custom fields preserved)
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "/init.sh",
        "customField": "customValue",
        "anotherField": 42
      }
    ]
  }
}
```

---

### 7.3 MCPs with Extra Fields

**Rule**: Preserve all fields except `name` when converting.

```json
// Normalized input
{
  "mcps": [
    {
      "name": "custom-server",
      "command": "node",
      "args": ["server.js"],
      "env": {},
      "customConfig": {
        "timeout": 5000
      }
    }
  ]
}

// Official output (custom fields preserved, empty env omitted)
{
  "mcpServers": {
    "custom-server": {
      "command": "node",
      "args": ["server.js"],
      "customConfig": {
        "timeout": 5000
      }
    }
  }
}
```

---

## 8. Validation

After transformation, the output should be validated against:

1. **JSON Schema**: Must conform to official plugin.json schema
2. **Required fields**: `name` must be present
3. **Valid types**: All fields have correct types (string, array, object)
4. **No forbidden fields**: `source` should not appear

---

## 9. Summary of Transformation Guarantees

✅ **Guarantees:**
1. Output is valid official Claude Code plugin format
2. All non-default metadata is preserved
3. Component arrays are explicit and unambiguous
4. Hooks are grouped by event correctly
5. MCPs are keyed by name correctly
6. Custom fields in hooks/MCPs are preserved
7. Output is minimal (defaults omitted)

❌ **Non-Guarantees (Acceptable Losses):**
1. Original path format (string vs array) is not preserved
2. External file references (hooks.json, .mcp.json) become inline
3. Cannot distinguish auto-discovered vs explicitly defined components
4. Field order may differ from original

---

## 10. Related Documents

- [001-normalization-protocol.md](./001-normalization-protocol.md) - Defines normalized format
- [002-plugin-format-spec.md](./002-plugin-format-spec.md) - Official plugin format reference
- [005-transformation-rules.md](./005-transformation-rules.md) - Forward transformation (Official → Normalized)
- [004-user-workflows.md](./004-user-workflows.md) - TUI SAVE operation context