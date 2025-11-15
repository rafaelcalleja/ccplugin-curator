# Quick Start Guide - MkCurator

## Installation

```bash
cd /home/rcalleja/projects/mkcurator
npm install
```

## Running the Application

### Option 1: Using npx tsx (Recommended)

```bash
npx tsx src/cli.tsx select test-plugins
```

### Option 2: Using the CLI script

```bash
npm run cli -- select test-plugins
```

## Running Tests

```bash
npm test
```

Expected output:
```
🎉 All tests passed!
Total tests run: 7
✅ Passed: 7
❌ Failed: 0
```

## Example Usage

```bash
# Test with the included test plugin
npx tsx src/cli.tsx select test-plugins

# Use with real plugins
npx tsx src/cli.tsx select ~/.claude/plugins

# Custom output location and name
npx tsx src/cli.tsx select ~/.claude/plugins --output ./my-plugin.json --name my-curated
```

## Keyboard Controls in TUI

- **←→**: Switch between panels
- **↑↓**: Navigate items
- **SPACE**: Toggle selection
- **TAB**: Switch to next plugin
- **A**: Select all of current type
- **N**: Select none (deselect all)
- **S**: Save curated plugin
- **Q**: Quit

## Troubleshooting

### "Cannot find module"
Run `npm install` to ensure all dependencies are installed.

### TUI doesn't appear
Make sure you're running in an interactive terminal (not in a subprocess or pipe).

### Tests fail
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

## Project Structure

- `src/` - Source code (TypeScript)
- `test/` - Test suite
- `test-plugins/` - Example plugin for testing
- `schemas/` - JSON schemas for validation

## Notes

- This project uses `tsx` to run TypeScript directly
- No build step required - runs from source
- Tests use the same `tsx` approach
