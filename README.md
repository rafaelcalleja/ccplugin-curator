# ccplugin-curator

A TUI tool for curating and combining Claude Code plugin components from multiple plugins into a single curated plugin.

## Features

- 📂 Scan multiple Claude Code plugins in a directory
- 🔍 Auto-discover commands, agents, and skills
- ✅ Interactive TUI for selecting components
- 🔄 Intelligent conflict resolution with namespace prefixes
- 💾 Generate properly formatted plugin.json and marketplace.json
- 📦 Ready-to-install output directory

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

```bash
ccplugin-curator select <plugin-folder>
```

This will:
1. Scan all plugins in `<plugin-folder>`
2. Launch an interactive TUI to select components
3. Save the curated plugin to `./output/curated-plugin`

### Options

```bash
ccplugin-curator select <plugin-folder> [options]
```

**Options:**
- `-o, --output <dir>` - Output directory (default: `./output/curated-plugin`)
- `-n, --name <name>` - Plugin name (default: `curated-plugin`)
- `--overwrite` - Overwrite output directory if exists (default: `false`)

### Examples

**Basic example:**
```bash
ccplugin-curator select ./my-plugins
```

**Custom output directory and name:**
```bash
ccplugin-curator select ./my-plugins -o ./my-output -n my-custom-plugin
```

**Overwrite existing output:**
```bash
ccplugin-curator select ./my-plugins --overwrite
```

## TUI Navigation

Once the TUI launches, you can navigate using:

- **Arrow Keys** - Navigate between plugins and components
- **Space** - Toggle selection of current component
- **Tab / Shift+Tab** - Switch between plugins
- **A** - Select all components in current plugin
- **N** - Deselect all components in current plugin
- **S** - Save selection and exit
- **Q** - Quit without saving

### TUI Layout

```
┌─────────────┬──────────────────┬─────────────────┐
│  PLUGINS    │   COMPONENTS     │    PREVIEW      │
│             │                  │                 │
│ ► plugin-a  │ COMMANDS         │ {               │
│   plugin-b  │ [✓] cmd1.md      │   "name": "...", │
│             │ [ ] cmd2.md      │   "commands": [...] │
│             │                  │   ...           │
│             │ AGENTS           │ }               │
│             │ [✓] agent1.md    │                 │
│             │                  │                 │
│             │ SKILLS           │                 │
│             │ [ ] skill1/      │                 │
└─────────────┴──────────────────┴─────────────────┘
```

## Output Structure

After saving, the output directory will contain:

```
output/curated-plugin/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace configuration
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Official plugin.json
│       ├── commands/              # Selected commands
│       ├── agents/                # Selected agents
│       └── skills/                # Selected skills
└── normalized-plugin.json         # Debug/testing file
```

## Installing the Curated Plugin

After creating your curated plugin, install it in Claude Code:

```bash
# Add marketplace
/plugin marketplace add /path/to/output/curated-plugin

# Install plugin
/plugin install curated-plugin
```

## Conflict Resolution

When multiple plugins have components with the same name, ccplugin-curator automatically resolves conflicts using namespace prefixes:

**Example:**
- `plugin-a` has `commands/build.md`
- `plugin-b` has `commands/build.md`

**Result:**
- `commands/plugin-a--build.md`
- `commands/plugin-b--build.md`

This applies to:
- Commands
- Agents
- Skills
- MCP Servers

**Hooks** are merged by event type (no conflicts).

## Plugin Requirements

For a directory to be recognized as a plugin, it must have:

```
plugin-name/
└── .claude-plugin/
    └── plugin.json
```

The `plugin.json` must be valid according to the Claude Code plugin schema.

## Development

### Build from source

```bash
# Install dependencies
npm install

# Generate TypeScript types from JSON schemas
npm run generate-types

# Build
npm run build

# Run locally
node dist/index.js select <plugin-folder>
```

### Project Structure

```
ccplugin-curator/
├── schemas/                      # JSON Schema definitions
│   ├── plugin.schema.json
│   ├── normalized-plugin.schema.json
│   └── marketplace.schema.json
├── src/
│   ├── index.ts                 # CLI entry point
│   ├── core/
│   │   ├── plugin-loader.ts     # Plugin discovery and loading
│   │   ├── auto-discovery.ts    # Component auto-discovery
│   │   ├── hooks-loader.ts      # Hook normalization
│   │   ├── mcp-loader.ts        # MCP normalization
│   │   ├── normalizer.ts        # Main normalization logic
│   │   └── save/                # Save operation modules
│   ├── transformers/
│   │   └── reverse/             # Normalized → Official format
│   ├── tui/                     # Terminal UI components
│   └── types/                   # Generated TypeScript types
├── docs/
│   └── spec/                    # Detailed specifications
└── package.json
```

## Documentation

Detailed specifications are available in the `docs/spec/` directory:

- `001-scope-and-goals.md` - Project scope and objectives
- `002-official-plugin-format.md` - Claude Code plugin format
- `003-normalized-format.md` - Internal normalized format
- `004-user-workflows.md` - User interaction workflows
- `005-auto-discovery-rules.md` - Component discovery rules
- `006-transform-mappings.md` - Format transformation mappings
- `007-save-operation-rules.md` - Save operation specifications
- `008-test-cases.md` - Test scenarios and BDD specs

## License

MIT

## Version

0.0.13
