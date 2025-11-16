# TUI Dashboard - Visual Specification

## Overview

This document provides a comprehensive visual reference for the claude-marketplace-builder TUI Dashboard. The interface uses a three-panel layout with real-time preview capabilities, allowing users to navigate, select, and configure plugin components interactively.

**Design Principles:**
- Clean, scannable layout with clear visual hierarchy
- Real-time feedback through synchronized preview panel
- Efficient keyboard navigation (no mouse required)
- Consistent use of Unicode box-drawing characters for borders
- Color-coded elements for quick recognition

**Terminal Requirements:**
- Minimum width: 120 columns (140+ recommended)
- Minimum height: 30 rows
- Color support: 256 colors preferred
- Font: Monospace required

---

## Layout Principal - Three Panel Design

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: personal-ai-infrastructure                                                                              [Tab 1 of 3] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ personal-ai (★)        │ COMMANDS (3)                                     │ {                                                │
│   • 3 commands           │   [ ] analyze-context.md                         │   "commands": [],                                │
│   • 2 agents             │   [ ] optimize-workflow.md                       │   "agents": [],                                  │
│   • 5 hooks              │   [ ] sync-knowledge.md                          │   "skills": [],                                  │
│   • 2 MCPs               │                                                  │   "hooks": [],                                   │
│                          │ AGENTS (2)                                       │   "mcp": {                                       │
│ ▼ superclaude            │   [ ] context-agent                              │     "servers": {}                                │
│   • 25 commands          │   [ ] workflow-agent                             │   }                                              │
│   • 3 skills             │                                                  │ }                                                │
│                          │ HOOKS (5)                                        │                                                  │
│ ▼ claudekit-skills       │   [ ] pre-commit:*.md → validate-docs            │                                                  │
│   • 15 commands          │   [ ] post-commit:* → sync-timestamp             │                                                  │
│   • 8 skills             │   [ ] file-change:config/** → reload-config      │                                                  │
│   • 1 MCP                │   [ ] file-change:**/*.ts → run-tests            │                                                  │
│                          │   [ ] session-start:* → load-context             │                                                  │
│                          │                                                  │                                                  │
│                          │ MCP SERVERS (2)                                  │                                                  │
│                          │   [ ] context-manager                            │                                                  │
│                          │     Commands: 4, Resources: 2                    │                                                  │
│                          │   [ ] knowledge-graph                            │                                                  │
│                          │     Commands: 6, Resources: 3, Prompts: 2        │                                                  │
│                          │                                                  │                                                  │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component States

