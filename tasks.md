# Project Implementation Review: Claude Plugin Curator

## Executive Summary

**Implementation Status:** ~95% Complete ✅

**MAJOR UPDATE:** All 6 phases of implementation are now complete! The project has gone from 5% to 95% completion.

**Current State:**
- ✅ **Documentation:** 100% complete (8 specification files covering all aspects)
- ✅ **Package Setup:** Fully configured with TypeScript, Jest, ESLint
- ✅ **JSON Schemas:** Both schemas created (plugin.schema.json, normalized-plugin.schema.json)
- ✅ **Type Definitions:** Generated from schemas using json-schema-to-typescript
- ✅ **Source Code:** Fully implemented across all phases
  - Phase 1: Foundation (package.json, tsconfig, schemas, types)
  - Phase 2: Core Logic (loader, transformers, validator)
  - Phase 3: TUI (3-panel interface with Ink/React)
  - Phase 4: Save Operations (file copying, conflict resolution)
  - Phase 5: CLI (command-line interface)
  - Phase 6: Testing & Documentation (Jest config, tests, README)
- ✅ **Tests:** Basic unit tests implemented, Jest configured
- ✅ **README:** Complete usage documentation

**Remaining Work (~5%):**
1. Comprehensive integration tests (Spec 008 fixtures)
2. Additional unit test coverage
3. Build verification and npm publishing setup

---

## Detailed Checklist

### ✅ Completed Items

#### Documentation (100% Complete)

- **[x] Spec 001: Normalization Protocol** (`/home/user/ccplugin-curator/docs/spec/001-normalization-protocol.md`)
  - Complete protocol for transforming official → normalized format
  - Defines all field transformations, defaults, and invariants
  - Includes auto-discovery behavior and path resolution rules

- **[x] Spec 002: Official Plugin Format** (`/home/user/ccplugin-curator/docs/spec/002-plugin-format-spec.md`)
  - Documents Claude Code's official plugin.json format
  - External reference documentation from claude.com
  - Includes hooks and MCP server configurations

- **[x] Spec 003: TUI Visual Specification** (`/home/user/ccplugin-curator/docs/spec/003-tui-visual-spec.md`)
  - Complete 3-panel layout design
  - Box-drawing characters reference
  - UI state examples and interaction flows
  - Real-world plugin examples

- **[x] Spec 004: User Workflows (BDD)** (`/home/user/ccplugin-curator/docs/spec/004-user-workflows.md`)
  - Gherkin scenarios for main workflows
  - Multi-plugin selection scenarios
  - Conflict resolution workflows
  - File operation behaviors

- **[x] Spec 005: Forward Transformation Rules** (`/home/user/ccplugin-curator/docs/spec/005-transformation-rules.md`)
  - Official → Normalized transformation
  - Field mapping and path normalization
  - Metadata defaults and edge cases

- **[x] Spec 006: Reverse Transformation Rules** (`/home/user/ccplugin-curator/docs/spec/006-reverse-transformation-rules.md`)
  - Normalized → Official transformation
  - Minimalism approach (omit defaults)
  - Hook/MCP grouping algorithms
  - Information loss documentation

- **[x] Spec 007: Save Operation Rules** (`/home/user/ccplugin-curator/docs/spec/007-save-operation-rules.md`)
  - Dual output strategy (marketplace.json + plugin.json + normalized.json)
  - File copying operations
  - Namespace conflict resolution
  - Hook script executable permissions

- **[x] Spec 008: Integration Test Specification** (`/home/user/ccplugin-curator/docs/spec/008-integration-test-spec.md`)
  - BDD scenarios for end-to-end testing
  - Test plugin structure definition
  - Multi-plugin conflict scenarios
  - Validation scenarios

- **[x] Decision 001: JSON Schema to TypeScript** (`/home/user/ccplugin-curator/docs/decisions/001-json-schema-to-typescript.md`)
  - Use `json-schema-to-typescript` for type generation
  - Schema-first approach
  - npm script recommendations

#### Infrastructure (Minimal)

- **[x] Document Frontmatter Schema** (`/home/user/ccplugin-curator/schemas/document-frontmatter.schema.json`)
  - Schema for validating document metadata
  - Gate constraint definitions
  - Document classification system

