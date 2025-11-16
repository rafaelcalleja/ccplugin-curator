# Test Fixtures

Test fixtures for integration testing of the plugin curator.

## Structure

### test-plugin/
Comprehensive plugin with all component types for testing full workflow.

**Components**:
- 3 commands (analyze, optimize, deep-cmd in nested dir)
- 2 agents (reviewer, context-agent)
- 3 skills (skill-alpha with helpers, skill-beta, skill-gamma)
- 4 hooks (SessionStart×2, PostToolUse×2 with matchers)
- 3 MCPs (tavily, filesystem, github)

**Metadata**:
- version: "1.2.3"
- Full author info
- Homepage, repository, license, keywords

### plugin-a/
Plugin with components that conflict with plugin-b.

**Components**:
- 2 commands (build**, deploy)
- 1 agent (reviewer**)
- 1 skill (chrome-devtools**)
- 1 hook (SessionStart)
- 1 MCP (tavily** with env KEY: "A")

### plugin-b/
Plugin with components that conflict with plugin-a.

**Components**:
- 2 commands (build**, test)
- 1 agent (reviewer**)
- 1 skill (chrome-devtools**)
- 1 hook (SessionStart - should merge)
- 1 MCP (tavily** with env KEY: "B")

** = Conflicts with same component in other plugin

## Usage in Tests

```typescript
import { normalize } from '../src/normalize';
import * as path from 'path';

const testPluginDir = path.join(__dirname, '..', 'test-fixtures', 'test-plugin');
const normalized = normalize(testPluginDir);

// Test that all components are discovered
expect(normalized.commands.length).toBe(3);
expect(normalized.agents.length).toBe(2);
// ...
```

## Conflict Resolution Testing

Use plugin-a and plugin-b together to test conflict resolution with namespace prefixes:

```typescript
const pluginA = normalize(path.join(__dirname, '..', 'test-fixtures', 'plugin-a'));
const pluginB = normalize(path.join(__dirname, '..', 'test-fixtures', 'plugin-b'));

const merged = savePlugin([pluginA, pluginB], {
  outputDir: './output',
  pluginName: 'curated'
});

// Verify namespace prefixes applied
// commands/test-plugin-a--build.md
// commands/test-plugin-b--build.md
```
