# Implementation Gaps

**Generated**: 2025-11-16
**Total Gaps**: 89 (78%)
**Completed**: 25 (22%)

---

## Priority Order

Implementation should follow this dependency order:
1. **Core Normalization** (001) - Foundation for all transformations
2. **Transformation Logic** (005, 006) - Core transformation rules
3. **Business Logic** (007) - Save operations and conflict resolution
4. **UI Layer** (004) - TUI and user workflows
5. **Integration Tests** (008) - End-to-end validation

---

## Gaps by Priority

### Priority 1: Core Normalization (001-normalization-protocol.md) - 25 requirements ✅ COMPLETE

Foundation for all transformations. **ALL REQUIREMENTS IMPLEMENTED AND TESTED**.

#### Invariants (20) ✅

- [x] 001::Invariant::1 - Path Behavior Rules - CRITICAL (line 34) ✅
- [x] 001::Invariant::2 - Commands directory loading rule (line 38) ✅
- [x] 001::Invariant::3 - All paths MUST be relative and start with ./ (line 39) ✅
- [x] 001::Invariant::4 - Custom commands follow same naming rules (line 40) ✅
- [x] 001::Invariant::5 - Multiple paths can be specified as arrays (line 41) ✅
- [x] 001::Invariant::6 - Auto-discovery ALWAYS occurs if default directories exist (line 42) ✅
- [x] 001::Invariant::7 - Custom paths are ADDED to auto-discovered paths (line 43) ✅
- [x] 001::Invariant::8 - Auto-discovery ALWAYS occurs for default directories (line 201) ✅
- [x] 001::Invariant::9 - Golden Rule - Custom paths COMPLEMENT auto-discovery (line 206) ✅
- [x] 001::Invariant::10 - All normalized plugins MUST have all fields defined (line 393) ✅
- [x] 001::Invariant::11 - All array fields MUST be arrays (line 394) ✅
- [x] 001::Invariant::12 - All component paths MUST be relative (line 395) ✅
- [x] 001::Invariant::13 - All component paths MUST start with ./ (line 396) ✅
- [x] 001::Invariant::14 - Source field MUST be absolute path (line 397) ✅
- [x] 001::Invariant::15 - Hooks and MCPs MUST be normalized to flat array (line 398) ✅
- [x] 001::Invariant::16 - Skills can be defined or auto-discovered (line 399) ✅
- [x] 001::Invariant::17 - CRITICAL - Custom paths COMPLEMENT auto-discovery (line 400) ✅
- [x] 001::Invariant::18 - Auto-discovery ALWAYS occurs if default directories exist (line 401) ✅
- [x] 001::Invariant::19 - Hooks can be string or object (line 402) ✅
- [x] 001::Invariant::20 - MCPs can be string or object (line 403) ✅

#### Examples (5) ✅

- [x] 001::Example::1 - Complete Example - Official to Normalized transformation (line 131) ✅
- [x] 001::Example::2 - Commands Supplementation - Custom paths complement auto-discovery (line 230) ✅
- [x] 001::Example::3 - Inline Hooks Configuration transformation (line 259) ✅
- [x] 001::Example::4 - Inline MCP Configuration transformation (line 306) ✅
- [x] 001::Example::5 - Multiple Custom Paths with Auto-Discovery (line 350) ✅

---

### Priority 2: Transformation Rules (005-transformation-rules.md) - 16 requirements

Core transformation logic from official format to normalized format.

#### Invariants (7)

- [ ] 005::Invariant::1 - No undefined values guarantee (line 292)
- [ ] 005::Invariant::2 - Arrays never undefined (line 293)
- [ ] 005::Invariant::3 - Flat structure for hooks/mcps (line 294)
- [ ] 005::Invariant::4 - Event extraction from original keys (line 295)
- [ ] 005::Invariant::5 - Name extraction for MCPs (line 296)
- [ ] 005::Invariant::6 - Field preservation guarantee (line 297)
- [ ] 005::Invariant::7 - Path normalization rule (line 298)

#### Examples (6)

