# EXECUTE: Spec-Driven Implementation Protocol (IMPROVED)

**INSTRUCTION**: Implement 100% of `docs/spec/` and `docs/decisions/`

---

## 🎯 Success Criteria

✅ **Convergence**: 2 consecutive iterations find NOTHING to implement
✅ Application runs without errors

**CRITICAL RULES**:
- **Must re-read ALL docs/ every iteration** - No assumptions from previous iteration
- **Only stop after 2 iterations with ZERO pending items** - One is not enough
- **NO item can be marked as "optional"** - Everything in `docs/` is MANDATORY
- **100% means 100%** - Not 90%, not "mostly done", not "core features complete"

**NEW: NUMBERS RULE**:
If a spec mentions a number/count (e.g., "3 commands", "15 items total", "4 hooks"):
- These are EXACT requirements, NOT approximations
- 2 ≠ 3, 14 ≠ 15
- When checking: Count actual vs spec count
- If mismatch → Pending item

**NEW: GRANULARITY RULE**:
If a pending item is broad (e.g., "Implement file X"):
- INVALID - Too coarse
- MUST break down into atomic items
- Atomic = Can be verified in ONE check
- Non-atomic = Requires multiple checks

Examples:
❌ "Implement 008-integration-test-spec.md" (non-atomic)
✅ "Create fixture with 3 commands not 2" (atomic)
✅ "Add test: Scenario 1 - Load workflow" (atomic)

RULE: If you can't verify the item with a SINGLE file check or test run, it's NOT atomic enough.

---

## The Loop (Run Until Convergence)

### Iteration N:

#### Step 1: Read ALL documentation

```bash
ultrathink --seq @docs/spec @docs/decisions
```

Read EVERY file in `docs/spec/` and `docs/decisions/`.

---

#### Step 2: Identify what's missing

For EACH file read:

**NEW: Read line by line**
- For EACH requirement/assertion/example/scenario in the file:
  → Is THIS SPECIFIC thing implemented?
  → NOT: 'Is the general topic covered?'
  → YES: 'Is this exact line/section/example done?'
- Create ONE pending item PER requirement found

**NEW: Exact matching criterion**
To answer "Is this implemented?" as YES, you MUST:
1. Quote the EXACT line from spec
2. Point to EXACT code/test/file that satisfies it
3. Verify match is COMPLETE (not partial)

Example from spec line 125:
Spec says: 'Commands: 3'

❌ NO: 'There are commands in the fixture'
✅ YES: 'Fixture has analyze.md, optimize.md, nested/deep.md (3 total)'

If unsure → Answer is NO → Add to pending

**Create list of pending items:**
```
Pending items found in iteration N:
- [ ] Item 1 from file X (quote: "line from spec")
- [ ] Item 2 from file Y (quote: "line from spec")
- [ ] Item 3 from file Z (quote: "line from spec")
...
Total: ___ pending items
```

---

#### Step 3: Check convergence

Count pending items from Step 2.

**NEW: MANDATORY VERIFICATION BEFORE CONVERGENCE**

IF pending items = 0:

  BEFORE declaring convergence, perform:

  1. Re-scan docs/ directory
  2. Pick 3 random spec files
  3. For each, verify 3 random requirements
  4. Can you point to EXACT implementation?

  IF ANY verification fails:
    → You missed items
    → Return to Step 2 (recount more carefully)

  IF all verifications pass:
    → Increment convergence counter
    → IF convergence counter = 2:
      → DONE - Go to Final Verification
    → ELSE:
      → Continue to Step 1 (next iteration)

IF pending items > 0:
  - Reset convergence counter to 0
  - Continue to Step 4

---

#### Step 4: Implement pending items

For EACH pending item:

1. **Re-read the source spec file**
   - Understand EXACT requirement
   - Note line numbers in spec

2. **Implement the requirement**
   - Write code/tests/config
   - Ensure EXACT match to spec
   - NOT approximate, NOT "close enough"

3. **Verify completion:**
   - Can quote spec line → point to exact implementation
   - Spec says N → Implementation has N (not N-1, not N+1)
   - Test passes (if applicable)
   - Code works (if applicable)

4. **Mark as done** - Move to next item

Mark each item as done when complete.

---

#### Step 5: Next iteration

Return to Step 1 (re-read ALL docs/ from scratch)

---

## ⚠️ Common Mistakes (Anti-patterns)

**❌ WRONG: Broad pending items**
```
- [ ] Implement integration tests
```
→ Too vague, impossible to verify

**✅ CORRECT: Atomic pending items**
```
- [ ] Create test-plugin/commands/nested/deep-cmd.md
- [ ] Add test function: 'Full workflow scenario'
- [ ] Add assertion: marketplace.json exists
```

---

**❌ WRONG: Partial implementation = done**
```
Spec: "Test plugin has 3 commands"
Reality: 2 commands exist
Marking: "Commands implemented ✓"
```
→ INCORRECT

**✅ CORRECT: Exact match required**
```
Spec: "Test plugin has 3 commands"
Reality: 2 commands exist
Marking: "Pending: Add 3rd command (nested/deep.md)"
```

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

Only reached after 2 consecutive iterations found 0 pending items.

**EXECUTE**:
- Run test suite (if exists)
- Build application (if buildable)
- Run application (if runnable)

**IF** any verification fails:
- Reset convergence counter to 0
- Return to Step 1

**IF** all verifications pass:
- **DONE** - 100% complete

---

## 📊 Why This Works

1. **Exhaustive re-reading**: Every iteration re-reads ALL docs/ from scratch
2. **Convergence detection**: Stops only when 2 iterations find nothing
3. **Self-correcting**: Can't skip items - will find them in next iteration
4. **No memory assumptions**: Each iteration treats docs/ as new
5. **Content-agnostic**: Works regardless of docs/ content
6. **NEW: Line-by-line granularity**: Forces atomic items
7. **NEW: Exact matching**: Prevents partial implementation acceptance
8. **NEW: Numbers verification**: Catches count mismatches
9. **NEW: Mandatory verification**: Random sampling before convergence
10. **NEW: Anti-patterns**: Examples of what NOT to do

---

## 🚀 START EXECUTION NOW

**Iteration 1 - Step 1**: Read all documentation

```bash
ultrathink --seq @docs/spec @docs/decisions
```

**Then**: Follow steps 2-5, loop until convergence (2x zero pending).

**Convergence counter**: 0
