# ccplugin-curator

Claude Code Plugin Curator - A TUI for selecting and curating plugin components from multiple sources.

## Overview

This tool allows you to:
- Scan and load Claude Code plugins
- Select specific components (commands, agents, skills, hooks, MCPs)
- Merge components from multiple plugins
- Generate a curated plugin with only the components you need

## Features

- ✅ **Auto-discovery**: Automatically finds all plugin components
- ✅ **Normalization**: Converts plugins to a consistent internal format
- ✅ **Conflict Resolution**: Handles naming conflicts with namespace prefixes
- ✅ **Dual Output**: Generates both official and normalized formats
- ✅ **Full Validation**: Ensures output conforms to Claude Code plugin spec

## Installation

```bash
npm install
npm run build
```

## Usage

### Select Components from Plugin(s)

```bash
npx ccplugin-curator select ./plugins
```

This will:
1. Scan the `./plugins` directory for Claude Code plugins
2. Load and normalize each plugin
3. Launch TUI for component selection (coming soon)
4. Save curated selection to `./output`

### Using the Output

After saving, install the curated plugin:

```bash
/plugin marketplace add ./output
/plugin install curated-plugin
