# Plugin Normalization Protocol

## 1. Official Plugin Format (Claude Code)

### 1.1 Required Fields
```json
{
  "name": "string"  // ÚNICO campo obligatorio (kebab-case format)
}
```

### 1.2 Optional Metadata Fields

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| version | string | Versión semántica | "2.1.0" |
| description | string | Breve explicación del propósito del complemento | "Deployment automation tools" |
| author | object | Información del autor | {"name": "Dev Team", "email": "dev@company.com"} |
| homepage | string | URL de documentación | "https://docs.example.com" |
| repository | string | URL del código fuente | "https://github.com/user/plugin" |
| license | string | Identificador de licencia | "MIT", "Apache-2.0" |
| keywords | array | Etiquetas de descubrimiento | ["deployment", "ci-cd"] |

### 1.3 Component Path Fields

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| commands | string\|array | Archivos/directorios de comandos adicionales | "./custom/cmd.md" o ["./cmd1.md"] |
| agents | string\|array | Archivos de agentes adicionales | "./custom/agents/" |
| skills | string\|array | Archivos/directorios de skills adicionales | "./skills/" o ["./skills/skill-a"] |
| hooks | string\|object | Ruta de configuración de hooks o configuración en línea | "./hooks.json" |
| mcpServers | string\|object | Ruta de configuración de MCP o configuración en línea | "./mcp.json" |

### 1.4 Path Behavior Rules ⚠️ CRÍTICO

**Importante: Las rutas personalizadas COMPLEMENTAN los directorios predeterminados, NO los reemplazan.**

- Si existe `commands/`, se carga ADEMÁS de las rutas de comandos personalizadas
- Todas las rutas deben ser relativas a la raíz del complemento y comenzar con `./`
- Los comandos de rutas personalizadas utilizan las mismas reglas de nomenclatura y espacios de nombres
- Se pueden especificar múltiples rutas como matrices para mayor flexibilidad
- Auto-discovery SIEMPRE ocurre si existen los directorios predeterminados
- Las rutas personalizadas se SUMAN a las rutas auto-descubiertas

## 2. Auto-Discovery Behavior

Claude Code automatically searches these locations when fields are undefined or to supplement custom paths:

| Component | Default Discovery Location | Behavior |
|-----------|----------------------------|----------|
| commands | `commands/**/*.md` | Scans recursively for all .md files |
| agents | `agents/**/*.md` | Scans recursively for all .md files |
| skills | `skills/*/SKILL.md` | Only directories with SKILL.md file |
| hooks | `hooks/hooks.json` | Loads and parses JSON file |
| mcpServers | `.mcp.json` | Loads and parses JSON file |

**Note**: Skills can be defined in plugin.json as string path or array, OR discovered via filesystem scan if undefined.

## 3. Normalized Format (Curator Internal)

The curator converts all plugins to this consistent format:

```json
{
  "name": "string",              // Always present
  "source": "string",            // Absolute path to plugin directory
  "version": "string",           // Default: "0.0.0"
  "description": "string",       // Default: ""
  "author": {                    // Default: all empty strings
    "name": "string",
    "email": "string",
    "url": "string"
  },
  "homepage": "string",          // Default: ""
  "repository": "string",        // Default: ""
  "license": "string",           // Default: ""
  "keywords": "string[]",        // Default: []
  "commands": "string[]",        // ALWAYS array, never undefined
  "agents": "string[]",          // ALWAYS array, never undefined
  "skills": "string[]",          // ALWAYS array, never undefined
  "hooks": "Hook[]",             // ALWAYS array, never undefined
  "mcps": "Mcp[]"                // ALWAYS array, never undefined
}
```

### Normalized Hook Format
```typescript
interface Hook {
  event: string;           // Extracted from hooks.json event key
  type: "command";         // Only "command" is supported
  command: string;         // command path
  matcher?: string;        // Optional tool matcher
  timeout?: number;        // Optional timeout in seconds
  [key: string]: any;      // Preserve additional fields
}
```

### Normalized MCP Format
```typescript
interface Mcp {
  name: string;            // Extracted from mcpServers key
  command: string;         // Executable command
  args?: string[];         // Optional arguments
  env?: Record<string, string>;  // Optional env vars
  [key: string]: any;      // Preserve additional fields
}
```

## 4. Complete Example

### Filesystem Structure
```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          ← { "name": "my-plugin" }
├── commands/
│   ├── analyze.md
│   └── build.md
├── agents/
│   └── reviewer.md
├── skills/
│   ├── skill-a/
│   │   └── SKILL.md
│   └── skill-b/
│       └── SKILL.md
├── hooks/
│   └── hooks.json           ← Hook configurations
└── .mcp.json                ← MCP server definitions
```

### Input: plugin.json (Official Format)
```json
{
  "name": "my-plugin"
  // All other fields omitted → auto-discovery applies
}
```

### Auto-Discovery Resolution (Claude Code Behavior)

Claude Code scans the filesystem and finds:
- `commands/` directory → ["commands/analyze.md", "commands/build.md"]
- `agents/` directory → ["agents/reviewer.md"]
- `skills/*/SKILL.md` pattern → ["skills/skill-a", "skills/skill-b"] (directory paths)
- `hooks/hooks.json` → Parsed hook configurations
- `.mcp.json` → Parsed MCP server definitions

