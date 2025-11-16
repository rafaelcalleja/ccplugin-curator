# ccplugin-curator

TUI for curating Claude Code plugins from multiple sources.

## Features

- **Auto-discovery**: Automatically finds commands, agents, skills, hooks, and MCP servers
- **Interactive TUI**: Three-panel interface for browsing and selecting components
- **Dual output**: Generates both official plugin format and normalized format
- **Component copying**: Automatically copies selected components to output directory

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
npm start <plugins-directory>

# Example
npm start ~/.claude/plugins
npm start ./test-fixtures
```

## TUI Controls

- `←→`: Switch between panels
- `↑↓`: Navigate items
- `SPACE`: Toggle selection
- `A`: Select all components
- `N`: Deselect all components
- `S`: Save selection
- `Q`: Quit

## Output Structure

When you save a selection, the curator generates:

```
output/curated-plugin/
├── .claude-plugin/
│   └── marketplace.json          ← Marketplace config
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       ← Official format
│       ├── commands/             ← Selected components
│       ├── agents/
│       └── skills/
└── normalized-plugin.json        ← Normalized format (for debugging)
```

## Installation of Curated Plugin

```bash
/plugin marketplace add ./output/curated-plugin
/plugin install curated-plugin
```

## Development

```bash
# Build
npm run build

# Run tests
npm test

# Run integration tests
npm run test:integration

# Generate types from schemas
npm run generate-types

# Development mode (watch)
npm run dev
```

## Project Structure

```
ccplugin-curator/
├── docs/                          # Specifications
│   ├── spec/                      # Detailed specs
│   └── decisions/                 # Technical decisions
├── schemas/                       # JSON Schemas
│   ├── plugin.schema.json
│   └── normalized-plugin.schema.json
├── src/
│   ├── cli.ts                     # CLI entry point
│   ├── lib/                       # Core logic
│   │   ├── discovery.ts           # Auto-discovery
│   │   ├── normalize.ts           # Official → Normalized
│   │   ├── denormalize.ts         # Normalized → Official
│   │   └── file-ops.ts            # File operations
│   ├── ui/                        # TUI components
│   │   └── App.tsx                # Main TUI app
│   └── types/                     # Generated TypeScript types
├── test-fixtures/                 # Test plugins
└── output/                        # Generated outputs
```

## Specifications

See [docs/spec/README.md](docs/spec/README.md) for complete specifications including:

- Normalization protocol
- Plugin format specification
- TUI visual spec
- User workflows (BDD)
- Transformation rules
- Integration test spec

## License

MIT
