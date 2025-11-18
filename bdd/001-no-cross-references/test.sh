#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="$SCRIPT_DIR/hook.sh"

echo "=== BDD Test: 001-no-cross-references ==="
echo ""

# Make hook executable
chmod +x "$HOOK"

# Test 1: Valid content (no cross-references) should PASS
echo "Test 1: Valid content (should allow write)"
valid_content=$(cat "$SCRIPT_DIR/fixtures/valid.md")
valid_input=$(jq -n \
  --arg path "test.md" \
  --arg content "$valid_content" \
  '{
    tool_name: "Write",
    tool_input: {
      file_path: $path,
      content: $content
    }
  }')

if echo "$valid_input" | "$HOOK" 2>/dev/null; then
  echo "✅ PASS: Valid content allowed"
else
  echo "❌ FAIL: Valid content was blocked (should have been allowed)"
  exit 1
fi

echo ""

# Test 2: Invalid content (has cross-references) should FAIL
echo "Test 2: Invalid content (should block write)"
invalid_content=$(cat "$SCRIPT_DIR/fixtures/invalid.md")
invalid_input=$(jq -n \
  --arg path "test.md" \
  --arg content "$invalid_content" \
  '{
    tool_name: "Write",
    tool_input: {
      file_path: $path,
      content: $content
    }
  }')

if echo "$invalid_input" | "$HOOK" 2>error.log; then
  echo "❌ FAIL: Invalid content was allowed (should have been blocked)"
  exit 1
else
  echo "✅ PASS: Invalid content blocked"
  echo ""
  echo "Error message:"
  cat error.log | sed 's/^/  /'
  rm error.log
fi

echo ""
echo "=== All tests passed ✅ ==="
