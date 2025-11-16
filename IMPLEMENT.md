# EXECUTE: Spec-Driven Implementation Protocol

**INSTRUCTION**: Implement 100% of `docs/spec/` and `docs/decisions/`

---

## 🎯 Success Criteria

✅ All items in checklist are ✅
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

This generates a checklist from all files in `docs/`.

---

## Phase 2: Verify Completeness

**COUNT** the checklist items:
- ✅ (done) items: `____`
- ❌ (pending) items: `____`
- Total items: `____`

**CHECK 1**: Are ALL items ✅?
- ✅ items = Total items → Continue to CHECK 2
- Otherwise → Go to Phase 3

**CHECK 2**: Does the application work?
- Run tests (if exist)
- Build application (if buildable)
- Run application (if runnable)

All checks pass → DONE ✅
Any check fails → Go to Phase 3

---

## Phase 3: Implement Pending Items

For each ❌ item in checklist:
1. Read the corresponding file in `docs/`
2. Implement what it requires
3. Verify it works
4. Update checklist to ✅

When done → Return to Phase 1 (regenerate checklist)

---

## 🔁 EXECUTION LOOP

```
Phase 1: Generate checklist
    ↓
Phase 2: Verify
    ↓
CHECK 1: All ✅? ──NO──┐
    ↓ YES              │
CHECK 2: App works? ───NO─→ Phase 3: Implement → Back to Phase 1
    ↓ YES
   DONE
```

**DO NOT STOP** until both checks pass.

---

## 📊 Why This Works

1. **Checklist-driven**: Tracks what's done vs pending
2. **Two-level verification**: Checklist ✅ AND app works
3. **Self-correcting**: Loop back if anything fails
4. **Content-agnostic**: Works regardless of docs/ content
5. **Immutable**: Protocol never changes

---

## 🚀 START EXECUTION NOW

```bash
ultrathink --seq @docs/spec @docs/decisions
```

Then verify, implement, loop until complete.