### Output: Normalized Format (Curator)
```json
{
  "name": "my-plugin",
  "source": "/absolute/path/to/my-plugin",
  "version": "0.0.0",
  "description": "",
  "author": {
    "name": "",
    "email": "",
    "url": ""
  },
  "homepage": "",
  "repository": "",
  "license": "",
  "keywords": [],
  "commands": ["commands/analyze.md", "commands/build.md"],
  "agents": ["agents/reviewer.md"],
  "skills": ["skills/skill-a", "skills/skill-b"],
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "/setup.sh"
    }
  ],
  "mcps": [
    {
      "name": "tavily",
      "command": "npx",
      "args": ["-y", "@tavily/mcp-server"],
      "env": {}
    }
  ]
}
```

## 5. Transformation Rules

### Metadata Fields
```
version      → "0.0.0"  (if undefined)
description  → ""       (if undefined)
author       → {name:"", email:"", url:""}  (if undefined)
homepage     → ""       (if undefined)
repository   → ""       (if undefined)
license      → ""       (if undefined)
keywords     → []       (if undefined)
```

### Component Path Fields

For each component type:
1. **Auto-discovery SIEMPRE ocurre** si existen los directorios predeterminados
2. **If defined in plugin.json**: Resolve paths y SÚMALOS a las rutas auto-descubiertas
3. **If undefined**: Solo auto-discovery (directorios predeterminados)
4. **Always produce**: Array of relative paths (never undefined, never string)

**Regla de Oro**: Custom paths COMPLEMENTAN (no reemplazan) auto-discovery

### Special Cases

**Skills**:
- Can be defined in plugin.json as string path or array: `"skills": "./skills/"` or `"skills": ["./skills/skill-a"]`
- If undefined, discovered via glob: `skills/*/SKILL.md`
- Result is directory paths (not file paths): `["skills/skill-a", "skills/skill-b"]`
- Follows same rules as commands/agents (string|array, custom paths COMPLEMENT auto-discovery)

**Hooks** (string|object):
- **String**: `"./custom/hooks.json"` → Load and parse JSON file
- **Object**: Inline configuration → Normalize to Hook[] array
- **Undefined**: Default to `hooks/hooks.json` (if exists) or `[]`
- Format: `{ "EventName": [{ matcher?, hooks: [{ type, command, timeout? }] }] }`

**MCPs** (string|object):
- **String**: `"./.mcp.json"` → Load and parse JSON file
- **Object**: Inline configuration → Normalize to Mcp[] array
- **Undefined**: Default to `.mcp.json` (if exists) or `[]`
- Format: `{ "serverName": { command, args?, env? } }`

## 6. Path Resolution with Custom Paths

### Example 1: Commands Supplementation

**Filesystem:**
```
my-plugin/
├── commands/
│   └── default.md
└── custom/
    └── cmd.md
```

**plugin.json:**
```json
{
  "name": "my-plugin",
  "commands": "./custom/cmd.md"
}
```

**Normalized (COMPLEMENTAN, no reemplazan):**
```json
{
  "commands": [
    "custom/cmd.md",           // Custom path
    "commands/default.md"      // Auto-discovered (AMBOS)
  ]
}
```

### Example 2: Inline Hooks Configuration

**plugin.json:**
```json
{
  "name": "my-plugin",
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "/setup-env.sh"
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
  }
}
```

**Normalized:**
```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "type": "command",
      "command": "/setup-env.sh"
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

### Example 3: Inline MCP Configuration

**plugin.json:**
```json
{
  "name": "my-plugin",
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
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"]
    }
  }
}
```

**Normalized:**
```json
{
  "mcps": [
    {
      "name": "tavily",
      "command": "npx",
      "args": ["-y", "@tavily/mcp-server"],
      "env": {
        "TAVILY_API_KEY": "${TAVILY_API_KEY}"
      }
    },
    {
      "name": "filesystem",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"],
      "env": {}
    }
  ]
}
```

### Example 4: Multiple Custom Paths with Auto-Discovery

**Filesystem:**
```
my-plugin/
├── commands/
│   ├── analyze.md
│   └── build.md
├── custom-commands/
│   └── deploy.md
└── scripts/
    └── cmd.md
```

**plugin.json:**
```json
{
  "name": "my-plugin",
  "commands": [
    "./custom-commands/deploy.md",
    "./scripts/cmd.md"
  ]
}
```

**Normalized:**
```json
{
  "commands": [
    "custom-commands/deploy.md",  // Custom path 1
    "scripts/cmd.md",              // Custom path 2
    "commands/analyze.md",         // Auto-discovered
    "commands/build.md"            // Auto-discovered
  ]
}
```

## 7. Environment Variables

**`${CLAUDE_PLUGIN_ROOT}`**: Available in hooks, MCP servers, and scripts. Contains absolute path to plugin directory for correct path resolution regardless of installation location.

## 8. Invariants

1. All normalized plugins MUST have all fields defined (no undefined values)
2. All array fields MUST be arrays (never string or undefined)
3. All component paths MUST be relative to plugin source directory
4. All component paths MUST start with `./` in plugin.json (normalized format removes leading `./`)
5. `source` field MUST be absolute path to plugin directory
6. Hooks and MCPs MUST be normalized to flat array format preserving original fields
7. Skills can be defined in plugin.json (string|array) OR auto-discovered, following same rules as commands/agents
8. **CRÍTICO**: Custom paths COMPLEMENTAN auto-discovery, NUNCA lo reemplazan
9. Auto-discovery SIEMPRE ocurre si existen los directorios predeterminados
10. Hooks can be string (file path) or object (inline config)
11. MCPs can be string (file path) or object (inline config)
