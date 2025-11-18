#!/bin/bash

# PreToolUse Write/Edit hook for validating no_cross_references constraint

# Read hook input from stdin
input=$(cat)

# Extract file_path and content
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')
content=$(echo "$input" | jq -r '.tool_input.content // empty')

# Only process .md files
[[ "$file_path" != *.md ]] && exit 0

# Extract frontmatter (between first and second ---)
frontmatter=$(echo "$content" | awk '
  BEGIN { in_fm=0; count=0 }
  /^---$/ {
    count++
    if (count == 1) { in_fm=1; next }
    if (count == 2) { exit }
  }
  in_fm { print }
')

# Check if frontmatter exists
if [[ -z "$frontmatter" ]]; then
  echo "❌ Error: Markdown file must have frontmatter" >&2
  exit 1
fi

# Check if no_cross_references constraint is present
if ! echo "$frontmatter" | grep -q "no_cross_references"; then
  # Constraint not active, allow write
  exit 0
fi

# Extract content (after frontmatter)
doc_content=$(echo "$content" | awk '
  BEGIN { count=0; started=0 }
  /^---$/ {
    count++
    if (count == 2) { started=1; next }
    next
  }
  started { print }
')

# Detect cross-references using patterns
cross_refs=$(echo "$doc_content" | grep -E '\[.*\]\(.*\.md\)|See [0-9]{3}-.*\.md|\.\.\/.*\.md|[0-9]{3}-[^.]*\.md' || true)

if [[ -n "$cross_refs" ]]; then
  echo "❌ Validation failed: no_cross_references violation" >&2
  echo "" >&2
  echo "This document has gate_constraint: no_cross_references" >&2
  echo "Found references to internal documents:" >&2
  echo "" >&2
  echo "$cross_refs" | sed 's/^/  /' >&2
  echo "" >&2
  echo "Cross-references are not allowed in this document." >&2
  exit 1
fi

# No violations found, allow write
exit 0
