# Pending Items - Iteration 1

**Total pending items will be listed below**

## Project Setup (decisions/001)

- [ ] Create package.json with project metadata
- [ ] Add json-schema-to-typescript as devDependency
- [ ] Create schemas/ directory
- [ ] Create schemas/plugin.schema.json (official format schema)
- [ ] Create schemas/normalized-plugin.schema.json (normalized format schema)
- [ ] Add "generate-types" script to package.json
- [ ] Create src/types/ directory
- [ ] Generate src/types/plugin.ts from plugin.schema.json
- [ ] Generate src/types/normalized.ts from normalized-plugin.schema.json

## Normalization Implementation (spec/001, spec/005)

- [ ] Create src/core/normalize.ts file
- [ ] Implement function to normalize plugin.json to internal format
- [ ] Implement auto-discovery for commands/ directory (glob **/*.md)
- [ ] Implement auto-discovery for agents/ directory (glob **/*.md)
- [ ] Implement auto-discovery for skills/ directory (glob */SKILL.md → parent dirs)
- [ ] Implement auto-discovery for hooks/hooks.json file
- [ ] Implement auto-discovery for .mcp.json file
- [ ] Implement path resolution: remove leading "./" from paths
- [ ] Implement metadata defaults: version → "0.0.0"
- [ ] Implement metadata defaults: description → ""
- [ ] Implement metadata defaults: author → {name:"", email:"", url:""}
- [ ] Implement metadata defaults: homepage → ""
- [ ] Implement metadata defaults: repository → ""
- [ ] Implement metadata defaults: license → ""
- [ ] Implement metadata defaults: keywords → []
- [ ] Implement source field: add absolute path to plugin directory
- [ ] Implement string path → array conversion (glob expansion)
- [ ] Implement array path → preserve as-is
- [ ] Implement custom paths COMPLEMENT auto-discovery (not replace)
- [ ] Implement hooks: nested object → flat array transformation
- [ ] Implement hooks: extract event field from object key
- [ ] Implement hooks: extract matcher field if present
- [ ] Implement hooks: flatten hooks arrays
- [ ] Implement hooks: from file path (string) → read and parse JSON
- [ ] Implement hooks: from inline object → normalize to array
- [ ] Implement MCPs: object → array transformation
- [ ] Implement MCPs: extract name field from object key
- [ ] Implement MCPs: add name to each MCP config
- [ ] Implement MCPs: from file path (string) → read and parse JSON
- [ ] Implement MCPs: from inline object → normalize to array
- [ ] Implement MCPs: preserve all config fields except name
- [ ] Implement skills: from string path → glob expansion
- [ ] Implement skills: from array → preserve as-is
- [ ] Implement skills: return directory paths not file paths
- [ ] Implement environment variable support: ${CLAUDE_PLUGIN_ROOT}
- [ ] Implement validation: all fields must be defined (no undefined)
- [ ] Implement validation: all arrays must be arrays (never string)
- [ ] Implement validation: all paths relative to plugin source
- [ ] Implement validation: source field must be absolute path

## Reverse Transformation Implementation (spec/006)

- [ ] Create src/core/denormalize.ts file
- [ ] Implement function to convert normalized → official format
- [ ] Implement metadata fields omission if default values
- [ ] Implement version omission if "0.0.0"
- [ ] Implement description omission if ""
- [ ] Implement author omission if all fields empty
- [ ] Implement author field filtering (remove empty fields)
- [ ] Implement homepage omission if ""
- [ ] Implement repository omission if ""
- [ ] Implement license omission if ""
- [ ] Implement keywords omission if []
- [ ] Implement commands: array → add "./" prefix to each path
- [ ] Implement commands: omit if empty array
- [ ] Implement agents: array → add "./" prefix to each path
- [ ] Implement agents: omit if empty array
- [ ] Implement skills: array → add "./" prefix to each path
- [ ] Implement skills: omit if empty array
- [ ] Implement hooks: flat array → group by event field
- [ ] Implement hooks: group by matcher field within each event
- [ ] Implement hooks: remove event field from hook configs
- [ ] Implement hooks: remove matcher field from hook configs
- [ ] Implement hooks: create nested structure {EventName: [{matcher?, hooks: [...]}]}
- [ ] Implement hooks: omit if empty array
- [ ] Implement hooks: preserve all custom fields
- [ ] Implement MCPs: array → object with name as key
- [ ] Implement MCPs: remove name field from config
- [ ] Implement MCPs: omit empty env objects
- [ ] Implement MCPs: omit if empty array
- [ ] Implement MCPs: preserve all custom fields
- [ ] Implement source field: never include in output (internal only)