- **[x] Base Schema Configuration** (`/home/user/ccplugin-curator/schemas/base.json`)
  - Base constraints for all documents
  - Gate constraints configuration

- **[x] BDD Example** (`/home/user/ccplugin-curator/bdd/001-no-cross-references/document.md`)
  - Minimal BDD example for documentation validation

---

### ⏳ Pending Items (Priority: CRITICAL)

#### Project Foundation

- **[ ] Initialize Node.js Project** - **Priority: CRITICAL**
  - Create package.json with project metadata
  - Configure TypeScript (tsconfig.json)
  - Set up build tooling
  - **Dependencies:** None
  - **Files to create:** `/home/user/ccplugin-curator/package.json`, `/home/user/ccplugin-curator/tsconfig.json`

- **[ ] Install Core Dependencies** - **Priority: CRITICAL**
  - json-schema-to-typescript (type generation)
  - ink + react (TUI framework)
  - ajv (JSON schema validation)
  - glob, fast-glob (file discovery)
  - chalk (terminal colors)
  - **Dependencies:** package.json must exist first
  - **Referenced in:** Spec 001, Decision 001

#### JSON Schemas (Priority: CRITICAL)

- **[ ] Create plugin.schema.json** - **Priority: CRITICAL**
  - Schema for official Claude Code plugin.json format
  - Validate all official format fields
  - Based on Spec 002
  - **Location:** `/home/user/ccplugin-curator/schemas/plugin.schema.json`
  - **Referenced in:** Spec 002, Spec 005, Spec 007, docs/spec/README.md line 49

- **[ ] Create normalized-plugin.schema.json** - **Priority: CRITICAL**
  - Schema for internal normalized format
  - All fields required (no undefined)
  - Based on Spec 001
  - **Location:** `/home/user/ccplugin-curator/schemas/normalized-plugin.schema.json`
  - **Referenced in:** Spec 001, Spec 006, Spec 007, docs/spec/README.md line 50

#### TypeScript Types (Priority: CRITICAL)

- **[ ] Generate TypeScript Types from Schemas** - **Priority: HIGH**
  - Run json-schema-to-typescript on both schemas
  - Generate src/types/plugin.ts
  - Generate src/types/normalized.ts
  - **Dependencies:** Schemas must exist first
  - **Command:** `npx json-schema-to-typescript schemas/plugin.schema.json -o src/types/plugin.ts`
  - **Referenced in:** Decision 001

#### Core Implementation

- **[ ] Plugin Loader Module** - **Priority: CRITICAL**
  - Read .claude-plugin/plugin.json files
  - Auto-discovery of components (commands/, agents/, skills/, etc.)
  - Path resolution and glob expansion
  - **Location:** `/home/user/ccplugin-curator/src/loader/`
  - **Spec Reference:** Spec 001, sections 2, 4, 6
  - **Dependencies:** TypeScript types, glob library

- **[ ] Forward Transformer (Official → Normalized)** - **Priority: CRITICAL**
  - Implement all transformation rules from Spec 005
  - Field mapping, path normalization
  - Metadata defaults
  - Hook flattening (nested → flat array)
  - MCP flattening (object → array)
  - **Location:** `/home/user/ccplugin-curator/src/transform/forward.ts`
  - **Spec Reference:** Spec 005, all sections
  - **Dependencies:** TypeScript types

- **[ ] Reverse Transformer (Normalized → Official)** - **Priority: CRITICAL**
  - Implement all transformation rules from Spec 006
  - Omit default values
  - Hook grouping (flat array → nested by event)
  - MCP grouping (array → object with name as key)
  - Path prefix addition (`./`)
  - **Location:** `/home/user/ccplugin-curator/src/transform/reverse.ts`
  - **Spec Reference:** Spec 006, all sections
  - **Dependencies:** TypeScript types

- **[ ] Schema Validator** - **Priority: HIGH**
  - Validate official format against plugin.schema.json
  - Validate normalized format against normalized-plugin.schema.json
  - Error reporting with helpful messages
  - **Location:** `/home/user/ccplugin-curator/src/validator/`
  - **Dependencies:** ajv, JSON schemas

#### TUI Implementation

