# Claude Plugin Curator

**TUI tool to curate and combine Claude Code plugin components**

A terminal user interface (TUI) application that allows you to scan, browse, and selectively combine components from multiple Claude Code plugins into a single curated plugin.

## Features

- 📦 **Multi-Plugin Support**: Scan and load multiple plugins simultaneously
- 🎨 **Interactive TUI**: Three-panel interface for easy navigation and selection
- ✅ **Selective Component Curation**: Pick exactly which commands, agents, skills, hooks, and MCP servers you want
- 🔄 **Auto-Discovery**: Automatically discovers all plugin components following Claude Code conventions
- 🚀 **Conflict Resolution**: Handles naming conflicts with automatic namespace prefixing
- 📋 **Standards Compliant**: Generates official Claude Code plugin format
- 💾 **Multiple Output Formats**: Produces marketplace.json, plugin.json, and normalized formats

## Installation

```bash
npm install -g ccplugin-curator
```

Or use directly with npx:

```bash
npx ccplugin-curator select <plugins-folder>
```

## Usage

### Basic Command

```bash
ccplugin-curator select <plugins-folder>
```

**Example:**

```bash
# Scan plugins in your Claude plugins directory
ccplugin-curator select ~/.claude/plugins

# Scan a custom plugins folder
ccplugin-curator select ./my-plugins
```

### TUI Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Switch between panels (Plugins, Components, Preview) |
| `↑` `↓` | Navigate up/down in current panel |
| `SPACE` | Toggle selection of current component |
| `A` | Select all components in current plugin |
| `N` | Deselect all components in current plugin |
| `S` | Save selection to output directory |
| `Q` | Quit application |

## TUI Interface

```
┌──────────────────┬────────────────────────┬─────────────────────┐
│ PLUGINS          │ COMPONENTS             │ PREVIEW             │
│                  │                        │                     │
│ ▼ plugin-a (★)   │ COMMANDS (3)           │ {                   │
│   • 3 commands   │   [✓] analyze.md       │   "commands": [     │
│   • 2 agents     │   [ ] build.md         │     "analyze.md"    │
│   • 5 hooks      │   [ ] deploy.md        │   ],                │
│                  │                        │   ...               │
│ ▽ plugin-b       │ AGENTS (2)             │ }                   │
│   • 15 commands  │   [ ] reviewer.md      │                     │
│                  │   [✓] context-agent.md │                     │
└──────────────────┴────────────────────────┴─────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | S: Save | Q: Quit  │
└────────────────────────────────────────────────────────────────┘
```

## Output Structure

When you press `S` (Save), the application generates:

```
output/curated-plugin/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace configuration
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Official Claude Code plugin format
│       ├── commands/             # Selected command files
│       ├── agents/               # Selected agent files
│       └── skills/               # Selected skill directories
└── normalized-plugin.json        # Debug format
```

### Installing Your Curated Plugin

```bash
# Add marketplace
/plugin marketplace add ./output/curated-plugin

# Install the curated plugin
/plugin install curated-plugin
```

## How It Works

### 1. Plugin Discovery & Normalization

The curator scans for directories containing `.claude-plugin/plugin.json` and automatically discovers all components:

- **Commands**: `commands/**/*.md`
- **Agents**: `agents/**/*.md`
- **Skills**: `skills/*/SKILL.md` (directories containing SKILL.md)
- **Hooks**: `hooks/hooks.json` or inline configuration
- **MCP Servers**: `.mcp.json` or inline configuration

### 2. Interactive Selection

Browse and select components using the TUI. The preview panel shows your selection in real-time.

### 3. Conflict Resolution

When combining components from multiple plugins:

**File Conflicts** (commands, agents, skills):
- Automatic namespace prefixing: `plugin-a--build.md`, `plugin-b--build.md`

**MCP Server Conflicts**:
- Namespace prefixing on server name: `plugin-a--tavily`, `plugin-b--tavily`

**Hook Merging**:
- Hooks for the same event are merged (no conflicts)
- Execution order preserved from selection order

### 4. Output Generation

Generates three output formats:

1. **marketplace.json**: For Claude Code marketplace installation
2. **plugin.json**: Official format, ready to use
3. **normalized-plugin.json**: Internal format for debugging

## Specifications

This project follows a comprehensive spec-driven implementation approach. All specifications are in `docs/spec/`:

- `001-normalization-protocol.md` - Plugin normalization rules
- `002-plugin-format-spec.md` - Official Claude Code format
- `003-tui-visual-spec.md` - TUI design specification
- `004-user-workflows.md` - User interaction flows
- `005-transformation-rules.md` - Forward transformation
- `006-reverse-transformation-rules.md` - Reverse transformation
- `007-save-operation-rules.md` - Save operation details
- `008-integration-test-spec.md` - Testing specifications

## Development

### Setup

```bash
# Install dependencies
npm install

# Generate TypeScript types from JSON schemas
npm run generate-types

# Build
npm run build

# Run in development
npm run dev select ./test-fixtures
```

### Project Structure

```
src/
├── lib/
│   ├── discovery.ts      # Auto-discovery logic
│   ├── normalize.ts      # Forward transformation (Official → Normalized)
│   ├── reverse.ts        # Reverse transformation (Normalized → Official)
│   └── save.ts           # Save operation with conflict resolution
├── tui/
│   └── app.ts            # Terminal UI implementation
├── types/
│   ├── plugin.ts         # Official format types (generated)
│   └── normalized.ts     # Normalized format types (generated)
├── cli.ts                # CLI entry point
└── index.ts              # Library exports

schemas/
├── plugin.schema.json           # Official format schema
└── normalized-plugin.schema.json  # Normalized format schema

docs/
├── spec/                 # Specifications
└── decisions/            # Architecture decisions
```

### Running Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration
```

## Examples

### Example 1: Combining Commands from Multiple Plugins

```bash
# You have plugin-a with deployment commands
# And plugin-b with testing commands
# Combine them into a single DevOps plugin

ccplugin-curator select ./plugins

# In TUI:
# 1. Navigate to plugin-a, select deployment commands
# 2. Navigate to plugin-b, select testing commands
# 3. Press S to save
```

### Example 2: Creating a Minimal Plugin

```bash
# Extract just the commands you need from a large plugin

ccplugin-curator select ~/.claude/plugins/superclaude

# In TUI:
# 1. Navigate through components
# 2. Select only the 5 commands you actually use
# 3. Press S to save
```

### Example 3: Merging Hooks

```bash
# Combine initialization hooks from multiple plugins

ccplugin-curator select ./work-plugins

# In TUI:
# 1. Select SessionStart hooks from plugin-a
# 2. Select SessionStart hooks from plugin-b
# 3. Both will merge into a single SessionStart event
```

## Troubleshooting

### No plugins found

Ensure each plugin directory has a `.claude-plugin/plugin.json` file:

```
my-plugin/
└── .claude-plugin/
    └── plugin.json       # Must exist
```

### Save fails with "No components selected"

You must select at least one component before saving. Press `SPACE` on components to select them.

### Output directory already exists

The curator will prompt you to overwrite. Press `Y` to continue or `N` to cancel.

## License

MIT

## Contributing

Contributions are welcome! Please check the `docs/spec/` directory for implementation specifications.

## Credits

Built following the official Claude Code plugin specification.

Documentation: https://code.claude.com/docs/es/plugins-reference
