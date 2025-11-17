/**
 * Environment variable expansion utilities
 * Implements ${CLAUDE_PLUGIN_ROOT} support per spec 001 line 389
 */

/**
 * Expand ${CLAUDE_PLUGIN_ROOT} to actual plugin directory path
 */
export function expandEnvVars(value: any, pluginRoot: string): any {
  if (typeof value === 'string') {
    return value.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, pluginRoot);
  }

  if (Array.isArray(value)) {
    return value.map((item) => expandEnvVars(item, pluginRoot));
  }

  if (typeof value === 'object' && value !== null) {
    const expanded: any = {};
    for (const [key, val] of Object.entries(value)) {
      expanded[key] = expandEnvVars(val, pluginRoot);
    }
    return expanded;
  }

  return value;
}