- [ ] 005::Example::1 - Commands/Agents - String path transformation (line 28)
- [ ] 005::Example::2 - Commands/Agents - Array (no transformation) (line 41)
- [ ] 005::Example::3 - Skills Discovery - Undefined to discovered array (line 55)
- [ ] 005::Example::4 - Hooks - Nested to Flat Array transformation (line 72)
- [ ] 005::Example::5 - MCPs - Object to Array transformation (line 153)
- [ ] 005::Example::6 - Complete Example - Official to Normalized (line 233)

#### Edge Cases (3)

- [ ] 005::EdgeCase::1 - Empty Plugin (line 304)
- [ ] 005::EdgeCase::2 - Multiple Hooks Same Event (line 329)
- [ ] 005::EdgeCase::3 - MCP Name Collisions (line 354)

---

### Priority 3: Reverse Transformation (006-reverse-transformation-rules.md) - 29 requirements

Transform normalized format back to official Claude Code plugin format.

#### Invariants (19)

- [ ] 006::Invariant::1 - Minimalism - Generate clean, minimal plugin.json files (line 14)
- [ ] 006::Invariant::2 - Validity - Output must be valid Claude Code plugin format (line 15)
- [ ] 006::Invariant::3 - Readability - Prefer human-readable structures (line 16)
- [ ] 006::Invariant::4 - Compatibility - Ensure auto-discovery still works (line 17)
- [ ] 006::Invariant::5 - Omit default values to keep plugin.json minimal (line 46)
- [ ] 006::Invariant::6 - Always output commands/agents as explicit array with ./ prefix (line 119)
- [ ] 006::Invariant::7 - NEVER include source field in official format (line 333)
- [ ] 006::Invariant::8 - Output is valid official Claude Code plugin format (line 875)
- [ ] 006::Invariant::9 - All non-default metadata is preserved (line 876)
- [ ] 006::Invariant::10 - Component arrays are explicit and unambiguous (line 877)
- [ ] 006::Invariant::11 - Hooks are grouped by event correctly (line 878)
- [ ] 006::Invariant::12 - MCPs are keyed by name correctly (line 879)
- [ ] 006::Invariant::13 - Custom fields in hooks/MCPs are preserved (line 880)
- [ ] 006::Invariant::14 - Output is minimal (defaults omitted) (line 881)
- [ ] 006::Invariant::15 - Non-Guarantee - Original path format not preserved (line 884)
- [ ] 006::Invariant::16 - Non-Guarantee - External file references become inline (line 885)
- [ ] 006::Invariant::17 - Non-Guarantee - Cannot distinguish auto-discovered vs explicit (line 886)
- [ ] 006::Invariant::18 - Preserve all fields except event when converting hooks (line 793)
- [ ] 006::Invariant::19 - Preserve all fields except name when converting MCPs (line 827)

#### Examples (7)

- [ ] 006::Example::1 - Metadata Fields - Omit defaults (line 49)
- [ ] 006::Example::2 - Metadata Fields - Include non-default (line 72)
- [ ] 006::Example::3 - Commands & Agents - Explicit arrays with ./ prefix (line 129)
- [ ] 006::Example::4 - Hooks - Array to Nested Object transformation (line 195)
- [ ] 006::Example::5 - MCPs - Array to Nested Object transformation (line 281)
- [ ] 006::Example::6 - Complete Example - Minimal Plugin (line 353)
- [ ] 006::Example::7 - Complete Example - Full-Featured Plugin (line 390)

#### Edge Cases (3)

- [ ] 006::EdgeCase::1 - Empty Plugin (line 762)
- [ ] 006::EdgeCase::2 - Hooks with Extra Fields (line 791)
- [ ] 006::EdgeCase::3 - MCPs with Extra Fields (line 826)

---

### Priority 4: Save Operations (007-save-operation-rules.md) - 9 requirements

Handle save operations with conflict resolution and file management.

#### Invariants (3)

- [ ] 007::Invariant::1 - Validate normalized format before saving (line 155)
- [ ] 007::Invariant::2 - Apply transformation before saving (line 156)
- [ ] 007::Invariant::3 - Validate official format before saving (line 157)

#### Edge Cases (6)

