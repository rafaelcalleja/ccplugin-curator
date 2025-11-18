# BDD Test Suite for Schema Validation

This directory contains BDD (Behavior-Driven Development) scenarios for testing schema validation hooks.

## Structure

Each scenario is in its own directory with everything needed to run independently:

```
bdd/
├── 001-no-cross-references/    - Test no_cross_references constraint
│   ├── scenario.md             - BDD definition
│   ├── hook.sh                 - Validation implementation
│   ├── test.sh                 - Test runner
│   ├── fixtures/               - Test files
│   └── README.md               - How to run
│
└── 002-xxx/                    - Next scenario (future)
```

## Running Tests

### Run single scenario
```bash
cd bdd/001-no-cross-references
./test.sh
```

### Run all scenarios
```bash
for dir in bdd/*/; do
  echo "Running $(basename $dir)..."
  cd "$dir"
  ./test.sh
  cd - > /dev/null
  echo ""
done
```

## Current Scenarios

### ✅ 001-no-cross-references
Tests validation of `no_cross_references` gate constraint.

**Status**: Implemented and passing
**What it tests**:
- Blocks content with markdown links to other docs
- Blocks content with plain references (e.g., "See 002-file.md")
- Blocks relative path references
- Allows valid content without cross-references

## Adding New Scenarios

1. Create directory: `bdd/00X-scenario-name/`
2. Add files:
   - `scenario.md` - BDD definition
   - `hook.sh` - Validation logic
   - `test.sh` - Test runner
   - `fixtures/` - Test files
   - `README.md` - Documentation
3. Make scripts executable: `chmod +x hook.sh test.sh`
4. Run test: `./test.sh`

## Principles

- **Self-contained**: Each scenario has everything it needs
- **Executable**: Can run `./test.sh` directly
- **Clear output**: Pass/fail is obvious
- **Documented**: README explains what's tested
- **Incremental**: Start simple (001), add complexity progressively
