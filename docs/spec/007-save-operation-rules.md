# Save Operation Rules

**Version**: 1.0.0
**Last Updated**: 2025-11-15
**Purpose**: Define what happens when user presses S (Save) in the TUI

---

## 1. Save Operation Flow

```
User presses S (Save)
    ↓
Check selection (non-empty)
    ↓
Apply reverse transformation [→ 006-reverse-transformation-rules.md]
    ↓
Generate outputs:
    1. .claude-plugin/marketplace.json
    2. plugins/curated-plugin/ (plugin files + components)
    3. normalized-plugin.json (for testing)
    ↓
Copy component files to plugins/curated-plugin/
    ↓
Show success message with installation instructions
```

**Note**: Plugin name "curated-plugin" is configurable (CLI arg or prompt).

---

## 2. Output Strategy

| File | Format | Purpose |
|------|--------|---------|
| `.claude-plugin/marketplace.json` | Marketplace config | Lists available plugins for installation |
| `plugins/curated-plugin/.claude-plugin/plugin.json` | Official ([002](./002-plugin-format-spec.md)) | Ready to use in Claude Code |
| `normalized-plugin.json` | Normalized ([001](./001-normalization-protocol.md)) | Testing, debugging, comparisons |

---

## 3. Output Directory Structure

```
output/curated-plugin/
├── .claude-plugin/
│   └── marketplace.json          ← Marketplace config
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       ← Official format (use this in Claude Code)
│       ├── commands/             ← Copied component files
│       │   └── *.md
│       ├── agents/
│       │   └── *.md
│       └── skills/
│           └── */SKILL.md
└── normalized-plugin.json        ← Normalized format (for debugging)
```

### marketplace.json

```json
{
  "name": "curated-plugins",
  "owner": {
    "name": "User",
    "email": "user@example.com"
  },
  "plugins": [
    {
      "name": "curated-plugin",
      "source": "./plugins/curated-plugin"
    }
  ]
}
```

### Installation

```bash
/plugin marketplace add ./output/curated-plugin
/plugin install curated-plugin
```

---

## 4. Transformation Applied

**From normalized selection TO plugin.json:**

Apply all rules from [006-reverse-transformation-rules.md](./006-reverse-transformation-rules.md):

- Hooks: flat array → nested object by event
- MCPs: flat array → object with name as key
- Omit default values
- Omit empty arrays
- Omit internal fields (`source`)

**Example:**

```typescript
// Normalized selection (internal TUI state)
{
  hooks: [{ event: "SessionStart", type: "command", command: "/init.sh" }],
  mcps: [{ name: "tavily", command: "npx", args: [...] }]
}

// Official plugin.json output
{
  "hooks": {
    "SessionStart": [{ "type": "command", "command": "/init.sh" }]
  },
  "mcpServers": {
    "tavily": { "command": "npx", "args": [...] }
  }
}
```

---

## 5. File Operations

### 5.1 Copy Component Files

For each selected component, copy source file/directory to output:

```typescript
// Commands & Agents: copy files
fs.copyFile(sourceFile, destFile);

// Skills: copy directories
fs.cp(sourceDir, destDir, { recursive: true });
```

### 5.2 Write Output Files

```typescript
// 1. Official format
fs.writeFile(
  '.claude-plugin/plugin.json',
  JSON.stringify(officialFormat, null, 2)
);

// 2. Normalized format
fs.writeFile(
  'normalized-plugin.json',
  JSON.stringify(normalizedFormat, null, 2)
);
```

---

## 6. Validation

**Before saving:**

1. ✅ Validate normalized format → [001-normalization-protocol.md](./001-normalization-protocol.md)
2. ✅ Apply transformation → [006-reverse-transformation-rules.md](./006-reverse-transformation-rules.md)
3. ✅ Validate official format → [002-plugin-format-spec.md](./002-plugin-format-spec.md)

If any validation fails → show errors, do NOT save.

---

## 7. Edge Cases

### 7.1 Empty Selection

```
IF selection.length === 0
THEN show "⚠ No hay componentes seleccionados"
AND do NOT save
```

### 7.2 Output Directory Exists

```
IF output directory exists
THEN ask "Output directory exists. Overwrite? [Y/n]"
AND if yes → delete and recreate
AND if no → cancel operation
```

### 7.3 Duplicate Paths

```
IF same path selected from multiple plugins
THEN show error "Duplicate path: {path}"
AND prevent save
```

---

## 8. Success Message

```
✓ Plugin guardado exitosamente

Archivos generados:
  • .claude-plugin/marketplace.json     (marketplace oficial - usar en Claude Code)
  • plugins/curated-plugin/             (plugin con componentes - oficial - usar en Claude Code)
  • normalized-plugin.json              (normalizado - para testing)

Componentes incluidos:
  • {count} commands
  • {count} agents
  • {count} skills
  • {count} hooks
  • {count} MCPs

Ubicación: {outputDir}

Instalación:
  /plugin marketplace add {outputDir}
  /plugin install curated-plugin
```

---

## 9. Related Documents

- [001-normalization-protocol.md](./001-normalization-protocol.md) - Normalized format validation
- [002-plugin-format-spec.md](./002-plugin-format-spec.md) - Official format validation
- [006-reverse-transformation-rules.md](./006-reverse-transformation-rules.md) - Transformation rules
- [004-user-workflows.md](./004-user-workflows.md) - TUI workflows (update needed)