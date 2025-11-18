# Validation Scenarios - Simplest Cases

## Scenario 1: Detect Cross-Reference Violation

**Given**: A document with this frontmatter:
```yaml
---
gate_constraints:
  - no_cross_references
document_covers:
  - concepts_and_definitions
---
```

**When**: Claude tries to write this content:
```markdown
## What is normalization?

Normalization transforms plugin formats. See 002-plugin-format.md for details.
```

**Then**: Write is BLOCKED

**Reason**: Content contains `002-plugin-format.md` which violates `no_cross_references`

**Error message**:
```
❌ Validation failed: no_cross_references violation
Found reference to internal document: 002-plugin-format.md
This document does not allow cross-references.
```

---

## Scenario 2: Allow Valid Content

**Given**: Same document (no_cross_references)

**When**: Claude tries to write this content:
```markdown
## What is normalization?

Normalization transforms plugin formats to a standard structure.
```

**Then**: Write is ALLOWED

**Reason**: No cross-references found, content is valid

---

## Why This Is The Simplest Scenario

**What makes it simple:**
1. Only ONE rule to check: `no_cross_references`
2. Rule is objective: either has link or doesn't
3. Can be validated with simple pattern matching: `[text](./file.md)` or `See 001-`
4. No semantic understanding needed
5. Binary result: pass or fail

**What we're NOT testing yet:**
- Multiple constraints at once
- `document_covers` validation (requires semantic understanding)
- `single_responsibility` (requires content analysis)
- Existing frontmatter preservation
- Edge cases

**Next step**: If this scenario works, we can expand to more complex cases.