- **[ ] TUI Main Application** - **Priority: HIGH**
  - Ink/React-based terminal UI
  - 3-panel layout (Plugins, Components, Preview)
  - Keyboard navigation
  - **Location:** `/home/user/ccplugin-curator/src/tui/App.tsx`
  - **Spec Reference:** Spec 003, all sections
  - **Dependencies:** ink, react

- **[ ] Plugins Panel Component** - **Priority: HIGH**
  - Display list of loaded plugins
  - Plugin metadata display
  - Tab navigation between plugins
  - **Location:** `/home/user/ccplugin-curator/src/tui/panels/PluginsPanel.tsx`
  - **Spec Reference:** Spec 003, lines 23-52, 229-263

- **[ ] Components Panel** - **Priority: HIGH**
  - Display commands, agents, skills, hooks, MCPs
  - Checkbox selection
  - Section headers with counts
  - Cursor navigation
  - **Location:** `/home/user/ccplugin-curator/src/tui/panels/ComponentsPanel.tsx`
  - **Spec Reference:** Spec 003, lines 69-125, 300-358

- **[ ] Preview Panel** - **Priority: HIGH**
  - Real-time JSON preview of selection
  - Syntax highlighting
  - Auto-scroll
  - **Location:** `/home/user/ccplugin-curator/src/tui/panels/PreviewPanel.tsx`
  - **Spec Reference:** Spec 003, lines 64-159

- **[ ] Selection State Management** - **Priority: HIGH**
  - Track selected components across plugins
  - Real-time preview updates
  - Multi-plugin selection support
  - **Location:** `/home/user/ccplugin-curator/src/tui/state/`
  - **Spec Reference:** Spec 004, lines 83-98

#### Save Operation

- **[ ] Save Operation Handler** - **Priority: CRITICAL**
  - Implement dual output strategy
  - Generate marketplace.json
  - Generate official plugin.json
  - Generate normalized-plugin.json (debug)
  - **Location:** `/home/user/ccplugin-curator/src/saver/`
  - **Spec Reference:** Spec 007, all sections
  - **Dependencies:** Reverse transformer, file operations

- **[ ] File Copy Operations** - **Priority: HIGH**
  - Copy commands, agents files
  - Copy skills directories (recursive)
  - Copy hook scripts with executable permissions (chmod +x)
  - **Location:** `/home/user/ccplugin-curator/src/saver/fileCopy.ts`
  - **Spec Reference:** Spec 007, lines 121-141

- **[ ] Namespace Conflict Resolution** - **Priority: HIGH**
  - Detect filename conflicts (commands, agents, skills, MCPs)
  - Apply `plugin-name--` prefix to conflicting files
  - Update paths in plugin.json
  - **Location:** `/home/user/ccplugin-curator/src/saver/conflicts.ts`
  - **Spec Reference:** Spec 007, lines 191-306

- **[ ] Hook Event Merging** - **Priority: MEDIUM**
  - Merge hooks with same event from different plugins
  - Preserve selection order
  - Namespace hook script files if needed
  - **Location:** `/home/user/ccplugin-curator/src/saver/hookMerge.ts`
  - **Spec Reference:** Spec 007, lines 235-283

#### CLI Interface

- **[ ] CLI Entry Point** - **Priority: HIGH**
  - Command: `app select <plugin-folder>`
  - Argument parsing
  - Launch TUI
  - **Location:** `/home/user/ccplugin-curator/src/cli.ts`
  - **Spec Reference:** Spec 004, lines 7-15
  - **Dependencies:** Commander.js or yargs

- **[ ] Output Directory Configuration** - **Priority: MEDIUM**
  - Default: `./output/curated-plugin/`
  - CLI option: `--output <path>`
  - Plugin name configuration
  - **Location:** `/home/user/ccplugin-curator/src/cli.ts`
  - **Spec Reference:** Spec 007, line 28

#### Testing Infrastructure

- **[ ] Test Framework Setup** - **Priority: HIGH**
  - Jest or Vitest configuration
  - Test directory structure
  - Test utilities and helpers
  - **Location:** `/home/user/ccplugin-curator/tests/`
  - **Dependencies:** Jest/Vitest packages

- **[ ] Unit Tests: Forward Transformer** - **Priority: HIGH**
  - Test all transformation rules
  - Edge cases (empty, undefined, arrays)
  - Path normalization
  - **Location:** `/home/user/ccplugin-curator/tests/unit/transform/forward.test.ts`
  - **Spec Reference:** Spec 005

