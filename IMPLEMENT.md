# EXECUTE: Spec-Driven Implementation Protocol

**INSTRUCTION**: Execute all phases below in order until 100% spec coverage is achieved.

---

## 🎯 Success Criteria

When you finish executing this protocol, you MUST have:

✅ All requirements from `docs/spec/*.md` extracted and documented
✅ All decisions from `docs/decisions/*.md` extracted and applied
✅ Coverage matrix showing requirement → test → implementation mapping
✅ All tests passing (unit + integration)
✅ Every requirement status = ✅ (100% coverage)
✅ Zero gaps remaining
✅ **EVERY spec file has corresponding implementation** (verified in Phase 6.3)
✅ **EVERY decision file has corresponding implementation** (verified in Phase 6.3)
✅ **TUI executable runs and displays correctly** (mandatory check for 003)

**If any criterion is not met, continue implementing until all are ✅**

**CRITICAL**: 100% coverage means:
- ALL spec files → implemented (verified in Phase 6.3)
- ALL decision files → implemented (verified in Phase 6.3)
- TUI runs without errors (verified in Check 4)

---

## 📋 Invariant Principles

1. **Specs are source of truth** - Code must match specs exactly
2. **Everything is testable** - Every requirement must have: test + implementation
3. **Dependency-aware** - Implementation follows dependency order (auto-discovered)
4. **Zero hardcoding** - Protocol discovers requirements dynamically from spec files
5. **Verifiable completeness** - Coverage matrix proves 100% implementation

---

## ⚡ EXECUTE ALL PHASES BELOW

---

## Phase 1: Discovery

**ACTION**: Execute discovery to find all specs and their dependencies.

### 1.1 EXECUTE: Scan for spec files

Scan the repository for all specification files:

```bash
find docs/spec -name "*.md" | sort
find docs/decisions -name "*.md" | sort
```

Store the list of files found.

---

### 1.2 EXECUTE: Build dependency graph

For each spec file you found:
1. Read the file content
2. Find all references to other spec files using these patterns:
   - `[text](./NNN-*.md)`
   - `See NNN-*-*.md`
   - `(according to NNN-*.md)`
3. Record dependency: `current-spec → [referenced-specs]`

Build a directed acyclic graph (DAG) of dependencies.

---

### 1.3 EXECUTE: Calculate execution order

Perform topological sort on the dependency graph to get the order in which specs must be implemented.

**Generate artifact**: `EXECUTION_ORDER.txt` with the sorted list of specs.

Example:
```
002-plugin-format-spec.md
001-normalization-protocol.md
005-transformation-rules.md
006-reverse-transformation-rules.md
007-save-operation-rules.md
003-tui-visual-spec.md
004-user-workflows.md
008-integration-test-spec.md
```

---

## Phase 2: Requirement Extraction

**ACTION**: Extract all requirements from every spec file.

For EACH spec file in `EXECUTION_ORDER` (calculated in Phase 1), execute ALL extraction steps below:

**CRITICAL**: Every spec file MUST generate at least one requirement. If pattern-based extraction yields zero requirements, manually create requirements from section headers.

### 2.1 Extract BDD Scenarios

**Pattern**: Find all Gherkin scenario blocks

```regex
Scenario: (.+?)\n((?:  (?:Given|When|Then|And).+?\n)+)
```

**Example match**:
```gherkin
Scenario: Conflicto de nombres de comandos
  Given plugin-a tiene "commands/build.md"
  When selecciono ambos comandos
  Then ambos archivos se copian con namespace prefix
```

**Generate requirement**:
```json
{
  "id": "004::Scenario::Conflicto de nombres de comandos",
  "type": "BDD_Scenario",
  "source": "docs/spec/004-user-workflows.md:125",
  "description": "Conflicto de nombres de comandos",
  "content": "<full scenario text>"
}
```

---

### 2.2 Extract Edge Cases

**Pattern**: Find all subsection headers with numbering

```regex
### (\d+\.\d+) (.+?)$
```

**Example match**:
```markdown
### 7.3 File Name Conflicts (Commands & Agents)
```

