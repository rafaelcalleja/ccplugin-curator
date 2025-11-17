# Contributing to ccplugin-curator

Thank you for your interest in contributing to ccplugin-curator!

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/rafaelcalleja/ccplugin-curator.git
cd ccplugin-curator

# Install dependencies
npm install

# Generate TypeScript types from JSON schemas
npm run generate-types

# Build the project
npm run build
```

## Project Structure

```
ccplugin-curator/
├── schemas/                      # JSON Schema definitions
│   ├── plugin.schema.json        # Official Claude Code plugin format
│   ├── normalized-plugin.schema.json  # Internal normalized format
│   └── marketplace.schema.json   # Marketplace configuration
├── src/
│   ├── index.ts                  # CLI entry point
│   ├── core/                     # Core functionality
│   │   ├── plugin-loader.ts      # Plugin discovery and loading
│   │   ├── auto-discovery.ts     # Component auto-discovery
│   │   ├── hooks-loader.ts       # Hook normalization
│   │   ├── mcp-loader.ts         # MCP normalization
│   │   ├── normalizer.ts         # Main normalization logic
│   │   ├── validator.ts          # JSON schema validation
│   │   └── save/                 # Save operation modules
│   │       ├── index.ts          # Main save coordinator
│   │       ├── conflicts.ts      # Conflict resolution
│   │       ├── copier.ts         # File copying
│   │       ├── directory.ts      # Directory operations
│   │       ├── marketplace.ts    # Marketplace generation
│   │       ├── outputs.ts        # JSON output generation
│   │       └── validator.ts      # Save validation
│   ├── transformers/
│   │   ├── utils/                # Utility functions
│   │   └── reverse/              # Normalized → Official format
│   ├── tui/                      # Terminal UI components
│   │   ├── App.tsx               # Main TUI component
│   │   ├── state.ts              # State management
│   │   ├── index.tsx             # TUI entry point
│   │   └── panels/               # UI panels
│   └── types/                    # Generated TypeScript types
├── tests/
│   ├── fixtures/                 # Test plugins
│   ├── unit/                     # Unit tests
│   └── integration/              # Integration tests (future)
└── docs/
    └── spec/                     # Detailed specifications
```

## Development Workflow

### Building

```bash
# Build once
npm run build

# Build and watch for changes
npm run dev
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:unit

# Run tests with coverage
npm run test:coverage
```

### Type Generation

When you modify JSON schemas, regenerate TypeScript types:

```bash
npm run generate-types
```

## Coding Standards

### TypeScript

- Use strict mode (enabled in tsconfig.json)
- Use ES2022 features
- Use `.js` extensions in imports (for ES modules)
- Prefer `type` over `interface` for simple types
- Use `interface` for objects that may be extended

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in multi-line arrays/objects
- Use descriptive variable names

### Documentation

- Add JSDoc comments to public functions
- Include @param and @returns tags
- Reference specification documents where applicable
- Use examples for complex functions

### Testing

- Write tests for all new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

## Adding New Features

### 1. Check Specifications

Before implementing, check if the feature is specified in `docs/spec/`.

### 2. Write Tests First

Create test cases in `tests/unit/` or `tests/integration/`.

### 3. Implement Feature

Follow the existing code structure and patterns.

### 4. Update Documentation

- Update README.md if adding user-facing features
- Add JSDoc comments to new functions
- Update specification docs if needed

### 5. Run Tests

```bash
npm test
npm run build
```

## Submitting Changes

### Commit Messages

Follow conventional commit format:

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks

Examples:
```
feat: add support for nested skill directories

fix: resolve path conflicts in Windows

docs: update installation instructions

test: add tests for conflict resolution
```

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

#### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Code follows project style
- [ ] Documentation updated
- [ ] Commit messages follow convention

## Architecture Decisions

### Why ES Modules?

- Modern JavaScript standard
- Better tree-shaking
- Native Node.js support (v18+)
- Ink framework requirement

### Why Ink for TUI?

- React-based (familiar paradigm)
- Declarative UI
- Good keyboard navigation support
- Active maintenance

### Why JSON Schema?

- Validation at runtime
- Type generation
- Self-documenting
- Industry standard

### Transformation Pipeline

```
Official Plugin Format
        ↓
[Normalization]
        ↓
Normalized Format (Internal)
        ↓
[User Selection via TUI]
        ↓
[Conflict Resolution]
        ↓
[Reverse Transformation]
        ↓
Official Plugin Format (Output)
```

## Troubleshooting

### TypeScript Errors

```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

### Test Failures

```bash
# Run specific test file
npx vitest tests/unit/core/plugin-loader.test.ts

# Run tests in debug mode
DEBUG=true npm test
```

### Module Resolution Issues

Ensure you're using Node.js >= 18 and that imports include `.js` extensions:

```typescript
// ✅ Correct
import { foo } from './bar.js';

// ❌ Incorrect
import { foo } from './bar';
```

## Getting Help

- Check existing issues on GitHub
- Review specification docs in `docs/spec/`
- Ask questions in GitHub Discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
