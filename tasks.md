# Implementation Review - ccplugin-curator

**Review Date**: 2025-11-18
**Reviewer**: Technical Project Manager
**Project Status**: Pre-Implementation (0% Complete)

---

## Executive Summary

### Overall Status: 0% Complete

The ccplugin-curator project has **comprehensive documentation** but **zero implementation**. The project currently consists of:

- ✅ **Complete Specifications**: 9 specification documents covering all features
- ✅ **Design Decisions**: 1 design decision documented
- ❌ **No Source Code**: No `src/`, `lib/`, or `bin/` directories exist
- ❌ **No Build Configuration**: Missing TypeScript config, build scripts
- ❌ **No Dependencies**: Minimal package.json with only dev dependency
- ❌ **No Tests**: No test framework or test files

### Major Gaps

1. **Core Transformation Engine** - Not started
2. **TUI Interface** - Not started
3. **CLI Entry Points** - Not started
4. **File Operations** - Not started
5. **Validation Logic** - Not started
6. **Setup Screens** - Not started
7. **Integration Tests** - Not started

### Recommended Next Steps

1. Set up project infrastructure (TypeScript, build tools, dependencies)
2. Implement core transformation logic (normalization protocol)
3. Build TUI components (setup screens + component selection)
4. Implement save operations with conflict resolution
5. Create integration tests with test fixtures

---

## Detailed Checklist

### ✅ Completed Items (Documentation Only)

- [x] **Normalization Protocol Specification** (001-normalization-protocol.md)
  - Complete definition of official → normalized transformation
  - Auto-discovery rules documented
  - Path resolution rules defined

- [x] **Plugin Format Specification** (002-plugin-format-spec.md)
  - Official Claude Code format documented
  - Hook and MCP structures specified

- [x] **TUI Visual Specification** (003-tui-visual-spec.md)
  - Three-panel layout design complete
  - UI states and interactions defined
  - Box-drawing characters and colors specified

- [x] **User Workflows** (004-user-workflows.md)
  - Setup workflow (Main Menu + Configuration Form)
  - Selection workflow (component selection)
  - Save workflow with conflict resolution
  - BDD scenarios defined

- [x] **Transformation Rules** (005-transformation-rules.md)
  - Official → Normalized transformation rules
  - Field mapping documented
  - Edge cases covered

- [x] **Reverse Transformation Rules** (006-reverse-transformation-rules.md)
  - Normalized → Official transformation rules
  - Minimalism principles defined
  - Hook and MCP grouping logic specified

- [x] **Save Operation Rules** (007-save-operation-rules.md)
  - Dual output strategy (official + normalized)
  - Conflict resolution rules (namespace prefixing)
  - Hook merging and script copying rules

- [x] **Integration Test Specification** (008-integration-test-spec.md)
  - Complete BDD scenarios for setup and component selection
  - Multi-plugin conflict resolution tests
  - Test plugin structure defined

- [x] **TUI Setup Screens** (009-tui-setup-screens.md)
  - Main Menu visual design
  - Configuration Form with validation rules
  - Placeholder behavior and transitions

- [x] **Design Decision: TypeScript Generation** (001-json-schema-to-typescript.md)
  - Decision to use `json-schema-to-typescript` documented

### ⏳ Pending Items (Not Started)

#### Infrastructure & Project Setup
- [ ] **Project Structure** (Priority: HIGH)
  - Create `src/` directory structure
  - Create `src/types/`, `src/lib/`, `src/tui/`, `src/cli/` directories
  - Set up `tsconfig.json` for TypeScript compilation
  - Configure build system and scripts
  - **Spec Reference**: Decision 001

- [ ] **Package Dependencies** (Priority: HIGH)
  - Add TypeScript and build tools
  - Add TUI library (recommend: `ink` for React-based TUI or `blessed` for low-level control)
  - Add CLI framework (recommend: `commander` or `yargs`)
  - Add testing framework (recommend: `vitest` or `jest`)
  - Add validation library (recommend: `ajv` for JSON schema validation)
  - Add file system utilities
  - **Spec Reference**: All specs

- [ ] **JSON Schema Validation** (Priority: HIGH)
  - Create `schemas/plugin.schema.json` for official format validation
  - Create `schemas/normalized-plugin.schema.json` for internal format validation
  - Generate TypeScript types from schemas using `json-schema-to-typescript`
  - **Spec Reference**: Decision 001, Spec 001, Spec 002

#### Core Transformation Engine
- [ ] **Normalizer Module** (Priority: HIGH)
  - Implement `src/lib/normalizer.ts`
  - Load and parse official `plugin.json` files
  - Auto-discovery implementation (commands, agents, skills glob patterns)
  - Hook parsing (inline object → flat array)
  - MCP parsing (object → flat array with name extraction)
  - Path normalization (remove leading `./`)
  - Default value application
  - **Spec Reference**: Spec 001, Spec 005
  - **Key Functions**:
    - `normalizePlugin(pluginPath: string): NormalizedPlugin`
    - `autoDiscoverCommands(pluginPath: string): string[]`
    - `autoDiscoverAgents(pluginPath: string): string[]`
    - `autoDiscoverSkills(pluginPath: string): string[]`
    - `parseHooks(hooksConfig: HooksConfig): Hook[]`
    - `parseMcps(mcpConfig: McpConfig): Mcp[]`

