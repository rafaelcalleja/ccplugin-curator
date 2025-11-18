# Claude Code Plugin Curator

A powerful Text User Interface (TUI) tool for curating and combining Claude Code plugin components from multiple sources.

## Overview

Claude Code Plugin Curator helps you create custom plugin combinations by selecting specific components from multiple plugins. It provides an interactive interface for browsing, selecting, and merging commands, agents, skills, hooks, and MCP servers.

## Features

- ✅ **Interactive Setup**: Guided configuration with field validation
- ✅ **Three-Panel TUI**: Browse plugins, select components, preview selection
- ✅ **Auto-Discovery**: Automatically finds all plugin components
- ✅ **Conflict Resolution**: Handles naming conflicts with namespace prefixes
- ✅ **Hook Script Management**: Copies hook scripts with executable permissions
- ✅ **Multi-Plugin Support**: Merge components from multiple plugins
- ✅ **Dual Output**: Generates both official and normalized plugin formats
- ✅ **Full Validation**: Ensures output conforms to Claude Code plugin spec

## Installation

```bash
npm install
npm run build
```

## Usage

### Interactive Mode (Recommended)

Launch without arguments for guided setup:

```bash
npm start
# or
node dist/cli/index.js
```

This will:
1. Show Main Menu
2. Guide you through configuration:
   - Marketplace Name (kebab-case)
   - Plugin Name (display name)
   - Source Plugin Directory
   - Output Directory (auto-filled)
   - Author Email (optional)
3. Scan plugins in source directory
4. Launch TUI for component selection

### Direct Mode

Select from a specific directory:

```bash
npm start -- select ./my-plugins
# or
node dist/cli/index.js select ./my-plugins
```

## TUI Navigation

### Keyboard Shortcuts

**Navigation:**
- `↑` `↓` - Navigate items
- `←` `→` / `TAB` - Switch panels
- `ENTER` - Expand/collapse categories

**Selection:**
- `SPACE` - Toggle component selection
- `A` - Select all components
- `N` - Deselect all components

**Actions:**
- `S` - Save selection
- `Q` / `ESC` - Quit
- `Y` / `N` - Confirm overwrite prompt

### TUI Panels

1. **PLUGINS** (Left): List of loaded plugins with component counts
2. **COMPONENTS** (Center): Hierarchical tree of all components
   - Commands
   - Agents
   - Skills
   - Hooks
   - MCP Servers
3. **PREVIEW** (Right): Real-time JSON preview of selected components

## Configuration Form Fields

### Required Fields

- **Marketplace Name**: Used in package.json name field
  - Format: lowercase, numbers, hyphens only
  - Example: `my-marketplace`

- **Plugin Name**: Display name for your curated plugin
  - Any printable characters, 3-100 chars
  - Example: `My Personal AI Tools`

- **Source Plugin Directory**: Directory containing plugins to curate
  - Must exist and contain plugins
  - Example: `~/.claude/plugins`

### Optional Fields

- **Output Directory**: Where to save curated plugin
  - Auto-fills from marketplace name
  - Default: `./output/[marketplace-name]`

- **Author Email**: Optional email for plugin metadata
  - Must be valid email format
  - Example: `user@example.com`

## Output Structure

After saving, the tool generates:

```
output/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace configuration
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Plugin configuration (official format)
│       ├── commands/             # Selected command files
│       ├── agents/               # Selected agent files
│       ├── skills/               # Selected skill directories
│       └── hooks/                # Hook scripts (with +x permission)
└── normalized-plugin.json        # Normalized format (for debugging)
```

### Installing the Output

```bash
# Add marketplace
cd /path/to/output
/plugin marketplace add .

# Install the curated plugin
/plugin install curated-plugin
```

## Multi-Plugin Conflict Resolution

When merging components from multiple plugins with identical names:

- **Commands/Agents/Skills**: Automatically prefixed with plugin name
  - Example: `build.md` from `plugin-a` and `plugin-b` becomes:
    - `plugin-a--build.md`
    - `plugin-b--build.md`

- **Hooks**: Merged by event type (no conflicts)
  - Hooks for the same event are combined

- **MCP Servers**: Prefixed with plugin name
  - Example: `tavily` from both plugins becomes:
    - `plugin-a--tavily`
    - `plugin-b--tavily`

## Development

### Run Tests

```bash
npm test
```

All 23 integration tests should pass:
- Full workflow tests (13 tests)
- Multi-plugin conflict tests (7 tests)
- Edge case tests (3 tests)

### Build

```bash
npm run build
```

### Development Mode

Run TypeScript directly without building:

```bash
npm run dev -- select ./test-fixtures
```

## Project Structure

```
src/
├── cli/                  # CLI entry point
│   └── index.ts
├── core/                 # Core logic
│   ├── normalize.ts      # Official → Normalized transformation
│   ├── denormalize.ts    # Normalized → Official transformation
│   └── save.ts           # Save operation with conflict resolution
├── tui/                  # Text User Interface
│   ├── app.tsx           # Main TUI app
│   ├── screens/          # Setup screens
│   │   ├── MainMenu.tsx
│   │   └── ConfigurationForm.tsx
│   ├── components/       # TUI components
│   ├── hooks/            # React hooks
│   └── state/            # State management
├── types/                # TypeScript types
└── validation/           # Schema validation
```

## Specifications

This project implements:
- `docs/spec/001-normalization-protocol.md`
- `docs/spec/002-plugin-format-spec.md`
- `docs/spec/003-tui-visual-spec.md`
- `docs/spec/004-user-workflows.md`
- `docs/spec/005-transformation-rules.md`
- `docs/spec/006-reverse-transformation-rules.md`
- `docs/spec/007-save-operation-rules.md`
- `docs/spec/008-integration-test-spec.md`
- `docs/spec/009-tui-setup-screens.md`
- `docs/decisions/001-json-schema-to-typescript.md`

## Testing

The project includes comprehensive integration tests covering:
- Plugin loading and normalization
- Component selection
- Multi-plugin merging
- Conflict resolution
- File copying with proper permissions
- Official format output

## License

MIT

## Contributing

See specifications in `docs/` directory for implementation details.
