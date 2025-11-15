# MkCurator Usage Guide

## Quick Start

1. **Build the application**
   ```bash
   npm install
   npm run build
   ```

2. **Run the curator**
   ```bash
   node dist/cli.js select <path-to-your-plugins-directory>
   ```

3. **Select components** using the TUI
   - Navigate with arrow keys
   - Press SPACE to select/deselect
   - Press S to save

4. **Find your curated plugin** at `./output/plugin.json`

## Plugin Directory Structure

The application expects plugins to follow the Claude Code plugin structure:

```
plugins-directory/
├── plugin-a/
│   ├── .claude-plugin/
│   │   └── plugin.json          # Required: plugin metadata
│   ├── commands/                # Auto-discovered: command files
│   │   ├── command1.md
│   │   └── command2.md
│   ├── agents/                  # Auto-discovered: agent files
│   │   └── agent1.md
│   ├── skills/                  # Auto-discovered: skill directories
│   │   ├── skill-a/
│   │   │   └── SKILL.md
│   │   └── skill-b/
│   │       └── SKILL.md
│   ├── hooks/                   # Auto-discovered: hooks config
│   │   └── hooks.json
│   └── .mcp.json                # Auto-discovered: MCP servers config
├── plugin-b/
│   └── .claude-plugin/
│       └── plugin.json
└── plugin-c/
    └── .claude-plugin/
        └── plugin.json
```

## TUI Interface

The TUI has three panels:

### Left Panel: Plugins
Shows all discovered plugins with their component counts.
- `▼ plugin-name (★)` - Currently active plugin
- `▽ plugin-name` - Inactive plugins
- Component counts displayed below each plugin

### Center Panel: Components
Shows all components from the selected plugin, grouped by type:
- **COMMANDS**: Markdown command files
- **AGENTS**: Markdown agent files
- **SKILLS**: Skill directories
- **HOOKS**: Hook configurations (event: type → command/agent)
- **MCP SERVERS**: MCP server configurations (name, command)

Each component shows:
- `[ ]` - Unselected
- `[✓]` - Selected
- `►` - Current cursor position (highlighted in blue)

### Right Panel: Preview
Real-time JSON preview of your selections.
Shows the structure that will be saved to `plugin.json`.

## Keyboard Controls

| Key | Action |
|-----|--------|
| `←` `→` | Switch between panels |
| `↑` `↓` | Navigate items in current panel |
| `SPACE` | Toggle selection of current item |
| `TAB` | Switch to next plugin |
| `SHIFT+TAB` | Switch to previous plugin |
| `A` | Select ALL items of current type |
| `N` | Select NONE (deselect all) of current type |
| `S` | SAVE curated plugin to file |
| `Q` | QUIT application |

## Examples

### Example 1: Basic Usage

```bash
node dist/cli.js select ~/.claude/plugins
```

This will:
1. Scan `~/.claude/plugins` for plugins
2. Launch the TUI
3. Let you select components
4. Save to `./output/plugin.json`

### Example 2: Custom Output

```bash
node dist/cli.js select ./my-plugins --output ./my-curated.json --name my-plugin
```

This will:
1. Scan `./my-plugins`
2. Launch the TUI
3. Save to `./my-curated.json` with name "my-plugin"

### Example 3: Development Mode

```bash
npm run dev -- select ./test-plugins
```

Uses `tsx` for faster iteration during development.

## Tips

1. **Select strategically**: You can select components from multiple plugins
2. **Preview first**: Check the preview panel before saving
3. **Use A/N shortcuts**: Quickly select/deselect all items of a type
4. **Tab between plugins**: Easily switch between plugins without leaving components panel
5. **Save often**: Press 'S' to save, the app stays open so you can continue editing

## Troubleshooting

### "No plugins found"
- Ensure your plugins have `.claude-plugin/plugin.json`
- Check that the directory path is correct
- Verify plugin structure matches Claude Code format

### "Build errors"
- Run `npm install` to ensure all dependencies are installed
- Try `npm run build` again
- Check TypeScript version compatibility

### "TUI doesn't respond"
- Ensure your terminal supports 256 colors
- Try a different terminal emulator
- Check terminal size (minimum 120x30 recommended)

## Output Format

The saved `plugin.json` will be in official Claude Code format:

```json
{
  "name": "curated-plugin",
  "commands": [
    "commands/selected-command.md"
  ],
  "agents": [
    "agents/selected-agent.md"
  ],
  "skills": [
    "skills/selected-skill"
  ],
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "/init.sh"
      }
    ]
  },
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@package/server"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

## Next Steps

After creating your curated plugin:

1. Copy the generated `plugin.json` to your plugin directory
2. Add it to your Claude Code plugins folder
3. Restart Claude Code or reload plugins
4. Your curated plugin is now available!