- [ ] **Reverse Transformer Module** (Priority: HIGH)
  - Implement `src/lib/reverse-transformer.ts`
  - Transform normalized format → official format
  - Group hooks by event (flat array → nested object)
  - Transform MCPs (flat array → object with name as key)
  - Omit default values (keep plugin.json minimal)
  - Add `./` prefix to all component paths
  - **Spec Reference**: Spec 006
  - **Key Functions**:
    - `toOfficialFormat(normalized: NormalizedPlugin): PluginJson`
    - `groupHooksByEvent(hooks: Hook[]): HooksObject`
    - `mcpsToObject(mcps: Mcp[]): McpServersObject`
    - `omitDefaults(plugin: Partial<PluginJson>): PluginJson`

- [ ] **Validator Module** (Priority: MEDIUM)
  - Implement `src/lib/validator.ts`
  - Validate official format against JSON schema
  - Validate normalized format against JSON schema
  - Validate marketplace name (kebab-case, 3-50 chars)
  - Validate email format
  - Validate directory existence
  - **Spec Reference**: Spec 008, Spec 009
  - **Key Functions**:
    - `validateOfficialFormat(plugin: PluginJson): ValidationResult`
    - `validateNormalizedFormat(plugin: NormalizedPlugin): ValidationResult`
    - `validateMarketplaceName(name: string): boolean`
    - `validateEmail(email: string): boolean`
    - `validateDirectory(path: string): boolean`

#### TUI Components
- [ ] **Main Menu Screen** (Priority: HIGH)
  - Implement `src/tui/screens/main-menu.tsx` (if using Ink) or `src/tui/screens/main-menu.ts` (if using blessed)
  - Display welcome banner
  - Show options: "Create New Curated Plugin" and "Exit"
  - Handle keyboard navigation (↑↓, ENTER, Q)
  - Transition to Configuration Form on selection
  - **Spec Reference**: Spec 009
  - **Features**:
    - Centered layout with border
    - Keyboard navigation
    - Clean visual hierarchy

- [ ] **Configuration Form Screen** (Priority: HIGH)
  - Implement `src/tui/screens/config-form.tsx` or `src/tui/screens/config-form.ts`
  - Display form fields with placeholders
  - Required fields: Marketplace Name, Plugin Name, Source Directory
  - Optional fields: Output Directory, Author Email
  - Real-time validation with checkmarks/errors
  - Auto-fill Output Directory from Marketplace Name
  - Directory scanning with plugin count display
  - Handle keyboard navigation (↑↓, TAB, SHIFT+TAB)
  - ESC to cancel and return to Main Menu
  - ENTER to continue to component selection
  - **Spec Reference**: Spec 009, Spec 008
  - **Validation Rules**:
    - Marketplace Name: `^[a-z0-9-]{3,50}$`
    - Email: standard email regex
    - Directory: must exist with `.claude-plugin/plugin.json` files

- [ ] **Component Selection TUI** (Priority: HIGH)
  - Implement `src/tui/screens/component-selection.tsx` or `src/tui/screens/component-selection.ts`
  - Three-panel layout: PLUGINS | COMPONENTS | PREVIEW
  - Left panel: List of discovered plugins
  - Center panel: Components of selected plugin (commands, agents, skills, hooks, MCPs)
  - Right panel: Real-time JSON preview of selection
  - Handle keyboard navigation (←→↑↓, SPACE, TAB, SHIFT+TAB)
  - S key: Save selection
  - Q key: Quit
  - A key: Select all components in current plugin
  - N key: Deselect all components
  - **Spec Reference**: Spec 003, Spec 004
  - **Visual Requirements**:
    - Minimum width: 120 columns
    - Box-drawing characters for borders
    - Color-coded checkboxes and cursor
    - Real-time preview updates

- [ ] **TUI State Management** (Priority: MEDIUM)
  - Implement `src/tui/state.ts`
  - Track loaded plugins
  - Track component selections (per plugin)
  - Track current panel focus
  - Track current cursor position
  - Generate preview JSON from selections
  - **Spec Reference**: Spec 003, Spec 004

#### Save Operations
- [ ] **Save Controller** (Priority: HIGH)
  - Implement `src/lib/save-controller.ts`
  - Orchestrate save operation flow
  - Validate non-empty selection
  - Check output directory conflicts
  - Apply reverse transformation
  - Copy component files with conflict resolution
  - Generate marketplace.json
  - Generate plugin.json (official format)
  - Generate normalized-plugin.json (debug format)
  - Display success message with installation instructions
  - **Spec Reference**: Spec 007
  - **Key Functions**:
    - `save(selection: Selection, config: Config): SaveResult`
    - `checkOutputDirectory(path: string): DirectoryStatus`
    - `copyComponents(selection: Selection, outputPath: string): void`
    - `generateMarketplaceJson(config: Config): MarketplaceJson`

