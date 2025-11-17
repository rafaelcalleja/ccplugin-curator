# Integration Test Specification

**Version**: 1.0.0
**Last Updated**: 2025-11-15
**Purpose**: Define end-to-end integration test validating complete workflow with a comprehensive test plugin

---

## 1. Test Plugin Structure

```
test-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── analyze.md
│   ├── optimize.md
│   └── nested/
│       └── deep-cmd.md
├── agents/
│   ├── reviewer.md
│   └── context-agent.md
├── skills/
│   ├── skill-alpha/
│   │   ├── SKILL.md
│   │   └── helpers.ts
│   ├── skill-beta/
│   │   └── SKILL.md
│   └── skill-gamma/
│       └── SKILL.md
├── hooks/
│   ├── hooks.json
│   ├── setup-env.sh           ← Hook script (executable)
│   ├── init-workspace.sh      ← Hook script (executable)
│   ├── security-check.sh      ← Hook script (executable)
│   └── cleanup.sh             ← Hook script (executable)
└── .mcp.json
```

### plugin.json

```json
{
  "name": "test-plugin",
  "version": "1.2.3",
  "description": "Comprehensive test plugin",
  "author": {
    "name": "Test Author",
    "email": "test@example.com",
    "url": "https://example.com"
  },
  "homepage": "https://example.com/test-plugin",
  "repository": "https://github.com/test/test-plugin",
  "license": "MIT",
  "keywords": ["testing", "integration"],
  "commands": "./commands",
  "agents": ["./agents/reviewer.md", "./agents/context-agent.md"],
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json",
  "mcpServers": "./.mcp.json"
}
```

### hooks/hooks.json

```json
{
  "SessionStart": [
    {
      "hooks": [
        { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/setup-env.sh" },
        { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/init-workspace.sh" }
      ]
    }
  ],
  "PostToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/security-check.sh" }
      ]
    },
    {
      "matcher": "Write",
      "hooks": [
        { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/cleanup.sh" }
      ]
    }
  ]
}
```

### .mcp.json

```json
{
  "tavily": {
    "command": "npx",
    "args": ["-y", "@tavily/mcp-server"],
    "env": { "TAVILY_API_KEY": "${TAVILY_API_KEY}" }
  },
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"],
    "env": {}
  },
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": { "GITHUB_TOKEN": "${GITHUB_TOKEN}" }
  }
}
```

---

## 2. Integration Test (BDD)

