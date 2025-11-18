#!/usr/bin/env bash
# UserPromptSubmit Hook: Auto-activate frontmatter-validator skill
# Triggers when working with markdown files

set -euo pipefail

# Get the project root (where .claude directory is)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SKILL_RULES="$PROJECT_ROOT/.claude/skills/skill-rules.json"

# Exit successfully if skill-rules.json doesn't exist
if [[ ! -f "$SKILL_RULES" ]]; then
    exit 0
fi

# Read user input from stdin (the prompt)
USER_PROMPT=$(cat)

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
    # Fallback: simple pattern matching without jq
    if echo "$USER_PROMPT" | grep -qiE '\.(md|markdown)|frontmatter|document_covers|gate_constraint'; then
        echo '{"decision": "allow", "addToContext": "⚠️ Recuerda validar las restricciones del frontmatter antes de escribir en archivos markdown. Usa la skill frontmatter-validator."}'
    fi
    exit 0
fi

# Parse skill rules and check for trigger patterns
MATCHED_SKILL=$(jq -r --arg prompt "$USER_PROMPT" '
  .skills[] |
  select(
    (.triggers.keywords[] | test($prompt; "i")) or
    ($prompt | test("\\.(md|markdown)"; "i"))
  ) |
  .name
' "$SKILL_RULES" | head -n1)

# If a skill matched, suggest activation
if [[ -n "$MATCHED_SKILL" ]]; then
    ACTIVATION_MSG=$(jq -r --arg name "$MATCHED_SKILL" '
      .skills[] |
      select(.name == $name) |
      .activationMessage
    ' "$SKILL_RULES")

    echo "{\"decision\": \"allow\", \"addToContext\": \"$ACTIVATION_MSG\"}"
else
    # Check recent file context (last tool use)
    # This is a simple heuristic - in production you'd parse the full context
    if [[ -f "$PROJECT_ROOT/.claude/.last_file_context" ]]; then
        LAST_FILE=$(cat "$PROJECT_ROOT/.claude/.last_file_context")
        if [[ "$LAST_FILE" =~ \.md$ ]]; then
            echo '{"decision": "allow", "addToContext": "💡 Estás trabajando con archivos markdown. Considera usar la skill frontmatter-validator para validar las restricciones."}'
            exit 0
        fi
    fi
fi

exit 0