- [ ] **Conflict Resolver** (Priority: HIGH)
  - Implement `src/lib/conflict-resolver.ts`
  - Detect filename conflicts (commands, agents)
  - Detect skill directory conflicts
  - Detect MCP name conflicts
  - Detect hook script filename conflicts
  - Apply namespace prefixing (e.g., `plugin-a--build.md`)
  - Merge hooks by event (SessionStart → multiple hooks array)
  - Update paths in plugin.json with namespace prefixes
  - **Spec Reference**: Spec 007, Spec 004
  - **Key Functions**:
    - `resolveCommandConflicts(commands: CommandSelection[]): ResolvedCommand[]`
    - `resolveAgentConflicts(agents: AgentSelection[]): ResolvedAgent[]`
    - `resolveSkillConflicts(skills: SkillSelection[]): ResolvedSkill[]`
    - `resolveMcpConflicts(mcps: McpSelection[]): ResolvedMcp[]`
    - `mergeHooksByEvent(hooks: HookSelection[]): MergedHook[]`
    - `resolveHookScriptConflicts(hooks: HookSelection[]): ResolvedHookScript[]`

- [ ] **File Operations** (Priority: MEDIUM)
  - Implement `src/lib/file-ops.ts`
  - Copy command markdown files
  - Copy agent markdown files
  - Copy skill directories (recursive)
  - Copy hook script files with executable permissions (chmod 0o755)
  - Write JSON files (pretty-printed with 2-space indent)
  - Create directory structures
  - **Spec Reference**: Spec 007
  - **Key Functions**:
    - `copyFile(source: string, dest: string): void`
    - `copyDirectory(source: string, dest: string): void`
    - `writeJson(path: string, data: object): void`
    - `ensureDirectory(path: string): void`
    - `setExecutable(path: string): void`

#### CLI Entry Points
- [ ] **Main CLI Entry** (Priority: HIGH)
  - Implement `src/cli/index.ts`
  - Handle `app` command (interactive mode → Main Menu)
  - Handle `app select <dir>` command (direct mode → skip setup, go to component selection)
  - Parse command-line arguments
  - Initialize TUI with appropriate screen
  - **Spec Reference**: Spec 004
  - **Commands**:
    - `app` → Show Main Menu
    - `app select <plugin-directory>` → Direct to component selection with defaults

- [ ] **Bin Script** (Priority: MEDIUM)
  - Create `bin/app.js` or `bin/app` executable
  - Add shebang: `#!/usr/bin/env node`
  - Import and run main CLI
  - Configure in package.json `bin` field
  - **Spec Reference**: Spec 004

#### Testing Infrastructure
- [ ] **Test Setup** (Priority: MEDIUM)
  - Configure test framework (vitest/jest)
  - Create `test/` directory structure
  - Create `test/fixtures/` for test plugins
  - Set up coverage reporting
  - Add test scripts to package.json
  - **Spec Reference**: Spec 008

- [ ] **Unit Tests** (Priority: MEDIUM)
  - Test normalizer module functions
  - Test reverse transformer module functions
  - Test validator module functions
  - Test conflict resolver module functions
  - Test file operations
  - **Spec Reference**: Spec 005, Spec 006, Spec 007

- [ ] **Integration Tests** (Priority: HIGH)
  - Create test plugin fixture (as specified in Spec 008)
  - Test full workflow: load → normalize → select → save → verify
  - Test multi-plugin selection with conflicts
  - Test setup screens workflow
  - Test configuration form validation
  - Test output file generation
  - Verify generated plugin.json validity
  - Verify copied files and permissions
  - **Spec Reference**: Spec 008

- [ ] **Test Plugin Fixtures** (Priority: MEDIUM)
  - Create `test/fixtures/test-plugin/` with all component types
  - Create `test/fixtures/test-plugin-a/` for conflict testing
  - Create `test/fixtures/test-plugin-b/` for conflict testing
  - Include executable hook scripts
  - Include all component types (commands, agents, skills, hooks, MCPs)
  - **Spec Reference**: Spec 008 (Section 1: Test Plugin Structure)

### 🔄 Partially Implemented (None)

*No partially implemented features - project is at 0% implementation.*

---

## Differences Analysis

### Missing Features (Compared to Specification)

#### 1. Core Transformation Logic (Spec 001, 005, 006)
- **Missing**: Entire normalization engine
- **Missing**: Path resolution and glob expansion
- **Missing**: Auto-discovery for commands, agents, skills
- **Missing**: Hook parsing from nested to flat format
- **Missing**: MCP parsing from object to array format
- **Missing**: Reverse transformation (normalized → official)
- **Missing**: Default value application