- [ ] 007::EdgeCase::1 - Empty Selection (line 167)
- [ ] 007::EdgeCase::2 - Output Directory Exists (line 176)
- [ ] 007::EdgeCase::3 - File Name Conflicts (Commands & Agents) (line 185)
- [ ] 007::EdgeCase::4 - MCP Name Conflicts (line 209)
- [ ] 007::EdgeCase::5 - Hook Event Merging (line 230)
- [ ] 007::EdgeCase::6 - Skill Directory Conflicts (line 257)

---

### Priority 5: User Workflows (004-user-workflows.md) - 14 requirements

TUI implementation and user interaction workflows.

#### BDD Scenarios (14)

- [ ] 004::BDD_Scenario::1 - Usuario selecciona componentes (line 25)
- [ ] 004::BDD_Scenario::2 - Inicio - Application startup and plugin scanning (line 52)
- [ ] 004::BDD_Scenario::3 - Navegar entre plugins (line 67)
- [ ] 004::BDD_Scenario::4 - Navegar entre paneles (line 74)
- [ ] 004::BDD_Scenario::5 - Seleccionar componentes (line 85)
- [ ] 004::BDD_Scenario::6 - Seleccionar de múltiples plugins (line 92)
- [ ] 004::BDD_Scenario::7 - Guardar selección (line 103)
- [ ] 004::BDD_Scenario::8 - Guardar sin selección (line 115)
- [ ] 004::BDD_Scenario::9 - Conflicto de nombres de comandos (line 125)
- [ ] 004::BDD_Scenario::10 - Conflicto de nombres de agentes (line 135)
- [ ] 004::BDD_Scenario::11 - Conflicto de nombres de MCPs (line 144)
- [ ] 004::BDD_Scenario::12 - Conflicto de directorios de skills (line 153)
- [ ] 004::BDD_Scenario::13 - Merge de hooks del mismo evento (line 162)
- [ ] 004::BDD_Scenario::14 - Salir de la aplicación (line 180)

---

### Priority 6: Integration Tests (008-integration-test-spec.md) - 21 requirements

Full end-to-end validation ensuring all specs work together.

#### BDD Scenarios (11)

- [ ] 008::BDD_Scenario::1 - Full workflow - Load, select, save, verify (line 131)
- [ ] 008::BDD_Scenario::2 - Multi-plugin selection with conflict resolution (line 185)
- [ ] 008::BDD_Scenario::3 - Save with no selection (line 290)
- [ ] 008::BDD_Scenario::4 - Output directory already exists (line 297)
- [ ] 008::BDD_Scenario::5 - Select from multiple plugins (line 305)
- [ ] 008::BDD_Scenario::6 - Plugin with missing files (line 313)
- [ ] 008::BDD_Scenario::7 - Different path formats produce same result (line 326)
- [ ] 008::BDD_Scenario::8 - Empty components are handled correctly (line 338)
- [ ] 008::BDD_Scenario::9 - Hooks transform correctly (line 345)
- [ ] 008::BDD_Scenario::10 - MCPs transform correctly (line 361)
- [ ] 008::BDD_Scenario::11 - Default values are omitted (line 378)

#### Invariants (10)

- [ ] 008::Invariant::1 - Can load test-plugin without errors (line 428)
- [ ] 008::Invariant::2 - All 15 components visible in TUI (line 429)
- [ ] 008::Invariant::3 - Selection works correctly (line 430)
- [ ] 008::Invariant::4 - Save generates both output files (line 431)
- [ ] 008::Invariant::5 - Official plugin.json is valid (line 432)
- [ ] 008::Invariant::6 - All selected files copied to output (line 433)
- [ ] 008::Invariant::7 - Output plugin can be loaded by Claude Code (line 434)
- [ ] 008::Invariant::8 - No crashes or unhandled errors (line 437)
- [ ] 008::Invariant::9 - Clear error messages for invalid states (line 438)
- [ ] 008::Invariant::10 - All edge cases handled gracefully (line 439)

---

## Implementation Strategy

### Phase 1: Core Normalization (Priority 1) ✅ COMPLETE
**Spec**: 001-normalization-protocol.md
**Requirements**: 25 (20 invariants + 5 examples) - **ALL IMPLEMENTED**
**Dependencies**: None - Foundation layer

