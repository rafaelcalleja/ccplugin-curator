# CCPlugin Curator - Implementation Review

**Date**: 2025-11-18
**Branch**: `claude/0.0.10-011QSnoTq3d2yU89YdiKoCDr`
**Review Protocol**: IMPLEMENT.md (Project Implementation Review)

---

## 1. Executive Summary

### Implementation Status: ~60% Complete

**Major Accomplishments:**
- ✅ Core TUI (3-panel layout) fully implemented
- ✅ Normalization/reverse transformation libraries complete
- ✅ JSON schemas and TypeScript types generated
- ✅ Basic save operation with file copying
- ✅ CLI with direct mode (`select` command)

**Critical Gaps:**
- ❌ Setup screens (spec 009) completely missing - 0% implemented
- ❌ Test coverage at ~20% (5 tests vs ~25 required by spec 008)
- ❌ Test fixtures incomplete (missing 40% of required components)
- ❌ Multi-plugin conflict resolution not tested
- ❌ Hook script file copying/permissions not verified

**Branch Update Impact:**
- New spec 009 (TUI setup screens) merged from base branch
- IMPLEMENT.md changed to review protocol format
- New `.claude/` directory with skills and hooks

---

## 2. Detailed Checklist

### ✅ Completed Items

#### Core Libraries
- [x] **Normalization library** (src/lib/normalize.ts)
  - Implementation: Official → Normalized transformation
  - Spec reference: 001-normalization-protocol.md, 005-transformation-rules.md
  - Status: Complete with auto-discovery support

- [x] **Reverse transformation library** (src/lib/reverse.ts)
  - Implementation: Normalized → Official transformation
  - Spec reference: 006-reverse-transformation-rules.md
  - Status: Complete with hooks/MCP grouping

- [x] **Auto-discovery** (src/lib/auto-discovery.ts)
  - Implementation: Glob-based component discovery
  - Spec reference: 001-normalization-protocol.md lines 45-57
  - Status: Complete for commands/agents/skills/hooks/MCPs

- [x] **Validation** (src/lib/validate.ts)
  - Implementation: Ajv-based schema validation with formats
  - Spec reference: 001-normalization-protocol.md, 002-plugin-format-spec.md
  - Status: Complete with ajv-formats for email/uri validation

