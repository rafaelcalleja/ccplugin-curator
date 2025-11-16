# EXECUTE: Spec-Driven Implementation Protocol

**INSTRUCTION**: Implement 100% of `docs/spec/` and `docs/decisions/`

---

## 🎯 Success Criteria

✅ Every file in `docs/spec/` is implemented
✅ Every file in `docs/decisions/` is applied
✅ Application runs without errors

---

## Phase 1: Read All Documentation

**EXECUTE**:

```bash
ultrathink --seq @docs/spec @docs/decisions
```

This reads all documentation and generates an implementation plan.

---

## Phase 2: Implement Everything

**PROCESS**:

For each file discovered in `docs/`:

1. **Identify requirements** - What does this file require?
2. **Check current state** - Is it already implemented?
3. **Implement gaps** - Write code/tests/config for missing requirements
4. **Verify** - Confirm the requirement is now satisfied
5. **Next file** - Move to next file in `docs/`

**Continue until**: All files in `docs/` are processed.

---

## Phase 3: Verify Completeness

**CHECK**: Answer these questions for ALL files in `docs/`:

### For each file in `docs/spec/`:
- ❓ Are the behaviors described in this spec file implemented?
- ❓ Does the application exhibit these behaviors?
- ❓ Are there tests validating these behaviors?

**If any answer is NO → return to Phase 2 for that file**

### For each file in `docs/decisions/`:
- ❓ Is the decision applied in the codebase?
- ❓ Does the project structure reflect this decision?
- ❓ Are the tools/libraries mentioned in the decision present?

**If any answer is NO → return to Phase 2 for that file**

---

## Phase 4: Final Verification

**EXECUTE**: Run whatever verification exists in the project.

This could be:
- Running test suite (if exists)
- Building the application (if buildable)
- Running the application (if runnable)
- Linting (if configured)
- Any other verification defined by the project

**CHECK**: Do all verifications pass?

**If NO → return to Phase 2**

---

## 🔁 EXECUTION LOOP

```
START
  ↓
Read docs/ (Phase 1)
  ↓
Implement all (Phase 2)
  ↓
Verify completeness (Phase 3)
  ↓
Final verification (Phase 4)
  ↓
ALL PASS? ──NO──→ Return to Phase 2
  ↓
 YES
  ↓
DONE - 100% complete
```

**DO NOT STOP** until all phases pass.

---

## 📊 Why This Works

1. **Content-agnostic**: No assumptions about project structure, language, or tools
2. **Self-discovering**: Finds all files in `docs/` dynamically
3. **Immutable**: Protocol never changes, only `docs/` content changes
4. **Verifiable**: Each phase has clear pass/fail criteria
5. **Exhaustive**: Loops until 100% of `docs/` is implemented

---

## 🚀 START EXECUTION NOW

**BEGIN Phase 1**:

```bash
ultrathink --seq @docs/spec @docs/decisions
```

**THEN**: Follow Phases 2-4 until all verification passes.

**DO NOT STOP** until 100% complete.