#### 2. TUI Interface (Spec 003, 009)
- **Missing**: Main Menu screen
- **Missing**: Configuration Form screen with validation
- **Missing**: Three-panel component selection interface
- **Missing**: Real-time JSON preview panel
- **Missing**: Keyboard navigation handlers
- **Missing**: Visual elements (borders, colors, checkboxes)

#### 3. File Operations (Spec 007)
- **Missing**: File copying with namespace prefixing
- **Missing**: Directory creation and management
- **Missing**: Hook script copying with executable permissions
- **Missing**: JSON file generation (marketplace.json, plugin.json, normalized-plugin.json)

#### 4. Conflict Resolution (Spec 004, 007)
- **Missing**: Filename conflict detection
- **Missing**: Namespace prefixing for conflicting files
- **Missing**: Hook merging by event
- **Missing**: MCP name conflict resolution
- **Missing**: Skill directory conflict resolution

#### 5. Validation (Spec 008, 009)
- **Missing**: JSON schema validation
- **Missing**: Marketplace name validation
- **Missing**: Email format validation
- **Missing**: Directory existence validation
- **Missing**: Plugin discovery and counting

#### 6. CLI Interface (Spec 004)
- **Missing**: Command-line argument parsing
- **Missing**: Interactive mode entry point
- **Missing**: Direct mode entry point
- **Missing**: Executable bin script

#### 7. Testing (Spec 008)
- **Missing**: Test framework setup
- **Missing**: Unit tests
- **Missing**: Integration tests
- **Missing**: Test fixtures
- **Missing**: BDD scenario implementations

### Features Implemented Differently Than Specified

*None - no implementation exists yet.*

### Additional Features Beyond Spec

*None - no implementation exists yet.*

### Design Decisions Not Yet Applied

1. **TypeScript Type Generation** (Decision 001)
   - JSON schemas need to be created
   - `json-schema-to-typescript` needs to be added as dev dependency
   - npm script needs to be added to generate types
   - Types need to be generated for official and normalized formats

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

#### 1.1 Project Infrastructure
**Goal**: Set up build system and tooling

**Tasks**:
1. Create directory structure:
   ```
   src/
   ├── types/           # Generated TypeScript types
   ├── lib/             # Core logic modules
   │   ├── normalizer.ts
   │   ├── reverse-transformer.ts
   │   ├── validator.ts
   │   ├── conflict-resolver.ts
   │   ├── file-ops.ts
   │   └── save-controller.ts
   ├── tui/             # TUI components
   │   ├── screens/
   │   │   ├── main-menu.ts
   │   │   ├── config-form.ts
   │   │   └── component-selection.ts
   │   └── state.ts
   └── cli/             # CLI entry points
       └── index.ts
   bin/
   └── app              # Executable script
   test/
   ├── unit/            # Unit tests
   ├── integration/     # Integration tests
   └── fixtures/        # Test plugins
   schemas/
   ├── plugin.schema.json
   └── normalized-plugin.schema.json
   ```

2. Create `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "lib": ["ES2020"],
       "outDir": "./dist",
       "rootDir": "./src",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "resolveJsonModule": true,
       "declaration": true,
       "declarationMap": true,
       "sourceMap": true
     },
     "include": ["src/**/*"],
     "exclude": ["node_modules", "dist", "test"]
   }
   ```

3. Update `package.json`:
   ```json
   {
     "name": "ccplugin-curator",
     "version": "0.1.0",
     "description": "Curate and combine Claude Code plugin components",
     "main": "dist/cli/index.js",
     "bin": {
       "app": "./bin/app"
     },
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch",
       "generate-types": "json-schema-to-typescript schemas/plugin.schema.json -o src/types/plugin.ts && json-schema-to-typescript schemas/normalized-plugin.schema.json -o src/types/normalized.ts",
       "test": "vitest",
       "test:watch": "vitest --watch",
       "test:coverage": "vitest --coverage",
       "test:integration": "vitest run test/integration"
     },
     "dependencies": {
       "commander": "^11.0.0",
       "blessed": "^0.1.81",
       "ajv": "^8.12.0",
       "glob": "^10.3.0"
     },
     "devDependencies": {
       "@anthropic-ai/claude-code": "^2.0.44",
       "@types/blessed": "^0.1.21",
       "@types/node": "^20.0.0",
       "json-schema-to-typescript": "^13.0.0",
       "typescript": "^5.2.0",
       "vitest": "^1.0.0",
       "@vitest/coverage-v8": "^1.0.0"
     }
   }
   ```