### Initial State - No Selections

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: personal-ai-infrastructure                                                                              [Tab 1 of 1] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ personal-ai (★)        │ COMMANDS (3)                                     │ {                                                │
│   • 3 commands           │ ► [ ] analyze-context.md                         │   "commands": [],                                │
│   • 2 agents             │   [ ] optimize-workflow.md                       │   "agents": [],                                  │
│   • 5 hooks              │   [ ] sync-knowledge.md                          │   "skills": [],                                  │
│   • 2 MCPs               │                                                  │   "hooks": [],                                   │
│                          │ AGENTS (2)                                       │   "mcp": {                                       │
│                          │   [ ] context-agent                              │     "servers": {}                                │
│                          │   [ ] workflow-agent                             │   }                                              │
│                          │                                                  │ }                                                │
│                          │ HOOKS (5)                                        │                                                  │
│                          │   [ ] pre-commit:*.md → validate-docs            │                                                  │
│                          │   [ ] post-commit:* → sync-timestamp             │                                                  │
│                          │   [ ] file-change:config/** → reload-config      │                                                  │
│                          │   [ ] file-change:**/*.ts → run-tests            │                                                  │
│                          │   [ ] session-start:* → load-context             │                                                  │
│                          │                                                  │                                                  │
│                          │ MCP SERVERS (2)                                  │                                                  │
│                          │   [ ] context-manager                            │                                                  │
│                          │   [ ] knowledge-graph                            │                                                  │
│                          │                                                  │                                                  │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Partial Selections - Some Items Checked

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: personal-ai-infrastructure                                                                              [Tab 1 of 1] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ personal-ai (★)        │ COMMANDS (3)                                     │ {                                                │
│   • 3 commands           │   [✓] analyze-context.md                         │   "commands": [                                  │
│   • 2 agents             │   [ ] optimize-workflow.md                       │     "analyze-context"                            │
│   • 5 hooks              │ ► [✓] sync-knowledge.md                          │   ],                                             │
│   • 2 MCPs               │                                                  │   "agents": [                                    │
│                          │ AGENTS (2)                                       │     "workflow-agent"                             │
│                          │   [ ] context-agent                              │   ],                                             │
│                          │   [✓] workflow-agent                             │   "skills": [],                                  │
│                          │                                                  │   "hooks": [                                     │
│                          │ HOOKS (5)                                        │     "pre-commit:*.md → validate-docs"            │
│                          │   [✓] pre-commit:*.md → validate-docs            │   ],                                             │
│                          │   [ ] post-commit:* → sync-timestamp             │   "mcp": {                                       │
│                          │   [ ] file-change:config/** → reload-config      │     "servers": {}                                │
│                          │   [ ] file-change:**/*.ts → run-tests            │   }                                              │
│                          │   [ ] session-start:* → load-context             │ }                                                │
│                          │                                                  │                                                  │
│                          │ MCP SERVERS (2)                                  │                                                  │
│                          │   [ ] context-manager                            │                                                  │
│                          │   [ ] knowledge-graph                            │                                                  │
│                          │                                                  │                                                  │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### MCP Server Selected - Expanded Details

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: personal-ai-infrastructure                                                                              [Tab 1 of 1] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ personal-ai (★)        │ COMMANDS (3)                                     │ {                                                │
│   • 3 commands           │   [✓] analyze-context.md                         │   "commands": [                                  │
│   • 2 agents             │   [ ] optimize-workflow.md                       │     "analyze-context",                           │
│   • 5 hooks              │   [✓] sync-knowledge.md                          │     "sync-knowledge"                             │
│   • 2 MCPs               │                                                  │   ],                                             │
│                          │ AGENTS (2)                                       │   "agents": [                                    │
│                          │   [ ] context-agent                              │     "workflow-agent"                             │
│                          │   [✓] workflow-agent                             │   ],                                             │
│                          │                                                  │   "skills": [],                                  │
│                          │ HOOKS (5)                                        │   "hooks": [                                     │
│                          │   [✓] pre-commit:*.md → validate-docs            │     "pre-commit:*.md → validate-docs"            │
│                          │   [ ] post-commit:* → sync-timestamp             │   ],                                             │
│                          │   [ ] file-change:config/** → reload-config      │   "mcp": {                                       │
│                          │   [ ] file-change:**/*.ts → run-tests            │     "servers": {                                 │
│                          │   [ ] session-start:* → load-context             │       "knowledge-graph": {                       │
│                          │                                                  │         "command": "node",                       │
│                          │ MCP SERVERS (2)                                  │         "args": ["dist/index.js"],               │
│                          │   [ ] context-manager                            │         "env": {}                                │
│                          │ ► [✓] knowledge-graph                            │       }                                          │
│                          │     Commands: 6, Resources: 3, Prompts: 2        │     }                                            │
│                          │                                                  │   }                                              │
│                          │                                                  │ }                                                │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Examples with Different Content

