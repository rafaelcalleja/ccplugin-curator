# CCPlugin Curator

TUI for curating and selecting components from Claude Code plugins.

## Features

- **Interactive TUI**: 3-panel interface for browsing and selecting plugin components
- **Multi-plugin support**: Curate components from multiple plugins into one
- **Conflict resolution**: Automatic namespace prefixing for name conflicts
- **Dual output**: Generates both official (`plugin.json`) and normalized formats
- **Validation**: JSON schema validation for all formats

## Installation

```bash
npm install
npm run build
```

## Usage

### Interactive Mode (Recommended)

```bash
# Launch interactive setup
ccplugin-curator
```

This will guide you through:
1. **Main Menu**: Choose to create a new curated plugin or exit
2. **Configuration Form**: Enter plugin metadata
   - Marketplace Name (lowercase, numbers, hyphens)
   - Plugin Name (display name)
   - Source Plugin Directory (where your plugins are)
   - Output Directory (where to save)
   - Author Email (optional)
3. **Component Selection**: 3-panel TUI for selecting components

### Direct Mode

```bash
# Skip setup and go directly to component selection
ccplugin-curator select ./plugins

# Specify output directory
ccplugin-curator select ./plugins -o ./my-output
```

### Setup Screen Navigation

**Main Menu:**
- **↑/↓**: Navigate options
- **ENTER**: Select option
- **Q/ESC**: Quit

**Configuration Form:**
- **↑/↓/TAB**: Navigate fields
- **Type**: Edit field (placeholder disappears)
- **ENTER**: Submit form (when all required fields valid)
- **ESC**: Cancel and return to Main Menu

### Component Selection Navigation

- **←/→**: Switch between panels (Plugins | Components | Preview)
- **↑/↓**: Navigate items in Components panel
- **SPACE**: Toggle selection
- **A**: Select all components in current plugin
- **N**: Deselect all components in current plugin
- **S**: Save curated plugin
- **Q**: Quit
- **TAB/SHIFT+TAB**: Switch between plugins (when multiple loaded)

## Architecture

### Formats

The curator works with two formats:

1. **Official Format**: Claude Code's `plugin.json` format
2. **Normalized Format**: Internal flat structure used by the TUI

### Transformation Pipeline

```
Official Plugin → Normalize → TUI Selection → Reverse Transform → Output
```

### Directory Structure

```
output/curated-plugin/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace config
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Official format (use in Claude Code)
│       ├── commands/             # Selected command files
│       ├── agents/               # Selected agent files
│       └── skills/               # Selected skill directories
└── normalized-plugin.json        # Normalized format (debugging)
```

## Installation in Claude Code

After saving your curated plugin:

```bash
/plugin marketplace add ./output/curated-plugin
/plugin install curated-plugin
```

## Development

### Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

### Generate Types

```bash
npm run generate-types
```

## Documentation

See `docs/` for detailed specifications:

- [001 - Normalization Protocol](./docs/spec/001-normalization-protocol.md)
- [002 - Official Plugin Format](./docs/spec/002-plugin-format-spec.md)
- [003 - TUI Visual Spec](./docs/spec/003-tui-visual-spec.md)
- [004 - User Workflows](./docs/spec/004-user-workflows.md)
- [005 - Transformation Rules](./docs/spec/005-transformation-rules.md)
- [006 - Reverse Transformation Rules](./docs/spec/006-reverse-transformation-rules.md)
- [007 - Save Operation Rules](./docs/spec/007-save-operation-rules.md)
- [008 - Integration Test Spec](./docs/spec/008-integration-test-spec.md)
- [009 - TUI Setup Screens](./docs/spec/009-tui-setup-screens.md)

## License

MIT