4. Create executable `bin/app`:
   ```bash
   #!/usr/bin/env node
   require('../dist/cli/index.js');
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

**Dependencies**: None
**Deliverables**: Working build system, package.json with dependencies
**Spec References**: Decision 001

#### 1.2 JSON Schemas and Types
**Goal**: Create validation schemas and generate TypeScript types

**Tasks**:
1. Create `schemas/plugin.schema.json` based on Spec 002 (Official Plugin Format)
2. Create `schemas/normalized-plugin.schema.json` based on Spec 001 (Normalized Format)
3. Run `npm run generate-types` to create TypeScript interfaces
4. Verify generated types in `src/types/`

**Dependencies**: 1.1 (infrastructure)
**Deliverables**: JSON schemas, TypeScript types
**Spec References**: Spec 001, Spec 002, Decision 001

### Phase 2: Core Transformation Engine (Week 2)

#### 2.1 Normalizer Module
**Goal**: Transform official format → normalized format

**Tasks**:
1. Implement `src/lib/normalizer.ts`
2. Implement functions:
   - `normalizePlugin(pluginPath: string): NormalizedPlugin`
   - `autoDiscoverCommands(pluginPath: string): string[]`
   - `autoDiscoverAgents(pluginPath: string): string[]`
   - `autoDiscoverSkills(pluginPath: string): string[]`
   - `parseHooks(hooksConfig: any): Hook[]`
   - `parseMcps(mcpConfig: any): Mcp[]`
3. Handle all path formats (string, array, glob patterns)
4. Apply default values for missing fields
5. Write unit tests for each function

**Dependencies**: 1.2 (types)
**Deliverables**: Working normalizer with tests
**Spec References**: Spec 001, Spec 005
**Test Coverage**: Unit tests for all edge cases in Spec 005

#### 2.2 Reverse Transformer Module
**Goal**: Transform normalized format → official format

**Tasks**:
1. Implement `src/lib/reverse-transformer.ts`
2. Implement functions:
   - `toOfficialFormat(normalized: NormalizedPlugin): PluginJson`
   - `groupHooksByEvent(hooks: Hook[]): HooksObject`
   - `mcpsToObject(mcps: Mcp[]): McpServersObject`
   - `omitDefaults(plugin: any): PluginJson`
3. Group hooks by event and matcher
4. Transform MCPs to object with name as key
5. Add `./` prefix to all component paths
6. Omit empty arrays and default values
7. Write unit tests for each function

**Dependencies**: 2.1 (normalizer)
**Deliverables**: Working reverse transformer with tests
**Spec References**: Spec 006
**Test Coverage**: Unit tests for all examples in Spec 006

#### 2.3 Validator Module
**Goal**: Validate formats and user inputs

**Tasks**:
1. Implement `src/lib/validator.ts`
2. Implement functions:
   - `validateOfficialFormat(plugin: any): ValidationResult`
   - `validateNormalizedFormat(plugin: any): ValidationResult`
   - `validateMarketplaceName(name: string): boolean`
   - `validateEmail(email: string): boolean`
   - `validateDirectory(path: string): boolean`
3. Use Ajv for JSON schema validation
4. Write unit tests for all validation rules

**Dependencies**: 1.2 (schemas)
**Deliverables**: Working validator with tests
**Spec References**: Spec 008, Spec 009
**Test Coverage**: Test all validation scenarios from Spec 009

### Phase 3: TUI Interface (Week 3)

#### 3.1 Main Menu Screen
**Goal**: Welcome screen with navigation

**Tasks**:
1. Implement `src/tui/screens/main-menu.ts` using blessed
2. Display centered welcome banner
3. Show menu options (Create New Curated Plugin, Exit)
4. Handle keyboard input (↑↓, ENTER, Q)
5. Transition to Configuration Form on selection
6. Style with borders and colors per Spec 009

**Dependencies**: 1.1 (blessed library)
**Deliverables**: Working Main Menu screen
**Spec References**: Spec 009 (Screen 1)
**Visual Requirements**: Match exact layout from Spec 009

#### 3.2 Configuration Form Screen
**Goal**: Interactive form with validation

**Tasks**:
1. Implement `src/tui/screens/config-form.ts` using blessed
2. Create form fields with placeholders
3. Implement real-time validation with checkmarks/errors
4. Auto-fill Output Directory from Marketplace Name
5. Directory scanning with plugin count display
6. Handle keyboard navigation (↑↓, TAB, SHIFT+TAB, ESC, ENTER)
7. Transition to component selection on submit
8. Style per Spec 009 (borders, colors, layout)

**Dependencies**: 2.3 (validator), 3.1 (main menu)
**Deliverables**: Working Configuration Form with validation
**Spec References**: Spec 009 (Screen 2), Spec 008 (BDD scenarios)
**Visual Requirements**: Match exact layout and validation rules from Spec 009

#### 3.3 Component Selection TUI
**Goal**: Three-panel selection interface

**Tasks**:
1. Implement `src/tui/screens/component-selection.ts` using blessed
2. Create three panels: PLUGINS | COMPONENTS | PREVIEW
3. Implement left panel (plugin list)
4. Implement center panel (component list with checkboxes)
5. Implement right panel (real-time JSON preview)
6. Handle keyboard navigation (←→↑↓, SPACE, TAB, S, Q, A, N)
7. Update preview in real-time as selections change
8. Style with box-drawing characters and colors per Spec 003

**Dependencies**: 2.1 (normalizer), 3.2 (config form)
**Deliverables**: Working component selection TUI
**Spec References**: Spec 003, Spec 004
**Visual Requirements**: Match three-panel layout from Spec 003

#### 3.4 TUI State Management
**Goal**: Centralized state for TUI components

**Tasks**:
1. Implement `src/tui/state.ts`
2. Store loaded plugins (normalized format)
3. Track selections per plugin
4. Track current focus (panel, cursor position)
5. Generate preview JSON from selections
6. Provide state update functions

**Dependencies**: 2.1 (normalizer)
**Deliverables**: Working state management
**Spec References**: Spec 003, Spec 004

### Phase 4: Save Operations (Week 4)

#### 4.1 Conflict Resolver
**Goal**: Detect and resolve naming conflicts

**Tasks**:
1. Implement `src/lib/conflict-resolver.ts`
2. Detect command/agent filename conflicts
3. Detect skill directory name conflicts
4. Detect MCP name conflicts
5. Detect hook script filename conflicts
6. Apply namespace prefixing (e.g., `plugin-a--build.md`)
7. Merge hooks by event (preserve order)
8. Update paths in plugin.json
9. Write unit tests for all conflict scenarios

**Dependencies**: 2.1 (normalizer), 2.2 (reverse transformer)
**Deliverables**: Working conflict resolver with tests
**Spec References**: Spec 007 (Sections 7.3-7.6), Spec 004 (Section 5)
**Test Coverage**: All conflict scenarios from Spec 007

#### 4.2 File Operations
**Goal**: Copy files and create directory structures

**Tasks**:
1. Implement `src/lib/file-ops.ts`
2. Implement file copying (commands, agents)
3. Implement recursive directory copying (skills)
4. Implement hook script copying with chmod 0o755
5. Implement JSON file writing (pretty-printed)
6. Implement directory creation
7. Write unit tests for all file operations

**Dependencies**: 4.1 (conflict resolver)
**Deliverables**: Working file operations with tests
**Spec References**: Spec 007 (Section 5)

#### 4.3 Save Controller
**Goal**: Orchestrate complete save operation

**Tasks**:
1. Implement `src/lib/save-controller.ts`
2. Validate non-empty selection
3. Check output directory conflicts
4. Apply reverse transformation
5. Resolve conflicts (use conflict resolver)
6. Copy all component files
7. Copy hook scripts with permissions
8. Generate marketplace.json
9. Generate official plugin.json
10. Generate normalized-plugin.json (debug)
11. Display success message with installation instructions
12. Write integration tests

**Dependencies**: 4.1 (conflict resolver), 4.2 (file ops), 2.2 (reverse transformer)
**Deliverables**: Complete save operation with tests
**Spec References**: Spec 007 (all sections)
**Test Coverage**: Full save workflow from Spec 008

### Phase 5: CLI and Integration (Week 5)

#### 5.1 CLI Entry Points
**Goal**: Command-line interface

**Tasks**:
1. Implement `src/cli/index.ts`
2. Add commander.js for argument parsing
3. Implement `app` command (interactive mode)
4. Implement `app select <dir>` command (direct mode)
5. Initialize TUI with appropriate screen
6. Handle errors and exit codes

**Dependencies**: 3.1, 3.2, 3.3 (TUI screens)
**Deliverables**: Working CLI commands
**Spec References**: Spec 004 (commands section)

#### 5.2 Integration Tests
**Goal**: End-to-end testing

**Tasks**:
1. Set up Vitest integration test suite
2. Create test fixtures (test-plugin, test-plugin-a, test-plugin-b)
3. Implement BDD scenarios from Spec 008:
   - Setup screens workflow
   - Component selection workflow
   - Save operation workflow
   - Multi-plugin conflict resolution
4. Verify output files (marketplace.json, plugin.json, normalized-plugin.json)
5. Verify file copying and permissions
6. Verify conflict resolution results
7. Test CLI commands

**Dependencies**: All previous phases
**Deliverables**: Complete test suite with fixtures
**Spec References**: Spec 008 (all scenarios)
**Test Coverage**: 100% of BDD scenarios from Spec 008

### Phase 6: Polish and Documentation (Week 6)

#### 6.1 Error Handling
**Goal**: Graceful error handling

**Tasks**:
1. Add try-catch blocks in all modules
2. Provide clear error messages
3. Handle edge cases (missing files, permission errors, invalid JSON)
4. Test error scenarios

**Dependencies**: All previous phases
**Deliverables**: Robust error handling

#### 6.2 README and Usage Docs
**Goal**: User-facing documentation

**Tasks**:
1. Create README.md with:
   - Installation instructions
   - Usage examples
   - CLI commands
   - Configuration options
   - Screenshots/examples
2. Update package.json metadata
3. Add LICENSE file

**Dependencies**: 5.1 (CLI)
**Deliverables**: Complete README

#### 6.3 Performance Optimization
**Goal**: Optimize for large plugins

**Tasks**:
1. Profile performance with large plugin directories
2. Optimize glob patterns and file scanning
3. Add progress indicators for long operations
4. Test with real-world plugins

**Dependencies**: All previous phases
**Deliverables**: Performance improvements

---

## Technical Architecture

### Module Dependencies

```
┌─────────────────────────────────────────────────────┐
│                    CLI Entry                        │
│                  (src/cli/index.ts)                 │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────────┐
│  Main Menu      │    │  Component         │
│  (TUI Screen)   │───▶│  Selection TUI     │
└─────────────────┘    │  (TUI Screen)      │
         │             └──────────┬──────────┘
         ▼                        │