## Save Operation Implementation (spec/007)

- [ ] Create src/core/save.ts file
- [ ] Implement save operation handler
- [ ] Implement validation: check selection is non-empty
- [ ] Implement validation: validate normalized format before save
- [ ] Implement validation: validate official format after transformation
- [ ] Implement output directory structure creation
- [ ] Implement .claude-plugin/ directory creation
- [ ] Implement plugins/curated-plugin/ directory creation
- [ ] Implement marketplace.json generation
- [ ] Implement marketplace.json: name field
- [ ] Implement marketplace.json: owner field
- [ ] Implement marketplace.json: plugins array with source
- [ ] Implement plugin.json generation (official format)
- [ ] Implement normalized-plugin.json generation (for debugging)
- [ ] Implement file copying: commands files
- [ ] Implement file copying: agents files
- [ ] Implement file copying: skills directories (recursive)
- [ ] Implement conflict resolution: namespace prefix for commands
- [ ] Implement conflict resolution: namespace prefix for agents
- [ ] Implement conflict resolution: namespace prefix for skills directories
- [ ] Implement conflict resolution: namespace prefix for MCP names
- [ ] Implement hooks merging: same event → merge into hooks array
- [ ] Implement hooks merging: preserve selection order
- [ ] Implement edge case: empty selection → show warning, don't save
- [ ] Implement edge case: output directory exists → prompt overwrite
- [ ] Implement success message display with file paths
- [ ] Implement success message: show component counts
- [ ] Implement success message: show installation instructions

## TUI Implementation (spec/003, spec/004)

- [ ] Create src/tui/ directory
- [ ] Create src/tui/app.ts (main TUI app)
- [ ] Implement three-panel layout: PLUGINS, COMPONENTS, PREVIEW
- [ ] Implement PLUGINS panel: show list of loaded plugins
- [ ] Implement PLUGINS panel: show component counts per plugin
- [ ] Implement PLUGINS panel: visual indicators (▼, ▽, ★, •)
- [ ] Implement COMPONENTS panel: show all component types
- [ ] Implement COMPONENTS panel: checkboxes [ ] and [✓]
- [ ] Implement COMPONENTS panel: section headers (COMMANDS, AGENTS, etc.)
- [ ] Implement COMPONENTS panel: show item counts in headers
- [ ] Implement PREVIEW panel: real-time JSON preview
- [ ] Implement PREVIEW panel: syntax highlighting
- [ ] Implement keyboard navigation: ↑ (up)
- [ ] Implement keyboard navigation: ↓ (down)
- [ ] Implement keyboard navigation: ← (left panel)
- [ ] Implement keyboard navigation: → (right panel)
- [ ] Implement keyboard action: SPACE (toggle selection)
- [ ] Implement keyboard action: A (select all)
- [ ] Implement keyboard action: N (deselect all)
- [ ] Implement keyboard action: S (save)
- [ ] Implement keyboard action: Q (quit)
- [ ] Implement keyboard action: TAB (next plugin tab)
- [ ] Implement keyboard action: SHIFT+TAB (previous plugin tab)
- [ ] Implement cursor indicator: ► for focused item
- [ ] Implement checkbox states: [ ] unchecked, [✓] checked
- [ ] Implement plugin expansion: ▼ expanded, ▽ collapsed
- [ ] Implement active plugin indicator: (★)
- [ ] Implement Unicode box-drawing characters: ─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴
- [ ] Implement status bar with keyboard shortcuts
- [ ] Implement color scheme: headers, cursor, checkmarks, JSON syntax
- [ ] Implement terminal size validation (min 120x30)
- [ ] Implement multi-plugin tabs display: [Tab X of Y]
- [ ] Implement preview update on selection change
- [ ] Implement selection state persistence across plugin switches
- [ ] Implement hooks display format: "event:pattern → script"
- [ ] Implement MCP display format: "name\n  Commands: X, Resources: Y"
- [ ] Implement scrolling for long lists
- [ ] Implement empty state: "No components available"

## CLI Implementation (spec/004)

- [ ] Create src/cli/ directory
- [ ] Create src/cli/index.ts (CLI entry point)
- [ ] Implement command: "app select <plugin-folder>"
- [ ] Implement plugin folder scanning
- [ ] Implement .claude-plugin/plugin.json discovery
- [ ] Implement normalization on plugin load
- [ ] Implement TUI launch after scan
- [ ] Implement error handling: folder not found
- [ ] Implement error handling: no plugins found
- [ ] Implement error handling: invalid plugin.json