**Generate requirement**:
```json
{
  "id": "007::EdgeCase::7.3",
  "type": "EdgeCase",
  "source": "docs/spec/007-save-operation-rules.md:185",
  "description": "File Name Conflicts (Commands & Agents)",
  "content": "<full edge case section>"
}
```

---

### 2.3 Extract Invariants and Rules

**Patterns**: Find all critical rules

```regex
- .+? MUST .+?$
- .+? SHOULD .+?$
- .+? CRITICAL .+?$
- ❌ .+?$
- ✅ .+?$
```

**Example match**:
```markdown
- All normalized plugins MUST have all fields defined (no undefined values)
```

**Generate requirement**:
```json
{
  "id": "001::Invariant::8.1",
  "type": "Invariant",
  "source": "docs/spec/001-normalization-protocol.md:392",
  "description": "All normalized plugins MUST have all fields defined",
  "content": "All normalized plugins MUST have all fields defined (no undefined values)"
}
```

---

### 2.4 Extract Examples

**Pattern**: Find all example blocks with input/output

```regex
# Input.*?\n```.*?\n(.+?)\n```.*?\n# Output.*?\n```.*?\n(.+?)\n```
```

**Example match**:
```markdown
// Normalized input
{
  "commands": ["commands/cmd1.md"]
}

// Official output
{
  "commands": ["./commands/cmd1.md"]
}
```

**Generate test case**:
```json
{
  "id": "006::Example::L354",
  "type": "Example",
  "source": "docs/spec/006-reverse-transformation-rules.md:354",
  "input": { "commands": ["commands/cmd1.md"] },
  "expectedOutput": { "commands": ["./commands/cmd1.md"] }
}
```

---

### 2.5 EXECUTE: Handle descriptive/visual specs

**CRITICAL CHECK**: For each spec file processed, if extraction steps 2.1-2.4 yielded ZERO requirements:

**Action**: Manually extract requirements from section headers.

**Pattern**: Find all `##` level headers and create one requirement per major section.

**Example for 003-tui-visual-spec.md**:
```json
[
  {
    "id": "003::Feature::3PanelLayout",
    "type": "Visual_Feature",
    "source": "docs/spec/003-tui-visual-spec.md:22",
    "description": "Three panel design (PLUGINS | COMPONENTS | PREVIEW)",
    "content": "Implement 3-panel TUI layout with borders"
  },
  {
    "id": "003::Feature::KeyboardNav",
    "type": "Visual_Feature",
    "source": "docs/spec/003-tui-visual-spec.md:53",
    "description": "Keyboard navigation (←→↑↓ SPACE S Q)",
    "content": "Implement keyboard controls for navigation and actions"
  },
  {
    "id": "003::Feature::RealtimePreview",
    "type": "Visual_Feature",
    "source": "docs/spec/003-tui-visual-spec.md:28",
    "description": "Real-time JSON preview panel",
    "content": "Sync preview panel with selection state"
  }
]
```

**Validation**: After this step, verify that EVERY spec file in EXECUTION_ORDER has at least 1 requirement.

```bash
# Check each spec has requirements
for spec in $(cat EXECUTION_ORDER.txt); do
  count=$(grep -c "\"source\": \"docs/spec/$spec" REQUIREMENTS.json)
  if [ $count -eq 0 ]; then
    echo "❌ ERROR: Spec $spec has ZERO requirements"
    exit 1
  fi
done

# Check each decision file has requirements
for decision in $(find docs/decisions -name "*.md" ! -name "README.md" -exec basename {} \;); do
  count=$(grep -c "\"source\": \"docs/decisions/$decision" REQUIREMENTS.json)
  if [ $count -eq 0 ]; then
    echo "❌ ERROR: Decision $decision has ZERO requirements"
    exit 1
  fi
done
```

---

### 2.6 Extract decision requirements

**ACTION**: Extract all requirements from `docs/decisions/*.md` files.

**CRITICAL**: Decisions define HOW to implement features (e.g., "use json-schema-to-typescript"). They MUST be extracted and applied BEFORE implementation.

For EACH decision file discovered in Phase 1:

