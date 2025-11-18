---
name: frontmatter-validator
description: Validate and enforce frontmatter schema constraints when writing or editing markdown files. Ensures content respects gate_constraints and document_covers defined in schemas.
---

# Frontmatter Validator

This skill teaches you how to validate frontmatter constraints before writing or editing markdown files.

## Core Workflow

### Before Writing/Editing ANY .md File

**ALWAYS read these schema files first:**

1. `schemas/document-frontmatter.schema.json` - Contains:
   - All allowed `document_covers` values (lines 20-34)
   - All allowed `gate_constraints` values (lines 45-52)
   - Complete definitions of each constraint with gate_questions (lines 69-107)

2. `schemas/base.json` - Default configuration for all markdown files

3. `schemas/CREATE.md` - Workflow for generating frontmatter

### When Writing Content

1. **Read the target file** (if it exists) to extract current frontmatter
2. **Analyze your content** - What topic does it cover?
3. **Validate constraints** - For each `gate_constraint` in the target file's frontmatter:
   - Find the constraint definition in `document-frontmatter.schema.json` (lines 69-107)
   - Answer the `gate_question`
   - Follow the `if_yes` or `if_no` instruction
   - If constraint is `index_document`: it's an override that allows cross-references

### Decision Tree

Based on validation results:

**If content violates any constraint:**
- Find another existing document without that constraint
- OR create a new document with appropriate constraints

**If content is valid:**
- Determine which `document_covers` value(s) match your content (use enum from schema lines 20-34)
- Check if a document with those covers already exists
- Write to existing document OR create new one

## Constraint Definitions Reference

All constraints are defined in `schemas/document-frontmatter.schema.json:69-107`:

- `single_responsibility` - Document covers exactly ONE topic
- `no_cross_references` - Cannot reference other internal documents
- `no_duplicate_definitions` - Cannot duplicate schema/type definitions
- `no_duplicate_behavior` - Cannot duplicate behavior documented elsewhere
- `self_contained_content` - Must be understandable without reading other docs
- `index_document` - Override that allows cross-references (for index/README files)

## Key Principles

1. **Read schemas FIRST** - Never assume constraint meanings
2. **Validate BEFORE writing** - Not after
3. **Use your reasoning** - Detect semantic violations, not just syntactic ones
4. **Respect the gates** - If blocked, find another path
5. **Check document_covers** - Content must match declared topics
