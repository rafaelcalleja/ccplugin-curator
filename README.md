# MkCurator

TUI for curating Claude Code plugins by selecting components from multiple sources.

## Features

- 🔍 Scan multiple Claude Code plugins from a directory
- 🖥️ Interactive three-panel TUI (plugins, components, preview)
- ✅ Select individual components (commands, agents, skills, hooks, MCP servers)
- 💾 Generate curated plugin.json with selected components
- 📦 Full support for official Claude Code plugin format
- 🔄 Auto-discovery of components from plugin directories
- 🎨 Real-time JSON preview of selections

## Installation

```bash
npm install
npm run build
```

## Usage

### Command Line

```bash
# Select components from plugins directory
npx tsx src/cli.tsx select <path-to-plugins-directory>

# With custom output path and name
npx tsx src/cli.tsx select ~/.claude/plugins --output ./my-plugin.json --name my-custom-plugin

# Or using npm script
npm run cli -- select <path-to-plugins-directory>
```

### TUI Controls

- **←→**: Switch between panels (plugins, components, preview)
- **↑↓**: Navigate items in the active panel
- **SPACE**: Toggle selection of current item
- **TAB**: Switch to next plugin
- **SHIFT+TAB**: Switch to previous plugin
- **A**: Select all items of current type
- **N**: Select none (deselect all of current type)
- **S**: Save curated plugin to file
- **Q**: Quit application

## Architecture

The application follows a systematic transformation pipeline:

1. **Scan**: Discover all plugins in specified directory
2. **Normalize**: Transform official plugin.json format to internal normalized format
3. **Select**: User interacts with TUI to select desired components
4. **Transform**: Reverse transformation from normalized format back to official format
5. **Save**: Write curated plugin.json to output file

### Project Structure

```
mkcurator/
├── schemas/                    # JSON schemas for validation
│   ├── plugin.schema.json
│   └── normalized-plugin.schema.json
├── src/
│   ├── components/             # React (Ink) TUI components
│   │   ├── App.tsx            # Main application component
│   │   ├── PluginList.tsx     # Left panel: plugin list
│   │   ├── ComponentList.tsx  # Center panel: component selection
│   │   └── PreviewPanel.tsx   # Right panel: JSON preview
│   ├── lib/                   # Core library functions
│   │   ├── auto-discovery.ts  # File system scanning
│   │   ├── normalize.ts       # Official → Normalized transformation
│   │   ├── reverse-transform.ts # Normalized → Official transformation
│   │   └── save.ts            # Save curated plugin
│   ├── types/                 # Generated TypeScript types
│   ├── cli.tsx                # CLI entry point
│   └── index.ts               # Programmatic API exports
└── docs/                      # Specifications
    ├── spec/                  # Detailed specifications
    └── decisions/             # Technical decisions
```

## Specifications

See `/home/rcalleja/projects/claude-marketplace-builder/docs/spec/` for detailed specifications:

- **001-normalization-protocol.md**: Plugin normalization format
- **002-plugin-format-spec.md**: Official Claude Code plugin format
- **003-tui-visual-spec.md**: TUI design and visual specification
- **004-user-workflows.md**: BDD-style user workflows
- **005-transformation-rules.md**: Official → Normalized transformation rules
- **006-reverse-transformation-rules.md**: Normalized → Official transformation rules

## Development

```bash
# Install dependencies
npm install

# Generate TypeScript types from JSON schemas
npm run generate-types

# Run the CLI
npx tsx src/cli.tsx select <plugins-directory>

# Run tests
npm test
```

## Example

```bash
# Assuming you have Claude Code plugins in ~/.claude/plugins
npx tsx src/cli.tsx select ~/.claude/plugins

# This will:
# 1. Scan for all plugins with .claude-plugin/plugin.json
# 2. Auto-discover commands, agents, skills, hooks, and MCP servers
# 3. Launch interactive TUI for component selection
# 4. Save curated plugin to ./output/plugin.json when you press 'S'
```

## License

MIT
