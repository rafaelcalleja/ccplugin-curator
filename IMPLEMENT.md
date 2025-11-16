# EXECUTE: Spec-Driven Implementation Protocol

**INSTRUCTION**: Implement 100% of `docs/spec/` and `docs/decisions/`

---

## 🎯 Success Criteria

✅ All pending items = 0 AND mandatory verification passes
✅ Application runs without errors

**CRITICAL RULES**:
- **NO item can be marked as "optional"** - Everything in `docs/` is MANDATORY
- **100% means 100%** - Not 90%, not "mostly done", not "core features complete"

**NUMBERS RULE**:
If a spec mentions a number/count (e.g., "3 commands", "15 items total", "4 hooks"):
- These are EXACT requirements, NOT approximations
- 2 ≠ 3, 14 ≠ 15
- When checking: Count actual vs spec count
- If mismatch → Pending item

**GRANULARITY RULE**:
If a pending item is broad (e.g., "Implement file X"):
- INVALID - Too coarse
- MUST break down into atomic items
- Atomic = Can be verified in ONE check
- Non-atomic = Requires multiple checks

Examples:
- ❌ "Implement 008-integration-test-spec.md" (non-atomic)
- ✅ "Create fixture with 3 commands not 2" (atomic)
- ✅ "Add test: Scenario 1 - Load workflow" (atomic)

RULE: If you can't verify the item with a SINGLE file check or test run, it's NOT atomic enough.

---

## The Loop

### Iteration N:

#### Step 1: Read ALL documentation
```bash
ultrathink --seq @docs/spec @docs/decisions
```

Read EVERY file in `docs/spec/` and `docs/decisions/`.

---

#### Step 2: Identify what's missing

For EACH file read:

**Read line by line**
- For EACH requirement/assertion/example/scenario in the file:
  → Is THIS SPECIFIC thing implemented?
  → NOT: 'Is the general topic covered?'
  → YES: 'Is this exact line/section/example done?'
- Create ONE pending item PER requirement found

**Exact matching criterion**
To answer "Is this implemented?" as YES, you MUST:
1. Quote the EXACT line from spec
2. Point to EXACT code/test/file that satisfies it
3. Verify match is COMPLETE (not partial)

If unsure → Answer is NO → Add to pending

Create list of pending items:
```
Pending items found in iteration N:
- [ ] Item 1 from file X (exact requirement quoted)
- [ ] Item 2 from file Y (exact requirement quoted)
- [ ] Item 3 from file Z (exact requirement quoted)
...
Total: ___ pending items
```

---

#### Step 3: Verify completeness

**IF** pending items = 0:

  **MANDATORY VERIFICATION**

  Perform random sampling:

  1. Re-scan docs/ directory
  2. Pick 3 random spec files
  3. For each, verify 3 random requirements
  4. Can you point to EXACT implementation?

  IF ANY verification fails:
    → You missed items
    → Return to Step 2 (recount more carefully)

  IF all verifications pass:
    → **DONE** - Go to Final Verification

**IF** pending items > 0:
  - Continue to Step 4

---

#### Step 4: Implement pending items

For EACH pending item:
1. Read the spec/decision file again
2. Implement what's required
3. Write tests
4. Verify it works

Mark each item as done when complete.

---

#### Step 5: Next iteration

Return to Step 1

---

## ⚠️ Common Mistakes (Anti-patterns)

**❌ WRONG: Broad pending items**

```
Implement integration tests
```
→ Too vague, impossible to verify

**✅ CORRECT: Atomic pending items**

```
Create test-plugin/commands/nested/deep-cmd.md
Add test function: 'Full workflow scenario'
```

---

**❌ WRONG: Partial implementation = done**

Spec: "Test plugin has 3 commands"
Reality: 2 commands exist
Marking: "Commands implemented ✓"

→ INCORRECT

**✅ CORRECT: Exact match required**

Spec: "Test plugin has 3 commands"
Reality: 2 commands exist
Marking: "Pending: Add 3rd command (nested/deep.md)"

---

**❌ WRONG: "Feature works" = "Spec done"**

```
normalize() works → "008 spec done" ✓
```

→ INCORRECT (conflates code with tests)

**✅ CORRECT: Spec requirements checked individually**

```
normalize() works ✓
BUT 008 spec line 125 says "3 commands" → have 2 → NOT done
```

---

## Final Verification

Only reached after pending items = 0 AND mandatory verification passes.

**EXECUTE**:
- Run test suite (if exists)
- Build application (if buildable)
- Run application (if runnable)

**IF** any verification fails:
- Return to Step 1

**IF** all verifications pass:
- **DONE** - 100% complete

---

## 📊 Why This Works

1. **Line-by-line granularity**: Forces atomic items
2. **Exact matching**: Prevents partial implementation acceptance
3. **Numbers verification**: Catches count mismatches (3 ≠ 2)
4. **Mandatory verification**: Random sampling prevents false positives
5. **Anti-patterns**: Examples of what NOT to do
6. **Content-agnostic**: Works regardless of docs/ content

---

## 🚀 START EXECUTION NOW

**Step 1**: Read all documentation

```bash
ultrathink --seq @docs/spec @docs/decisions
```

**Then**: Follow steps 2-5, loop until pending = 0 AND verification passes.
