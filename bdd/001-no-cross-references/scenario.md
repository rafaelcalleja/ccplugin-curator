# BDD Scenario 001: No Cross-References Validation

## Feature
Prevent writing cross-references when `no_cross_references` constraint is active

## Background
Documents with `gate_constraints: ["no_cross_references"]` should NOT allow content that links to other internal documents.

## Scenario 1: Block content with cross-reference

**Given** a document with frontmatter:
```yaml
---
gate_constraints:
  - no_cross_references
document_covers:
  - concepts_and_definitions
---
```

**When** attempting to write content:
```markdown
## What is normalization?

Normalization transforms plugin formats. See 002-plugin-format.md for details.
```

**Then** the write should be BLOCKED

**And** error message should contain:
- "no_cross_references violation"
- "002-plugin-format.md"

## Scenario 2: Allow content without cross-references

**Given** same document with `no_cross_references` constraint

**When** attempting to write content:
```markdown
## What is normalization?

Normalization transforms plugin formats to a standard structure.
```

**Then** the write should be ALLOWED

## Patterns to Detect

Cross-references include:
- Markdown links: `[text](./file.md)` or `[text](file.md)`
- Plain references: `See 001-file.md` or `See file.md`
- Relative paths: `../other/file.md`

## Test Files

- `fixtures/valid.md` - Content without cross-references (should pass)
- `fixtures/invalid.md` - Content with cross-references (should fail)
- `hook.sh` - Validation hook implementation
- `test.sh` - Test runner
