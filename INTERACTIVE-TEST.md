# Interactive Test Guide

## Overview

This guide explains how to manually test the mk-curator TUI application with the included test-plugin.

## Prerequisites

```bash
# Build the project
npm run build
```

## Running Interactive Test

### Method 1: Using npm script (Recommended)

```bash
# Terminal-based interactive test
npm run dev -- select ./test-plugin
```

### Method 2: Using built binary

```bash
npm start -- select ./test-plugin
```

## What to Expect

Once you run the command, you'll see a three-panel terminal interface:

```
┌──────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: test-plugin                                    [Tab 1 of 1]      │
├──────────────────┬─────────────────────────┬─────────────────────────────┤
│ PLUGINS          │ COMPONENTS              │ PREVIEW                     │
│                  │                         │                             │
│ ▼ test-plugin    │ COMMANDS (3)            │ {                           │
│   • 3 commands   │ ► [ ] commands/build.md │   "commands": [],           │
│   • 2 agents     │   [ ] commands/deploy.md│   "agents": [],             │
│   • 2 skills     │   [ ] commands/test.md  │   "skills": [],             │
│   • 3 hooks      │                         │   "hooks": [],              │
│   • 2 MCPs       │ AGENTS (2)              │   "mcp": {                  │
│                  │   [ ] agents/code-...  │     "servers": {}           │
│                  │   [ ] agents/document... │   }                        │
│                  │                         │ }                           │
│                  │ SKILLS (2)              │                             │
│                  │   [ ] skills/skill-a    │                             │
│                  │   [ ] skills/skill-b    │                             │
│                  │                         │                             │
│                  │ HOOKS (3)               │                             │
│                  │   [ ] SessionStart      │                             │
│                  │   [ ] PreToolUse        │                             │
│                  │   [ ] PostToolUse       │                             │
│                  │                         │                             │
│                  │ MCP SERVERS (2)         │                             │
│                  │   [ ] data-processor    │                             │
│                  │   [ ] knowledge-base    │                             │
│                  │                         │                             │
└──────────────────┴─────────────────────────┴─────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit
└──────────────────────────────────────────────────────────────────────────┘
```

## Test Scenarios

### Scenario 1: Basic Selection

**Objective:** Select a few commands and verify preview updates

**Steps:**

1. Start the application: `npm run dev -- select ./test-plugin`
2. Use ↓ arrow to navigate to first command: `commands/build.md`
3. Press SPACE to select it
4. Notice the preview on the right updates immediately
5. Navigate down to `commands/deploy.md`
6. Press SPACE to select it too
7. Observe: Preview now shows 2 commands
8. Press Q to exit

**Expected Result:**
- Preview updates in real-time as you select components
- Both commands appear in preview JSON

### Scenario 2: Multi-Component Selection

**Objective:** Select components from different categories

**Steps:**

1. Start the application
2. Select 2-3 commands (use ↓ and SPACE)
3. Navigate to AGENTS section (↓)
4. Select 1 agent (SPACE)
5. Navigate to SKILLS section (↓)
6. Select 1 skill (SPACE)
7. Navigate to HOOKS section (↓)
8. Select 1 hook (SPACE)
9. Observe preview updates with all selections

**Expected Result:**
- Preview JSON shows commands, agents, skills, hooks all selected
- Each selection is immediately reflected in preview

### Scenario 3: Select All / Deselect All

**Objective:** Test bulk selection operations

**Steps:**

1. Start the application
2. Focus on COMPONENTS panel (use ← → to navigate)
3. Press A (Select All)
4. Observe: All items show [✓]
5. Preview shows everything selected
6. Press N (Deselect All)
7. Observe: All items show [ ]
8. Preview becomes empty

**Expected Result:**
- A selects everything in current plugin
- N deselects everything
- Preview updates accordingly

### Scenario 4: Save Curated Plugin

**Objective:** Test saving functionality

**Steps:**

1. Start the application
2. Select a few components:
   - Select 2 commands
   - Select 1 agent
   - Select 1 skill
3. Press S to save
4. Application closes and prints: `✓ Saved to ./output/curated-plugin/plugin.json`
5. In terminal, verify output:

```bash
cat ./output/curated-plugin/plugin.json
```

**Expected Result:**
```json
{
  "name": "curated-plugin",
  "commands": ["...", "..."],
  "agents": ["..."],
  "skills": ["..."],
  "hooks": { ... },
  "mcp": { ... }
}
```

### Scenario 5: Panel Navigation

**Objective:** Test switching between panels

**Steps:**

1. Start the application
2. Focus starts on COMPONENTS (center panel)
3. Press → (right arrow)
4. Focus moves to PREVIEW panel (right)
5. Press → (right arrow) again
6. Cycles back to PLUGINS panel
7. Press ← (left arrow)
8. Focus moves through panels in reverse
9. Try ↑ ↓ in PREVIEW - navigation is read-only