### Example 1: Minimal Plugin - Commands Only

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: quick-utils                                                                                             [Tab 1 of 1] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ quick-utils (★)        │ COMMANDS (5)                                     │ {                                                │
│   • 5 commands           │ ► [ ] format-code.md                             │   "commands": []                                 │
│                          │   [ ] lint-check.md                              │ }                                                │
│                          │   [ ] test-runner.md                             │                                                  │
│                          │   [ ] build-project.md                           │                                                  │
│                          │   [ ] deploy-staging.md                          │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Example 2: Full Plugin - All Component Types

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: superclaude                                                                                             [Tab 1 of 1] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ superclaude (★)        │ COMMANDS (25)                                    │ {                                                │
│   • 25 commands          │   [✓] agent.md                                   │   "commands": [                                  │
│   • 3 skills             │   [✓] analyze.md                                 │     "agent",                                     │
│   • 2 hooks              │ ► [✓] brainstorm.md                              │     "analyze",                                   │
│                          │   [✓] build.md                                   │     "brainstorm",                                │
│                          │   [✓] cleanup.md                                 │     "build",                                     │
│                          │   [ ] design.md                                  │     "cleanup"                                    │
│                          │   [ ] document.md                                │   ],                                             │
│                          │   [ ] estimate.md                                │   "agents": [],                                  │
│                          │   ... (17 more)                                  │   "skills": [                                    │
│                          │                                                  │     "sequential-thinking",                       │
│                          │ SKILLS (3)                                       │     "code-review"                                │
│                          │   [✓] sequential-thinking.md                     │   ],                                             │
│                          │   [✓] code-review.md                             │   "hooks": [                                     │
│                          │   [ ] research-assistant.md                      │     "pre-commit:* → quality-gate"                │
│                          │                                                  │   ],                                             │
│                          │ HOOKS (2)                                        │   "mcp": {                                       │
│                          │   [✓] pre-commit:* → quality-gate                │     "servers": {}                                │
│                          │   [ ] file-change:**/*.ts → validate-types       │   }                                              │
│                          │                                                  │ }                                                │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Example 3: Multi-Plugin Navigation with Tabs

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: claudekit-skills                                                    [Tab 2 of 3] ◄ TAB / SHIFT+TAB to switch       │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▽ personal-ai            │ COMMANDS (15)                                    │ {                                                │
│   • 3 commands           │   [✓] git-cm.md                                  │   "commands": [                                  │
│   • 2 agents             │   [✓] git-cp.md                                  │     "git-cm",                                    │
│   • 5 hooks              │   [✓] git-pr.md                                  │     "git-cp",                                    │
│   • 2 MCPs               │   [ ] skill-create.md                            │     "git-pr",                                    │
│                          │   [ ] use-mcp.md                                 │     "mcp-builder",                               │
│ ▼ claudekit-skills (★)   │ ► [✓] mcp-builder.md                             │     "repomix"                                    │
│   • 15 commands          │   [✓] repomix.md                                 │   ],                                             │
│   • 8 skills             │   [ ] ai-multimodal.md                           │   "agents": [],                                  │
│   • 1 MCP                │   ... (8 more)                                   │   "skills": [                                    │
│                          │                                                  │     "chrome-devtools",                           │
│ ▽ superclaude            │ SKILLS (8)                                       │     "databases"                                  │
│   • 25 commands          │   [✓] chrome-devtools.md                         │   ],                                             │
│   • 3 skills             │   [✓] databases.md                               │   "hooks": [],                                   │
│                          │   [ ] devops.md                                  │   "mcp": {                                       │
│                          │   [ ] docs-seeker.md                             │     "servers": {                                 │
│                          │   ... (4 more)                                   │       "ai-multimodal": {                         │
│                          │                                                  │         "command": "npx",                        │
│                          │ MCP SERVERS (1)                                  │         "args": ["-y", "ai-multimodal"]          │
│                          │   [✓] ai-multimodal                              │       }                                          │
│                          │     Commands: 12, Resources: 0                   │     }                                            │
│                          │                                                  │   }                                              │
│                          │                                                  │ }                                                │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | TAB: Next Plugin | SHIFT+TAB: Prev Plugin | SPACE: Toggle | S: Save | Q: Quit             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Example 4: Empty Plugin - No Components

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: starter-template                                                                                        [Tab 1 of 1] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ starter-template (★)   │ No components available                          │ {                                                │
│   (empty)                │                                                  │ }                                                │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## UI Elements Reference

### Checkbox States

```
[ ] - Unchecked (item not selected)
[✓] - Checked (item selected)
[▣] - Partially checked (parent with some children selected) [FUTURE]
```

### Cursor Indicators

```
  analyze-context.md           ← Normal item (no focus)
► analyze-context.md           ← Focused item (cursor, shows with blue background in terminal)
[✓] analyze-context.md         ← Selected item (checked)
► [✓] analyze-context.md       ← Focused AND selected
```

### Section Headers

```
COMMANDS (5)                    ← Section with item count
AGENTS (0)                      ← Empty section
MCP SERVERS (2)                 ← Multi-word section
```

### Plugin List Indicators

```
▼ personal-ai (★)               ← Active/expanded plugin (current tab)
  • 3 commands                  ← Component stats (bullet points)
  • 2 agents

▽ superclaude                   ← Inactive/collapsed plugin (other tab)
  • 25 commands

▼ starter-template (★)          ← Active empty plugin
  (empty)
```

### Hook Display Format

```
[ ] pre-commit:*.md → validate-docs              ← Event:pattern → script
[ ] file-change:config/** → reload-config        ← Glob pattern support
[ ] session-start:* → load-context               ← Wildcard patterns
```

### MCP Server Display Format

```
[ ] context-manager                              ← Simple MCP (collapsed)

[ ] knowledge-graph                              ← Expanded MCP with details
    Commands: 6, Resources: 3, Prompts: 2

[✓] ai-multimodal                                ← Selected MCP
    Commands: 12, Resources: 0
```

### Status Bar Elements

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | S: Save | Q: Quit   │
└─────────────────────────────────────────────────────────────────────────┘
     ↑                  ↑              ↑             ↑         ↑
  Navigation      Vertical Nav     Selection      Save      Exit
```

### Color Scheme (Terminal Colors)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header Text          → Bright White / Cyan                              │
│ Panel Borders        → Gray / Dim White                                 │
│ Section Headers      → Yellow / Bright Yellow                           │
│ Normal Text          → White / Default                                  │
│ Cursor Background    → Blue                                             │
│ Cursor Text          → Bright White                                     │
│ Checkmarks [✓]       → Green                                            │
│ Selected Items       → Green tint                                       │
│ Stats/Counts         → Cyan / Blue                                      │
│ JSON Syntax          → Multi-color (keys: cyan, strings: green)         │
│ Inactive Plugins     → Dim Gray                                         │
│ Active Plugin (★)    → Bright with star indicator                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Interaction Flow - Step-by-Step Visual Sequence

### Flow 1: Basic Selection

**Step 1: Initial State**
```
│ COMPONENTS                     │ PREVIEW                          │
│                                │                                  │
│ COMMANDS (3)                   │ {                                │
│ ► [ ] analyze-context.md       │   "commands": []                 │
│   [ ] optimize-workflow.md     │ }                                │
```
*User focus on first command*

**Step 2: User presses SPACE**
```
│ COMPONENTS                     │ PREVIEW                          │
│                                │                                  │
│ COMMANDS (3)                   │ {                                │
│ ► [✓] analyze-context.md       │   "commands": [                  │
│   [ ] optimize-workflow.md     │     "analyze-context"            │
│                                │   ]                              │
│                                │ }                                │
```
*Item selected, preview updates immediately*

**Step 3: User presses ↓**
```
│ COMPONENTS                     │ PREVIEW                          │
│                                │                                  │
│ COMMANDS (3)                   │ {                                │
│   [✓] analyze-context.md       │   "commands": [                  │
│ ► [ ] optimize-workflow.md     │     "analyze-context"            │
│                                │   ]                              │
│                                │ }                                │
```
*Cursor moves down, selection preserved*

**Step 4: User presses SPACE again**
```
│ COMPONENTS                     │ PREVIEW                          │
│                                │                                  │
│ COMMANDS (3)                   │ {                                │
│   [✓] analyze-context.md       │   "commands": [                  │
│ ► [✓] optimize-workflow.md     │     "analyze-context",           │
│                                │     "optimize-workflow"           │
│                                │   ]                              │
│                                │ }                                │
```
*Second item selected, preview shows both*

### Flow 2: MCP Selection with Expansion

**Step 1: Navigate to MCP section**
```
│ COMPONENTS                               │ PREVIEW                    │
│                                          │                            │
│ MCP SERVERS (2)                          │ {                          │
│ ► [ ] context-manager                    │   "mcp": {                 │
│   [ ] knowledge-graph                    │     "servers": {}          │
│                                          │   }                        │
│                                          │ }                          │
```

**Step 2: Select MCP server**
```
│ COMPONENTS                               │ PREVIEW                    │
│                                          │                            │
│ MCP SERVERS (2)                          │ {                          │
│ ► [✓] context-manager                    │   "mcp": {                 │
│     Commands: 4, Resources: 2            │     "servers": {           │
│   [ ] knowledge-graph                    │       "context-manager": { │
│                                          │         "command": "node", │
│                                          │         "args": ["..."]    │
│                                          │       }                    │
│                                          │     }                      │
│                                          │   }                        │
│                                          │ }                          │
```

### Flow 3: Multi-Plugin Tab Switching

**Step 1: On first plugin**
```
│ PLUGIN: personal-ai                      [Tab 1 of 3] │
│                                                        │
│ ▼ personal-ai (★)    │ COMMANDS (3)                    │
│   • 3 commands       │ ► [ ] analyze-context.md        │
│                      │   [ ] optimize-workflow.md      │
```

**Step 2: User presses TAB**
```
│ PLUGIN: claudekit-skills                 [Tab 2 of 3] │
│                                                        │
│ ▽ personal-ai        │ COMMANDS (15)                   │
│   • 3 commands       │ ► [ ] git-cm.md                 │
│ ▼ claudekit (★)      │   [ ] git-cp.md                 │
│   • 15 commands      │                                 │
```
*Switched to second plugin, focus resets to top*

**Step 3: User presses SHIFT+TAB**
```
│ PLUGIN: personal-ai                      [Tab 1 of 3] │
│                                                        │
│ ▼ personal-ai (★)    │ COMMANDS (3)                    │
│   • 3 commands       │ ► [ ] analyze-context.md        │
│                      │   [ ] optimize-workflow.md      │
```
*Back to first plugin*

### Flow 4: Panel Navigation

**Step 1: Focus on center panel (Components)**
```
├─────────────────┬─────────────────────────┬─────────────────┤
│ PLUGINS         │ COMPONENTS              │ PREVIEW         │
│                 │                         │                 │
│ ▼ personal-ai   │ COMMANDS (3)            │ {               │
│                 │ ► [ ] analyze.md        │   "commands": []│
│                 │   [ ] optimize.md       │ }               │
│                 │      ↑                  │                 │
│                 │   CURSOR HERE           │                 │
```

**Step 2: User presses → (Right Arrow)**
```
├─────────────────┬─────────────────────────┬─────────────────┤
│ PLUGINS         │ COMPONENTS              │ PREVIEW         │
│                 │                         │                 │
│ ▼ personal-ai   │ COMMANDS (3)            │ {               │
│                 │   [ ] analyze.md        │ ► "commands": []│
│                 │   [ ] optimize.md       │ }               │
│                 │                         │    ↑            │
│                 │                         │ CURSOR HERE     │
```
*Focus moves to preview panel (read-only navigation)*

**Step 3: User presses ← (Left Arrow)**
```
├─────────────────┬─────────────────────────┬─────────────────┤
│ PLUGINS         │ COMPONENTS              │ PREVIEW         │
│                 │                         │                 │
│ ▼ personal-ai   │ COMMANDS (3)            │ {               │
│ ► • 3 commands  │   [ ] analyze.md        │   "commands": []│
│   • 2 agents    │   [ ] optimize.md       │ }               │
│    ↑            │                         │                 │
│ CURSOR HERE     │                         │                 │
```
*Focus moves to plugins panel (for future multi-plugin selection)*

---

## Real-World Plugin Examples

### Example: personal-ai-infrastructure (Full Featured)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: personal-ai-infrastructure                                                                              [Tab 1 of 1] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ personal-ai (★)        │ COMMANDS (3)                                     │ {                                                │
│   • 3 commands           │   [✓] analyze-context.md                         │   "commands": [                                  │
│   • 2 agents             │   [✓] optimize-workflow.md                       │     "analyze-context",                           │
│   • 5 hooks              │   [✓] sync-knowledge.md                          │     "optimize-workflow",                         │
│   • 2 MCPs               │                                                  │     "sync-knowledge"                             │
│                          │ AGENTS (2)                                       │   ],                                             │
│                          │   [✓] context-agent                              │   "agents": [                                    │
│                          │   [✓] workflow-agent                             │     "context-agent",                             │
│                          │                                                  │     "workflow-agent"                             │
│                          │ HOOKS (5)                                        │   ],                                             │
│                          │   [✓] pre-commit:*.md → validate-docs            │   "skills": [],                                  │
│                          │   [✓] post-commit:* → sync-timestamp             │   "hooks": [                                     │
│                          │   [✓] file-change:config/** → reload-config      │     "pre-commit:*.md → validate-docs",           │
│                          │   [✓] file-change:**/*.ts → run-tests            │     "post-commit:* → sync-timestamp",            │
│                          │ ► [✓] session-start:* → load-context             │     "file-change:config/** → reload-config",     │
│                          │                                                  │     "file-change:**/*.ts → run-tests",           │
│                          │ MCP SERVERS (2)                                  │     "session-start:* → load-context"             │
│                          │   [✓] context-manager                            │   ],                                             │
│                          │     Commands: 4, Resources: 2                    │   "mcp": {                                       │
│                          │   [✓] knowledge-graph                            │     "servers": {                                 │
│                          │     Commands: 6, Resources: 3, Prompts: 2        │       "context-manager": {                       │
│                          │                                                  │         "command": "node",                       │
│                          │                                                  │         "args": ["dist/context.js"]              │
│                          │                                                  │       },                                         │
│                          │                                                  │       "knowledge-graph": {                       │
│                          │                                                  │         "command": "node",                       │
│                          │                                                  │         "args": ["dist/graph.js"]                │
│                          │                                                  │       }                                          │
│                          │                                                  │     }                                            │
│                          │                                                  │   }                                              │
│                          │                                                  │ }                                                │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Example: superclaude (Skills Heavy)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: superclaude                                                                                             [Tab 1 of 1] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ superclaude (★)        │ COMMANDS (25)                                    │ {                                                │
│   • 25 commands          │   [ ] agent.md                                   │   "commands": [],                                │
│   • 3 skills             │   [ ] analyze.md                                 │   "agents": [],                                  │
│   • 2 hooks              │   [ ] brainstorm.md                              │   "skills": [                                    │
│                          │   ... (22 more)                                  │     "sequential-thinking",                       │
│                          │                                                  │     "code-review",                               │
│                          │ SKILLS (3)                                       │     "research-assistant"                         │
│                          │   [✓] sequential-thinking.md                     │   ],                                             │
│                          │   [✓] code-review.md                             │   "hooks": [],                                   │
│                          │ ► [✓] research-assistant.md                      │   "mcp": {                                       │
│                          │                                                  │     "servers": {}                                │
│                          │ HOOKS (2)                                        │   }                                              │
│                          │   [ ] pre-commit:* → quality-gate                │ }                                                │
│                          │   [ ] file-change:**/*.ts → validate-types       │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
│                          │                                                  │                                                  │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Example: claudekit-skills (Commands & MCP)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLUGIN: claudekit-skills                                                                                        [Tab 1 of 1] │
├──────────────────────────┬──────────────────────────────────────────────────┬──────────────────────────────────────────────────┤
│ PLUGINS                  │ COMPONENTS                                       │ PREVIEW                                          │
│                          │                                                  │                                                  │
│ ▼ claudekit-skills (★)   │ COMMANDS (15)                                    │ {                                                │
│   • 15 commands          │   [✓] git-cm.md                                  │   "commands": [                                  │
│   • 8 skills             │   [✓] git-cp.md                                  │     "git-cm",                                    │
│   • 1 MCP                │   [✓] git-pr.md                                  │     "git-cp",                                    │
│                          │   [ ] skill-create.md                            │     "git-pr"                                     │
│                          │   [ ] use-mcp.md                                 │   ],                                             │
│                          │   ... (10 more)                                  │   "agents": [],                                  │
│                          │                                                  │   "skills": [],                                  │
│                          │ SKILLS (8)                                       │   "hooks": [],                                   │
│                          │   [ ] chrome-devtools.md                         │   "mcp": {                                       │
│                          │   [ ] databases.md                               │     "servers": {}                                │
│                          │   [ ] devops.md                                  │   }                                              │
│                          │   ... (5 more)                                   │ }                                                │
│                          │                                                  │                                                  │
│                          │ MCP SERVERS (1)                                  │                                                  │
│                          │ ► [ ] ai-multimodal                              │                                                  │
│                          │     Commands: 12, Resources: 0                   │                                                  │
│                          │                                                  │                                                  │
└──────────────────────────┴──────────────────────────────────────────────────┴──────────────────────────────────────────────────┘
│ ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


---

## Box Drawing Characters Reference

This section defines the Unicode box-drawing characters used throughout the TUI. These characters ensure consistent visual appearance across terminals.

### Border Styles

```
┌─┬┐  ╔═╦╗  ╭─┬╮  ┏━┳┓
│ ││  ║ ║║  │ ││  ┃ ┃┃
├─┼┤  ╠═╬╣  ├─┼┤  ┣━╋┫
└─┴┘  ╚═╩╝  ╰─┴╯  ┗━┻┛

Light:   ─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼  ← Primary style used in TUI
Heavy:   ━ ┃ ┏ ┓ ┗ ┛ ┣ ┫ ┳ ┻ ╋
Double:  ═ ║ ╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬
Rounded: ─ │ ╭ ╮ ╰ ╯
```

### Symbols Used

```
Arrows:     ← → ↑ ↓ ↔ ↕
Triangles:  ▼ ▽ ► ▶ ◀ ◄
Bullets:    • ● ○
Checkmarks: ✓ ✔ ✗ ✘
Special:    … ⋯ ★ ☆
```

### Usage in TUI

| Character | Usage | Example |
|-----------|-------|---------|
| `─` `│` `┌` `┐` `└` `┘` `├` `┤` `┬` `┴` | Panel borders | Main layout structure |
| `▼` | Expanded/active plugin | `▼ personal-ai (★)` |
| `▽` | Collapsed/inactive plugin | `▽ superclaude` |
| `►` | Cursor/focus indicator | `► [ ] analyze.md` |
| `•` | Bullet point | `• 3 commands` |
| `✓` | Selected checkbox | `[✓]` |
| `★` | Active tab indicator | `personal-ai (★)` |
| `→` | Hook action separator | `pre-commit:*.md → validate` |
