# ccplugin-curator

> 🎨 Interactive TUI for curating and combining Claude Code plugin components

[![Tests](https://img.shields.io/badge/tests-184%20passing-brightgreen)](tests/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A powerful terminal user interface (TUI) tool for creating curated Claude Code plugins by selecting and combining components from multiple existing plugins. Perfect for building custom plugin collections tailored to your workflow.

## ✨ Features

- 🚀 **Interactive Setup Wizard** - Guided workflow with real-time validation and plugin scanning
- 🎯 **Interactive TUI** - Navigate and select components with keyboard shortcuts
- 📦 **Multi-Plugin Support** - Combine components from multiple plugins into one
- 🔍 **Auto-Discovery** - Automatically discovers commands, agents, skills, hooks, and MCPs
- ⚡ **Smart Conflict Resolution** - Automatic namespace prefixing for conflicting component names
- 🔄 **Hook Script Transformation** - Transforms local paths to `${CLAUDE_PLUGIN_ROOT}` for portability
- ✅ **Schema Validation** - Validates all outputs against official Claude Code schemas
- 📊 **Real-time Preview** - Live JSON preview of your curated plugin
- 🎨 **3-Panel Layout** - Clear separation of plugins, components, and preview
- 💾 **Ready to Install** - Generates complete marketplace structure for immediate use

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Usage](#cli-usage)
- [TUI Navigation](#tui-navigation)
- [Features in Detail](#features-in-detail)
- [Output Structure](#output-structure)
- [Installing the Curated Plugin](#installing-the-curated-plugin)
- [Development](#development)
- [Testing](#testing)
- [Documentation](#documentation)

## 🚀 Installation

### Global Install

```bash
npm install -g ccplugin-curator
```

### Use with npx (no install)

```bash
npx ccplugin-curator select <plugin-folder>
```

### Build from Source

```bash
git clone https://github.com/yourusername/ccplugin-curator.git
cd ccplugin-curator
npm install
npm run build
npm link
```

## ⚡ Quick Start

### Interactive Mode (Recommended)

The easiest way to get started is with the interactive setup wizard:

```bash
ccplugin-curator
```

The wizard guides you through three simple steps:

1. **Main Menu** - Choose to create a new curated plugin or exit
2. **Configuration Form** - Set up your plugin with real-time validation:
   - Marketplace Name (required, auto-validates format)
   - Plugin Name (required)
   - Source Directory (required, automatically scans and counts plugins)
   - Output Directory (optional, auto-fills from marketplace name)
   - Author Email (optional)
3. **Component Selection** - Interactive TUI for picking components:
   - Navigate with arrow keys
   - Press `SPACE` to select/deselect
   - Press `S` to save your curated plugin

### Direct Mode

For automation or quick operations, use direct mode:

```bash
ccplugin-curator select ./my-plugins
```

**With custom options:**
```bash
ccplugin-curator select ./my-plugins \
  -o ./my-curated-collection \
  -n my-awesome-plugin \
  --owner-name "John Doe" \
  --owner-email "john@example.com"
```

### Installing Your Curated Plugin

After creation, install in Claude Code:

```bash
/plugin marketplace add ./output/curated-plugin
/plugin install curated-plugin
```

## 💻 CLI Usage

### Command

```bash
ccplugin-curator select <plugin-folder> [options]
```

### Interactive Mode

Run without arguments to launch the interactive setup wizard:

```bash
ccplugin-curator
```

The wizard will guide you through:
1. **Main Menu** - Choose to create a new curated plugin or exit
2. **Configuration Form** - Configure your plugin with validation:
   - Marketplace Name (required, lowercase letters/numbers/hyphens)
   - Plugin Name (required)
   - Source Directory (required, automatically scans for plugins)
   - Output Directory (optional, auto-fills from marketplace name)
   - Author Email (optional)
3. **Component Selection** - Interactive TUI for selecting components

### Direct Mode Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--output <dir>` | `-o` | Output directory | `./output/curated-plugin` |
| `--name <name>` | `-n` | Plugin name | `curated-plugin` |
| `--overwrite` | - | Overwrite if exists | `false` |
| `--owner-name <name>` | - | Owner name for marketplace.json | - |
| `--owner-email <email>` | - | Owner email for marketplace.json | - |

### Examples

**Basic usage:**
```bash
ccplugin-curator select ./my-plugins
```

**Custom output directory and name:**
```bash
ccplugin-curator select ./my-plugins \
  -o ./my-curated-collection \
  -n my-awesome-plugin
```

**Overwrite existing output:**
```bash
ccplugin-curator select ./my-plugins --overwrite
```

**With owner information:**
```bash
ccplugin-curator select ./my-plugins \
  -n my-plugin \
  --owner-name "John Doe" \
  --owner-email "john@example.com"
```

## 🎮 TUI Navigation

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Switch between panels (Plugins ↔ Components ↔ Preview) |
| `↑` `↓` | Navigate items in current panel |
| `SPACE` | Toggle selection of current component |
| `TAB` | Switch to next plugin |
| `SHIFT+TAB` | Switch to previous plugin |
| `A` | Select **all** components in current plugin |
| `N` | Select **none** (deselect all) in current plugin |
| `S` | **Save** selection and exit |
| `Q` | **Quit** without saving |

### TUI Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: my-awesome-plugin                                        [Tab 1 of 3]  │
├──────────────────────┬──────────────────────────────┬───────────────────────────┤
│ PLUGINS              │ COMPONENTS                   │ PREVIEW                   │
│                      │                              │                           │
│ ▼ plugin-a (★)       │ COMMANDS (3)                 │ {                         │
│   • 3 commands       │ ► [✓] analyze-context.md     │   "name": "...",          │
│   • 2 agents         │   [ ] optimize-workflow.md   │   "commands": [           │
│   • 5 hooks          │   [ ] sync-knowledge.md      │     "./commands/..."      │
│   • 2 MCPs           │                              │   ],                      │
│                      │ AGENTS (2)                   │   "agents": [],           │
│ ▽ plugin-b           │   [✓] context-agent          │   "skills": [],           │
│   • 25 commands      │   [ ] workflow-agent         │   "hooks": {},            │
│   • 3 skills         │                              │   "mcpServers": {}        │
│                      │ HOOKS (5)                    │ }                         │
│ ▽ plugin-c           │   [ ] SessionStart → setup   │                           │
│   • 15 commands      │   [ ] PreCommit → validate   │                           │
│   • 8 skills         │                              │                           │
│   • 1 MCP            │ MCP SERVERS (2)              │                           │
│                      │   [ ] tavily                 │                           │
│                      │   [ ] filesystem             │                           │
└──────────────────────┴──────────────────────────────┴───────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save   │
└────────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Features in Detail

### 1. Multi-Plugin Aggregation

Combine components from multiple plugins into a single curated plugin:

```bash
# Input: 3 separate plugins
my-plugins/
├── dev-tools/       # 10 commands, 2 agents
├── ai-helpers/      # 5 commands, 3 skills
└── utilities/       # 8 commands, 1 MCP

# Output: 1 curated plugin with selected components from all 3
output/my-curated/
└── plugins/my-curated/
    ├── commands/    # Selected from all 3 plugins
    ├── agents/      # Selected from dev-tools
    └── skills/      # Selected from ai-helpers
```

### 2. Intelligent Conflict Resolution

When multiple plugins have components with the same name, automatic namespace prefixing is applied:

**Example Conflict:**
- `plugin-a` has `commands/build.md`
- `plugin-b` has `commands/build.md`

**Resolved Output:**
```
curated-plugin/
└── commands/
    ├── plugin-a--build.md     # Namespaced
    └── plugin-b--build.md     # Namespaced
```

**plugin.json:**
```json
{
  "commands": [
    "./commands/plugin-a--build.md",
    "./commands/plugin-b--build.md"
  ]
}
```

**Applies to:**
- ✅ Commands
- ✅ Agents
- ✅ Skills
- ✅ MCP Servers
- ✅ Hook Scripts

**Hooks are merged** by event type (no conflicts).

### 3. Hook Script Transformation

Hook scripts are automatically transformed for portability:

**Input (plugin.json):**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "./hooks/setup.sh" }
        ]
      }
    ]
  }
}
```

**Output (curated plugin.json):**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/setup.sh" }
        ]
      }
    ]
  }
}
```

**Hook scripts are:**
- ✅ Copied to output directory
- ✅ Set with executable permissions (`chmod 755`)
- ✅ Paths transformed to use `${CLAUDE_PLUGIN_ROOT}`
- ✅ Namespaced if conflicts exist

### 4. Schema Validation

All generated outputs are validated against official Claude Code schemas:

- ✅ `plugin.json` - Validated against plugin schema
- ✅ `marketplace.json` - Validated against marketplace schema
- ✅ `normalized-plugin.json` - Validated against normalized schema

**If validation fails**, save is aborted with descriptive error messages.

### 5. Component Auto-Discovery

Automatically discovers components even if not declared in `plugin.json`:

**Discovery Rules:**
- **Commands**: `commands/**/*.md`
- **Agents**: `agents/**/*.md`
- **Skills**: `skills/*/SKILL.md` (skill directories)
- **Hooks**: Parsed from `plugin.json` with path resolution
- **MCPs**: Extracted from `plugin.json` mcpServers

## 📦 Output Structure

After saving, the output directory contains a complete marketplace-ready structure:

```
output/curated-plugin/
├── .claude-plugin/
│   └── marketplace.json          ← Marketplace config (install this)
├── plugins/
│   └── curated-plugin/
│       ├── .claude-plugin/
│       │   └── plugin.json       ← Official plugin format
│       ├── commands/              ← Selected command files
│       │   ├── build.md
│       │   └── test.md
│       ├── agents/                ← Selected agent files
│       │   └── code-reviewer.md
│       ├── skills/                ← Selected skill directories
│       │   └── chrome-devtools/
│       │       └── SKILL.md
│       └── hooks/                 ← Hook script files
│           └── session-start.sh
└── normalized-plugin.json         ← Debug/testing format
```

### File Purposes

| File | Purpose | Use In Claude Code |
|------|---------|-------------------|
| `.claude-plugin/marketplace.json` | Marketplace configuration | ✅ Required for installation |
| `plugins/*/plugin.json` | Official plugin definition | ✅ Loaded by Claude Code |
| `normalized-plugin.json` | Internal debug format | ❌ For testing only |

## 🎯 Installing the Curated Plugin

After creating your curated plugin, install it in Claude Code:

```bash
# 1. Add marketplace
/plugin marketplace add /path/to/output/curated-plugin

# 2. Install plugin
/plugin install curated-plugin

# 3. Verify installation
/plugin list
```

### Installation Example

```bash
# Create curated plugin
ccplugin-curator select ./my-plugins -n my-tools

# Install in Claude Code
/plugin marketplace add ./output/my-tools
/plugin install my-tools

# ✅ Your curated plugin is now active!
```

## 🔧 Troubleshooting

### Interactive Mode Issues

**Problem**: "Directory does not exist" error in configuration form
- **Solution**: Verify the path is correct and the directory exists on your system
- Use absolute paths if relative paths aren't working
- Check file permissions

**Problem**: "No valid plugins found" after entering directory
- **Solution**: Ensure each plugin has a `.claude-plugin/plugin.json` file
- Check that the directory structure is correct
- Verify plugin.json files are valid JSON

**Problem**: Field validation fails unexpectedly
- **Solution**: Check field requirements:
  - Marketplace Name: lowercase letters, numbers, hyphens only (3-50 chars)
  - Plugin Name: lowercase letters, numbers, hyphens only (3-50 chars)
  - Email: valid email format (optional)

### General Issues

**Problem**: "Output directory already exists" error
- **Solution**: Use `--overwrite` flag or choose a different output directory

**Problem**: Curated plugin won't install in Claude Code
- **Solution**:
  - Verify marketplace.json exists in output directory
  - Check that plugin.json is valid
  - Ensure all referenced files exist
  - Try validating with JSON schema

**Problem**: Hook scripts not executing
- **Solution**:
  - Verify hook scripts have executable permissions (755)
  - Check that paths use `${CLAUDE_PLUGIN_ROOT}` variable
  - Ensure scripts are in the hooks/ directory

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or pnpm
- TypeScript 5.3+

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/ccplugin-curator.git
cd ccplugin-curator

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Run in development mode
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
│   │   ├── normalizer.ts        # Format normalization
│   │   ├── validator.ts         # Schema validation
│   │   └── save/                # Save operation modules
│   │       ├── index.ts         # Main save orchestration
│   │       ├── conflicts.ts     # Conflict detection
│   │       ├── copier.ts        # File copying with namespacing
│   │       ├── directory.ts     # Directory management
│   │       ├── marketplace.ts   # Marketplace.json generation
│   │       ├── outputs.ts       # Plugin.json generation
│   │       └── validator.ts     # Selection validation
│   ├── transformers/
│   │   └── reverse/             # Normalized → Official format
│   │       ├── index.ts         # Main transformer
│   │       ├── hooks.ts         # Hook transformation
│   │       ├── mcps.ts          # MCP transformation
│   │       ├── components.ts    # Component path transformation
│   │       └── metadata.ts      # Metadata omission rules
│   ├── tui/                     # Terminal UI components
│   │   ├── App.tsx              # Main TUI app
│   │   ├── Layout.tsx           # 3-panel layout
│   │   ├── state.ts             # State management
│   │   └── panels/
│   │       ├── PluginsPanel.tsx
│   │       ├── ComponentsPanel.tsx
│   │       └── PreviewPanel.tsx
│   └── types/                   # TypeScript type definitions
├── tests/
│   ├── unit/                    # 123 unit tests
│   │   ├── core/
│   │   └── transformers/
│   └── integration/             # 38 integration tests
│       ├── save-operation.test.ts
│       ├── phase2-conflicts.test.ts
│       ├── phase3-marketplace.test.ts
│       ├── phase4-tui.test.ts
│       └── phase5-validation.test.ts
├── docs/
│   └── spec/                    # Detailed specifications
└── package.json
```

### Scripts

```bash
npm run build          # Build TypeScript
npm run clean          # Clean dist/
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run lint           # Lint code
```

## ✅ Testing

### Test Coverage

**184 tests** covering all functionality:

- **123 Unit Tests**
  - Auto-discovery (37 tests)
  - Normalization (29 tests)
  - Reverse transformers (40 tests)
  - Plugin loader (9 tests)
  - Conflicts (8 tests)

- **61 Integration Tests**
  - Save operation (8 tests)
  - Multi-plugin conflicts (3 tests)
  - Marketplace generation (6 tests)
  - TUI state management (13 tests)
  - Schema validation (7 tests)
  - Setup screens (19 tests)
  - Comprehensive workflow (4 tests)
  - Simple save (1 test)

### Run Tests

```bash
# All tests
npm test

# Specific test file
npm test -- tests/integration/phase5-validation.test.ts

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Output

```
Test Files  17 passed (17)
     Tests  184 passed (184)
  Duration  4.54s
```

## 📚 Documentation

Detailed specifications are available in the `docs/spec/` directory:

| Specification | Description |
|---------------|-------------|
| [001-normalization-protocol.md](docs/spec/001-normalization-protocol.md) | Normalized format specification |
| [002-plugin-format-spec.md](docs/spec/002-plugin-format-spec.md) | Official Claude Code plugin format |
| [003-tui-visual-spec.md](docs/spec/003-tui-visual-spec.md) | TUI layout and visual design |
| [004-user-workflows.md](docs/spec/004-user-workflows.md) | User interaction workflows |
| [005-auto-discovery-rules.md](docs/spec/005-auto-discovery-rules.md) | Component discovery rules |
| [006-reverse-transformation-rules.md](docs/spec/006-reverse-transformation-rules.md) | Format transformation mappings |
| [007-save-operation-rules.md](docs/spec/007-save-operation-rules.md) | Save operation specification |
| [008-testing-spec.md](docs/spec/008-testing-spec.md) | Test cases and BDD scenarios |

## 🔍 Plugin Requirements

For a directory to be recognized as a valid Claude Code plugin:

1. **Must have** `.claude-plugin/plugin.json`
2. **plugin.json must be valid** according to Claude Code schema
3. **Components are auto-discovered** from standard directories

### Example Valid Plugin

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json              ← Required
├── commands/
│   ├── build.md                 ← Auto-discovered
│   └── test.md
├── agents/
│   └── reviewer.md              ← Auto-discovered
└── skills/
    └── chrome-devtools/
        └── SKILL.md             ← Auto-discovered
```

## 🐛 Troubleshooting

### No plugins found

```
❌ No valid plugins found in: ./my-plugins
```

**Solution:** Ensure each plugin directory has `.claude-plugin/plugin.json`

### Validation errors

```
❌ Generated plugin.json is invalid:
  /commands: must be array
```

**Solution:** Check that selected components are valid. Run with `--debug` for details.

### Output directory exists

```
❌ Output directory already exists: ./output/curated-plugin
Use overwrite option to replace it.
```

**Solution:** Use `--overwrite` flag or delete the directory manually.

## 📝 License

MIT © [Your Name]

## 🙏 Acknowledgments

- Built with [Ink](https://github.com/vadimdemedes/ink) for terminal UI
- Powered by [TypeScript](https://www.typescriptlang.org/)
- Validated with [Ajv](https://ajv.js.org/) JSON schema validator

## 📮 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 🔗 Links

- [Claude Code Documentation](https://docs.claude.com/)
- [Issue Tracker](https://github.com/yourusername/ccplugin-curator/issues)
- [Changelog](CHANGELOG.md)

---

**Version:** 0.0.13
**Status:** Production Ready ✅
**Tests:** 184/184 Passing 🎉