## Test Fixtures (spec/008)

- [ ] Create test-fixtures/ directory
- [ ] Create test-fixtures/test-plugin/ directory
- [ ] Create test-fixtures/test-plugin/.claude-plugin/ directory
- [ ] Create test-fixtures/test-plugin/.claude-plugin/plugin.json
- [ ] Verify plugin.json has name: "test-plugin"
- [ ] Verify plugin.json has version: "1.2.3"
- [ ] Verify plugin.json has description: "Comprehensive test plugin"
- [ ] Verify plugin.json has author.name: "Test Author"
- [ ] Verify plugin.json has author.email: "test@example.com"
- [ ] Verify plugin.json has author.url: "https://example.com"
- [ ] Verify plugin.json has homepage: "https://example.com/test-plugin"
- [ ] Verify plugin.json has repository: "https://github.com/test/test-plugin"
- [ ] Verify plugin.json has license: "MIT"
- [ ] Verify plugin.json has keywords: ["testing", "integration"]
- [ ] Verify plugin.json has commands: "./commands"
- [ ] Verify plugin.json has agents: array with 2 items
- [ ] Verify plugin.json has skills: "./skills/"
- [ ] Verify plugin.json has hooks: "./hooks/hooks.json"
- [ ] Verify plugin.json has mcpServers: "./.mcp.json"
- [ ] Create test-fixtures/test-plugin/commands/ directory
- [ ] Create test-fixtures/test-plugin/commands/analyze.md
- [ ] Create test-fixtures/test-plugin/commands/optimize.md
- [ ] Create test-fixtures/test-plugin/commands/nested/ directory
- [ ] Create test-fixtures/test-plugin/commands/nested/deep-cmd.md
- [ ] Verify test-plugin has exactly 3 commands total
- [ ] Create test-fixtures/test-plugin/agents/ directory
- [ ] Create test-fixtures/test-plugin/agents/reviewer.md
- [ ] Create test-fixtures/test-plugin/agents/context-agent.md
- [ ] Verify test-plugin has exactly 2 agents total
- [ ] Create test-fixtures/test-plugin/skills/ directory
- [ ] Create test-fixtures/test-plugin/skills/skill-alpha/ directory
- [ ] Create test-fixtures/test-plugin/skills/skill-alpha/SKILL.md
- [ ] Create test-fixtures/test-plugin/skills/skill-alpha/helpers.ts
- [ ] Create test-fixtures/test-plugin/skills/skill-beta/ directory
- [ ] Create test-fixtures/test-plugin/skills/skill-beta/SKILL.md
- [ ] Create test-fixtures/test-plugin/skills/skill-gamma/ directory
- [ ] Create test-fixtures/test-plugin/skills/skill-gamma/SKILL.md
- [ ] Verify test-plugin has exactly 3 skills total
- [ ] Create test-fixtures/test-plugin/hooks/ directory
- [ ] Create test-fixtures/test-plugin/hooks/hooks.json
- [ ] Verify hooks.json has SessionStart with 2 hooks
- [ ] Verify hooks.json has PostToolUse with 2 matchers (Bash, Write)
- [ ] Verify test-plugin has exactly 4 hooks total
- [ ] Create test-fixtures/test-plugin/.mcp.json
- [ ] Verify .mcp.json has "tavily" MCP with command "npx"
- [ ] Verify .mcp.json has "tavily" with env.TAVILY_API_KEY
- [ ] Verify .mcp.json has "filesystem" MCP with command "npx"
- [ ] Verify .mcp.json has "filesystem" with args including "/allowed/path"
- [ ] Verify .mcp.json has "github" MCP with command "npx"
- [ ] Verify .mcp.json has "github" with env.GITHUB_TOKEN
- [ ] Verify test-plugin has exactly 3 MCPs total

## Test Fixtures - Multi-Plugin Conflicts (spec/008)

