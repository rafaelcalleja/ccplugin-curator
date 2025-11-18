#!/bin/bash
# SessionEnd hook: Cleanup resources
echo "Cleaning up test-plugin resources..."
rm -rf /tmp/test-plugin-workspace
unset TEST_PLUGIN_READY
