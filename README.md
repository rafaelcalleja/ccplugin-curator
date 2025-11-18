# Claude Plugin Curator

Interactive TUI tool for curating and combining Claude Code plugins. Select components from multiple plugins and create a custom curated plugin.

## Features

- **Interactive TUI**: Beautiful terminal interface with 3-panel layout
- **Multi-Plugin Selection**: Load and combine components from multiple plugins
- **Real-Time Preview**: See your curated plugin.json in real-time
- **Conflict Resolution**: Automatic namespace conflict handling
- **Type-Safe**: Full TypeScript implementation with generated types from JSON schemas
- **Spec-Compliant**: Implements official Claude Code plugin format

## Installation

```bash
npm install -g ccplugin-curator
```

Or run directly with npx:

```bash
npx ccplugin-curator select <plugin-folder>
```

## Usage

### Basic Usage

Load a single plugin:

```bash
ccplugin-curator select /path/to/my-plugin
```

Load multiple plugins from a directory:

```bash
ccplugin-curator select /path/to/plugins-directory
```

### Options

- `-o, --output <path>`: Output directory (default: `./output`)
- `-n, --name <name>`: Output plugin name (default: `curated-plugin`)

Example:

```bash
ccplugin-curator select ./my-plugins --output ./my-output --name my-curated-plugin
```

## Interactive UI

The TUI has three panels:

### 1. Plugins Panel (Left)
- Lists all loaded plugins
- Shows component counts for each plugin
- Active plugin marked with ★

### 2. Components Panel (Center)
- Shows all components from the active plugin:
  - COMMANDS
  - AGENTS
  - SKILLS
  - HOOKS
  - MCP SERVERS
- Use checkboxes to select components

### 3. Preview Panel (Right)
- Real-time JSON preview of your curated plugin
- Shows the final plugin.json format
- Updates as you make selections

## Keyboard Controls

- **↑/↓**: Navigate components
- **Space**: Toggle selection
- **Tab**: Switch between plugins
- **S**: Save curated plugin
- **Q**: Quit without saving

## Output Structure

After saving, the tool creates:

```
output/
├── .claude-plugin/
│   └── marketplace.json          # For Claude Code marketplace
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       # For Claude Code
│       ├── commands/             # Copied command files
│       ├── agents/               # Copied agent files
│       ├── skills/               # Copied skill directories
│       └── hooks/                # Copied hook scripts (executable)
└── normalized-plugin.json        # Debug output
```

## Features

### Auto-Discovery

Automatically discovers plugin components:
- Commands: `./commands/**/*.md`
- Agents: `./agents/**/*.md`
- Skills: `./skills/*/SKILL.md`
- Hooks: `./hooks/hooks.json` or `./settings.json`
- MCP Servers: `./.mcp.json`

### Namespace Conflict Resolution

Automatically handles filename conflicts:
- Applies `plugin-name--` prefix to conflicting files
- Merges hooks with the same event
- Updates all paths in plugin.json

### File Copying

- Commands and agents: Individual file copy
- Skills: Recursive directory copy
- Hook scripts: Copied with executable permissions (`chmod +x`)

## Development

### Setup

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Generate types from schemas
npm run generate-types
```

### Project Structure

```
src/
├── loader/          # Plugin loading and auto-discovery
├── transform/       # Official ↔ Normalized transformations
├── validator/       # JSON Schema validation
├── tui/            # Terminal UI components
├── saver/          # Save operations and file copying
└── cli.ts          # CLI entry point

schemas/
├── plugin.schema.json              # Official format schema
└── normalized-plugin.schema.json   # Normalized format schema

docs/
├── spec/           # Specifications
└── decisions/      # Design decisions
```

## Specifications

This project implements the Claude Code plugin format according to:

- **Spec 001**: Normalization Protocol
- **Spec 002**: Official Plugin Format
- **Spec 003**: TUI Visual Specification
- **Spec 004**: User Workflows (BDD)
- **Spec 005**: Forward Transformation Rules
- **Spec 006**: Reverse Transformation Rules
- **Spec 007**: Save Operation Rules
- **Spec 008**: Integration Test Specification

See `docs/spec/` for complete specifications.

## License

ISC

## Contributing

Contributions welcome! Please read the specifications in `docs/spec/` before making changes.