**Completed**:
1. ✅ All 28 tests written for invariants and examples (TDD)
2. ✅ Full normalization logic implemented:
   - Path resolution and validation
   - Auto-discovery mechanism (commands, agents, skills, hooks, MCPs)
   - Custom path supplementation (CRITICAL: complement, not replace)
   - Field normalization (all fields defined, arrays never undefined)
   - Hooks normalization (nested → flat array)
   - MCPs normalization (object → array with name extraction)
3. ✅ All 5 examples validated
4. ✅ All 20 invariants pass

**Implementation Files**:
- Tests: `tests/normalize.test.ts` (28 passing tests)
- Implementation: `src/normalize.ts`

---

### Phase 2: Transformation Rules (Priority 2)
**Spec**: 005-transformation-rules.md
**Requirements**: 16 (7 invariants + 6 examples + 3 edge cases)
**Dependencies**: 001 (normalization protocol)

**Approach**:
1. Implement transformations with TDD:
   - Commands/Agents: String → Array, preserve arrays
   - Skills: Auto-discovery
   - Hooks: Nested object → Flat array
   - MCPs: Object → Array with name extraction
2. Test all 6 examples as test data
3. Handle all 3 edge cases
4. Validate all 7 invariants

**Key Focus**:
- Invariant 1-2: No undefined values, arrays never undefined
- Invariant 3-5: Hooks/MCPs flattening with event/name extraction
- Edge cases: Empty plugins, multiple hooks, MCP collisions

---

### Phase 3: Reverse Transformation (Priority 3)
**Spec**: 006-reverse-transformation-rules.md
**Requirements**: 29 (19 invariants + 7 examples + 3 edge cases)
**Dependencies**: 001, 005 (must understand both formats)

**Approach**:
1. Implement reverse transformations:
   - Normalized → Official format
   - Metadata: Omit defaults
   - Commands/Agents: Add ./ prefix
   - Hooks: Flat array → Nested by event
   - MCPs: Array → Object keyed by name
2. Test minimalism: defaults omitted
3. Preserve custom fields
4. Validate all 7 examples
5. Handle all 3 edge cases

**Key Focus**:
- Invariant 1, 5, 14: Minimalism (omit defaults)
- Invariant 8-13: Valid official format with all structures correct
- Invariant 18-19: Preserve custom fields (except event/name)
- Edge cases: Empty plugin, extra fields

---

### Phase 4: Save Operations (Priority 4)
**Spec**: 007-save-operation-rules.md
**Requirements**: 9 (3 invariants + 6 edge cases)
**Dependencies**: 001, 005, 006 (requires all transformations)

**Approach**:
1. Implement save workflow:
   - Validate normalized format (001)
   - Apply reverse transformation (006)
   - Validate official format (002)
   - Handle file operations
2. Implement conflict resolution:
   - Commands/Agents/Skills: Namespace prefix
   - MCPs: Namespace prefix on name
   - Hooks: Merge by event (preserve order)
3. Handle all 6 edge cases:
   - Empty selection
   - Directory exists
   - File/name/directory conflicts

**Key Focus**:
- Invariant 1-3: Validation pipeline
- Edge cases 3-6: All conflict scenarios
- Edge case 1: Empty selection validation
- Edge case 2: Directory management

---

### Phase 5: User Workflows (Priority 5)
**Spec**: 004-user-workflows.md
**Requirements**: 14 (14 BDD scenarios)
**Dependencies**: 001, 005, 006, 007 (requires core logic complete)

**Approach**:
1. Implement TUI components:
   - 3-panel layout (Plugins, Components, Preview)
   - Navigation (arrow keys, panel switching)
   - Selection (space to toggle)
2. Implement workflows:
   - Plugin scanning and loading
   - Component selection (multi-plugin)
   - Real-time preview updates
   - Save operation
3. Use BDD scenarios as acceptance tests
4. Implement conflict UI feedback

**Key Focus**:
- BDD 1-2: Basic startup and display
- BDD 3-6: Navigation and selection
- BDD 7-8: Save operations
- BDD 9-13: Conflict handling UI
- BDD 14: Exit behavior

---

