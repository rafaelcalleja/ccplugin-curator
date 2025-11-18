#!/bin/bash
# ToolUse:Write hook: Security check before writing files
echo "Running security check..."
# Check if file path is safe
if [[ "$1" == *".."* ]]; then
  echo "Error: Path traversal detected"
  exit 1
fi
exit 0