- [ ] Create test-fixtures/test-plugin-a/ directory
- [ ] Create test-fixtures/test-plugin-a/.claude-plugin/plugin.json
- [ ] Create test-fixtures/test-plugin-a/commands/build.md
- [ ] Create test-fixtures/test-plugin-a/commands/deploy.md
- [ ] Create test-fixtures/test-plugin-a/agents/reviewer.md
- [ ] Create test-fixtures/test-plugin-a/skills/chrome-devtools/SKILL.md
- [ ] Create test-fixtures/test-plugin-a/hooks/hooks.json with SessionStart
- [ ] Create test-fixtures/test-plugin-a/.mcp.json with "tavily" (KEY: "A")
- [ ] Create test-fixtures/test-plugin-b/ directory
- [ ] Create test-fixtures/test-plugin-b/.claude-plugin/plugin.json
- [ ] Create test-fixtures/test-plugin-b/commands/build.md (conflict with plugin-a)
- [ ] Create test-fixtures/test-plugin-b/commands/test.md
- [ ] Create test-fixtures/test-plugin-b/agents/reviewer.md (conflict with plugin-a)
- [ ] Create test-fixtures/test-plugin-b/skills/chrome-devtools/SKILL.md (conflict)
- [ ] Create test-fixtures/test-plugin-b/hooks/hooks.json with SessionStart (merge)
- [ ] Create test-fixtures/test-plugin-b/.mcp.json with "tavily" (KEY: "B", conflict)

## Integration Tests (spec/008)

- [ ] Create tests/ directory
- [ ] Create tests/integration/ directory
- [ ] Create tests/integration/full-workflow.test.ts
- [ ] Implement test: Load test-plugin without errors
- [ ] Implement test: Verify 15 components visible (3+2+3+4+3)
- [ ] Implement test: Select components and verify preview updates
- [ ] Implement test: Save and verify marketplace.json created
- [ ] Implement test: Save and verify plugin.json created
- [ ] Implement test: Save and verify normalized-plugin.json created
- [ ] Implement test: Verify marketplace.json is valid JSON
- [ ] Implement test: Verify marketplace.json contains plugin "curated-plugin"
- [ ] Implement test: Verify plugin.json has name "test-plugin"
- [ ] Implement test: Verify plugin.json has version "1.2.3"
- [ ] Implement test: Verify plugin.json has correct commands array
- [ ] Implement test: Verify plugin.json has correct agents array
- [ ] Implement test: Verify plugin.json has correct skills array
- [ ] Implement test: Verify plugin.json has hooks object with SessionStart key
- [ ] Implement test: Verify plugin.json has mcpServers object with tavily key
- [ ] Implement test: Verify commands/analyze.md copied to output
- [ ] Implement test: Verify agents/reviewer.md copied to output
- [ ] Implement test: Verify skills/skill-alpha/ directory copied to output
- [ ] Implement test: Verify skills/skill-alpha/SKILL.md exists in output
- [ ] Create tests/integration/multi-plugin-conflicts.test.ts
- [ ] Implement test: Load two plugins with conflicts
- [ ] Implement test: Select all components from both plugins
- [ ] Implement test: Verify namespace prefix applied to build.md files
- [ ] Implement test: Verify test-plugin-a--build.md exists in output
- [ ] Implement test: Verify test-plugin-b--build.md exists in output
- [ ] Implement test: Verify namespace prefix applied to reviewer.md files
- [ ] Implement test: Verify namespace prefix applied to skills directories
- [ ] Implement test: Verify namespace prefix applied to MCP "tavily"
- [ ] Implement test: Verify hooks merged for SessionStart event
- [ ] Implement test: Verify plugin.json hooks.SessionStart has 2 hooks
- [ ] Implement test: Verify plugin.json mcpServers has both tavily configs
- [ ] Create tests/integration/edge-cases.test.ts
- [ ] Implement test: Save with no selection shows warning
- [ ] Implement test: Output directory exists prompts overwrite
- [ ] Implement test: Missing file referenced in plugin.json shows error
- [ ] Add test setup script: npm run test:setup-fixtures
- [ ] Add test run script: npm run test:integration
- [ ] Add test coverage script: npm run test:integration -- --coverage

## Build Configuration

- [ ] Create tsconfig.json for TypeScript compilation
- [ ] Configure TypeScript: target, module, outDir, strict mode
- [ ] Add build script to package.json: npm run build
- [ ] Add start script to package.json: npm start
- [ ] Add dev script to package.json: npm run dev (watch mode)
- [ ] Configure entry point in package.json: ./dist/cli/index.js
- [ ] Add test framework dependency (e.g., jest, vitest)
- [ ] Configure test framework
- [ ] Add TUI library dependency (e.g., ink, blessed, neo-blessed)
- [ ] Add glob library dependency for file pattern matching
- [ ] Add JSON schema validator dependency
- [ ] Create .gitignore with node_modules/, dist/, coverage/

## Documentation

- [ ] Create README.md with project overview
- [ ] Document installation instructions in README
- [ ] Document usage examples in README
- [ ] Document CLI commands in README
- [ ] Create CONTRIBUTING.md (if needed)
- [ ] Create LICENSE file (if needed)

---

**END OF PENDING ITEMS - Iteration 1**