┌─────────────────┐               │
│  Config Form    │               │
│  (TUI Screen)   │──────────────▶│
└─────────────────┘               │
         │                        │
         │                        ▼
         │              ┌─────────────────┐
         │              │  TUI State      │
         │              │  Management     │
         │              └─────────────────┘
         │                        │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │    Normalizer          │
         │  (Transformation)      │
         └────────┬───────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │   Validator            │
         │  (JSON Schema)         │
         └────────────────────────┘
                  │
                  ▼
         ┌────────────────────────┐
         │  Save Controller       │
         └────────┬───────────────┘
                  │
         ┌────────┴────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│ Reverse         │   │  Conflict        │
│ Transformer     │   │  Resolver        │
└─────────────────┘   └──────────────────┘
         │                     │
         └─────────┬───────────┘
                   │
                   ▼
         ┌────────────────────┐
         │  File Operations   │
         └────────────────────┘
```

### Data Flow

```
1. CLI → Main Menu → Config Form
   ↓
2. Config Form → Scan Directory → Normalize Plugins
   ↓
3. Component Selection TUI
   ↓
4. User Selections → TUI State
   ↓
5. Save (S key) → Save Controller
   ↓
6. Reverse Transform + Conflict Resolution
   ↓
7. File Operations (copy, write JSON)
   ↓
