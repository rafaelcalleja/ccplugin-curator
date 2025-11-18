# Problem Analysis: Schema Enforcement for Document Content

## Context

We have a system where Markdown documents contain YAML frontmatter that defines:
- `document_covers`: Topics the document is allowed to cover
- `gate_constraints`: Rules that govern what type of content can be written

Example frontmatter from `base.json`:
```json
{
  "$schema": "./document-frontmatter.schema.json",
  "gate_constraints": [
    "single_responsibility",
    "self_contained_content",
    "no_cross_references",
    "no_duplicate_definitions",
    "no_duplicate_behavior"
  ],
  "document_covers": []
}
```

## The Problem

**Claude's behavior is non-deterministic when writing to Markdown files.**

### Symptoms

1. **Ignores document_covers**: Writes content about topics NOT listed in `document_covers`
2. **Violates gate_constraints**:
   - Adds cross-references when `no_cross_references` is set
   - Writes duplicate content when `no_duplicate_behavior` is set
   - Covers multiple topics when `single_responsibility` is set
3. **Inconsistent enforcement**: Sometimes respects rules, sometimes ignores them
4. **No validation**: No automated check that content matches frontmatter rules

### Why This Is Critical

- **Non-determinism**: Same spec + same request = different results each time
- **Spec violations**: Documents end up containing content they shouldn't have
- **No enforcement**: Frontmatter rules are "suggestions" not "constraints"
- **Manual verification needed**: Humans must review every write to catch violations

## Root Cause Analysis

**Claude is a non-deterministic LLM** - injecting text, warnings, or instructions does NOT guarantee consistent behavior.

Even if we tell Claude:
- "Read the frontmatter before writing"
- "Verify your content matches document_covers"
- "Don't violate gate_constraints"

Claude may:
- Ignore the instruction
- Misinterpret what constitutes a violation
- Forget to check after reading multiple files
- Behave differently between sessions

**Conclusion**: We cannot rely on Claude to self-enforce. We need **automated validation**.

## Solution Requirements

We need a system that:

1. **Validates content BEFORE write** - Prevent violations, don't fix them after
2. **Enforces gate_constraints automatically** - No human interpretation needed
3. **Works deterministically** - Same content + same frontmatter = same result
4. **Provides clear feedback** - When blocked, explain why
5. **Handles both new and existing files** - Preserve existing frontmatter when relevant

## Proposed Solution

### Approach: Hybrid Validation (Enfoque 5)

Combine two validation strategies:

**1. Rule-based validation (fast, deterministic)**
- Regex/AST parsing for obvious violations
- Example: Detect `[text](./001-*.md)` for `no_cross_references`

**2. LLM validation (semantic, flexible)**
- Use small/fast LLM for ambiguous cases
- Example: "Does this content cover only topic X?"

**3. Guided validation (pre-check)**
- Generate checklist questions based on constraints
- Force Claude to answer before writing
- Hook validates answers were provided

### Implementation: Claude Code Hooks

Use **PreToolUse Write/Edit hooks** to intercept writes BEFORE they happen:

```
Claude tries to write file.md
    ↓
Hook intercepts
    ↓
Read existing frontmatter (if file exists)
    ↓
Load schemas (base.json + document-frontmatter.schema.json)
    ↓
Validate content against frontmatter rules
    ↓
Pass? → Allow write (exit 0)
Fail? → Block write (exit 1) + explain violation
```

### What Gets Validated

For each `gate_constraint`:

| Constraint | Validation Method | Example Violation |
|------------|-------------------|-------------------|
| `no_cross_references` | Rule-based (regex) | Contains `[text](./file.md)` |
| `single_responsibility` | LLM + content analysis | Covers multiple topics from enum |
| `no_duplicate_definitions` | Rule-based (AST) | Defines same type/interface |
| `no_duplicate_behavior` | LLM + similarity check | Describes same algorithm |
| `self_contained_content` | LLM validation | Requires external context to understand |

For `document_covers`:
- LLM analyzes: "Is this content about topics: [X, Y, Z]?"
- If NO → block

## Success Criteria

When solution is complete:

1. ✅ Claude CANNOT write content that violates gate_constraints
2. ✅ Claude CANNOT write content outside of document_covers
3. ✅ Validation is deterministic (same content = same result)
4. ✅ Blocked writes show clear error message explaining violation
5. ✅ Existing frontmatter is preserved when Claude writes without frontmatter
6. ✅ New files without frontmatter are blocked

## Next Steps

1. **Define BDD scenarios** (001-validation-scenarios.md)
   - Concrete examples of valid/invalid content
   - Expected hook behavior for each scenario

2. **Define use cases** (002-validation-use-cases.md)
   - Real-world examples from our specs
   - Edge cases and corner cases

3. **Implement hook prototype**
   - Start with simplest rule: `no_cross_references`
   - Prove concept works end-to-end

4. **Expand to LLM validation**
   - Add semantic validation for `document_covers`
   - Test with small model (haiku, gpt-4o-mini)

5. **Add guided validation**
   - Generate pre-write checklists
   - Validate checklist completion
