#!/bin/bash
# Cleanup hook script
# Uses ${CLAUDE_PLUGIN_ROOT} for portable path resolution

echo "Cleaning up from ${CLAUDE_PLUGIN_ROOT}"
rm -rf "${CLAUDE_PLUGIN_ROOT}/.workspace"
