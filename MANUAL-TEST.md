# Manual Interactive Test Guide

## Fixed TUI Implementation

The application now uses a **command-line interface (CLI)** instead of the React/Ink TUI. This provides better keyboard input handling and a more reliable interactive experience.

## How to Run

### Simple Test (Non-Interactive)

This will automatically select all components:

```bash
npm run dev -- select ./test-plugin
```

Expected behavior:
- Shows scanning progress
- Displays plugin information
- Lists all components
- Automatically selects all items (non-interactive mode)
- Saves the curated plugin
- Shows the generated `plugin.json`

### Interactive Test (With Keyboard)

To use the interactive selection interface, you need a terminal that supports keyboard input:

```bash
npm start -- select ./test-plugin
```

Then interact as follows:

1. **Navigation:**
   - Use `↑` and `↓` arrow keys to move between items
   - Current item has a blue background with `►` indicator

2. **Selection:**
   - Press `SPACE` to toggle checkbox `[ ]` ↔ `[✓]`
   - Press `ENTER` to confirm selection and move to next component type

3. **Workflow:**
   - Select Commands
   - Select Agents
   - Select Skills
   - Select Hooks
   - Select MCPs
   - Confirm saves for each plugin
   - Plugin is saved to `./output/curated-plugin/plugin.json`

## Example Interaction Session

```bash
$ npm start -- select ./test-plugin

📂 Scanning plugins in ./test-plugin...
✓ Found 1 plugin(s)

Normalizing test-plugin...

╔════════════════════════════════════════════════════════════════╗
║  mk-curator - Plugin Component Selector                        ║
╚════════════════════════════════════════════════════════════════╝

📦 Plugin: test-plugin

Plugin Information:
  Name: test-plugin
  Version: 1.0.0
  Description: Test plugin for integration testing

📊 Available Components:
  Commands: 3 items
  Agents: 2 items
  Skills: 2 items
  Hooks: 3 items
  MCPs: 2 items

👇 Select components to include (use arrow keys and space):


Select Commands (press Space, then Enter):
(Use Arrow Keys to navigate, Space to select, Enter to confirm)

► [ ] commands/test.md
  [ ] commands/deploy.md
  [ ] commands/build.md

# User presses SPACE to select first command:

► [✓] commands/test.md
  [ ] commands/deploy.md
  [ ] commands/build.md

# User presses ↓ to move down:

  [✓] commands/test.md
► [ ] commands/deploy.md
  [ ] commands/build.md

# User presses SPACE to select second command:

  [✓] commands/test.md
► [✓] commands/deploy.md
  [ ] commands/build.md

# User presses ENTER to confirm:

Select Agents (press Space, then Enter):
(Use Arrow Keys to navigate, Space to select, Enter to confirm)

► [ ] agents/code-reviewer.md
  [ ] agents/documentation-writer.md

# ... continues for Agents, Skills, Hooks, MCPs

# After all selections, shows preview and asks to save:

📋 Your Selection:
  Commands: 2
  Agents: 0
  Skills: 0
  Hooks: 0
  MCPs: 0

📄 Preview (JSON):

{
  "name": "curated-plugin",
  "commands": [
    "commands/test.md",
    "commands/deploy.md"
  ]
}

💾 Save this selection? (y/n): y
✓ Selection saved for test-plugin

✅ Done!
```

## Features of the CLI Interface

### ✅ Fixed Issues

- **Keyboard input now works reliably** - No more premature exit
- **Non-interactive fallback** - Works even without a TTY (e.g., piped input)
- **Clear visual feedback** - Blue highlight shows current selection
- **Simple and predictable** - Traditional command-line interaction style

### ✅ Component Selection

- **Arrow Keys** - Navigate through items
- **SPACE** - Toggle selection checkbox
- **ENTER** - Confirm and move to next component type
- **CTRL+C** - Exit cleanly

## Testing Checklist

- [ ] Run automated test: `npm run test:integration`
- [ ] Run with test-plugin: `npm start -- select ./test-plugin`
- [ ] Try with your own plugins: `npm start -- select ~/.claude/plugins`
- [ ] Verify output file: `cat ./output/curated-plugin/plugin.json`
- [ ] Test keyboard navigation (arrow keys)
- [ ] Test selection (SPACE key)
- [ ] Test confirmation (ENTER key)
- [ ] Test saving (y/n prompt)

## Troubleshooting

### "I can't type anything"

**Solution:** The keyboard input is working. Just use arrow keys and SPACE/ENTER, not mouse or arbitrary typing.

### "The display looks weird"

**Solution:** Your terminal might be too small. Try expanding it to at least 100 columns × 20 rows.

### "Nothing happens when I press a key"

**Solution:** Make sure the application is running in an interactive terminal, not piped input.

### "I want to exit"

**Solution:** Press `CTRL+C` to exit gracefully.

## Output Verification

After running, verify the output:

```bash
# Check if file was created
ls -la ./output/curated-plugin/plugin.json

# View the saved configuration
cat ./output/curated-plugin/plugin.json
```

Expected structure:

```json
{
  "name": "curated-plugin",
  "commands": ["..."],
  "agents": ["..."],
  "skills": ["..."],
  "hooks": {...},
  "mcpServers": {...}
}
```

## Automated Testing

If you want to test without interactive input:

```bash
npm run test:integration
```

This runs a complete automated test with mock selections and verifies the entire workflow.

## Development vs Production

### Development Mode (with hot-reload)
```bash
npm run dev -- select ./test-plugin
```

### Production Mode (compiled binary)
```bash
npm start -- select ./test-plugin
```

Both modes work the same way. Use whichever you prefer.

## Next Steps

1. ✅ Verify the application works with test-plugin
2. ✅ Test with your own plugins
3. ✅ Try selecting different combinations of components
4. ✅ Verify the output in `./output/`
5. ✅ Use the saved plugin.json with Claude Code

---

**Status:** ✅ Fixed and ready to use!

If you encounter any issues, check that:
- Terminal supports keyboard input (TTY)
- Terminal is at least 100 columns wide
- Terminal has color support