- **[ ] Unit Tests: Reverse Transformer** - **Priority: HIGH**
  - Test all reverse transformation rules
  - Default omission
  - Hook/MCP grouping
  - **Location:** `/home/user/ccplugin-curator/tests/unit/transform/reverse.test.ts`
  - **Spec Reference:** Spec 006

- **[ ] Integration Test: Full Workflow** - **Priority: CRITICAL**
  - Create test-plugin fixture
  - Test load → select → save flow
  - Verify output files
  - Verify file copying
  - **Location:** `/home/user/ccplugin-curator/tests/integration/workflow.test.ts`
  - **Spec Reference:** Spec 008, lines 119-190

- **[ ] Integration Test: Multi-Plugin Conflicts** - **Priority: HIGH**
  - Create test-plugin-a and test-plugin-b fixtures
  - Test namespace conflict resolution
  - Test hook event merging
  - **Location:** `/home/user/ccplugin-curator/tests/integration/conflicts.test.ts`
  - **Spec Reference:** Spec 008, lines 191-294

- **[ ] Test Fixtures** - **Priority: HIGH**
  - Create comprehensive test-plugin (all component types)
  - Create test-plugin-a and test-plugin-b (conflict scenarios)
  - Hook scripts with proper permissions
  - **Location:** `/home/user/ccplugin-curator/tests/fixtures/`
  - **Spec Reference:** Spec 008, lines 9-113

#### Documentation

- **[ ] README.md** - **Priority: MEDIUM**
  - Project overview
  - Installation instructions
  - Usage examples
  - Development setup
  - **Location:** `/home/user/ccplugin-curator/README.md`

- **[ ] Contributing Guide** - **Priority: LOW**
  - Development workflow
  - Code style guidelines
  - Testing requirements
  - **Location:** `/home/user/ccplugin-curator/CONTRIBUTING.md`

---

### 🔄 Partially Implemented

*No items are partially implemented. The project is either fully documented or not started.*

---

## Differences Analysis

### Missing Features Not Yet Implemented

1. **Entire source code implementation** - 0% complete
2. **Critical JSON schemas** - Referenced in docs but don't exist:
   - `schemas/plugin.schema.json`
   - `schemas/normalized-plugin.schema.json`
3. **Type definitions** - Should be generated from schemas per Decision 001
4. **Plugin loading and auto-discovery** - Spec 001 sections 2, 4, 6
5. **Path resolution and glob expansion** - Spec 001 section 6
6. **Forward transformation logic** - Spec 005 all sections
7. **Reverse transformation logic** - Spec 006 all sections
8. **TUI implementation** - Spec 003 all sections
9. **Save operation** - Spec 007 all sections
10. **File copy with namespace resolution** - Spec 007 sections 7.3-7.6
11. **Hook script executable permissions** - Spec 007 line 138
12. **CLI interface** - Spec 004 lines 7-15
13. **Test infrastructure and test cases** - Spec 008 all sections
14. **Test fixtures** - Spec 008 lines 9-113

### Features Implemented Differently Than Specified

*None - nothing has been implemented yet*

### Additional Features Beyond Spec

- **Document frontmatter schema** - Not mentioned in specs but adds value for documentation validation
- **BDD folder structure** - Minimal example exists

### Design Decisions Not Yet Applied

1. **Decision 001: JSON Schema to TypeScript**
   - Schemas don't exist yet
   - Type generation hasn't been run
   - npm script not configured

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Goal:** Set up project infrastructure and type system

#### 1.1 Project Initialization
**Files to create:**
- `/home/user/ccplugin-curator/package.json`
- `/home/user/ccplugin-curator/tsconfig.json`
- `/home/user/ccplugin-curator/.gitignore`
- `/home/user/ccplugin-curator/.eslintrc.js`