**Pattern**: Find decision headers and rationale sections

```regex
## Decision.*?\n(.+?)(?=\n##|\Z)
```

**Example match from `001-json-schema-to-typescript.md`**:
```markdown
## Decision
Use `json-schema-to-typescript` to generate TypeScript types from JSON schemas.

## Rationale
- Ensures type safety between schemas and code
- Auto-generates interfaces
```

**Generate requirement**:
```json
{
  "id": "DEC001::Use::json-schema-to-typescript",
  "type": "Decision",
  "source": "docs/decisions/001-json-schema-to-typescript.md:5",
  "description": "Use json-schema-to-typescript for type generation",
  "content": "<full decision section>",
  "priority": "critical"
}
```

**Note**: Decisions with `priority: "critical"` MUST be implemented before any code that depends on them.

---

### 2.7 Consolidate requirements

**Output**: `REQUIREMENTS.json`

```json
[
  {
    "id": "001::Invariant::8.1",
    "type": "Invariant",
    "source": "docs/spec/001-normalization-protocol.md:392",
    "description": "...",
    "content": "..."
  },
  {
    "id": "004::Scenario::Conflicto de nombres de comandos",
    "type": "BDD_Scenario",
    "source": "docs/spec/004-user-workflows.md:125",
    "description": "...",
    "content": "..."
  },
  {
    "id": "DEC001::Use::json-schema-to-typescript",
    "type": "Decision",
    "source": "docs/decisions/001-json-schema-to-typescript.md:5",
    "description": "...",
    "content": "...",
    "priority": "critical"
  }
  // ... all requirements (specs + decisions)
]
```

---

## Phase 3: Coverage Matrix Generation

**ACTION**: Generate coverage matrix showing which requirements have tests and implementation.

For EACH requirement extracted in Phase 2, execute the following steps:

### 3.1 Search for test file

**Strategy**: Search test files for requirement ID or description keywords

```bash
# Search for requirement description in test files
grep -r "<description>" tests/ spec/ __tests__/
```

**If found**: Extract test file path and line number

---

### 3.2 Assess test coverage

**Heuristics**:
- ✅ **Full coverage**: Test explicitly validates requirement (found exact match)
- ⚠️ **Partial coverage**: Test mentions requirement but incomplete
- ❌ **No coverage**: No test found

---

### 3.3 Search for implementation

**Strategy**: Search codebase for functions/modules related to requirement

```bash
# Search for keywords from requirement
grep -r "<keywords>" src/ lib/
```

**If found**: Extract implementation file path

---

### 3.4 Build coverage matrix

**Generate markdown table**:

```markdown
| Requirement ID | Spec Source | Description | Test File | Test Coverage | Impl File | Status |
|----------------|-------------|-------------|-----------|---------------|-----------|--------|
| 001::Invariant::8.1 | 001:392 | All fields defined | normalize.test.ts:45 | ✅ | normalize.ts:120 | ✅ |
| 004::Scenario::Conflicto comandos | 004:125 | Namespace prefix commands | - | ❌ | - | ❌ |
| 007::EdgeCase::7.3 | 007:185 | File name conflicts | conflict.test.ts:12 | ⚠️ | conflict.ts:89 | ⚠️ |
```

**Output**: `COVERAGE_MATRIX.md`

---

## Phase 4: Gap Analysis

**ACTION**: Find all incomplete requirements and sort them by implementation priority.

### 4.1 EXECUTE: Filter incomplete requirements

Extract all requirements from `COVERAGE_MATRIX.md` with status ❌ or ⚠️:

```bash
grep -E "❌|⚠️" COVERAGE_MATRIX.md > GAPS.md
```

---

### 4.2 EXECUTE: Sort by dependency order

Re-order the gaps list using `EXECUTION_ORDER` from Phase 1:
1. Core specs first (001, 002, 005, 006)
2. Business logic second (007)
3. UI specs third (003, 004)
4. Integration tests last (008)

**Generate artifact**: `GAPS.md` - Sorted list of work to be done.

