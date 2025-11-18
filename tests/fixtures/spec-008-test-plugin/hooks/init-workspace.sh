#!/usr/bin/env bash
# Initialize Workspace Hook
# Sets up the workspace for the session

echo "Initializing workspace..."
mkdir -p .workspace
touch .workspace/.initialized
echo "Workspace initialized"
