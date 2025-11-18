import { NormalizedPluginConfiguration } from '../types/normalized';

/**
 * Namespace conflict resolution
 *
 * Implements conflict resolution rules from Spec 007:
 * - Detect filename conflicts across plugins
 * - Apply plugin-name-- prefix to conflicting files
 * - Update paths in configuration
 * - Merge hooks with same event
 */

/**
 * Resolve namespace conflicts in merged plugin
 *
 * @param merged - Merged normalized plugin
 * @param sourcePlugins - Map of original source plugins
 * @returns Resolved plugin with namespace prefixes applied
 */
export async function resolveConflicts(
  merged: NormalizedPluginConfiguration,
  sourcePlugins: Map<string, NormalizedPluginConfiguration>
): Promise<NormalizedPluginConfiguration> {
  const resolved: NormalizedPluginConfiguration = { ...merged };

  // Track which files come from which plugins
  const commandSources = new Map<string, string>(); // path -> plugin name
  const agentSources = new Map<string, string>();
  const skillSources = new Map<string, string>();
  const mcpSources = new Map<string, string>(); // name -> plugin name

  // Build source tracking
  for (const [pluginName, plugin] of sourcePlugins) {
    for (const cmd of plugin.commands) {
      if (merged.commands.includes(cmd)) {
        const existingPlugin = commandSources.get(cmd);
        if (existingPlugin && existingPlugin !== pluginName) {
          // Conflict detected
          commandSources.set(cmd, 'CONFLICT');
        } else {
          commandSources.set(cmd, pluginName);
        }
      }
    }

    for (const agent of plugin.agents) {
      if (merged.agents.includes(agent)) {
        const existingPlugin = agentSources.get(agent);
        if (existingPlugin && existingPlugin !== pluginName) {
          agentSources.set(agent, 'CONFLICT');
        } else {
          agentSources.set(agent, pluginName);
        }
      }
    }

    for (const skill of plugin.skills) {
      if (merged.skills.includes(skill)) {
        const existingPlugin = skillSources.get(skill);
        if (existingPlugin && existingPlugin !== pluginName) {
          skillSources.set(skill, 'CONFLICT');
        } else {
          skillSources.set(skill, pluginName);
        }
      }
    }

    for (const mcp of plugin.mcps) {
      if (merged.mcps.some(m => m.name === mcp.name)) {
        const existingPlugin = mcpSources.get(mcp.name);
        if (existingPlugin && existingPlugin !== pluginName) {
          mcpSources.set(mcp.name, 'CONFLICT');
        } else {
          mcpSources.set(mcp.name, pluginName);
        }
      }
    }
  }

  // Resolve command conflicts
  const commandOccurrences = new Map<string, number>(); // Track which occurrence of each path
  resolved.commands = merged.commands.map(cmd => {
    const source = commandSources.get(cmd);
    if (source === 'CONFLICT') {
      // Track occurrence index for this path
      const currentOccurrence = commandOccurrences.get(cmd) || 0;
      commandOccurrences.set(cmd, currentOccurrence + 1);

      // Find which plugin this specific instance came from
      let occurrenceIndex = 0;
      for (const [pluginName, plugin] of sourcePlugins) {
        if (plugin.commands.includes(cmd)) {
          if (occurrenceIndex === currentOccurrence) {
            return applyNamespacePrefix(cmd, pluginName);
          }
          occurrenceIndex++;
        }
      }
    }
    return cmd;
  });

  // Resolve agent conflicts
  const agentOccurrences = new Map<string, number>();
  resolved.agents = merged.agents.map(agent => {
    const source = agentSources.get(agent);
    if (source === 'CONFLICT') {
      const currentOccurrence = agentOccurrences.get(agent) || 0;
      agentOccurrences.set(agent, currentOccurrence + 1);

      let occurrenceIndex = 0;
      for (const [pluginName, plugin] of sourcePlugins) {
        if (plugin.agents.includes(agent)) {
          if (occurrenceIndex === currentOccurrence) {
            return applyNamespacePrefix(agent, pluginName);
          }
          occurrenceIndex++;
        }
      }
    }
    return agent;
  });

  // Resolve skill conflicts
  const skillOccurrences = new Map<string, number>();
  resolved.skills = merged.skills.map(skill => {
    const source = skillSources.get(skill);
    if (source === 'CONFLICT') {
      const currentOccurrence = skillOccurrences.get(skill) || 0;
      skillOccurrences.set(skill, currentOccurrence + 1);

      let occurrenceIndex = 0;
      for (const [pluginName, plugin] of sourcePlugins) {
        if (plugin.skills.includes(skill)) {
          if (occurrenceIndex === currentOccurrence) {
            return applyNamespacePrefix(skill, pluginName);
          }
          occurrenceIndex++;
        }
      }
    }
    return skill;
  });

  // Resolve MCP conflicts (apply prefix to name field)
  const mcpOccurrences = new Map<string, number>();
  resolved.mcps = merged.mcps.map(mcp => {
    const source = mcpSources.get(mcp.name);
    if (source === 'CONFLICT') {
      const currentOccurrence = mcpOccurrences.get(mcp.name) || 0;
      mcpOccurrences.set(mcp.name, currentOccurrence + 1);

      let occurrenceIndex = 0;
      for (const [pluginName, plugin] of sourcePlugins) {
        if (plugin.mcps.some(m => m.name === mcp.name)) {
          if (occurrenceIndex === currentOccurrence) {
            return {
              ...mcp,
              name: `${pluginName}--${mcp.name}`
            };
          }
          occurrenceIndex++;
        }
      }
    }
    return mcp;
  });

  // Hooks are merged (same event hooks from different plugins are combined)
  // No conflict resolution needed - they naturally merge

  return resolved;
}

/**
 * Apply namespace prefix to a file path
 *
 * Examples:
 * - commands/foo.md + plugin-a -> commands/plugin-a--foo.md
 * - skills/bar + plugin-b -> skills/plugin-b--bar
 *
 * @param filePath - Original file path
 * @param pluginName - Plugin name to use as prefix
 * @returns Namespaced path
 */
function applyNamespacePrefix(filePath: string, pluginName: string): string {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  const directory = parts.slice(0, -1).join('/');

  const namespacedName = `${pluginName}--${fileName}`;

  if (directory) {
    return `${directory}/${namespacedName}`;
  }
  return namespacedName;
}