**If GAPS.md is empty → Skip to Phase 6 (Validation)**
**If GAPS.md has entries → Continue to Phase 5 (Implementation)**

---

## Phase 5: Implementation Loop

**ACTION**: Implement ALL gaps following TDD (Test-Driven Development).

For EACH gap in `GAPS.md` (from first to last in dependency order):

### Step 1: WRITE FAILING TEST
- Create test file (if doesn't exist): `tests/<module>.test.ts` or `src/<module>.test.ts`
- Write test that validates the exact requirement from spec
- Use input/output examples from spec as test data
- Run test → should FAIL (red)

### Step 2: IMPLEMENT FEATURE
- Create/modify implementation file: `src/<module>.ts`
- Write minimum code to make test pass
- Code must match spec exactly
- Handle ALL edge cases mentioned in requirement

### Step 3: VERIFY TEST PASSES
- Run: `npm test`
- If fails → fix code until green
- Do NOT continue until test is green

### Step 4: RUN INTEGRATION TESTS
- Run: `npm test -- --integration` (or equivalent)
- If fails → FIX before moving to next gap
- NO partial implementations allowed

### Step 5: UPDATE COVERAGE MATRIX
- Mark requirement status as ✅ in `COVERAGE_MATRIX.md`
- Save the file

### Step 6: NEXT GAP
- Move to next gap in `GAPS.md`
- Repeat steps 1-5

**When all gaps are implemented → Proceed to Phase 6**

---

## Phase 6: Validation

**ACTION**: Verify 100% completeness.

### 6.1 EXECUTE: Run automated checks

Check that all tests pass:
```bash
npm test
```
**Must output**: All tests passing (green)

Check that coverage matrix is 100% complete:
```bash
grep -c "❌\|⚠️" COVERAGE_MATRIX.md
```
**Must output**: 0 (zero incomplete requirements)

### 6.2 EXECUTE: Verify artifacts exist

Check that all required files were generated:
```bash
ls -1 EXECUTION_ORDER.txt REQUIREMENTS.json COVERAGE_MATRIX.md GAPS.md
```
**Must output**: All 4 files exist

---

### 6.3 EXECUTE: Verify 100% coverage for ALL discovered files

**CRITICAL**: Every file discovered in Phase 1 MUST have 100% implementation coverage.

**Verification algorithm** (content-agnostic):

```bash
echo "=== Verifying ALL docs/ files are implemented ==="

# Step 1: Get all files discovered in Phase 1
all_spec_files=$(cat EXECUTION_ORDER.txt)
all_decision_files=$(find docs/decisions -name "*.md" ! -name "README.md" -exec basename {} \;)

# Step 2: Verify each spec file
for spec in $all_spec_files; do
  echo "Checking: docs/spec/$spec"

  # Check: Has requirements extracted?
  req_count=$(grep -c "\"source\": \"docs/spec/$spec" REQUIREMENTS.json 2>/dev/null || echo "0")
  if [ "$req_count" -eq 0 ]; then
    echo "❌ FAIL: $spec - NO requirements extracted (Phase 2 incomplete)"
    exit 1
  fi

  # Check: All requirements are ✅ in coverage matrix?
  incomplete=$(grep "docs/spec/$spec" COVERAGE_MATRIX.md 2>/dev/null | grep -c -E "❌|⚠️" || echo "0")
  if [ "$incomplete" -gt 0 ]; then
    echo "❌ FAIL: $spec - Has $incomplete incomplete requirements"
    grep "docs/spec/$spec" COVERAGE_MATRIX.md | grep -E "❌|⚠️"
    exit 1
  fi

  echo "✅ $spec - Complete"
done

# Step 3: Verify each decision file
for decision in $all_decision_files; do
  echo "Checking: docs/decisions/$decision"

  # Check: Has requirements extracted?
  req_count=$(grep -c "\"source\": \"docs/decisions/$decision" REQUIREMENTS.json 2>/dev/null || echo "0")
  if [ "$req_count" -eq 0 ]; then
    echo "❌ FAIL: $decision - NO requirements extracted (Phase 2.6 incomplete)"
    exit 1
  fi

  # Check: All requirements are ✅ in coverage matrix?
  incomplete=$(grep "docs/decisions/$decision" COVERAGE_MATRIX.md 2>/dev/null | grep -c -E "❌|⚠️" || echo "0")
  if [ "$incomplete" -gt 0 ]; then
    echo "❌ FAIL: $decision - Has $incomplete incomplete requirements"
    grep "docs/decisions/$decision" COVERAGE_MATRIX.md | grep -E "❌|⚠️"
    exit 1
  fi

  echo "✅ $decision - Complete"
done

echo "✅ All discovered files verified"
```

**This check is completely agnostic** - it doesn't care what's IN the files, only that:
1. All files from Phase 1 are in REQUIREMENTS.json (extracted in Phase 2)
2. All requirements from Phase 2 are ✅ in COVERAGE_MATRIX.md (implemented in Phase 5)

**If ANY file verification fails → INCOMPLETE, return to Phase 5**

---

## 🔁 EXECUTION LOOP - DO NOT STOP UNTIL COMPLETE

After executing Phases 1-6, check the success criteria:

### Check 1: Are all requirements extracted?
```bash
test -f REQUIREMENTS.json && echo "✅" || echo "❌ Run Phase 2 again"
```

### Check 2: Is coverage matrix complete?
```bash
! grep -q "❌\|⚠️" COVERAGE_MATRIX.md && echo "✅" || echo "❌ Continue Phase 5"
```

### Check 3: Do all tests pass?
```bash
npm test && echo "✅" || echo "❌ Fix failing tests"
```

### Check 4: Does TUI executable exist and run?
```bash
npm run build 2>/dev/null && \
  [ -f dist/index.js ] && \
  echo "✅ TUI executable exists" || \
  echo "❌ TUI not implemented (003-tui-visual-spec.md incomplete)"
```

### Check 5: Are ALL specs and decisions implemented?
```bash
# Verify each spec and decision has implementation (from Phase 6.3)
# This check runs the content-agnostic verification algorithm
# See Phase 6.3 for details
echo "⚠️  Run Phase 6.3 verification script"
```

### IF ANY CHECK FAILS:
**LOOP BACK** to the failing phase and continue implementation.

### IF ALL CHECKS PASS:
**STOP** - Implementation is complete.

**FINAL VALIDATION**: Before declaring complete, manually verify:
1. TUI runs: `node dist/index.js ./test-fixtures`
2. TUI displays 3 panels
3. Keyboard navigation works (←→↑↓ SPACE S Q)
4. Save operation creates files

---

## 📊 Final Output Artifacts

When execution loop completes, you will have generated:

1. **`EXECUTION_ORDER.txt`** - Dependency-sorted list of specs (from Phase 1)
2. **`REQUIREMENTS.json`** - All extracted requirements with metadata (from Phase 2)
3. **`COVERAGE_MATRIX.md`** - Requirement → Test → Implementation mapping (from Phase 3)
4. **`GAPS.md`** - Remaining work - MUST be empty (from Phase 4)
5. **Test suite** - All tests green (from Phase 5)
6. **Implementation** - Complete codebase matching specs (from Phase 5)

---

## 🎯 How This Protocol Works

1. **Self-discovering**: Scans `docs/spec/*.md` dynamically, no hardcoded file lists
2. **Immutable**: This protocol never changes, even when specs are added/modified
3. **Verifiable**: Coverage matrix proves 100% completeness
4. **Continuous**: Execution loop ensures nothing is missed
5. **Test-driven**: Every requirement gets a test before implementation

**To use**: Execute all phases in order. Loop back if checks fail. Stop when all checks pass.

---

## 🚀 START EXECUTION NOW

**IMMEDIATE ACTION REQUIRED**:

You are now reading this protocol to execute it, NOT to review it.

**BEGIN Phase 1.1 immediately:**
1. Scan for spec files with: `find docs/spec -name "*.md" | sort`
2. Scan for decision files with: `find docs/decisions -name "*.md" | sort`
3. Store the results and proceed to Phase 1.2

**DO NOT STOP** until all phases are complete and all success criteria are met.
