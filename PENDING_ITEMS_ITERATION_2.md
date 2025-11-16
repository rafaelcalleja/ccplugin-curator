# Pending Items - Iteration 2

**After reviewing all specs again, the following items are still pending:**

## TUI Implementation (spec/003, spec/004) - CRITICAL

The TUI is mentioned extensively in the specs but is not implemented. The CLI currently only displays JSON output.

Required TUI features (from specs/003-tui-visual-spec.md and specs/004-user-workflows.md):

- [ ] Implement TUI app with React/Ink
- [ ] Three-panel layout: PLUGINS | COMPONENTS | PREVIEW
- [ ] PLUGINS panel: list plugins with stats
- [ ] COMPONENTS panel: show components with checkboxes
- [ ] PREVIEW panel: real-time JSON preview
- [ ] Keyboard navigation: ↑↓←→ arrows
- [ ] SPACE key: toggle selection
- [ ] S key: save operation
- [ ] Q key: quit
- [ ] A key: select all
- [ ] N key: deselect all
- [ ] TAB/SHIFT+TAB: switch between plugins
- [ ] Real-time preview updates
- [ ] Visual indicators: ►, ▼, ▽, ★, •, ✓
- [ ] Status bar with keyboard shortcuts
- [ ] Component counts display
- [ ] Hooks display format: "event:pattern → script"
- [ ] MCP display format with details
- [ ] Integrate TUI launch in CLI (src/cli/index.ts)

## Test Fixtures - Multi-Plugin Conflicts (spec/008)

Missing test fixtures for conflict resolution testing:

- [ ] Create test-fixtures/test-plugin-a/ directory structure
- [ ] Create test-plugin-a/.claude-plugin/plugin.json
- [ ] Create test-plugin-a/commands/build.md
- [ ] Create test-plugin-a/commands/deploy.md
- [ ] Create test-plugin-a/agents/reviewer.md
- [ ] Create test-plugin-a/skills/chrome-devtools/SKILL.md
- [ ] Create test-plugin-a/hooks/hooks.json (SessionStart)
- [ ] Create test-plugin-a/.mcp.json (tavily with KEY: "A")
- [ ] Create test-fixtures/test-plugin-b/ directory structure
- [ ] Create test-plugin-b/.claude-plugin/plugin.json
- [ ] Create test-plugin-b/commands/build.md (conflict)
- [ ] Create test-plugin-b/commands/test.md
- [ ] Create test-plugin-b/agents/reviewer.md (conflict)
- [ ] Create test-plugin-b/skills/chrome-devtools/SKILL.md (conflict)
- [ ] Create test-plugin-b/hooks/hooks.json (SessionStart, merge)
- [ ] Create test-plugin-b/.mcp.json (tavily with KEY: "B", conflict)

## Integration Tests - Multi-Plugin (spec/008)

- [ ] Create tests/integration/multi-plugin-conflicts.test.ts
- [ ] Test: Load two plugins with conflicts
- [ ] Test: Select all components from both plugins
- [ ] Test: Verify namespace prefix applied to build.md
- [ ] Test: Verify test-plugin-a--build.md exists in output
- [ ] Test: Verify test-plugin-b--build.md exists in output
- [ ] Test: Verify namespace prefix applied to reviewer.md
- [ ] Test: Verify namespace prefix applied to skills directories
- [ ] Test: Verify namespace prefix applied to MCP "tavily"
- [ ] Test: Verify hooks merged for SessionStart event
- [ ] Test: Verify plugin.json hooks.SessionStart has 2 hooks
- [ ] Test: Verify plugin.json mcpServers has both tavily configs

## Integration Tests - Edge Cases (spec/008)

- [ ] Create tests/integration/edge-cases.test.ts
- [ ] Test: Save with no selection shows warning
- [ ] Test: Output directory exists prompts overwrite (or handles via option)
- [ ] Test: Handle missing file referenced in plugin.json

## Scripts (spec/008)

- [ ] Create scripts/setup-fixtures.js for automated fixture setup
- [ ] Add script reference in package.json test:setup-fixtures

---

**Total: ~60 pending items**

**Note**: The TUI is the largest remaining component. If we implement a functional TUI that meets the basic requirements from the specs, most of the remaining items will be complete.
