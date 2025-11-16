# Spec-Driven Implementation Protocol

**Version**: 1.0.0
**Purpose**: Generic, autodiscoverable protocol for implementing specs without hardcoding

---

## 🎯 Invariant Principles

1. **Specs are source of truth** - Code must match specs exactly
2. **Everything is testable** - Every requirement must have: test + implementation
3. **Dependency-aware** - Implementation follows dependency order (auto-discovered)
4. **Zero hardcoding** - Protocol discovers requirements dynamically from spec files
5. **Verifiable completeness** - Coverage matrix proves 100% implementation

---

## Phase 1: Discovery (Auto-scan specs)

### 1.1 Discover all spec files

```bash
SPEC_FILES=$(find docs/spec -name "*.md" | sort)
DECISION_FILES=$(find docs/decisions -name "*.md" | sort)
```

**Output**: List of all specification documents

---

### 1.2 Extract dependency graph

For each spec file, detect references to other specs:

**Patterns to detect**:
- Markdown links: `[description](./other-spec.md)`
- Direct references: `See 005-transformation-rules.md`
- Inline citations: `(according to 001-normalization-protocol.md)`

**Build dependency DAG**:
```typescript
{
  "007-save-operation-rules.md": ["001-normalization-protocol.md", "006-reverse-transformation-rules.md"],
  "006-reverse-transformation-rules.md": ["002-plugin-format-spec.md"],
  // ...
}
```

**Topological sort** → `EXECUTION_ORDER[]`

**Output**: Dependency-ordered list of specs to process

---

## Phase 2: Requirement Extraction (Generic patterns)

For EACH spec file in `EXECUTION_ORDER`:

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

### 2.5 Consolidate requirements

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
  }
  // ... all requirements
]
```

---

## Phase 3: Coverage Matrix Generation

For EACH requirement in `REQUIREMENTS[]`:

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

### 4.1 Filter incomplete requirements

```bash
# Extract all rows with ❌ or ⚠️ status
GAPS=$(grep -E "❌|⚠️" COVERAGE_MATRIX.md)
```

---

### 4.2 Sort by dependency order

Re-order gaps using `EXECUTION_ORDER` from Phase 1:
- Implement core transformations first (001, 005, 006)
- Then business logic (007)
- Finally UI and workflows (003, 004)
- Last: integration tests (008)

**Output**: `GAPS.md` (sorted list of incomplete requirements)

---

## Phase 5: Implementation Loop

```
FOR EACH gap IN GAPS (in dependency order):

  1. Write failing test for gap
     - Test file: tests/<module>.test.ts
     - Test describes exact requirement from spec
     - Use examples from spec as test data

  2. Implement feature to pass test
     - Implementation file: src/<module>.ts
     - Code matches spec exactly
     - Handle all edge cases mentioned in requirement

  3. Run test suite
     npm test
     - If fails: fix until green

  4. Run integration tests
     npm test -- --integration
     - If fails: FIX before moving to next gap
     - NO partial implementations allowed

  5. Update coverage matrix
     - Mark requirement as ✅
     - Update COVERAGE_MATRIX.md

ENDFOR
```

---

## Phase 6: Validation

### 6.1 Automated checks

```bash
# All tests pass
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failing"
  exit 1
fi

# Coverage matrix 100% complete
INCOMPLETE=$(grep -c "❌\|⚠️" COVERAGE_MATRIX.md)
if [ $INCOMPLETE -ne 0 ]; then
  echo "❌ Found $INCOMPLETE incomplete requirements"
  exit 1
fi

echo "✅ All requirements implemented and tested"
```

---

### 6.2 Manual verification (if applicable)

Some requirements may need manual checks:
- Visual specs (003) → UI matches mockups
- Installation workflow (008) → Can install generated plugin
- TUI behavior (003, 004) → Keyboard navigation works

**Checklist for manual verification**:
```markdown
[ ] TUI displays 3 panels correctly (003)
[ ] Keyboard navigation works (003)
[ ] Generated plugin installs via `/plugin install` (008)
[ ] Visual output matches spec examples (007)
```

---

## Success Criteria (Generic)

✅ All spec files scanned and requirements extracted
✅ Dependency graph computed (no cycles)
✅ Coverage matrix generated and complete
✅ All requirements have status = ✅
✅ All tests pass (unit + integration)
✅ Zero gaps in GAPS.md

---

## Output Artifacts

1. **`EXECUTION_ORDER.txt`** - Dependency-sorted list of specs
2. **`REQUIREMENTS.json`** - All extracted requirements with metadata
3. **`COVERAGE_MATRIX.md`** - Requirement → Test → Implementation mapping
4. **`GAPS.md`** - Remaining work (should be empty when done)
5. **Test suite** - All tests green
6. **Implementation** - Complete codebase matching specs

---

## Notes

- **This protocol never changes** - It discovers specs dynamically
- **Add new specs** - Just create `NNN-new-spec.md`, protocol auto-discovers
- **Add new edge cases** - Protocol extracts them via pattern matching
- **Change requirements** - Update spec, run protocol again to find gaps
- **Verify completeness** - Check COVERAGE_MATRIX.md for 100% ✅

---

## Example Usage

```bash
# Phase 1-2: Extract all requirements
./scripts/extract-requirements.sh
# → Generates REQUIREMENTS.json

# Phase 3: Generate coverage matrix
./scripts/generate-coverage-matrix.sh
# → Generates COVERAGE_MATRIX.md

# Phase 4: Find gaps
./scripts/find-gaps.sh
# → Generates GAPS.md

# Phase 5: Implement (manual loop)
# For each gap in GAPS.md:
#   1. Write test
#   2. Implement
#   3. Verify
#   4. Update matrix

# Phase 6: Validate
./scripts/validate.sh
# → Checks all tests pass + matrix complete
```
