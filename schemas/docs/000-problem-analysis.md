# Problem Analysis: Schema Enforcement for Document Content

## Context

We have Markdown documents with YAML frontmatter that defines metadata and rules.

### What exists today

**Files:**
- `schemas/base.json` - Base configuration with constraints
- `schemas/document-frontmatter.schema.json` - JSON schema defining structure
- `schemas/CREATE.md` - Prompt for generating frontmatter

**Frontmatter example (from base.json):**
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

### What these fields mean

**`gate_constraints`**: Rules that govern what type of content can be written in the document
- `no_cross_references`: Cannot link to other internal documents
- `single_responsibility`: Document covers exactly ONE topic
- `no_duplicate_definitions`: Cannot repeat type/interface definitions
- `no_duplicate_behavior`: Cannot repeat algorithm/behavior documentation
- `self_contained_content`: Must be understandable without reading other docs

**`document_covers`**: Topics the document is allowed to cover (from predefined enum)
- Examples: `concepts_and_definitions`, `workflows_and_processes`, `validation_and_constraints`, etc.

**Schema purpose**: Each constraint has a "gate_question" that should be asked BEFORE writing content.

## The Problem

**When Claude writes to Markdown files, frontmatter rules are not enforced.**

### Observable Symptoms

1. **Ignores `document_covers`**
   - Document has `document_covers: ["concepts_and_definitions"]`
   - Claude writes content about workflows (wrong topic)
   - No error, no validation, content is written

2. **Violates `gate_constraints`**
   - Document has `no_cross_references` constraint
   - Claude writes "See 001-normalization.md for details"
   - No error, no validation, violation written

3. **Inconsistent behavior**
   - Same document, same request
   - Sometimes respects rules, sometimes ignores them
   - Behavior varies between sessions

4. **No enforcement mechanism**
   - Frontmatter exists but is purely informational
   - No automated check validates content vs rules
   - Manual review needed to catch violations

### Why This Is a Problem

**1. Non-determinism**
- Same input should produce same validation result
- Currently: same content + same frontmatter = unpredictable outcome

**2. Specification violations**
- Documents end up containing content they shouldn't have
- Breaks separation of concerns defined in gate_constraints
- Violates single responsibility principle

**3. No feedback loop**
- Writer doesn't know they violated a rule until human review
- No immediate error message explaining what was violated
- Wastes time writing content in wrong document

**4. Manual verification burden**
- Every write must be manually reviewed
- Scales poorly as documents/contributors grow
- Error-prone (humans miss violations)

## Root Cause Analysis

### Why can't Claude self-enforce?

**Claude is a non-deterministic LLM:**
- Same prompt can produce different outputs
- May forget to check rules after reading multiple files
- May misinterpret what constitutes a violation
- Cannot guarantee consistent behavior

**Even with explicit instructions:**
- "Read frontmatter before writing" → sometimes skipped
- "Verify content matches document_covers" → sometimes forgotten
- "Check gate_constraints" → sometimes misunderstood

**Example of non-determinism:**
```
Session 1:
User: "Write about normalization in 001-normalization.md"
Claude: ✓ Checks frontmatter, writes correctly

Session 2:
Same user, same request
Claude: ✗ Skips frontmatter check, violates constraints
```

### What we've tried

**Approach 1: Prompt engineering**
- Added rules to CREATE.md
- Result: Sometimes followed, sometimes ignored

**Approach 2: Explicit reminders**
- "IMPORTANT: Check gate_constraints before writing"
- Result: Still non-deterministic

**Approach 3: Schema references**
- Added `$schema` field to frontmatter
- Result: Claude doesn't auto-validate against schema

### Conclusion

**We cannot rely on Claude to self-enforce rules.**

The LLM's non-deterministic nature means:
- Instructions are suggestions, not guarantees
- Behavior varies unpredictably
- No way to force consistent validation

## What We Need

**Automated, deterministic validation** that:

1. **Validates content BEFORE it's written** (prevent, don't fix)
2. **Works independently of Claude** (no reliance on LLM behavior)
3. **Enforces all gate_constraints** (no violations possible)
4. **Verifies document_covers match** (content matches allowed topics)
5. **Provides clear feedback** (explain what was violated and why)
6. **Works deterministically** (same content + same frontmatter = same result every time)

### Success Criteria

We'll know the problem is solved when:

- ✅ Invalid content CANNOT be written to documents
- ✅ Violations are caught BEFORE write, not after
- ✅ Error messages clearly explain what rule was violated
- ✅ Behavior is 100% consistent (deterministic)
- ✅ Works without relying on Claude's cooperation

## Next Steps

**001-validation-scenarios.md**: Define concrete scenarios
- Examples of valid content
- Examples of invalid content
- Expected validation outcomes

**002-validation-use-cases.md**: Real-world use cases
- Actual spec files from our project
- Edge cases and corner cases
- Complex scenarios

After documenting the problem completely, we can explore solutions.
