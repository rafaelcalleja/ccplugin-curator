# mkcurator

Claude Code plugin curator - A TUI for selecting and combining plugin components.

## Overview

`mkcurator` is a terminal user interface (TUI) application that allows you to curate custom Claude Code plugins by selecting components from one or more existing plugins. It provides an interactive 3-panel interface for browsing, selecting, and combining:

- Commands
- Agents
- Skills
- Hooks
- MCP Servers

## Features

- **3-Panel TUI**: Intuitive interface with plugins list, components panel, and real-time preview
- **Multi-Plugin Support**: Select components from multiple plugins simultaneously
- **Smart Normalization**: Automatically normalizes plugins from official format to internal format
- **Dual Output**: Generates both official plugin.json and normalized format for debugging
- **Marketplace Ready**: Outputs marketplace.json for easy installation
- **Component Copying**: Automatically copies selected files and directories to output

## Installation

```bash
npm install
npm run build
```

## Usage

### Installation

First, build the project and link it globally:

```bash
npm install
npm run build
npm link  # Install globally
```

### Basic Usage

```bash
# Using global command (after npm link)
mkcurator select <plugin-directory>

# Or using the helper script
./run.sh select <plugin-directory>

# Or directly with node
node dist/cli.js select <plugin-directory>
```

### Examples

```bash
# Test with included fixtures
mkcurator select test-fixtures

# Use with your Claude plugins
mkcurator select ~/.claude/plugins

# With output options
mkcurator select ~/.claude/plugins \
  --output ./my-curated-plugin \
  --name my-plugin
```

### Options

- `<plugin-directory>`: Directory containing Claude Code plugins (required)
- `--output, -o <dir>`: Output directory (default: `./output/curated-plugin`)
- `--name, -n <name>`: Plugin name (default: `curated-plugin`)

## TUI Controls

- `←→` or `h/l`: Switch between panels
- `↑↓` or `k/j`: Navigate within lists
- `SPACE`: Toggle component selection
- `A`: Select all components from current plugin
- `N`: Deselect all components from current plugin
- `S`: Save selection
- `Q` or `Ctrl+C`: Quit

## Output Structure

When you press `S` to save, the application generates:

```
output/curated-plugin/
├── .claude-plugin/
│   └── marketplace.json          ← Marketplace config
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       ← Official format
│       ├── commands/             ← Copied component files
│       ├── agents/
│       └── skills/
└── normalized-plugin.json        ← Normalized format (debugging)
```

## Installation of Curated Plugin

After saving, install your curated plugin in Claude Code:

```bash
/plugin marketplace add ./output/curated-plugin
/plugin install curated-plugin
```

## Architecture

### Project Structure

```
src/
├── cli.ts                    # CLI entry point
├── index.ts                  # Main exports
├── scanner/                  # Plugin scanning and loading
│   └── plugin-scanner.ts
├── transformation/           # Format transformations
│   ├── normalize.ts          # Official → Normalized
│   └── denormalize.ts        # Normalized → Official
├── tui/                      # Terminal UI
│   └── index.ts
├── save/                     # Save operations
│   └── save-operation.ts
├── utils/                    # Utilities
│   └── selection-state.ts
└── types/                    # TypeScript types (generated)
    ├── plugin.ts
    └── normalized.ts
```

### Transformation Flow

1. **Scan**: Discover plugins in directory
2. **Normalize**: Transform official format → normalized format
3. **Select**: User selects components via TUI
4. **Save**: Generate output files
5. **Denormalize**: Transform normalized → official format for output

## Specifications

This application implements the following specifications:

- **001-normalization-protocol.md**: Normalized format definition
- **002-plugin-format-spec.md**: Official Claude Code format
- **005-transformation-rules.md**: Official → Normalized transformation
- **006-reverse-transformation-rules.md**: Normalized → Official transformation
- **007-save-operation-rules.md**: Save operation behavior
- **004-user-workflows.md**: User interaction flows

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Generate Types

```bash
npm run generate-types
```

This regenerates TypeScript types from JSON schemas.

## Type Generation

Types are automatically generated from JSON schemas using `json-schema-to-typescript`:

- `schemas/plugin.schema.json` → `src/types/plugin.ts`
- `schemas/normalized-plugin.schema.json` → `src/types/normalized.ts`

## License

MIT