**Expected Result:**
- ← → switches between panels cyclically
- Cursor visually indicates current panel
- Preview panel shows currently selected items

### Scenario 6: Empty Selection

**Objective:** Test saving with no components selected

**Steps:**

1. Start the application
2. Press N to deselect all
3. Press S to save
4. Observe: Warning message appears
5. No file is saved
6. Application exits cleanly

**Expected Result:**
- Warning about no components selected
- No file created
- Clean exit

### Scenario 7: Verify Auto-Discovery

**Objective:** Confirm all plugin components are discovered

**Steps:**

1. Start the application
2. Observe PLUGINS panel shows:
   - test-plugin (★ = active)
   - • 3 commands ✓
   - • 2 agents ✓
   - • 2 skills ✓
   - • 3 hooks ✓
   - • 2 MCPs ✓

3. Observe COMPONENTS panel shows:
   - COMMANDS (3)
   - AGENTS (2)
   - SKILLS (2)
   - HOOKS (3)
   - MCP SERVERS (2)

**Expected Result:**
- All components from test-plugin are discovered
- Counts match actual files in test-plugin directory

## Component Details

### Test Plugin Components

**Commands (3):**
- `commands/build.md` - Build project
- `commands/deploy.md` - Deploy application
- `commands/test.md` - Run tests

**Agents (2):**
- `agents/code-reviewer.md` - Code review agent
- `agents/documentation-writer.md` - Documentation agent

**Skills (2):**
- `skills/skill-a` - Advanced capability
- `skills/skill-b` - Data processing capability

**Hooks (3):**
- `SessionStart` - /initialize command
- `PreToolUse` - /code-reviewer agent (matcher: Bash)
- `PostToolUse` - /cleanup command

**MCPs (2):**
- `data-processor` - Node.js MCP server
- `knowledge-base` - Python MCP server

## Troubleshooting

### Terminal too small

**Problem:** Display looks garbled or text overlaps

**Solution:**
- Resize terminal to at least 120 columns × 30 rows
- Recommended: 140+ columns × 40+ rows

### No components showing

**Problem:** COMPONENTS panel is empty

**Solution:**
- Check that test-plugin directory exists: `ls test-plugin/`
- Verify structure: `find test-plugin -type f`
- Ensure `.claude-plugin/plugin.json` exists

### Preview not updating

**Problem:** Right panel doesn't change when selecting items

**Solution:**
- Make sure you're in COMPONENTS panel (use ← → to focus)
- Verify focus indicator `►` is visible
- Try pressing Q and restarting

### Save doesn't work

**Problem:** S key doesn't save

**Solution:**
- Ensure at least 1 component is selected
- Check that output directory is writable
- Verify disk space available
- Try creating directory manually: `mkdir -p output`

## Integration with Automatic Test

After interactive testing, you can verify against automated tests:

```bash
# Run automated integration test
npm run test:integration
```

This confirms:
- Scanner works correctly
- Normalizer produces expected output
- Persistence layer functions properly
- Full workflow executes successfully

## What's Being Tested

1. **Plugin Discovery**
   - ✅ Finds `.claude-plugin/plugin.json`
   - ✅ Loads plugin metadata

2. **Component Auto-Discovery**
   - ✅ Scans `commands/` directory
   - ✅ Scans `agents/` directory
   - ✅ Scans `skills/*/SKILL.md` pattern
   - ✅ Loads `hooks/hooks.json`
   - ✅ Loads `.mcp.json`

3. **Normalization**
   - ✅ Converts format correctly
   - ✅ Merges custom paths with auto-discovery
   - ✅ Applies default values

4. **Interactive UI**
   - ✅ Navigation with keyboard
   - ✅ Real-time preview updates
   - ✅ Multi-panel layout
   - ✅ Component selection

5. **Persistence**
   - ✅ Creates output directory
   - ✅ Writes valid JSON
   - ✅ Saves selections correctly

## Performance Notes

The interactive test should be responsive:
- Selection toggle: <100ms
- Preview update: <50ms
- Navigation: <10ms
- All operations: instant visible feedback

## Testing Tips

1. **Use arrow keys slowly** - Some terminals have key repeat issues
2. **Watch the preview** - The best way to validate selections
3. **Try all keys** - A, N, S, Q all have specific functions
4. **Test edge cases** - Empty selection, all selected, single item
5. **Check output** - Always verify the saved plugin.json

## Next Steps

After successful interactive testing:

1. Run automated test: `npm run test:integration`
2. Inspect generated output: `cat output/curated-plugin/plugin.json`
3. Try with your own plugins: `npm run dev -- select ~/.claude/plugins`
4. Integrate into your workflow

---

**Happy Testing!** 🚀

If you encounter any issues, check the logs and refer to the README.md for more information.