### Phase 6: Integration Tests (Priority 6)
**Spec**: 008-integration-test-spec.md
**Requirements**: 21 (11 BDD scenarios + 10 invariants)
**Dependencies**: ALL previous phases

**Approach**:
1. Create comprehensive test fixtures
2. Implement full end-to-end tests:
   - Complete workflow (load → select → save → verify)
   - Multi-plugin with conflicts
   - All edge cases in real scenarios
3. Verify output files:
   - marketplace.json
   - plugin.json (official format)
   - normalized-plugin.json
   - File copying
4. Validate plugin can be installed in Claude Code

**Key Focus**:
- BDD 1: Full workflow verification
- BDD 2: Multi-plugin conflict resolution
- BDD 3-11: All edge cases and transformations
- Invariants 1-7: Functional correctness
- Invariants 8-10: Error handling and robustness

---

## Next Steps

### Completed

- [x] **Phase 1**: Implement Priority 1 (Core Normalization - 25 requirements) ✅
  - Created test file: `tests/normalize.test.ts` (28 tests)
  - Created implementation: `src/normalize.ts`
  - Implemented auto-discovery and path supplementation
  - All tests passing

### Immediate Actions

- [ ] **Phase 2**: Implement Priority 2 (Transformations - 16 requirements)
  - Create test file: `tests/transformation.test.ts`
  - Create implementation: `src/transformation.ts`
  - Focus on hooks/MCPs flattening

- [ ] **Phase 3**: Implement Priority 3 (Reverse Transformations - 29 requirements)
  - Create test file: `tests/reverse-transformation.test.ts`
  - Create implementation: `src/reverse-transformation.ts`
  - Focus on minimalism and official format

- [ ] **Phase 4**: Implement Priority 4 (Save Operations - 9 requirements)
  - Create test file: `tests/save-operations.test.ts`
  - Create implementation: `src/save-operations.ts`
  - Focus on conflict resolution

- [ ] **Phase 5**: Implement Priority 5 (User Workflows - 14 requirements)
  - Create test file: `tests/tui.test.ts`
  - Create implementation: `src/tui.ts`
  - Focus on 3-panel layout and interactions

- [ ] **Phase 6**: Implement Priority 6 (Integration Tests - 21 requirements)
  - Create test file: `tests/integration.test.ts`
  - Create test fixtures: `tests/fixtures/`
  - Verify complete workflow

---

## Summary

**Total Requirements**: 114 across 6 priority levels
**Current Coverage**: 25/114 (22%)
**Phase 1 Complete**: ✅ ALL Priority 1 requirements implemented and tested

**Progress**:
- ✅ Core Normalization (25/25) - **COMPLETE**
- ⏳ Transformations (0/16) - Next priority
- ⏳ Reverse Transformations (0/29) - Pending
- ⏳ Save Operations (0/9) - Pending
- ⏳ User Workflows (0/14) - Pending
- ⏳ Integration Tests (0/21) - Pending

**Critical Path**:
1. ✅ Core Normalization (25) → Foundation **COMPLETE**
2. Transformations (16) → Core logic **NEXT**
3. Reverse Transformations (29) → Output generation
4. Save Operations (9) → Business logic
5. User Workflows (14) → UI layer
6. Integration Tests (21) → Validation

**Estimated Implementation Order**:
- Phase 1: ✅ Core functionality foundation (25 requirements) **COMPLETE**
- Phases 2-3: Core transformation logic (45 requirements)
- Phase 4: Business logic (9 requirements)
- Phase 5: UI layer (14 requirements)
- Phase 6: Validation (21 requirements)

**Phase 1 Achievements**:
- ✅ All 20 invariants implemented and tested
- ✅ All 5 examples validated
- ✅ 28 passing tests in tests/normalize.test.ts
- ✅ Full implementation in src/normalize.ts
- ✅ CRITICAL requirements completed:
  - 001::Invariant::1, 9, 17: Custom paths COMPLEMENT auto-discovery
  - 001::Invariant::10-15: Complete normalized structure
  - Auto-discovery for all component types (commands, agents, skills, hooks, MCPs)
  - Hooks normalization (nested → flat array)
  - MCPs normalization (object → array with name extraction)
