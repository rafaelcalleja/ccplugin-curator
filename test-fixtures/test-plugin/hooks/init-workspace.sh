#!/bin/bash
# Initialize workspace hook script
# Uses ${CLAUDE_PLUGIN_ROOT} for portable path resolution

echo "Initializing workspace from ${CLAUDE_PLUGIN_ROOT}"
mkdir -p "${CLAUDE_PLUGIN_ROOT}/.workspace"
