---
name: frontmatter-validator
description: Use this skill when writing or editing markdown files with YAML frontmatter. Validates gate_constraints (single_responsibility, no_cross_references, etc.) and document_covers before writing. Helps decide which file to write to or if a new file should be created based on constraint violations. Always activate before Write or Edit operations on .md files.
---

# Frontmatter Validator

This skill teaches you how to validate frontmatter constraints before writing or editing markdown files.

## Core Workflow

### Before Writing/Editing ANY .md File

Read the schema files in `references/` to understand constraints and allowed values:

- **[document-frontmatter.schema.json](references/document-frontmatter.schema.json)** - All constraint definitions, allowed values, and gate questions
- **[base.json](references/base.json)** - Default configuration for all markdown files
- **[CREATE.md](references/CREATE.md)** - Workflow for generating frontmatter

### When Writing Content

1. **Read the target file** (if it exists) to extract current frontmatter
2. **Analyze your content** - What topic does it cover?
3. **Validate constraints** - For each `gate_constraint` in the frontmatter:
   - Find the constraint definition in [document-frontmatter.schema.json](references/document-frontmatter.schema.json)
   - Answer the `gate_question`
   - Follow the `if_yes` or `if_no` instruction

### Decision Tree

**If content violates any constraint:**
- Find another existing document without that constraint
- OR create a new document with appropriate constraints

**If content is valid:**
- Determine which `document_covers` value(s) match your content
- Check if a document with those covers already exists
- Write to existing document OR create new one

## Key Principles

1. **Read schemas FIRST** - Never assume constraint meanings
2. **Validate BEFORE writing** - Not after
3. **Use your reasoning** - Detect semantic violations, not just syntactic ones
4. **Respect the gates** - If blocked, find another path
5. **Check document_covers** - Content must match declared topics
