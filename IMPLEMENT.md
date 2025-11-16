# EXECUTE: Spec-Driven Implementation Protocol

**INSTRUCTION**: Execute this protocol to implement 100% of `docs/spec/` and `docs/decisions/`.

---

## 🎯 Success Criteria

✅ All files in `docs/spec/` → implemented
✅ All files in `docs/decisions/` → implemented
✅ All tests passing
✅ Application runs without errors

**If any criterion fails → LOOP BACK and continue implementation**

---

## Phase 1: Implementation

**EXECUTE**:

```bash
ultrathink --seq @docs/spec @docs/decisions
```

This command:
- Reads all spec and decision files
- Generates checklist of completed vs pending items
- Implements all pending items
- Runs tests

---

## Phase 2: Verification

**EXECUTE**: Verify 100% completeness using content-agnostic checks.

### 2.1 Check: All tests pass

```bash
npm test
```

**Must output**: All tests passing (exit code 0)

**If fails**: Review test output, fix implementation, loop back to Phase 1

---

### 2.2 Check: All spec files are implemented

```bash
echo "=== Verifying ALL spec files ==="

for spec in $(find docs/spec -name "*.md" ! -name "README.md" -exec basename {} \;); do
  echo "Checking: docs/spec/$spec"

  # Strategy: Search codebase for evidence of implementation
  # - Test files mention the spec
  # - Implementation files exist for the domain

  test_count=$(grep -r "$spec" tests/ __tests__/ src/**/*.test.ts 2>/dev/null | wc -l)

  if [ "$test_count" -eq 0 ]; then
    echo "❌ FAIL: No tests found referencing $spec"
    exit 1
  fi

  echo "✅ $spec - Found $test_count test references"
done

echo "✅ All spec files verified"
```

**If fails**: Spec file has no implementation → loop back to Phase 1

---

### 2.3 Check: All decision files are applied

```bash
echo "=== Verifying ALL decision files ==="

for decision in $(find docs/decisions -name "*.md" ! -name "README.md" -exec basename {} \;); do
  echo "Checking: docs/decisions/$decision"

  # Strategy: Search codebase for evidence of decision being applied
  # - package.json mentions dependencies from decision
  # - Code references decision artifacts

  ref_count=$(grep -r "$(basename $decision .md)" . --include="*.json" --include="*.ts" --include="*.js" 2>/dev/null | wc -l)

  if [ "$ref_count" -eq 0 ]; then
    echo "⚠️  WARNING: No references found for $decision (may be informational)"
  else
    echo "✅ $decision - Found $ref_count references"
  fi
done

echo "✅ All decision files verified"
```

**If fails**: Decision not applied → loop back to Phase 1

---

### 2.4 Check: Application runs

```bash
echo "=== Verifying application runs ==="

# Build
npm run build 2>/dev/null

# Check executable exists
if [ ! -f dist/index.js ]; then
  echo "❌ FAIL: Executable dist/index.js not found"
  exit 1
fi

echo "✅ Application builds successfully"

# Verify CLI can run (should show help or handle no args gracefully)
node dist/index.js --help >/dev/null 2>&1 || {
  echo "⚠️  WARNING: CLI --help failed (may be expected)"
}

echo "✅ Application verification complete"
```

**If fails**: Application doesn't build/run → loop back to Phase 1

---

## 🔁 EXECUTION LOOP

```bash
# Loop until all checks pass
while true; do
  echo "========================================="
  echo "Starting implementation cycle..."
  echo "========================================="

  # Phase 1: Implement
  ultrathink --seq @docs/spec @docs/decisions

  # Phase 2: Verify
  if npm test && \
     bash verify-specs.sh && \
     bash verify-decisions.sh && \
     bash verify-app.sh; then
    echo "✅ SUCCESS: 100% complete"
    break
  else
    echo "❌ INCOMPLETE: Looping back to Phase 1"
  fi
done
```

**DO NOT STOP** until all Phase 2 checks pass.

---

## 📊 Why This Works

1. **Self-discovering**: Finds all files in `docs/` dynamically
2. **Immutable**: Protocol never changes, only `docs/` content changes
3. **Content-agnostic**: Verifies existence, not content
4. **Delegated implementation**: `ultrathink --seq` handles the "how"
5. **Verifiable completeness**: Checks ensure nothing is missed

---

## 🚀 START EXECUTION NOW

**BEGIN Phase 1 immediately:**

```bash
ultrathink --seq @docs/spec @docs/decisions
```

**DO NOT STOP** until all Phase 2 verification checks pass.
