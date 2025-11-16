# EXECUTE: Spec-Driven Implementation Protocol

**INSTRUCTION**: Implement 100% of `docs/spec/` and `docs/decisions/`

---

## 🎯 Success Criteria

✅ Checklist generated from `docs/` is 100% complete
✅ All items marked as done
✅ Application runs without errors

**CRITICAL RULES**:
- **NO item can be marked as "optional"** - Everything in `docs/` is MANDATORY
- **NO "partial completion"** - Each item is either ✅ (done) or ❌ (not done)
- **NO "TODO for later"** - All items must be ✅ before declaring complete
- **100% means 100%** - Not 90%, not "mostly done", not "core features complete"

---

## Phase 1: Generate Checklist

**EXECUTE**:

```bash
ultrathink --seq @docs/spec @docs/decisions
```

**This command**:
- Reads all files in `docs/spec/` and `docs/decisions/`
- Generates a checklist of completed vs pending items
- Shows what is already done
- Shows what needs to be implemented

**Output**: A checklist with items marked as ✅ (done) or ❌ (pending)

---

## Phase 2: Review Checklist

**CHECK**: Look at the checklist generated in Phase 1.

**STRICT VERIFICATION**:

Count the items:
- ✅ (done) items: `____`
- ❌ (pending) items: `____`
- ⚠️ (incomplete) items: `____`
- 🔜 (optional/later) items: `____`
- Total items: `____`

**PASS criteria**:
- ✅ items = Total items (100%)
- ❌ items = 0
- ⚠️ items = 0
- 🔜 items = 0

**FAIL if**:
- ANY item is not ✅
- ANY item is marked "optional", "TODO", "later", "nice to have"
- Count of ✅ items < Total items

**If FAIL → Go to Phase 3**

**If PASS → Go to Phase 4**

---

## Phase 3: Complete Pending Items

**EXECUTE**: For each pending item in the checklist:

1. Read the spec/decision file that corresponds to that item
2. Understand what needs to be implemented
3. Implement it (write code, tests, config, etc.)
4. Verify it works (run tests, build, etc.)
5. Mark item as ✅ in the checklist

**Continue until**: All items in checklist are ✅

**Then**: Return to Phase 1 (regenerate checklist to verify)

---

## Phase 4: Final Verification

**EXECUTE**: Verify the application works end-to-end.

Run whatever verification the project defines:
- Test suite (if exists)
- Build process (if exists)
- Run application (if runnable)
- Any other project-specific verification

**CHECK**: Do all verifications pass?

**If NO → Return to Phase 3**

**If YES → DONE - Implementation complete**

---

## 🔁 EXECUTION LOOP

```
START
  ↓
Phase 1: Generate checklist
  ↓
Phase 2: Review checklist
  ↓
All ✅? ──NO──→ Phase 3: Complete pending items ──→ Back to Phase 1
  ↓
 YES
  ↓
Phase 4: Final verification
  ↓
Pass? ──NO──→ Phase 3: Fix failures ──→ Back to Phase 1
  ↓
YES
  ↓
DONE - 100% complete
```

**DO NOT STOP** until checklist is 100% ✅ and all verifications pass.

---

## 📊 Why This Works

1. **Checklist-driven**: Explicit tracking of what's done vs pending
2. **Self-verifying**: Regenerate checklist after changes to confirm completion
3. **Content-agnostic**: Works regardless of docs/ content or project structure
4. **Immutable**: Protocol never changes, only checklist content changes
5. **Exhaustive**: Loops until 100% of checklist is complete

---

## 🚀 START EXECUTION NOW

**BEGIN Phase 1**:

```bash
ultrathink --seq @docs/spec @docs/decisions
```

**THEN**: Review the checklist, complete pending items, verify, loop.

**DO NOT STOP** until checklist shows 100% ✅ and all verifications pass.
