# CCPlugin Curator

Spec-driven implementation of Claude Code Plugin Curator using automated requirement extraction and coverage tracking.

## Overview

This project implements a **Spec-Driven Implementation Protocol** that:

1. Auto-discovers all specification documents
2. Extracts requirements dynamically (BDD scenarios, edge cases, invariants, examples)
3. Tracks test coverage and implementation status
4. Generates implementation gaps sorted by dependency order
5. Validates completeness with automated checks

## Quick Start

```bash
# Run the full protocol (extract requirements, generate coverage, find gaps)
npm run protocol

# Or run phases individually:
npm run extract-requirements  # Phase 1-2: Discovery & Requirement Extraction
npm run generate-coverage     # Phase 3: Coverage Matrix Generation
npm run find-gaps             # Phase 4: Gap Analysis

# Validate implementation completeness
npm run validate              # Phase 6: Validation
```

## Project Structure

```
ccplugin-curator/
├── docs/
│   ├── spec/              # Specification documents (source of truth)
│   │   ├── 001-normalization-protocol.md
│   │   ├── 002-plugin-format-spec.md
│   │   └── ...
│   └── decisions/         # Architecture decision records
├── scripts/               # Protocol automation scripts
│   ├── extract-requirements.js
│   ├── generate-coverage-matrix.js
│   ├── find-gaps.js
│   └── validate.js
├── output/                # Generated artifacts
│   ├── EXECUTION_ORDER.txt      # Dependency-sorted spec list
│   ├── REQUIREMENTS.json        # All extracted requirements
│   ├── COVERAGE_MATRIX.md       # Requirement → Test → Implementation mapping
│   └── GAPS.md                  # Remaining implementation work
├── src/                   # Implementation (to be created)
├── tests/                 # Test suite (to be created)
├── IMPLEMENT.md           # Protocol specification
└── package.json
```

## Protocol Artifacts

### EXECUTION_ORDER.txt

Lists all spec files in dependency order. Implementation should follow this order:

```
001-normalization-protocol.md
002-plugin-format-spec.md
003-tui-visual-spec.md
...
```

### REQUIREMENTS.json

Structured list of all requirements extracted from specs:

```json
[
  {
    "id": "001::EdgeCase::1.1",
    "type": "EdgeCase",
    "source": "docs/spec/001-normalization-protocol.md:45",
    "description": "Required Fields",
    "content": "..."
  },
  ...
]
```

### COVERAGE_MATRIX.md

Maps requirements to tests and implementations:

| Requirement ID | Spec Source | Description | Test File | Test Coverage | Impl File | Status |
|----------------|-------------|-------------|-----------|---------------|-----------|--------|
| 001::EdgeCase::1.1 | 001:45 | Required Fields | - | ❌ | - | ❌ |

### GAPS.md

Prioritized list of incomplete requirements, sorted by dependency order.

## Implementation Workflow

### Step 1: Run the Protocol

```bash
npm run protocol
```

This generates all artifacts showing what needs to be implemented.

### Step 2: Check Gaps

```bash
cat output/GAPS.md
```

Review the gaps sorted by priority. Implement in dependency order.

### Step 3: Implement a Gap

For each gap:

1. **Write failing test**
   ```bash
   # Create test file in tests/
   # Test should validate the exact requirement from spec
   ```

2. **Implement feature**
   ```bash
   # Create implementation in src/
   # Code must match spec exactly
   ```

3. **Run tests**
   ```bash
   npm test
   # Fix until green
   ```

4. **Update tracking**
   ```bash
   npm run protocol  # Regenerate coverage matrix
   npm run validate  # Check overall progress
   ```

### Step 4: Repeat

Continue implementing gaps in dependency order until:

```bash
npm run validate
# Returns: ✅ All validation checks passed!
```

## Success Criteria

✅ All spec files scanned and requirements extracted
✅ Dependency graph computed (no cycles)
✅ Coverage matrix generated and complete
✅ All requirements have status = ✅
✅ All tests pass (unit + integration)
✅ Zero gaps in GAPS.md

## Current Status

Run `npm run validate` to see current progress.

**Initial State:**
- **Total requirements**: 73
- **Implemented**: 0 (0%)
- **Remaining gaps**: 73

See `output/GAPS.md` for detailed implementation plan.

## Protocol Philosophy

### Invariant Principles

1. **Specs are source of truth** - Code must match specs exactly
2. **Everything is testable** - Every requirement must have: test + implementation
3. **Dependency-aware** - Implementation follows dependency order (auto-discovered)
4. **Zero hardcoding** - Protocol discovers requirements dynamically from spec files
5. **Verifiable completeness** - Coverage matrix proves 100% implementation

### Why This Approach?

- **No manual tracking** - Requirements are auto-extracted from specs
- **No missed requirements** - Every scenario, edge case, and invariant is captured
- **Clear priorities** - Dependency graph ensures correct implementation order
- **Measurable progress** - Coverage matrix shows exactly what's done
- **Living documentation** - Specs stay synchronized with code

## Extending the Protocol

### Add New Spec

1. Create `docs/spec/NNN-new-feature.md`
2. Write specification with BDD scenarios, edge cases, etc.
3. Run `npm run protocol`
4. New requirements automatically appear in GAPS.md

### Add New Requirement Type

Edit `scripts/extract-requirements.js` to add new pattern extractors. The protocol is designed to be extended without changing the core workflow.

## Documentation

- `IMPLEMENT.md` - Complete protocol specification
- `docs/spec/` - Feature specifications (source of truth)
- `docs/decisions/` - Architecture decisions

## License

MIT