```gherkin
Feature: Complete plugin curation workflow
  As a user
  I want to curate components from a complex plugin
  So that I can create a custom plugin with selected features

Background:
  Given test-plugin exists in "./test-fixtures/test-plugin"
  And test-plugin contains:
    | Component | Count |
    | Commands  | 3     |
    | Agents    | 2     |
    | Skills    | 3     |
    | Hooks     | 4     |
    | MCPs      | 3     |

Scenario: Full workflow - Load, select, save, verify
  When I execute "app select ./test-fixtures/test-plugin"
  Then TUI displays with 3 panels
  And PLUGINS panel shows "test-plugin"
  And COMPONENTS panel shows 15 items total
  And PREVIEW panel is empty

  When I navigate to COMPONENTS panel
  And I select:
    | Component Type | Item |
    | Command        | analyze.md |
    | Agent          | reviewer.md |
    | Skill          | skill-alpha |
    | Hook           | SessionStart: /setup-env.sh |
    | MCP            | tavily |
  Then PREVIEW panel shows 5 items selected

  When I press S (Save)
  Then I see success message with installation instructions
  And TUI remains open

  # VERIFY OUTPUT FILES
  And file "./output/curated-plugin/.claude-plugin/marketplace.json" exists
  And file "./output/curated-plugin/plugins/curated-plugin/.claude-plugin/plugin.json" exists
  And file "./output/curated-plugin/normalized-plugin.json" exists

  # VERIFY MARKETPLACE FORMAT
  And marketplace.json is valid JSON
  And marketplace.json contains plugin "curated-plugin"
  And marketplace.json source points to "./plugins/curated-plugin"

  # VERIFY OFFICIAL FORMAT (plugin.json)
  And plugin.json is valid JSON
  And plugin.json contains:
    | Field       | Value |
    | name        | "test-plugin" |
    | version     | "1.2.3" |
    | description | "Comprehensive test plugin" |
  And plugin.json has field "commands" with 1 item
  And plugin.json has field "agents" with 1 item
  And plugin.json has field "skills" with 1 item
  And plugin.json has field "hooks" as object with key "SessionStart"
  And plugin.json has field "mcpServers" as object with key "tavily"

  # VERIFY FILES COPIED
  And file "./output/curated-plugin/plugins/curated-plugin/commands/analyze.md" exists
  And file "./output/curated-plugin/plugins/curated-plugin/agents/reviewer.md" exists
  And directory "./output/curated-plugin/plugins/curated-plugin/skills/skill-alpha" exists
  And file "./output/curated-plugin/plugins/curated-plugin/skills/skill-alpha/SKILL.md" exists
  And file "./output/curated-plugin/plugins/curated-plugin/hooks/setup-env.sh" exists
  And file "./output/curated-plugin/plugins/curated-plugin/hooks/setup-env.sh" is executable

  # VERIFY PLUGIN IS USABLE
  And can install with "/plugin marketplace add ./output/curated-plugin"
  And can install plugin with "/plugin install curated-plugin"

Scenario: Multi-plugin selection with conflict resolution
  Given test-plugin-a exists in "./test-fixtures/test-plugin-a" with:
    | Component | Path |
    | Command   | commands/build.md |
    | Command   | commands/deploy.md |
    | Agent     | agents/reviewer.md |
    | Skill     | skills/chrome-devtools/SKILL.md |
    | Hook      | SessionStart → /setup-a.sh |
    | MCP       | tavily (command: "npx", env: {"KEY": "A"}) |

  And test-plugin-b exists in "./test-fixtures/test-plugin-b" with:
    | Component | Path |
    | Command   | commands/build.md          ← CONFLICT: same name |
    | Command   | commands/test.md |
    | Agent     | agents/reviewer.md         ← CONFLICT: same name |
    | Skill     | skills/chrome-devtools/    ← CONFLICT: same directory |
    | Hook      | SessionStart → /setup-b.sh ← MERGE: same event |
    | MCP       | tavily (command: "npx", env: {"KEY": "B"}) ← CONFLICT: same name |

  When I execute "app select ./test-fixtures"
  Then TUI displays with 3 panels
  And PLUGINS panel shows "test-plugin-a" and "test-plugin-b"

  When I select ALL components from test-plugin-a
  And I select ALL components from test-plugin-b
  Then PREVIEW panel shows:
    - 4 commands (2 + 2)
    - 2 agents (1 + 1)
    - 2 skills (1 + 1)
    - 2 hooks merged into 1 event
    - 2 MCPs (1 + 1)

  When I press S (Save)
  Then I see success message
  And TUI remains open

  # VERIFY COMMANDS - namespace prefix applied
  And file "./output/curated-plugin/plugins/curated-plugin/commands/test-plugin-a--build.md" exists
  And file "./output/curated-plugin/plugins/curated-plugin/commands/test-plugin-b--build.md" exists
  And file "./output/curated-plugin/plugins/curated-plugin/commands/test-plugin-a--deploy.md" exists
  And file "./output/curated-plugin/plugins/curated-plugin/commands/test-plugin-b--test.md" exists

  # VERIFY AGENTS - namespace prefix applied
  And file "./output/curated-plugin/plugins/curated-plugin/agents/test-plugin-a--reviewer.md" exists
  And file "./output/curated-plugin/plugins/curated-plugin/agents/test-plugin-b--reviewer.md" exists

  # VERIFY SKILLS - namespace prefix applied to directory
  And directory "./output/curated-plugin/plugins/curated-plugin/skills/test-plugin-a--chrome-devtools" exists
  And file "./output/curated-plugin/plugins/curated-plugin/skills/test-plugin-a--chrome-devtools/SKILL.md" exists
  And directory "./output/curated-plugin/plugins/curated-plugin/skills/test-plugin-b--chrome-devtools" exists
  And file "./output/curated-plugin/plugins/curated-plugin/skills/test-plugin-b--chrome-devtools/SKILL.md" exists

  # VERIFY HOOK SCRIPTS - copied (no namespace needed, different names)
  And file "./output/curated-plugin/plugins/curated-plugin/hooks/setup-a.sh" exists
  And file "./output/curated-plugin/plugins/curated-plugin/hooks/setup-a.sh" is executable
  And file "./output/curated-plugin/plugins/curated-plugin/hooks/setup-b.sh" exists
  And file "./output/curated-plugin/plugins/curated-plugin/hooks/setup-b.sh" is executable

  # VERIFY OFFICIAL FORMAT (plugin.json)
  And plugin.json is valid JSON
  And plugin.json contains:
    ```json
    {
      "name": "curated-plugin",
      "commands": [
        "./commands/test-plugin-a--build.md",
        "./commands/test-plugin-a--deploy.md",
        "./commands/test-plugin-b--build.md",
        "./commands/test-plugin-b--test.md"
      ],
      "agents": [
        "./agents/test-plugin-a--reviewer.md",
        "./agents/test-plugin-b--reviewer.md"
      ],
      "skills": [
        "./skills/test-plugin-a--chrome-devtools",
        "./skills/test-plugin-b--chrome-devtools"
      ],
      "hooks": {
        "SessionStart": [
          {
            "hooks": [
              { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/setup-a.sh" },
              { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/setup-b.sh" }
            ]
          }
        ]
      },
      "mcpServers": {
        "test-plugin-a--tavily": {
          "command": "npx",
          "env": { "KEY": "A" }
        },
        "test-plugin-b--tavily": {
          "command": "npx",
          "env": { "KEY": "B" }
        }
      }
    }
    ```

  # VERIFY PLUGIN IS USABLE
  And can install with "/plugin marketplace add ./output/curated-plugin"
  And can install plugin with "/plugin install curated-plugin"
```

---

## 3. Edge Cases

```gherkin
Scenario: Save with no selection
  Given TUI is open
  And no components are selected
  When I press S (Save)
  Then I see warning "⚠ No hay componentes seleccionados"
  And no files are created

Scenario: Output directory already exists
  Given "./output/curated-plugin/" already exists
  When I press S (Save)
  Then I see prompt "Output directory exists. Overwrite? [Y/n]"
  When I press Y
  Then old directory is deleted
  And new files are created

Scenario: Select from multiple plugins
  Given multiple plugins loaded
  When I select components from plugin A
  And I select components from plugin B
  And I press S (Save)
  Then output contains components from both plugins
  And plugin.json merges all selections

Scenario: Plugin with missing files
  Given plugin.json references "./commands/missing.md"
  But file does not exist
  When I press S (Save)
  Then I see error "Command file not found: ./commands/missing.md"
  And save operation is cancelled
```

---

## 4. Validation Scenarios

```gherkin
Scenario Outline: Different path formats produce same result
  Given plugin.json with <component> = <path_format>
  When I load the plugin
  Then COMPONENTS panel shows <expected_count> items

  Examples:
    | component | path_format          | expected_count |
    | commands  | "./commands"         | 3              |
    | commands  | ["./commands/*.md"]  | 3              |
    | agents    | "./agents/"          | 2              |
    | skills    | "./skills/"          | 3              |

Scenario: Empty components are handled correctly
  Given plugin.json with no commands, agents, or skills defined
  When I load the plugin
  Then COMPONENTS panel shows only hooks and MCPs
  When I press S (Save)
  Then plugin.json omits empty component fields

Scenario: Hooks transform correctly
  Given plugin has 2 hooks for "SessionStart" event
  When I select both hooks
  And I press S (Save)
  Then plugin.json has:
    ```json
    {
      "hooks": {
        "SessionStart": [
          {
            "hooks": [
              { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/setup-env.sh" },
              { "type": "command", "command": "${CLAUDE_PLUGIN_ROOT}/hooks/init-workspace.sh" }
            ]
          }
        ]
      }
    }
    ```
  And hook script files are copied with executable permissions
  And "./output/curated-plugin/plugins/curated-plugin/hooks/setup-env.sh" has permissions 0o755
  And "./output/curated-plugin/plugins/curated-plugin/hooks/init-workspace.sh" has permissions 0o755

Scenario: MCPs transform correctly
  Given plugin has 3 MCPs
  When I select "tavily" MCP
  And I press S (Save)
  Then plugin.json has:
    ```json
    {
      "mcpServers": {
        "tavily": {
          "command": "npx",
          "args": ["-y", "@tavily/mcp-server"],
          "env": { "TAVILY_API_KEY": "${TAVILY_API_KEY}" }
        }
      }
    }
    ```

Scenario: Default values are omitted
  Given I create a minimal selection
  When I press S (Save)
  Then plugin.json does NOT contain:
    - version: "0.0.0" (if not changed)
    - description: "" (if empty)
    - empty arrays
    - empty objects
```

---

## 5. Test Execution

### Setup

```bash
# Create test fixture
npm run test:setup-fixtures

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:integration -- --coverage
```

### Test Structure

```typescript
describe('Integration Test Suite', () => {
  beforeAll(async () => {
    await setupTestPlugin();
  });

  test('Full workflow: load → select → save → verify', async () => {
    // Execute BDD scenario
    // Verify all assertions
  });

  afterAll(async () => {
    await cleanupTestPlugin();
  });
});
```

---

## 6. Success Criteria

### Must Pass
- ✅ Can load test-plugin without errors
- ✅ All 15 components visible in TUI
- ✅ Selection works correctly
- ✅ Save generates both output files
- ✅ Official plugin.json is valid
- ✅ All selected files copied to output
- ✅ Output plugin can be loaded by Claude Code

### Quality Gates
- ✅ No crashes or unhandled errors
- ✅ Clear error messages for invalid states
- ✅ All edge cases handled gracefully

---

## 7. Coverage Matrix

| Spec Document | Test Coverage |
|---------------|---------------|
| 001-normalization-protocol.md | Path resolution, auto-discovery, defaults |
| 002-plugin-format-spec.md | Output validation |
| 004-user-workflows.md | Load → Select → Save flow |
| 005-transformation-rules.md | Input normalization |
| 006-reverse-transformation-rules.md | Output transformation |
| 007-save-operation-rules.md | Dual output, file copying |