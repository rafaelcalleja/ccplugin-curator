# mk-curator - Interactive Claude Plugin Curator

A terminal-based UI application for curating and selecting components from Claude Code plugins.

## Overview

**mk-curator** is an interactive TUI (Terminal User Interface) that allows you to:

1. **Scan** directories containing Claude Code plugins
2. **Normalize** plugins according to the specification
3. **Interactively select** components (commands, agents, skills, hooks, MCPs)
4. **Preview** selections in real-time as JSON
5. **Save** curated plugin configurations

## Features

- ✅ Three-panel interactive interface (Plugins | Components | Preview)
- ✅ Full keyboard navigation (no mouse required)
- ✅ Real-time JSON preview of selections
- ✅ Auto-discovery of plugin components
- ✅ Normalization according to Claude Code specification
- ✅ Batch selection (Select All / Deselect All)
- ✅ Multi-plugin support with tab switching

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

```bash
# Start the curator
npm run dev -- select <plugins-directory>

# Example
npm run dev -- select ~/.claude/plugins
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←→` | Switch panel (Plugins ↔ Components ↔ Preview) |
| `↑↓` | Navigate up/down |
| `TAB` | Next plugin |
| `SHIFT+TAB` | Previous plugin |
| `SPACE` | Toggle component selection |
| `A` | Select all components |
| `N` | Deselect all components |
| `S` | Save curated plugin |
| `Q` | Quit application |

## Architecture

```
src/
├── index.ts              # Entry point, CLI handler
├── scanner.ts           # Plugin directory scanner
├── normalizer.ts        # Plugin normalization logic
├── persistence.ts       # Save/load functionality
├── types/
│   ├── index.ts         # Type definitions
│   ├── plugin.ts        # Generated from schema
│   └── normalized.ts    # Generated from schema
└── ui/
    ├── PluginCurator.tsx    # Main TUI component
    ├── PluginPanel.tsx      # Left panel - plugins list
    ├── ComponentPanel.tsx   # Center panel - components
    └── PreviewPanel.tsx     # Right panel - JSON preview
```

## How It Works

### 1. Plugin Scanning
- Scans directory for `.claude-plugin/plugin.json` files
- Reads official plugin format
- Validates plugin structure

### 2. Auto-Discovery
For each plugin, discovers:
- `commands/` → Command files
- `agents/` → Agent files
- `skills/*/SKILL.md` → Skill directories
- `hooks/hooks.json` → Hook configurations
- `.mcp.json` → MCP server definitions

### 3. Normalization
Transforms plugin from official format to internal normalized format:
- Merges custom paths with auto-discovered components
- Ensures all fields have defaults
- Validates invariants

### 4. Interactive Selection
- Browse plugins with keyboard
- Select/deselect components
- Real-time preview updates
- Batch operations (All/None)

### 5. Persistence
Saves curated selections to:
- `./output/curated-plugin/plugin.json` (merged)
- `./output/curated-<plugin-name>/plugin.json` (per-plugin)

## Data Flow

```
┌─────────────────────┐
│  Plugin Directory   │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────┐
│   Plugin Scanner         │
│ (finds .claude-plugin/)  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Auto-Discovery         │
│ (commands/, agents/, ...) │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Normalizer             │
│ (standardize format)     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Interactive TUI        │
│ (select components)      │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Persistence            │
│ (save plugin.json)       │
└──────────────────────────┘
```

## Component Types

### Commands
Automation scripts and workflows defined in `commands/` or custom paths.

### Agents
Specialized AI agents defined in `agents/` or custom paths.

### Skills
Enhanced capabilities defined in `skills/*/SKILL.md`.

### Hooks
Event handlers that trigger on Claude Code events:
- `SessionStart`, `SessionEnd`
- `PreToolUse`, `PostToolUse`
- `UserPromptSubmit`
- And more...

### MCP Servers
Model Context Protocol servers providing tools and resources.

## Configuration

### Environment Variables

`${CLAUDE_PLUGIN_ROOT}` - Available in hooks and MCPs for plugin path resolution.

### JSON Schemas

Plugin validation uses JSON Schemas:
- `schemas/plugin.schema.json` - Official plugin format
- `schemas/normalized-plugin.schema.json` - Internal format

TypeScript types are generated from these schemas:
```bash
npm run generate-types
```

## Example Workflow

```bash
# 1. Build the project
npm run build

# 2. Start the curator pointing to your plugins
npm run start -- select ~/.claude/plugins

# 3. Navigate with arrow keys
#    - Select first plugin
#    - View available commands/agents/skills/etc

# 4. Toggle components with SPACE
#    - Preview updates in real-time on the right

# 5. Press 'S' to save
#    - Creates curated-plugin/plugin.json

# 6. Use the generated plugin
#    - Add to Claude Code's .claude-plugin/ directory
```

## Development

```bash
# Run in development mode with hot-reload
npm run dev -- select <path>

# Build for production
npm run build

# Run built version
npm start -- select <path>

# Type checking
npm run build

# Linting (optional)
npm run lint

# Code formatting (optional)
npm run format
```

## Troubleshooting

### No plugins found
- Ensure plugins have `.claude-plugin/plugin.json` files
- Check directory path exists and is accessible
- Verify plugin.json is valid JSON

### Components not showing
- Auto-discovery requires standard directory structure
- Custom paths must be defined in `plugin.json`
- Check file permissions

### Save fails
- Ensure output directory is writable
- Check disk space available
- Verify JSON is valid before saving

## Technical Details

- **Language**: TypeScript
- **Runtime**: Node.js 16+
- **TUI Framework**: Ink (React for Terminal)
- **Package Manager**: npm
- **Schema Validation**: JSON Schema

## Limitations

- Terminal width minimum: 120 columns (140+ recommended)
- Terminal height minimum: 30 rows
- Requires 256-color support (monospace font required)
- Mouse input not supported (keyboard only)

## Future Improvements

- [ ] Plugin validation and error reporting
- [ ] Advanced filtering and search
- [ ] Drag-and-drop reordering (if possible in terminal)
- [ ] Configuration profiles/presets
- [ ] Diff view for changes
- [ ] Undo/redo functionality
- [ ] Plugin dependency resolution

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- Code compiles without errors
- Types are properly defined
- Changes follow existing patterns
- README is updated if needed