8. Success Message
```

---

## Critical Implementation Notes

### 1. Hook Command Paths (CRITICAL)
**From Spec 006, Section 3.5:**

Hook command paths must be transformed to use `${CLAUDE_PLUGIN_ROOT}`:
```typescript
// Normalized format
{ command: "hooks/setup.sh" }

// Must become (in official format)
{ command: "${CLAUDE_PLUGIN_ROOT}/hooks/setup.sh" }
```

**Implementation Location**: `src/lib/reverse-transformer.ts`, function `groupHooksByEvent()`

### 2. Auto-Discovery ALWAYS Happens (CRITICAL)
**From Spec 001, Section 1.4:**

> Auto-discovery SIEMPRE ocurre si existen los directorios predeterminados

Custom paths COMPLEMENT auto-discovery, never replace it.

**Implementation Location**: `src/lib/normalizer.ts`, all `autoDiscover*()` functions

### 3. Skills Are Directory Paths (CRITICAL)
**From Spec 001:**

Skills glob pattern: `skills/*/SKILL.md`
Result: Parent directory paths (NOT file paths)

Example: `["skills/skill-a", "skills/skill-b"]` (not `["skills/skill-a/SKILL.md"]`)

**Implementation Location**: `src/lib/normalizer.ts`, `autoDiscoverSkills()`

### 4. Hook Merging Preserves Order (CRITICAL)
**From Spec 007, Section 7.5:**

When merging hooks from multiple plugins:
- Group by event
- Preserve selection order from TUI
- Merge into single array

**Implementation Location**: `src/lib/conflict-resolver.ts`, `mergeHooksByEvent()`

### 5. Executable Permissions for Hook Scripts (CRITICAL)
**From Spec 007, Section 5.1:**

Hook scripts MUST have executable permissions (chmod 0o755).

**Implementation Location**: `src/lib/file-ops.ts`, `copyHookScript()`

### 6. Empty Arrays and Defaults Are Omitted (CRITICAL)
**From Spec 006, Section 3:**

Official plugin.json should omit:
- Empty arrays (commands: [], agents: [])
- Default values (version: "0.0.0")
- Empty objects (author: { name: "", email: "", url: "" })

**Implementation Location**: `src/lib/reverse-transformer.ts`, `omitDefaults()`

### 7. Namespace Prefix Format (CRITICAL)
**From Spec 007:**

Format: `{plugin-name}--{original-filename}`

Examples:
- `plugin-a--build.md`
- `plugin-b--reviewer.md`
- `plugin-a--chrome-devtools/` (for skill directories)
- `plugin-a--tavily` (for MCP names)

**Implementation Location**: `src/lib/conflict-resolver.ts`, all `resolve*Conflicts()` functions

---

## Next Immediate Actions

### Week 1 Priority Tasks

1. **Create Project Structure** (1-2 hours)
   - Create all directories
   - Create empty module files
   - Set up tsconfig.json

2. **Update package.json and Install Dependencies** (1 hour)
   - Add all required dependencies
   - Add build and test scripts
   - Run `npm install`

3. **Create JSON Schemas** (4-6 hours)
   - Create plugin.schema.json from Spec 002
   - Create normalized-plugin.schema.json from Spec 001
   - Generate TypeScript types
   - Verify types compile

4. **Implement Normalizer Module** (8-10 hours)
   - Start with simple cases (commands, agents)
   - Add auto-discovery with glob patterns
   - Add hook and MCP parsing
   - Write unit tests as you go

5. **Implement Reverse Transformer** (6-8 hours)
   - Start with simple transformations
   - Add hook grouping logic
   - Add MCP object conversion
   - Add default omission logic
   - Write unit tests

---

## Success Criteria

### Definition of Done

A feature is considered complete when:

1. ✅ **Implementation matches specification exactly**
2. ✅ **Unit tests pass with >80% coverage**
3. ✅ **Integration tests pass (BDD scenarios from Spec 008)**
4. ✅ **TypeScript compiles with no errors**
5. ✅ **Code is documented with JSDoc comments**
6. ✅ **Manual testing with real plugins succeeds**

### Project Completion Checklist

- [ ] All CLI commands work (`app`, `app select <dir>`)
- [ ] Main Menu displays and navigates correctly
- [ ] Configuration Form validates all fields
- [ ] Component Selection TUI displays three panels
- [ ] Real-time preview updates correctly
- [ ] Save operation generates all output files
- [ ] Conflict resolution works for all conflict types
- [ ] Hook scripts have executable permissions
- [ ] Generated plugin.json is valid Claude Code format
- [ ] Integration tests pass (all BDD scenarios from Spec 008)
- [ ] Can install and use generated plugin in Claude Code
- [ ] README with usage instructions
- [ ] Performance is acceptable for 100+ plugins

---

## Risk Assessment

### High Risk Items

1. **TUI Library Choice** (blessed vs ink)
   - **Risk**: blessed is older but more stable; ink is React-based but may have performance issues
   - **Mitigation**: Prototype both early in Phase 3, choose based on ease of implementation

2. **Real-time Preview Performance**
   - **Risk**: JSON preview may lag with large selections
   - **Mitigation**: Debounce updates, optimize JSON stringification

3. **File Permission Handling** (Hook scripts)
   - **Risk**: chmod may not work on Windows
   - **Mitigation**: Document platform limitations, provide workaround

4. **Complex Hook Grouping Logic**
   - **Risk**: Grouping by event + matcher is complex
   - **Mitigation**: Extensive unit tests, reference implementation from Spec 006

### Medium Risk Items

1. **Glob Pattern Edge Cases**
   - **Risk**: Different glob implementations may behave differently
   - **Mitigation**: Use well-tested `glob` npm package, test edge cases

2. **Path Normalization Cross-Platform**
   - **Risk**: Windows vs Unix path separators
   - **Mitigation**: Use Node.js `path` module exclusively

3. **JSON Schema Validation Performance**
   - **Risk**: Validating large plugins may be slow
   - **Mitigation**: Cache validation results, validate only on change

---

## Appendix: Specification Coverage Matrix

| Spec Document | Primary Implementation Module | Secondary Modules | Test Coverage |
|--------------|------------------------------|-------------------|---------------|
| 001-normalization-protocol.md | `src/lib/normalizer.ts` | `src/lib/reverse-transformer.ts` | Unit tests for all examples |
| 002-plugin-format-spec.md | `src/lib/validator.ts` (schema) | N/A | Schema validation tests |
| 003-tui-visual-spec.md | `src/tui/screens/component-selection.ts` | `src/tui/state.ts` | Manual visual testing |
| 004-user-workflows.md | `src/cli/index.ts`, all TUI screens | `src/lib/save-controller.ts` | Integration tests (BDD) |
| 005-transformation-rules.md | `src/lib/normalizer.ts` | N/A | Unit tests for all rules |
| 006-reverse-transformation-rules.md | `src/lib/reverse-transformer.ts` | N/A | Unit tests for all rules |
| 007-save-operation-rules.md | `src/lib/save-controller.ts` | `src/lib/conflict-resolver.ts`, `src/lib/file-ops.ts` | Integration tests |
| 008-integration-test-spec.md | `test/integration/` | All modules | Integration tests (BDD) |
| 009-tui-setup-screens.md | `src/tui/screens/main-menu.ts`, `src/tui/screens/config-form.ts` | `src/lib/validator.ts` | Integration tests (BDD) |
| Decision 001 | `package.json` scripts | `schemas/*.schema.json` | Type generation tests |

---

**End of Implementation Review**

*This document should be updated as implementation progresses. Mark items as complete, track blockers, and adjust timelines as needed.*
