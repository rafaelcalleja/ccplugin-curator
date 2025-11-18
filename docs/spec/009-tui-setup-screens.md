---
extends: ../../schemas/base.json
document_covers:
  - visual_design
  - user_interactions
---

# TUI Setup Screens - Visual Specification

## Overview

This document provides visual specifications for the initial setup screens shown before component selection. The setup flow consists of two screens:

1. **Main Menu** - Welcome screen with option to create curated plugin
2. **Configuration Form** - Metadata input with placeholder fields

After configuration, the TUI transitions directly to the component selection interface (three-panel layout for selecting plugin components).

**Terminal Requirements:**
- Minimum width: 120 columns (140+ recommended)
- Minimum height: 30 rows
- Color support: 256 colors preferred
- Font: Monospace required

---

## Screen 1: Main Menu

### Initial State

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                                             │
│                                      ╔═══════════════════════════════════════════════════╗                                  │
│                                      ║                                                   ║                                  │
│                                      ║      CLAUDE MARKETPLACE CURATOR                   ║                                  │
│                                      ║                                                   ║                                  │
│                                      ║      Curate and combine plugin components         ║                                  │
│                                      ║      from multiple sources                        ║                                  │
│                                      ║                                                   ║                                  │
│                                      ╚═══════════════════════════════════════════════════╝                                  │
│                                                                                                                             │
│                                                                                                                             │
│                                                                                                                             │
│                                          ┌─────────────────────────────────────┐                                            │
│                                          │                                     │                                            │
│                                        ► │  Create New Curated Plugin          │                                            │
│                                          │                                     │                                            │
│                                          └─────────────────────────────────────┘                                            │
│                                                                                                                             │
│                                                                                                                             │
│                                          ┌─────────────────────────────────────┐                                            │
│                                          │                                     │                                            │
│                                          │  Exit                               │                                            │
│                                          │                                     │                                            │
│                                          └─────────────────────────────────────┘                                            │
│                                                                                                                             │
│                                                                                                                             │
│                                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
│ ↑↓: Navigate | ENTER: Select | Q: Quit                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen 2: Configuration Form

### Form with Placeholders - Initial State

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE CURATED PLUGIN                                                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                             │
│   ┌─ REQUIRED FIELDS ──────────────────────────────────────────────────────────────────────────────────────────┐           │
│   │                                                                                                              │           │
│   │  Marketplace Name                                                                                            │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │► │ my-marketplace                                                                     │                     │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  Used in package.json name field (lowercase, numbers, hyphens)                                              │           │
│   │                                                                                                              │           │
│   │  Plugin Name                                                                                                 │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │  │ My Awesome Plugin                                                                  │                     │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  Display name for your curated plugin                                                                       │           │
│   │                                                                                                              │           │
│   │  Source Plugin Directory                                                                                     │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │  │ ~/.claude/plugins                                                                  │                     │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  Directory containing source plugins to curate                                                              │           │
│   │                                                                                                              │           │
│   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘           │
│                                                                                                                             │
│   ┌─ OPTIONAL FIELDS ──────────────────────────────────────────────────────────────────────────────────────────┐           │
│   │                                                                                                              │           │
│   │  Output Directory                                                                                            │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │  │ ./output                                                                           │                     │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  Where to save the curated plugin                                                                           │           │
│   │                                                                                                              │           │
│   │  Author Email                                                                                                │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │  │ you@example.com                                                                    │                     │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  Optional email for plugin metadata                                                                         │           │
│   │                                                                                                              │           │
│   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘           │
│                                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
│ ↑↓/TAB: Navigate | Type to edit (placeholder disappears) | ENTER: Continue | ESC: Cancel                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Form with User Input - Typing State

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CREATE CURATED PLUGIN                                                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                             │
│   ┌─ REQUIRED FIELDS ──────────────────────────────────────────────────────────────────────────────────────────┐           │
│   │                                                                                                              │           │
│   │  Marketplace Name                                                                                            │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │  │ personal-ai-tools                                                                  │  ✓                  │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  Used in package.json name field (lowercase, numbers, hyphens)                                              │           │
│   │                                                                                                              │           │
│   │  Plugin Name                                                                                                 │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │► │ My Personal AI Tools█                                                              │  ✓                  │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  Display name for your curated plugin                                                                       │           │
│   │                                                                                                              │           │
│   │  Source Plugin Directory                                                                                     │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │  │ ~/.claude/plugins                                                                  │  ✓                  │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  → Scanning... Found 3 plugins (superclaude, claudekit-skills, example-skills)                              │           │
│   │                                                                                                              │           │
│   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘           │
│                                                                                                                             │
│   ┌─ OPTIONAL FIELDS ──────────────────────────────────────────────────────────────────────────────────────────┐           │
│   │                                                                                                              │           │
│   │  Output Directory                                                                                            │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │  │ ./output/personal-ai-tools                                                         │  ✓                  │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  Where to save the curated plugin (auto-filled from marketplace name)                                       │           │
│   │                                                                                                              │           │
│   │  Author Email                                                                                                │           │
│   │  ┌────────────────────────────────────────────────────────────────────────────────────┐                     │           │
│   │  │ user@example.com                                                                   │  ✓                  │           │
│   │  └────────────────────────────────────────────────────────────────────────────────────┘                     │           │
│   │  Optional email for plugin metadata                                                                         │           │
│   │                                                                                                              │           │
│   └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘           │
│                                                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
│ ENTER: Start Curating → | ESC: Cancel                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## UI Elements Reference

