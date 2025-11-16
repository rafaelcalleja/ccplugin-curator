# EXECUTE: Spec-Driven Implementation Protocol

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
- Is this requirement/decision implemented?
- Is there code/tests/config for it?
- Does the app exhibit this behavior?

Create list of pending items:
```
Pending items found in iteration N:
- [ ] Item 1 from file X
- [ ] Item 2 from file Y
- [ ] Item 3 from file Z
...
Total: ___ pending items
```

---

#### Step 3: Check convergence

**IF** pending items = 0:
  - Increment convergence counter
  - **IF** convergence counter = 2:
    - **DONE** - Go to Final Verification
  - **ELSE**:
    - Continue to Step 1 (next iteration)

**IF** pending items > 0:
  - Reset convergence counter to 0
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

Return to Step 1 (re-read ALL docs/ from scratch)

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

---

## 🚀 START EXECUTION NOW

**Iteration 1 - Step 1**: Read all documentation

```bash
ultrathink --seq @docs/spec @docs/decisions
```

**Then**: Follow steps 2-5, loop until convergence (2x zero pending).

**Convergence counter**: 0