**Actions:**
```bash
npm init -y
npm install -D typescript @types/node
npm install -D json-schema-to-typescript
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Dependencies:** None

#### 1.2 Create JSON Schemas
**Files to create:**
- `/home/user/ccplugin-curator/schemas/plugin.schema.json`
- `/home/user/ccplugin-curator/schemas/normalized-plugin.schema.json`

**Approach:**
1. Based on Spec 002 (official format), create plugin.schema.json
2. Define all fields from Spec 002 lines 18-24
3. Based on Spec 001 (normalized format), create normalized-plugin.schema.json
4. Define all required fields from Spec 001 lines 59-84
5. Add validation rules per Spec 001 section 8

**Implementation notes:**
- All fields in normalized schema are required
- Official schema has only `name` as required
- Hook interface per Spec 001 lines 87-96
- MCP interface per Spec 001 lines 99-107

#### 1.3 Generate TypeScript Types
**Files to create:**
- `/home/user/ccplugin-curator/src/types/plugin.ts`
- `/home/user/ccplugin-curator/src/types/normalized.ts`

**Actions:**
```bash
npx json-schema-to-typescript schemas/plugin.schema.json -o src/types/plugin.ts
npx json-schema-to-typescript schemas/normalized-plugin.schema.json -o src/types/normalized.ts
```

**Dependencies:** Schemas must exist (1.2)

**Add to package.json:**
```json
{
  "scripts": {
    "generate-types": "json-schema-to-typescript schemas/plugin.schema.json -o src/types/plugin.ts && json-schema-to-typescript schemas/normalized-plugin.schema.json -o src/types/normalized.ts"
  }
}
```

---

### Phase 2: Core Logic (Week 2-3)

**Goal:** Implement transformation and validation logic

#### 2.1 Plugin Loader
**Files to create:**
- `/home/user/ccplugin-curator/src/loader/pluginLoader.ts`
- `/home/user/ccplugin-curator/src/loader/autoDiscover.ts`
- `/home/user/ccplugin-curator/src/loader/pathResolver.ts`

**Implementation:**
1. `pluginLoader.ts`: Main entry point
   - Read `.claude-plugin/plugin.json`
   - Call auto-discovery if needed
   - Return PluginJson type
2. `autoDiscover.ts`: Auto-discovery logic
   - Scan default directories per Spec 001 lines 47-56
   - Glob patterns: `commands/**/*.md`, `agents/**/*.md`, `skills/*/SKILL.md`
   - Load hooks.json and .mcp.json if present
3. `pathResolver.ts`: Path utilities
   - Normalize paths (remove leading `./`)
   - Resolve relative paths to absolute
   - Handle custom paths + auto-discovery supplement

**Dependencies:** glob, fs/promises

**Spec Reference:** Spec 001 sections 2, 4, 6

#### 2.2 Forward Transformer
**Files to create:**
- `/home/user/ccplugin-curator/src/transform/forward.ts`
- `/home/user/ccplugin-curator/src/transform/forwardHooks.ts`
- `/home/user/ccplugin-curator/src/transform/forwardMcps.ts`

**Implementation:**
1. `forward.ts`: Main transformation
   - Map all metadata fields with defaults per Spec 005 lines 188-197
   - Transform commands/agents to arrays per Spec 005 lines 26-48
   - Handle skills discovery per Spec 005 lines 54-65
2. `forwardHooks.ts`: Hook transformation
   - Load from file or inline per Spec 005 lines 72-146
   - Flatten nested structure per Spec 005 lines 95-100
   - Extract event/matcher to each hook
3. `forwardMcps.ts`: MCP transformation
   - Load from file or inline per Spec 005 lines 152-193
   - Extract name from key
   - Add default empty env if missing

**Dependencies:** TypeScript types

**Spec Reference:** Spec 005 all sections

**Tests to write:**
- Empty plugin → all defaults
- String path → array expansion
- Inline hooks → flat array
- Inline MCPs → array with names

#### 2.3 Reverse Transformer
**Files to create:**
- `/home/user/ccplugin-curator/src/transform/reverse.ts`
- `/home/user/ccplugin-curator/src/transform/reverseHooks.ts`
- `/home/user/ccplugin-curator/src/transform/reverseMcps.ts`

**Implementation:**
1. `reverse.ts`: Main transformation
   - Omit default values per Spec 006 lines 43-88
   - Add `./` prefix to paths per Spec 006 lines 118-140
   - Omit empty arrays
2. `reverseHooks.ts`: Hook grouping
   - Group by event per Spec 006 lines 188-278
   - Group by matcher within event
   - Remove event/matcher fields from hook configs
3. `reverseMcps.ts`: MCP grouping
   - Use name as key per Spec 006 lines 292-348
   - Remove name field
   - Omit empty env objects

**Dependencies:** TypeScript types

**Spec Reference:** Spec 006 all sections

**Pseudo-code provided:** Spec 006 lines 666-776

#### 2.4 Schema Validator
**Files to create:**
- `/home/user/ccplugin-curator/src/validator/validate.ts`

**Implementation:**
1. Load schemas
2. Use Ajv to validate
3. Format error messages
4. Export `validateOfficial()` and `validateNormalized()`

**Dependencies:** ajv

**Install:**
```bash
npm install ajv
```

---

### Phase 3: TUI Implementation (Week 4-5)

**Goal:** Build interactive terminal interface

#### 3.1 TUI Setup
**Files to create:**
- `/home/user/ccplugin-curator/src/tui/App.tsx`
- `/home/user/ccplugin-curator/src/tui/hooks/useKeyboard.ts`
- `/home/user/ccplugin-curator/src/tui/state/SelectionState.ts`

**Install dependencies:**
```bash
npm install ink react
npm install -D @types/react
```

**Implementation:**
1. Main App component with 3-panel layout
2. Keyboard event handling
3. Global selection state management

**Spec Reference:** Spec 003 lines 23-55

#### 3.2 Plugins Panel
**Files to create:**
- `/home/user/ccplugin-curator/src/tui/panels/PluginsPanel.tsx`

**Implementation:**
1. Display plugin list with stats
2. Active plugin indicator (★)
3. Expand/collapse state (▼/▽)
4. Tab navigation support

**Spec Reference:** Spec 003 lines 316-338

#### 3.3 Components Panel
**Files to create:**
- `/home/user/ccplugin-curator/src/tui/panels/ComponentsPanel.tsx`
- `/home/user/ccplugin-curator/src/tui/components/Checkbox.tsx`
- `/home/user/ccplugin-curator/src/tui/components/SectionHeader.tsx`

**Implementation:**
1. Display sections: COMMANDS, AGENTS, SKILLS, HOOKS, MCP SERVERS
2. Checkbox components with state
3. Cursor navigation
4. Section headers with counts

**Spec Reference:** Spec 003 lines 300-358

#### 3.4 Preview Panel
**Files to create:**
- `/home/user/ccplugin-curator/src/tui/panels/PreviewPanel.tsx`
- `/home/user/ccplugin-curator/src/tui/utils/jsonHighlight.ts`

**Implementation:**
1. Real-time JSON rendering
2. Syntax highlighting (optional)
3. Auto-scroll

**Spec Reference:** Spec 003 lines 64-159

**Install (optional):**
```bash
npm install chalk
```

---

### Phase 4: Save Operations (Week 6)

**Goal:** Implement file generation and copying

#### 4.1 Save Handler
**Files to create:**
- `/home/user/ccplugin-curator/src/saver/save.ts`
- `/home/user/ccplugin-curator/src/saver/outputGenerator.ts`

**Implementation:**
1. Check non-empty selection
2. Apply reverse transformation
3. Generate 3 output files:
   - `.claude-plugin/marketplace.json`
   - `plugins/curated-plugin/.claude-plugin/plugin.json`
   - `normalized-plugin.json`
4. Call file copy operations
5. Show success message

**Spec Reference:** Spec 007 sections 1-4

#### 4.2 File Copy Operations
**Files to create:**
- `/home/user/ccplugin-curator/src/saver/fileCopy.ts`

**Implementation:**
1. Copy command/agent files
2. Copy skill directories (recursive with fs.cp)
3. Copy hook scripts and set executable (`fs.chmod(path, 0o755)`)
4. Handle namespace conflicts

**Spec Reference:** Spec 007 lines 121-141

**Key requirement:** Hook scripts must be executable per Spec 007 line 138

#### 4.3 Conflict Resolution
**Files to create:**
- `/home/user/ccplugin-curator/src/saver/conflicts.ts`

**Implementation:**
1. Detect filename conflicts across plugins
2. Apply `plugin-name--` prefix
3. Update paths in selection
4. Handle special cases:
   - Commands/Agents: namespace prefix (Spec 007 lines 191-213)
   - MCPs: namespace prefix to name (Spec 007 lines 215-232)
   - Skills: namespace prefix to directory (Spec 007 lines 285-308)
   - Hooks: merge same event, namespace scripts if needed (Spec 007 lines 235-283)

**Spec Reference:** Spec 007 sections 7.3-7.6

---

### Phase 5: CLI & Integration (Week 7)

**Goal:** Command-line interface and end-to-end tests

#### 5.1 CLI Entry Point
**Files to create:**
- `/home/user/ccplugin-curator/src/cli.ts`
- `/home/user/ccplugin-curator/bin/ccplugin-curator`

**Install:**
```bash
npm install commander
```

**Implementation:**
1. Parse command: `select <plugin-folder>`
2. Options: `--output <path>`, `--name <plugin-name>`
3. Load plugins from folder
4. Launch TUI
5. Handle save operation

**Spec Reference:** Spec 004 lines 7-15

**Add to package.json:**
```json
{
  "bin": {
    "ccplugin-curator": "./bin/ccplugin-curator"
  }
}
```

#### 5.2 Test Infrastructure
**Files to create:**
- `/home/user/ccplugin-curator/jest.config.js`
- `/home/user/ccplugin-curator/tests/setup.ts`

**Install:**
```bash
npm install -D jest ts-jest @types/jest
```

**Configure jest.config.js:**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts']
};
```

#### 5.3 Integration Test Fixtures
**Files to create:**
- `/home/user/ccplugin-curator/tests/fixtures/test-plugin/.claude-plugin/plugin.json`
- `/home/user/ccplugin-curator/tests/fixtures/test-plugin/commands/*.md`
- `/home/user/ccplugin-curator/tests/fixtures/test-plugin/agents/*.md`
- `/home/user/ccplugin-curator/tests/fixtures/test-plugin/skills/*/SKILL.md`
- `/home/user/ccplugin-curator/tests/fixtures/test-plugin/hooks/hooks.json`
- `/home/user/ccplugin-curator/tests/fixtures/test-plugin/hooks/*.sh`
- `/home/user/ccplugin-curator/tests/fixtures/test-plugin/.mcp.json`

**Structure per Spec 008 lines 9-113:**
- 3 commands (including nested)
- 2 agents
- 3 skills
- 4 hooks with scripts
- 3 MCPs

**Hook scripts must be executable:**
```bash
chmod +x tests/fixtures/test-plugin/hooks/*.sh
```

#### 5.4 Integration Tests
**Files to create:**
- `/home/user/ccplugin-curator/tests/integration/workflow.test.ts`
- `/home/user/ccplugin-curator/tests/integration/conflicts.test.ts`

**Test scenarios per Spec 008:**
1. Full workflow: load → select → save → verify (lines 136-190)
2. Multi-plugin conflicts (lines 191-294)
3. Edge cases (lines 302-331)
4. Validation scenarios (lines 338-405)

**Success criteria per Spec 008 lines 447-460:**
- All components loaded correctly
- Selection works
- Output files generated
- Files copied
- Executable permissions set

---

### Phase 6: Testing & Documentation (Week 8)

**Goal:** Complete test coverage and documentation

#### 6.1 Unit Tests
**Files to create:**
- `/home/user/ccplugin-curator/tests/unit/loader/*.test.ts`
- `/home/user/ccplugin-curator/tests/unit/transform/forward.test.ts`
- `/home/user/ccplugin-curator/tests/unit/transform/reverse.test.ts`
- `/home/user/ccplugin-curator/tests/unit/validator/*.test.ts`
- `/home/user/ccplugin-curator/tests/unit/saver/*.test.ts`

**Coverage targets:**
- Loader: auto-discovery, path resolution
- Forward: all transformation rules per Spec 005
- Reverse: all transformation rules per Spec 006
- Validator: schema validation
- Saver: file operations, conflict resolution

#### 6.2 Documentation
**Files to create:**
- `/home/user/ccplugin-curator/README.md`
- `/home/user/ccplugin-curator/CONTRIBUTING.md`
- `/home/user/ccplugin-curator/docs/API.md`

**README.md should include:**
1. Project overview
2. Installation: `npm install -g ccplugin-curator`
3. Usage: `ccplugin-curator select <path>`
4. Features list
5. Examples
6. Development setup

#### 6.3 Build & Release
**Add to package.json:**
```json
{
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:integration": "jest --testMatch '**/integration/*.test.ts'",
    "test:unit": "jest --testMatch '**/unit/**/*.test.ts'",
    "lint": "eslint src tests",
    "prepare": "npm run build"
  }
}
```

---

## Priority Matrix

### Immediate (Week 1)
1. Initialize project (package.json, tsconfig.json)
2. Create JSON schemas
3. Generate TypeScript types

### Short-term (Weeks 2-3)
1. Plugin loader
2. Forward transformer
3. Reverse transformer
4. Validator

### Medium-term (Weeks 4-6)
1. TUI implementation
2. Save operations
3. Conflict resolution

### Long-term (Weeks 7-8)
1. CLI interface
2. Integration tests
3. Documentation
4. Release preparation

---

## Dependencies & Prerequisites

### External Dependencies
```json
{
  "dependencies": {
    "ink": "^4.0.0",
    "react": "^18.0.0",
    "ajv": "^8.0.0",
    "glob": "^10.0.0",
    "commander": "^11.0.0",
    "chalk": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "json-schema-to-typescript": "^13.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "eslint": "^8.0.0"
  }
}
```

### Internal Dependencies (Build Order)
1. JSON Schemas → TypeScript Types
2. Types → Loader, Transformers, Validator
3. Transformers → Saver
4. All Core Logic → TUI
5. TUI + Saver → CLI
6. All Implementation → Tests

---

## Risk Analysis

### Critical Risks

1. **TUI Complexity**
   - Risk: Ink/React learning curve
   - Mitigation: Start with simple mock, iterate
   - Reference: Spec 003 provides detailed examples

2. **Conflict Resolution Edge Cases**
   - Risk: Complex namespace scenarios
   - Mitigation: Comprehensive test coverage per Spec 008
   - Reference: Spec 007 sections 7.3-7.6

3. **File Permission Handling**
   - Risk: Hook scripts not executable
   - Mitigation: Explicit `fs.chmod(0o755)` per Spec 007 line 138
   - Test: Verify in integration tests per Spec 008 lines 377-378

### Medium Risks

1. **Path Resolution Cross-Platform**
   - Risk: Windows vs Unix path differences
   - Mitigation: Use `path` module consistently

2. **Hook Script Environment Variables**
   - Risk: `${CLAUDE_PLUGIN_ROOT}` not resolved
   - Mitigation: Document as user responsibility (Claude Code handles this)
   - Reference: Spec 001 line 391

---

## Testing Strategy

### Unit Test Coverage (Target: >80%)
- Loader: auto-discovery, custom paths
- Forward transform: all rules, edge cases
- Reverse transform: grouping, omission
- Validator: schema compliance
- Conflict resolver: all conflict types

### Integration Test Coverage
- Full workflow (Spec 008 lines 136-190)
- Multi-plugin conflicts (Spec 008 lines 191-294)
- Edge cases (Spec 008 lines 302-331)
- Hook scripts executable (Spec 008 lines 377-378)

### Manual Testing
- TUI navigation
- Real plugin loading
- Visual verification

---

## Success Metrics

### Feature Completeness
- [ ] Load plugins from directory
- [ ] Display in 3-panel TUI
- [ ] Select components interactively
- [ ] Generate dual output (marketplace + plugin)
- [ ] Copy files with namespace resolution
- [ ] Hook scripts executable
- [ ] Pass all integration tests

### Quality Metrics
- [ ] >80% unit test coverage
- [ ] All integration tests passing
- [ ] No TypeScript errors
- [ ] ESLint passing
- [ ] Documentation complete

### User Experience
- [ ] Clear error messages
- [ ] Intuitive keyboard navigation
- [ ] Real-time preview
- [ ] Success message with instructions

---

## Conclusion

This project has excellent, comprehensive documentation but requires complete implementation from scratch. The specifications are well-defined and provide clear guidance for implementation. The recommended approach is to build incrementally following the 8-week plan outlined above, with emphasis on:

1. **Foundation first:** Schemas and types are critical
2. **Core logic before UI:** Transformers must work correctly
3. **Test-driven:** Write tests alongside implementation
4. **Iterative TUI:** Start simple, add polish later

The specs provide all necessary details for implementation. No spec changes are required - only execution.