### Placeholder Behavior

```
Empty field:
┌──────────────────┐
│ my-marketplace   │  ← Gray text (placeholder)
└──────────────────┘

User starts typing:
┌──────────────────┐
│ personal█        │  ← Placeholder disappears, cursor shows
└──────────────────┘
```

### Field States

```
Empty:          ┌──────────────┐
                │ placeholder  │  (gray text)
                └──────────────┘

Focused:        ┌──────────────┐
              ► │ placeholder  │  (blue border)
                └──────────────┘

Typing:         ┌──────────────┐
              ► │ text█        │  ✓  (cursor, checkmark when valid)
                └──────────────┘

Invalid:        ┌──────────────┐
                │ Bad Input!   │
                └──────────────┘
                ✗ Error message
```

### Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| Marketplace Name | `^[a-z0-9-]+$` (3-50 chars) | `personal-ai-tools` |
| Plugin Name | Any printable (3-100 chars) | `My Personal AI Tools` |
| Source Directory | Must exist with plugins | `~/.claude/plugins` |
| Output Directory | Parent writable | `./output/my-plugin` |
| Author Email | Valid email (optional) | `user@example.com` |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Navigate fields |
| `TAB` | Next field |
| `SHIFT+TAB` | Previous field |
| `Type` | Edit field (placeholder disappears) |
| `ENTER` | Continue to component selection |
| `ESC` | Cancel and return to main menu |
| `Q` | Quit application |

---

## Color Scheme

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Title Bar           → Bright Cyan / White                               │
│ Section Headers     → Yellow                                            │
│ Field Labels        → White                                             │
│ Placeholders        → Dim Gray                                          │
│ Field Borders       → Gray                                              │
│ Focused Border      → Blue                                              │
│ Valid Checkmark ✓   → Green                                             │
│ Error Cross ✗       → Red                                               │
│ Error Messages      → Red                                               │
│ Help Text           → Dim Gray                                          │
│ Cursor █            → Bright White                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Transition Flow

After configuration form completion:

1. User presses ENTER
2. System validates all required fields
3. System scans source directory for plugins
4. **Transitions to component selection interface** (three-panel layout)
5. Discovered plugins appear in left panel
6. User navigates and selects components to curate