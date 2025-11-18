# BDD Scenario 001: No Cross-References

This directory contains everything needed to test the `no_cross_references` validation.

## Structure

```
001-no-cross-references/
├── scenario.md         - BDD scenario definition
├── hook.sh            - Validation hook implementation
├── test.sh            - Test runner
├── fixtures/          - Test files
│   ├── valid.md       - Content without cross-references (should pass)
│   └── invalid.md     - Content with cross-references (should fail)
└── expected/          - Expected outputs (future)
```

## Running the Test

```bash
cd bdd/001-no-cross-references
./test.sh
```

## Expected Output

```
=== BDD Test: 001-no-cross-references ===

Test 1: Valid content (should allow write)
✅ PASS: Valid content allowed

Test 2: Invalid content (should block write)
✅ PASS: Invalid content blocked

Error message:
  ❌ Validation failed: no_cross_references violation

  This document has gate_constraint: no_cross_references
  Found references to internal documents:

    Normalization transforms plugin formats. See 002-plugin-format.md for the format specification.
    The process is documented in [transformation rules](005-transformation-rules.md).
    - See ../workflows/001-workflow.md for usage
    - Check 007-save-operation.md for details

  Cross-references are not allowed in this document.

=== All tests passed ✅ ===
```

## What This Tests

1. ✅ Detects markdown links: `[text](file.md)`
2. ✅ Detects plain references: `See 002-file.md`
3. ✅ Detects relative paths: `../other/file.md`
4. ✅ Allows content without cross-references
5. ✅ Provides clear error messages

## Dependencies

- `bash`
- `jq` (for JSON manipulation)
- `grep`, `awk`, `sed` (standard Unix tools)
