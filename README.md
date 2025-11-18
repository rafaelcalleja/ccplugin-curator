# CCPlugin Curator

**Curate and combine Claude Code plugin components into unified plugins**

CCPlugin Curator is a powerful tool that allows you to select and combine components (commands, agents, skills, hooks, and MCP servers) from multiple Claude Code plugins into a single curated plugin.

## Features

- 🎯 **Interactive TUI** - Beautiful text-based interface for component selection
- 🔄 **Format Normalization** - Converts official → normalized → official formats
- ⚔️ **Conflict Resolution** - Automatic namespace prefixing for conflicting components
- ✅ **Validation** - JSON schema validation for both formats
- 📦 **Complete Output** - Generates marketplace.json and plugin.json ready for Claude Code
- 🛠️ **CLI & TUI Modes** - Both command-line and interactive interfaces

## Installation

```bash
npm install
npm run build
```

## Quick Start

```bash
# Run interactive TUI
npm start

# Or use the CLI directly
npm run cli -- curate
```

## Usage

### Interactive TUI Mode (Recommended)

```bash
npm start
# or
npm run cli -- curate
# or
node dist/cli/index.js curate
```

This launches an interactive TUI that guides you through:
1. **Main Menu** - Welcome screen
2. **Configuration Form** - Set marketplace name, plugin name, source/output directories
3. **Component Selection** - Three-panel interface to select components from plugins
4. **Save Operation** - Generates the curated plugin with conflict resolution

### CLI Commands

#### 1. Normalize a Plugin

View the internal normalized structure of a plugin:

```bash
node dist/cli/index.js normalize <plugin-directory>
```

**Example:**
```bash
node dist/cli/index.js normalize ./my-plugin
```

**Output:**
- Complete normalized plugin structure (JSON)
- Statistics (counts of commands, agents, skills, hooks, MCPs)

#### 2. List Plugins

List all Claude Code plugins in a directory:

```bash
node dist/cli/index.js list <directory>
```

**Example:**
```bash
node dist/cli/index.js list ./plugins
```

#### 3. Combine Plugins (Non-Interactive)

Combine all plugins from a directory without the TUI:

```bash
node dist/cli/index.js combine <source-dir> \
  -n <plugin-name> \
  -o <output-dir> \
  [-m <marketplace-name>] \
  [-e <author-email>]
```

**Example:**
```bash
node dist/cli/index.js combine ./plugins \
  -n my-curated-plugin \
  -o ./output \
  -m my-marketplace \
  -e user@example.com
```

**Options:**
- `-n, --name <name>` - Name of the curated plugin (required)
- `-o, --output <dir>` - Output directory (required)
- `-m, --marketplace <name>` - Marketplace name (default: "curated-plugins")
- `-e, --email <email>` - Author email (optional)

**Note:** This command selects ALL components from ALL plugins in the source directory.

## TUI Keyboard Controls

### Main Menu
- `↑↓` - Navigate menu options
- `ENTER` - Select option
- `Q` - Quit

### Configuration Form
- `TAB` / `SHIFT+TAB` - Navigate between fields
- `↑↓` - Navigate fields
- `ENTER` - Validate field / Continue
- `ESC` - Cancel and return

**Validation:**
- **Marketplace Name**: kebab-case, 3-50 characters (e.g., `my-plugins`)
- **Plugin Name**: any valid name
- **Source Directory**: must exist and contain plugins
- **Output Directory**: auto-filled from marketplace name
- **Author Email**: optional, standard email format

### Component Selection (3-Panel Layout)

**Panels:**
- **Left (PLUGINS)** - List of discovered plugins
- **Center (COMPONENTS)** - Components of selected plugin
- **Right (PREVIEW)** - Real-time JSON preview of selections

**Controls:**
- `←→` / `H L` - Switch between panels
- `↑↓` / `J K` - Navigate within panel
- `SPACE` - Toggle component selection
- `A` - Select all components in current plugin
- `N` - Deselect all components in current plugin
- `S` - Save selection and generate curated plugin
- `Q` / `ESC` - Quit without saving

## Output Structure

When you save a curated plugin, the following structure is generated:

```
output-directory/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace configuration
├── plugins/
│   └── your-plugin-name/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Official Claude Code format
│       ├── commands/             # Selected commands
│       ├── agents/               # Selected agents
│       ├── skills/               # Selected skills
│       └── hooks/                # Hook scripts (with executable permissions)
└── normalized-plugin.json        # Debugging/testing format
```

### Installing the Curated Plugin

```bash
/plugin marketplace add ./output-directory
/plugin install your-plugin-name
```

## Conflict Resolution

When combining plugins, CCPlugin Curator automatically resolves naming conflicts:

### File Conflicts (Commands, Agents)
**Problem:** Two plugins have `commands/build.md`

**Solution:** Namespace prefixing
- `plugin-a/commands/build.md` → `commands/plugin-a--build.md`
- `plugin-b/commands/build.md` → `commands/plugin-b--build.md`

### Skill Directory Conflicts
**Problem:** Two plugins have `skills/chrome-devtools/`

**Solution:** Namespace prefixing
- `plugin-a/skills/chrome-devtools/` → `skills/plugin-a--chrome-devtools/`
- `plugin-b/skills/chrome-devtools/` → `skills/plugin-b--chrome-devtools/`

### MCP Name Conflicts
**Problem:** Two plugins have MCP server "tavily"

**Solution:** Namespace prefixing
```json
{
  "mcpServers": {
    "plugin-a--tavily": { ... },
    "plugin-b--tavily": { ... }
  }
}
```

### Hook Merging (No Conflict)
**Scenario:** Multiple plugins have SessionStart hooks

**Solution:** Merge into single array (preserves selection order)
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/plugin-a--setup.sh" },
          { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/plugin-b--init.sh" }
        ]
      }
    ]
  }
}
```

## Architecture

### Core Modules

- **normalizer.ts** - Transforms official → normalized format
  - Auto-discovery (commands, agents, skills via glob patterns)
  - Hook parsing (nested → flat array)
  - MCP parsing (object → array)

- **reverse-transformer.ts** - Transforms normalized → official format
  - Hook grouping by event and matcher
  - MCP array → object conversion
  - Default value omission

- **validator.ts** - Validation logic
  - JSON schema validation (Ajv)
  - Input validation (marketplace name, email, directories)

- **conflict-resolver.ts** - Conflict detection and resolution
  - Filename conflicts (commands, agents, skills)
  - MCP name conflicts
  - Hook script conflicts

- **file-ops.ts** - File system operations
  - Copy files/directories
  - Set executable permissions (hook scripts)
  - Write pretty-printed JSON

- **save-controller.ts** - Orchestration
  - Merge selections from multiple plugins
  - Apply conflict resolution
  - Generate all output files

### TUI Screens

- **main-menu.ts** - Welcome screen with navigation
- **config-form.ts** - Configuration form with real-time validation
- **component-selection.ts** - Three-panel selection interface
- **state.ts** - Centralized state management

## Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

### Type Generation

JSON schemas are in `schemas/` and types are auto-generated:

```bash
npm run generate-types
```

## Project Structure

```
ccplugin-curator/
├── src/
│   ├── cli/
│   │   └── index.ts              # CLI entry point
│   ├── lib/
│   │   ├── normalizer.ts         # Official → Normalized
│   │   ├── reverse-transformer.ts # Normalized → Official
│   │   ├── validator.ts          # Validation logic
│   │   ├── conflict-resolver.ts  # Conflict resolution
│   │   ├── file-ops.ts           # File operations
│   │   └── save-controller.ts    # Save orchestration
│   ├── tui/
│   │   ├── screens/
│   │   │   ├── main-menu.ts      # Main menu TUI
│   │   │   ├── config-form.ts    # Configuration form
│   │   │   └── component-selection.ts # Component selector
│   │   └── state.ts              # TUI state management
│   └── types/
│       ├── plugin.ts             # Official format types
│       └── normalized.ts         # Normalized format types
├── schemas/
│   ├── plugin.schema.json        # Official format schema
│   └── normalized-plugin.schema.json # Normalized format schema
├── bin/
│   └── app                       # Executable entry point
├── docs/
│   ├── spec/                     # Technical specifications
│   └── decisions/                # Design decisions
└── test/
    ├── unit/                     # Unit tests
    ├── integration/              # Integration tests
    └── fixtures/                 # Test plugins
```

## Specifications

Comprehensive specifications are available in `docs/spec/`:

1. **001-normalization-protocol.md** - Format normalization rules
2. **002-plugin-format-spec.md** - Official Claude Code format
3. **003-tui-visual-spec.md** - TUI design and layout
4. **004-user-workflows.md** - User interaction flows
5. **005-transformation-rules.md** - Official → Normalized rules
6. **006-reverse-transformation-rules.md** - Normalized → Official rules
7. **007-save-operation-rules.md** - Save operation behavior
8. **008-integration-test-spec.md** - BDD test scenarios
9. **009-tui-setup-screens.md** - TUI screen specifications

## License

MIT

## Contributing

Contributions are welcome! Please read the specifications in `docs/spec/` before contributing.

## Support

For issues and questions:
- GitHub Issues: https://github.com/rafaelcalleja/ccplugin-curator/issues
- Documentation: See `docs/spec/` directory