- [x] **TypeScript types generated from schemas**
  - Implementation: src/types/*.ts from schemas/*.schema.json
  - Spec reference: decisions/001-json-schema-to-typescript.md
  - Status: Complete - 3 type files generated

#### TUI Components (Component Selection)
- [x] **App orchestrator** (src/components/App.tsx)
  - Implementation: 3-panel layout with keyboard navigation
  - Spec reference: 003-tui-visual-spec.md lines 23-55
  - Status: Complete with all keyboard shortcuts (←→↑↓, SPACE, A, N, S, Q, TAB)

- [x] **PluginsPanel component** (src/components/PluginsPanel.tsx)
  - Implementation: Left panel showing plugin list
  - Spec reference: 003-tui-visual-spec.md lines 31-34
  - Status: Complete with expand/collapse indicators

- [x] **ComponentsPanel component** (src/components/ComponentsPanel.tsx)
  - Implementation: Center panel showing selectable components
  - Spec reference: 003-tui-visual-spec.md lines 31-50
  - Status: Complete with checkboxes and sections

- [x] **PreviewPanel component** (src/components/PreviewPanel.tsx)
  - Implementation: Right panel showing JSON preview
  - Spec reference: 003-tui-visual-spec.md lines 31, 35-37
  - Status: Complete with real-time updates

- [x] **StatusBar component** (src/components/StatusBar.tsx)
  - Implementation: Bottom help bar
  - Spec reference: 003-tui-visual-spec.md lines 53-54
  - Status: Complete with all keyboard hints

#### CLI
- [x] **Direct mode** (`select` command)
  - Implementation: src/cli.ts lines 19-41
  - Spec reference: 004-user-workflows.md lines 17-28, 121-129
  - Status: Complete - skips setup, loads plugins directly

#### Basic Save Operation
- [x] **Save function** (src/lib/save.ts)
  - Implementation: Generates plugin.json and marketplace.json
  - Spec reference: 007-save-operation-rules.md
  - Status: Partial - basic file generation works

---

### ⏳ Pending Items

#### Setup Screens (Spec 009) - Priority: HIGH
**Spec**: docs/spec/009-tui-setup-screens.md (0% implemented)

- [ ] **Main Menu component**
  - Quote: "Screen 1: Main Menu" (line 27)
  - Implementation needed: React/Ink component with 2 options (Create/Exit)
  - Priority: HIGH

- [ ] **Configuration Form component**
  - Quote: "Screen 2: Configuration Form" (line 67)
  - Implementation needed: Form with 5 fields (3 required, 2 optional)
  - Priority: HIGH

- [ ] **Field validation - Marketplace Name**
  - Quote: "Marketplace Name | `^[a-z0-9-]+$` (3-50 chars)" (line 212)
  - Implementation needed: Regex validation with error display
  - Priority: HIGH

- [ ] **Field validation - Email format**
  - Quote: "Author Email | Valid email (optional)" (line 216)
  - Implementation needed: Email format validation
  - Priority: MEDIUM

- [ ] **Field validation - Directory existence**
  - Quote: "Source Directory | Must exist with plugins" (line 214)
  - Implementation needed: fs.access check + plugin scan
  - Priority: HIGH

- [ ] **Placeholder behavior**
  - Quote: "Type to edit (placeholder disappears)" (line 115)
  - Implementation needed: Gray placeholder that clears on first keystroke
  - Priority: MEDIUM

- [ ] **Auto-fill Output Directory from Marketplace Name**
  - Quote: "auto-filled from marketplace name" (line 154)
  - Implementation needed: Sync Output field when Marketplace Name changes
  - Priority: MEDIUM

- [ ] **Directory scanning with feedback**
  - Quote: "→ Scanning... Found 3 plugins" (line 144)
  - Implementation needed: Real-time scan + display count
  - Priority: MEDIUM

- [ ] **Transition from Configuration Form to TUI**
  - Quote: "transitions directly to the component selection interface" (line 17)
  - Implementation needed: Pass form data to App component
  - Priority: HIGH

- [ ] **ESC key navigation (cancel/back)**
  - Quote: "ESC: Cancel" (line 115)
  - Implementation needed: Form → Menu → Exit
  - Priority: MEDIUM

- [ ] **Interactive mode without arguments**
  - Quote: "app" (line 12 in 004-user-workflows.md)
  - Implementation needed: CLI entrypoint that shows Main Menu
  - Priority: HIGH

#### Test Coverage (Spec 008) - Priority: HIGH
**Spec**: docs/spec/008-integration-test-spec.md (~20% implemented)

- [ ] **Complete test-plugin fixture**
  - Quote: "Commands: 3" (line 268)
  - Current: 2 commands
  - Missing: `commands/nested/deep-cmd.md`
  - Priority: HIGH

- [ ] **Add second agent to fixture**
  - Quote: "Agents: 2" (line 269)
  - Current: 1 agent (reviewer.md)
  - Missing: `agents/context-agent.md`
  - Priority: HIGH

- [ ] **Add third skill to fixture**
  - Quote: "Skills: 3" (line 270)
  - Current: 2 skills
  - Missing: `skills/skill-gamma/SKILL.md`
  - Priority: HIGH

- [ ] **Add helpers.ts to skill-alpha**
  - Quote: "helpers.ts" (line 26)
  - Implementation needed: Create dummy helpers.ts file
  - Priority: LOW

- [ ] **Add hook script files to fixture**
  - Quote: "setup-env.sh, init-workspace.sh, security-check.sh, cleanup.sh" (lines 33-36)
  - Current: hooks.json exists but missing script files
  - Implementation needed: Create 4 executable scripts (chmod +x)
  - Priority: HIGH

- [ ] **Update hooks.json to match spec**
  - Quote: "Hooks: 4" (line 271) - spec lines 64-90
  - Current: 2 hooks (SessionStart:1, PostToolUse:1)
  - Required: 4 hooks (SessionStart:2, PostToolUse:2)
  - Priority: HIGH

- [ ] **Add third MCP to fixture**
  - Quote: "MCPs: 3" (line 272)
  - Current: 2 MCPs (tavily, filesystem)
  - Missing: `github` MCP (line 108-112)
  - Priority: HIGH

- [ ] **Test: Full workflow - load, select, save, verify**
  - Quote: "Scenario: Full workflow" (line 274)
  - Implementation needed: E2E test from spec lines 274-328
  - Priority: HIGH

- [ ] **Test: Verify marketplace.json format**
  - Quote: "VERIFY MARKETPLACE FORMAT" (line 300)
  - Implementation needed: Assertions for marketplace.json structure
  - Priority: MEDIUM

- [ ] **Test: Verify official plugin.json format**
  - Quote: "VERIFY OFFICIAL FORMAT" (line 305)
  - Implementation needed: Assertions matching spec lines 307-316
  - Priority: HIGH

- [ ] **Test: Verify files copied correctly**
  - Quote: "VERIFY FILES COPIED" (line 318)
  - Implementation needed: File existence checks (lines 319-324)
  - Priority: HIGH

- [ ] **Test: Verify hook scripts are executable**
  - Quote: "file ... is executable" (line 324)
  - Implementation needed: Check file permissions (0o755)
  - Priority: HIGH

- [ ] **Test: Multi-plugin conflict resolution**
  - Quote: "Scenario: Multi-plugin selection with conflict resolution" (line 330)
  - Implementation needed: Complete scenario from lines 330-433
  - Priority: HIGH

- [ ] **Test: Verify namespace prefixing for commands**
  - Quote: "VERIFY COMMANDS - namespace prefix applied" (line 366)
  - Implementation needed: Check files like `test-plugin-a--build.md`
  - Priority: HIGH

- [ ] **Test: Verify namespace prefixing for agents**
  - Quote: "VERIFY AGENTS - namespace prefix applied" (line 372)
  - Implementation needed: Check files like `test-plugin-a--reviewer.md`
  - Priority: HIGH

- [ ] **Test: Verify namespace prefixing for skills**
  - Quote: "VERIFY SKILLS - namespace prefix applied to directory" (line 376)
  - Implementation needed: Check dirs like `test-plugin-a--chrome-devtools`
  - Priority: HIGH

- [ ] **Test: Verify hook scripts copied with namespace**
  - Quote: "VERIFY HOOK SCRIPTS - copied (no namespace needed, different names)" (line 382)
  - Implementation needed: Check executable permissions preserved
  - Priority: MEDIUM

- [ ] **Test: Verify MCP name conflicts resolved**
  - Quote: "test-plugin-a--tavily, test-plugin-b--tavily" (line 418-426)
  - Implementation needed: Check namespace prefixing in mcpServers object
  - Priority: HIGH

- [ ] **Test: Edge case - Save with no selection**
  - Quote: "Scenario: Save with no selection" (line 441)
  - Implementation needed: Test warning message, no files created
  - Priority: MEDIUM

- [ ] **Test: Edge case - Output directory exists**
  - Quote: "Scenario: Output directory already exists" (line 448)
  - Implementation needed: Test overwrite prompt
  - Priority: MEDIUM

- [ ] **Test: Edge case - Plugin with missing files**
  - Quote: "Scenario: Plugin with missing files" (line 464)
  - Implementation needed: Test error handling
  - Priority: MEDIUM

- [ ] **Test: Different path formats produce same result**
  - Quote: "Scenario Outline: Different path formats" (line 477)
  - Implementation needed: Test string vs array paths
  - Priority: LOW

- [ ] **Test: Empty components handled correctly**
  - Quote: "Scenario: Empty components are handled correctly" (line 489)
  - Implementation needed: Test omission of empty fields
  - Priority: MEDIUM

- [ ] **Test: Hooks transform correctly**
  - Quote: "Scenario: Hooks transform correctly" (line 496)
  - Implementation needed: Test nested hook structure + executable permissions
  - Priority: HIGH

- [ ] **Test: MCPs transform correctly**
  - Quote: "Scenario: MCPs transform correctly" (line 519)
  - Implementation needed: Test MCP object structure
  - Priority: MEDIUM

- [ ] **Test: Default values are omitted**
  - Quote: "Scenario: Default values are omitted" (line 536)
  - Implementation needed: Test plugin.json minimalism
  - Priority: MEDIUM

- [ ] **Create test-plugin-a fixture for conflicts**
  - Quote: "test-plugin-a exists in ./test-fixtures/test-plugin-a" (line 331)
  - Implementation needed: Second plugin for conflict testing
  - Priority: HIGH

- [ ] **Create test-plugin-b fixture for conflicts**
  - Quote: "test-plugin-b exists in ./test-fixtures/test-plugin-b" (line 340)
  - Implementation needed: Third plugin for conflict testing
  - Priority: HIGH

- [ ] **Setup screens test: Main Menu displays correctly**
  - Quote: "Then Main Menu is displayed with options" (line 127)
  - Implementation needed: Test from spec 008 lines 118-252
  - Priority: HIGH

- [ ] **Setup screens test: Configuration Form validation**
  - Quote: "Scenario: Field validation - Invalid marketplace name" (line 166)
  - Implementation needed: Test all validation scenarios
  - Priority: HIGH

- [ ] **Setup screens test: Placeholder behavior**
  - Quote: "Scenario: Placeholder behavior" (line 233)
  - Implementation needed: Test gray text disappears on typing
  - Priority: MEDIUM

- [ ] **Setup screens test: Auto-fill Output Directory**
  - Quote: "Scenario: Auto-fill Output Directory from Marketplace Name" (line 244)
  - Implementation needed: Test field sync
  - Priority: MEDIUM

- [ ] **Setup screens test: Cancel navigation**
  - Quote: "Scenario: Cancel from Configuration Form" (line 204)
  - Implementation needed: Test ESC key flow
  - Priority: MEDIUM

#### Save Operation Enhancements (Spec 007) - Priority: HIGH

- [ ] **Implement file name conflict resolution**
  - Quote: "THEN apply namespace prefix" (line 200, spec 007)
  - Implementation needed: Detect same filename from different plugins
  - Priority: HIGH

- [ ] **Implement MCP name conflict resolution**
  - Quote: "THEN apply namespace prefix to MCP name" (line 224, spec 007)
  - Implementation needed: Prefix MCP names when conflicts detected
  - Priority: HIGH

- [ ] **Implement hook event merging**
  - Quote: "THEN merge into same event array" (line 244, spec 007)
  - Implementation needed: Group hooks by event, preserve order
  - Priority: HIGH

- [ ] **Implement hook script file copying with namespace**
  - Quote: "Copy plugin-a/hooks/setup.sh → curated-plugin/hooks/plugin-a--setup.sh" (line 268, spec 007)
  - Implementation needed: Copy + rename + chmod +x
  - Priority: HIGH

- [ ] **Implement skill directory conflict resolution**
  - Quote: "apply namespace prefix to directory name" (line 296, spec 007)
  - Implementation needed: Rename skill directories on conflict
  - Priority: HIGH

- [ ] **Implement output directory overwrite prompt**
  - Quote: "ask 'Output directory exists. Overwrite? [Y/n]'" (line 187, spec 007)
  - Implementation needed: Interactive prompt before deletion
  - Priority: MEDIUM

- [ ] **Implement executable permissions for hook scripts**
  - Quote: "fs.chmod(destScriptPath, 0o755)" (line 138, spec 007)
  - Implementation needed: Set +x on all copied hook scripts
  - Priority: HIGH

- [ ] **Implement hook command path transformation**
  - Quote: "{ command: 'hooks/setup.sh' } → { command: '${CLAUDE_PLUGIN_ROOT}/hooks/setup.sh' }" (lines 195-210, spec 006)
  - Implementation needed: Transform local paths to use CLAUDE_PLUGIN_ROOT
  - Priority: HIGH

---

### 🔄 Partially Implemented

- [~] **Save operation** (src/lib/save.ts)
  - **Completed:**
    - Basic file generation (plugin.json, marketplace.json)
    - Component file copying
    - Reverse transformation integration
  - **Remaining:**
    - File name conflict detection and namespace prefixing
    - MCP name conflict resolution
    - Hook event merging
    - Hook script file copying with executable permissions
    - Skill directory conflict resolution
    - Output directory overwrite prompt
    - Hook command path transformation (${CLAUDE_PLUGIN_ROOT})
  - **Spec reference:** 007-save-operation-rules.md

- [~] **Test fixtures** (tests/fixtures/test-plugin/)
  - **Completed:**
    - Basic directory structure
    - 2 commands (analyze.md, optimize.md)
    - 1 agent (reviewer.md)
    - 2 skills (skill-alpha, skill-beta)
    - hooks.json file
    - .mcp.json with 2 MCPs
  - **Remaining:**
    - 1 command (nested/deep-cmd.md)
    - 1 agent (context-agent.md)
    - 1 skill (skill-gamma)
    - 4 hook script files (setup-env.sh, init-workspace.sh, security-check.sh, cleanup.sh)
    - Update hooks.json to have 4 hooks instead of 2
    - 1 MCP (github)
    - helpers.ts in skill-alpha
  - **Spec reference:** 008-integration-test-spec.md lines 10-114

- [~] **CLI** (src/cli.ts)
  - **Completed:**
    - Direct mode (`select` command)
    - Plugin loading from directory
    - TUI rendering
  - **Remaining:**
    - Interactive mode without arguments (show Main Menu)
    - Configuration form integration
  - **Spec reference:** 004-user-workflows.md lines 10-93

---

## 3. Differences Analysis

### Missing Features Not Yet Implemented

#### A. Setup Screens (Spec 009) - Complete Gap
**Spec Location:** docs/spec/009-tui-setup-screens.md

The entire setup screens workflow is missing:
1. Main Menu (lines 27-63)
2. Configuration Form (lines 67-167)
3. Field validation (lines 208-217)
4. Placeholder behavior (lines 173-185)
5. Auto-fill logic (lines 150-155)
6. Keyboard navigation (lines 218-228)
7. Transition to component selection (lines 252-261)

**Impact:** Users cannot configure plugin metadata interactively. They must use direct mode only.

#### B. Test Coverage Gap - ~80% Missing Tests
**Spec Location:** docs/spec/008-integration-test-spec.md

**Current:** 5 basic tests covering normalization/reverse/validation
**Required:** ~25 test scenarios covering:
- Setup screens (13 scenarios, lines 118-252)
- Full workflow (2 scenarios, lines 257-434)
- Edge cases (4 scenarios, lines 439-470)
- Validation (6 scenarios, lines 474-544)

**Missing test scenarios:**
- No E2E tests for save operation
- No multi-plugin conflict tests
- No setup screen tests
- No edge case tests (empty selection, overwrite, missing files)
- No validation tests (path formats, empty components, transform correctness)

#### C. Test Fixtures Incomplete - 40% Missing Components
**Spec Location:** docs/spec/008-integration-test-spec.md lines 10-114

**Current fixture gaps:**
- Commands: 2/3 (missing `nested/deep-cmd.md`)
- Agents: 1/2 (missing `context-agent.md`)
- Skills: 2/3 (missing `skill-gamma/`)
- Hooks: 2/4 (missing 2 SessionStart hooks)
- Hook scripts: 0/4 (all missing: setup-env.sh, init-workspace.sh, security-check.sh, cleanup.sh)
- MCPs: 2/3 (missing `github`)

**Impact:** Cannot run comprehensive integration tests as specified.

#### D. Save Operation - Conflict Resolution Not Implemented
**Spec Location:** docs/spec/007-save-operation-rules.md

**Missing functionality:**
1. File name conflict detection (lines 192-212)
2. Namespace prefixing for commands/agents (lines 200-208)
3. MCP name conflict resolution (lines 218-230)
4. Hook event merging (lines 238-261)
5. Hook script file copying with namespace (lines 262-283)
6. Skill directory conflict resolution (lines 288-308)
7. Executable permissions for hook scripts (line 138)
8. Hook command path transformation to use ${CLAUDE_PLUGIN_ROOT} (spec 006 lines 195-210)
9. Output directory overwrite prompt (lines 182-189)

**Impact:** Multi-plugin curation will fail with conflicts or lose data.

### Features Implemented Differently Than Specified

**None identified.** Current implementation follows specs where implemented.

### Additional Features Implemented Beyond Spec

**None identified.** No extra features added.

### Design Decisions Not Yet Applied

#### From decisions/001-json-schema-to-typescript.md
- [x] Type generation script exists in package.json
- [x] Types are generated and up-to-date

**Status:** Fully applied.

---

## 4. Implementation Plan

### Phase 1: Complete Test Fixtures (Priority: HIGH)
**Dependencies:** None
**Estimated Effort:** 2-3 hours

#### Tasks:
1. **Create missing command file**
   - File: `tests/fixtures/test-plugin/commands/nested/deep-cmd.md`
   - Content: Minimal command markdown
   - Update: Verify auto-discovery picks it up

2. **Create missing agent file**
   - File: `tests/fixtures/test-plugin/agents/context-agent.md`
   - Content: Minimal agent markdown

3. **Create missing skill**
   - File: `tests/fixtures/test-plugin/skills/skill-gamma/SKILL.md`
   - Content: Minimal skill markdown

4. **Add helpers.ts to skill-alpha**
   - File: `tests/fixtures/test-plugin/skills/skill-alpha/helpers.ts`
   - Content: Dummy TypeScript file (e.g., `export const helper = () => {}`)

5. **Create hook script files**
   - Files:
     - `tests/fixtures/test-plugin/hooks/setup-env.sh`
     - `tests/fixtures/test-plugin/hooks/init-workspace.sh`
     - `tests/fixtures/test-plugin/hooks/security-check.sh`
     - `tests/fixtures/test-plugin/hooks/cleanup.sh`
   - Content: Minimal bash scripts (e.g., `#!/bin/bash\necho "Hook executed"`)
   - Permissions: `chmod +x` on all scripts

6. **Update hooks.json to match spec**
   - File: `tests/fixtures/test-plugin/hooks/hooks.json`
   - Content: Add 4 hooks matching spec 008 lines 64-90
   - Hooks:
     - SessionStart: setup-env.sh, init-workspace.sh
     - PostToolUse (Bash): security-check.sh
     - PostToolUse (Write): cleanup.sh

7. **Add third MCP (github)**
   - File: `tests/fixtures/test-plugin/.mcp.json`
   - Content: Add github server matching spec 008 lines 108-112

8. **Verify fixture completeness**
   - Run: Manual count of all components
   - Expected: 3 commands, 2 agents, 3 skills, 4 hooks, 3 MCPs

### Phase 2: Implement Save Operation Conflict Resolution (Priority: HIGH)
**Dependencies:** Phase 1 complete
**Estimated Effort:** 6-8 hours

#### Tasks:
1. **Detect file name conflicts**
   - File: `src/lib/save.ts`
   - Logic: Track all component file names, detect duplicates
   - Approach: Map<filename, Array<{plugin, path}>>

2. **Implement namespace prefixing for commands**
   - File: `src/lib/save.ts`
   - Logic: When conflict detected, rename to `{pluginName}--{filename}`
   - Update: plugin.json commands array with prefixed paths

3. **Implement namespace prefixing for agents**
   - File: `src/lib/save.ts`
   - Logic: Same as commands
   - Update: plugin.json agents array

4. **Implement namespace prefixing for skills**
   - File: `src/lib/save.ts`
   - Logic: Rename skill directories to `{pluginName}--{skillname}`
   - Update: plugin.json skills array

5. **Implement MCP name conflict resolution**
   - File: `src/lib/save.ts`
   - Logic: Detect duplicate MCP names, prefix with plugin name
   - Update: mcpServers object keys

6. **Implement hook event merging**
   - File: `src/lib/save.ts` or `src/lib/reverse.ts`
   - Logic: Group hooks by event, preserve selection order
   - No conflicts - this is valid behavior

7. **Implement hook script file copying**
   - File: `src/lib/save.ts`
   - Logic:
     - Extract script paths from hook commands
     - Copy to output/hooks/ directory
     - Apply namespace prefix if filename conflicts
     - Set executable permissions (fs.chmod 0o755)
     - Update hook commands in plugin.json to use namespaced paths

8. **Implement hook command path transformation**
   - File: `src/lib/reverse.ts`
   - Logic: Transform local script paths to use ${CLAUDE_PLUGIN_ROOT}
   - Example: `hooks/setup.sh` → `${CLAUDE_PLUGIN_ROOT}/hooks/setup.sh`
   - Spec reference: 006-reverse-transformation-rules.md lines 195-210

9. **Implement output directory overwrite prompt**
   - File: `src/lib/save.ts`
   - Logic: Check if output dir exists, prompt user, delete if yes
   - Use Ink's useInput or native readline

10. **Create unit tests for conflict resolution**
    - File: `tests/save-conflicts.test.ts`
    - Tests: Each conflict type (commands, agents, skills, MCPs, hook scripts)

### Phase 3: Implement Setup Screens (Priority: HIGH)
**Dependencies:** None (can run in parallel with Phase 2)
**Estimated Effort:** 10-12 hours

#### Tasks:
1. **Create MainMenu component**
   - File: `src/components/MainMenu.tsx`
   - Features:
     - 2 options: "Create New Curated Plugin", "Exit"
     - Keyboard navigation (↑↓, ENTER, Q)
     - Visual design matching spec 009 lines 27-63

2. **Create ConfigurationForm component**
   - File: `src/components/ConfigurationForm.tsx`
   - Features:
     - 5 fields (3 required, 2 optional)
     - Field navigation (↑↓, TAB, SHIFT+TAB)
     - ENTER to submit, ESC to cancel
     - Visual design matching spec 009 lines 67-117

3. **Implement field validation**
   - In ConfigurationForm component
   - Validations:
     - Marketplace Name: `/^[a-z0-9-]+$/` (3-50 chars)
     - Plugin Name: 3-100 chars (any printable)
     - Source Directory: Directory exists + contains plugins
     - Output Directory: Parent writable
     - Author Email: Valid email format (optional)
   - Display: Checkmarks (✓) for valid, errors (✗) with messages

4. **Implement placeholder behavior**
   - In ConfigurationForm component
   - Logic: Show gray placeholder when empty, clear on first keystroke

5. **Implement auto-fill logic**
   - In ConfigurationForm component
   - Logic: When Marketplace Name changes, update Output Directory to `./output/{marketplaceName}`

6. **Implement directory scanning**
   - In ConfigurationForm component
   - Logic: On Source Directory change, scan for plugins, show count

7. **Implement transitions**
   - MainMenu → ConfigurationForm (on "Create" select)
   - ConfigurationForm → App (on ENTER with valid form)
   - ConfigurationForm → MainMenu (on ESC)
   - MainMenu → Exit (on ESC or "Exit" select)

8. **Update CLI for interactive mode**
   - File: `src/cli.ts`
   - Logic: If no command, show MainMenu
   - Pass form data to App component

9. **Create Setup component orchestrator**
   - File: `src/components/Setup.tsx`
   - Logic: Manage state between MainMenu ↔ ConfigurationForm ↔ App

### Phase 4: Implement Comprehensive Tests (Priority: HIGH)
**Dependencies:** Phases 1, 2, 3 complete
**Estimated Effort:** 12-15 hours

#### Tasks:
1. **Create multi-plugin test fixtures**
   - Directory: `tests/fixtures/test-plugin-a/`
   - Components: Matching spec 008 lines 331-339
   - Directory: `tests/fixtures/test-plugin-b/`
   - Components: Matching spec 008 lines 340-348

2. **Test: Full workflow - load, select, save, verify**
   - File: `tests/integration.test.ts`
   - Scenario: Spec 008 lines 274-328
   - Assertions:
     - marketplace.json exists and is valid
     - plugin.json exists and is valid
     - All files copied
     - Hook scripts are executable

3. **Test: Multi-plugin conflict resolution**
   - File: `tests/integration.test.ts`
   - Scenario: Spec 008 lines 330-433
   - Assertions:
     - Namespace prefixing for commands
     - Namespace prefixing for agents
     - Namespace prefixing for skills
     - Hook merging
     - MCP namespace prefixing

4. **Test: Edge cases**
   - File: `tests/edge-cases.test.ts`
   - Scenarios:
     - Save with no selection
     - Output directory exists
     - Plugin with missing files
   - Spec reference: Spec 008 lines 439-470

5. **Test: Validation scenarios**
   - File: `tests/validation.test.ts`
   - Scenarios:
     - Different path formats
     - Empty components
     - Hooks transform
     - MCPs transform
     - Default values omitted
   - Spec reference: Spec 008 lines 474-544

6. **Test: Setup screens**
   - File: `tests/setup-screens.test.ts`
   - Scenarios:
     - Main Menu display
     - Configuration Form validation
     - Placeholder behavior
     - Auto-fill
     - Cancel navigation
     - Directory scanning
   - Spec reference: Spec 008 lines 118-252

7. **Update existing tests**
   - File: `tests/integration.test.ts`
   - Add exact count assertions:
     - `expect(normalized.commands.length).toBe(3)` (not toBeGreaterThan)
     - `expect(normalized.agents.length).toBe(2)`
     - `expect(normalized.skills.length).toBe(3)`
     - `expect(normalized.hooks.length).toBe(4)`
     - `expect(normalized.mcps.length).toBe(3)`

### Phase 5: Polish and Documentation (Priority: MEDIUM)
**Dependencies:** Phases 1-4 complete
**Estimated Effort:** 2-3 hours

#### Tasks:
1. **Update README with setup screens**
   - Add interactive mode documentation
   - Add screenshots/examples

2. **Add JSDoc comments**
   - Document all public functions
   - Add examples for complex logic

3. **Run full test suite**
   - Execute: `npm test`
   - Coverage target: >80%

4. **Manual testing**
   - Test interactive mode end-to-end
   - Test direct mode end-to-end
   - Test multi-plugin conflicts
   - Test all keyboard shortcuts

5. **Performance testing**
   - Test with 10+ plugins
   - Test with 100+ components

---

## 5. Priority Matrix

### Must Have (Critical Path)
1. Phase 1: Complete test fixtures
2. Phase 2: Conflict resolution in save operation
3. Phase 3: Setup screens
4. Phase 4: Comprehensive tests

### Should Have
5. Phase 5: Documentation and polish

### Could Have (Future)
- Performance optimizations
- Additional validations
- Export functionality

---

## 6. Risks and Blockers

### Identified Risks
1. **Hook script file detection** - Need to parse hook commands to extract script file paths
   - Mitigation: Use regex to extract paths from command strings

2. **Hook command path transformation** - Need to distinguish local scripts from system commands
   - Mitigation: Check if path starts with `/`, `./`, or contains plugin-relative path

3. **Executable permissions** - Need to ensure chmod works on all platforms
   - Mitigation: Use Node.js fs.chmod (0o755), test on Unix/macOS

4. **Interactive prompts in TUI** - Ink may need special handling for prompts
   - Mitigation: Use Ink's useInput for Y/n confirmation

### Blockers
**None identified.** All dependencies are internal and implementable.

---

## 7. Next Steps

**Immediate actions:**
1. Start with Phase 1 (test fixtures) - ~2-3 hours
2. Run existing tests to verify fixture updates work
3. Move to Phase 2 (conflict resolution) - ~6-8 hours
4. Parallel track: Phase 3 (setup screens) - ~10-12 hours

**Success criteria:**
- All 25+ test scenarios passing
- Test fixtures match spec 008 exactly (3 commands, 2 agents, 3 skills, 4 hooks, 3 MCPs)
- Setup screens functional and match spec 009
- Multi-plugin conflict resolution working
- Coverage >80%

**Total estimated effort:** 32-41 hours
**Recommended timeline:** 1-2 weeks (part-time) or 5-7 days (full-time)

---

## 8. Spec Coverage Summary

| Spec Document | Coverage | Status |
|---------------|----------|--------|
| 001-normalization-protocol.md | 100% | ✅ Complete |
| 002-plugin-format-spec.md | 100% | ✅ Complete (reference) |
| 003-tui-visual-spec.md | 100% | ✅ Complete (component selection) |
| 004-user-workflows.md | 50% | 🔄 Partial (missing setup screens) |
| 005-transformation-rules.md | 100% | ✅ Complete |
| 006-reverse-transformation-rules.md | 90% | 🔄 Partial (missing hook path transform) |
| 007-save-operation-rules.md | 40% | 🔄 Partial (missing conflict resolution) |
| 008-integration-test-spec.md | 20% | ⏳ Minimal (5/25 tests) |
| 009-tui-setup-screens.md | 0% | ❌ Not started |
| decisions/001-json-schema-to-typescript.md | 100% | ✅ Complete |

**Overall completion: ~60%**

---

**End of Implementation Review**
