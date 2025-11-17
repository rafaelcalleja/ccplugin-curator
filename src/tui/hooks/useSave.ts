/**
 * Save Operation Hook
 * Implements: docs/spec/003-tui-visual-spec.md (Save Operation section)
 * Implements: docs/spec/007-save-operation-rules.md
 */

import { useState, useCallback } from 'react';
import * as fs from 'fs';
import type { NormalizedPlugin } from '../../types/normalized';
import { saveSelection, mergeSelections } from '../../core/save';

interface UseSaveProps {
  plugins: NormalizedPlugin[];
  selection: Map<string, boolean>;
  outputDir: string;
}

interface SaveResult {
  success: boolean;
  message: string;
}

export function useSave({ plugins, selection, outputDir }: UseSaveProps) {
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [isOverwritePrompt, setIsOverwritePrompt] = useState(false);

  const validateSelection = useCallback((): boolean => {
    let hasSelection = false;
    for (const [_, selected] of selection) {
      if (selected) {
        hasSelection = true;
        break;
      }
    }
    return hasSelection;
  }, [selection]);

  const buildSelectedPlugin = useCallback((): NormalizedPlugin => {
    // Build partial plugins (only selected components from each plugin)
    const partialPlugins: NormalizedPlugin[] = [];

    plugins.forEach((plugin) => {
      const partial: NormalizedPlugin = {
        ...plugin,
        commands: [],
        agents: [],
        skills: [],
        hooks: [],
        mcps: [],
      };

      let hasSelection = false;

      plugin.commands.forEach((cmd, idx) => {
        if (selection.get(`${plugin.name}-command-${idx}`)) {
          partial.commands.push(cmd);
          hasSelection = true;
        }
      });

      plugin.agents.forEach((agent, idx) => {
        if (selection.get(`${plugin.name}-agent-${idx}`)) {
          partial.agents.push(agent);
          hasSelection = true;
        }
      });

      plugin.skills.forEach((skill, idx) => {
        if (selection.get(`${plugin.name}-skill-${idx}`)) {
          partial.skills.push(skill);
          hasSelection = true;
        }
      });

      plugin.hooks.forEach((hook, idx) => {
        if (selection.get(`${plugin.name}-hook-${idx}`)) {
          partial.hooks.push(hook);
          hasSelection = true;
        }
      });

      plugin.mcps.forEach((mcp, idx) => {
        if (selection.get(`${plugin.name}-mcp-${idx}`)) {
          partial.mcps.push(mcp);
          hasSelection = true;
        }
      });

      if (hasSelection) {
        partialPlugins.push(partial);
      }
    });

    // If only one plugin, return it directly
    if (partialPlugins.length === 1) {
      return partialPlugins[0];
    }

    // If multiple plugins, merge them (handles conflicts with namespace prefixes)
    if (partialPlugins.length > 1) {
      return mergeSelections(partialPlugins);
    }

    // Fallback: empty plugin (shouldn't happen due to validation)
    return {
      name: 'curated-plugin',
      version: '0.0.1',
      description: 'Curated plugin from selected components',
      source: outputDir,
      author: { name: '', email: '', url: '' },
      homepage: '',
      repository: '',
      license: 'MIT',
      keywords: [],
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      mcps: [],
    };
  }, [plugins, selection, outputDir]);

  const performSave = useCallback(async (overwrite: boolean = false): Promise<SaveResult> => {
    try {
      // Validate selection
      if (!validateSelection()) {
        return {
          success: false,
          message: '⚠ No hay componentes seleccionados',
        };
      }

      // Check if output directory exists
      if (!overwrite && fs.existsSync(outputDir)) {
        setIsOverwritePrompt(true);
        return {
          success: false,
          message: 'Output directory exists. Overwrite? Press Y to confirm, N to cancel.',
        };
      }

      setIsOverwritePrompt(false);

      // Build selected plugin
      const selectedPlugin = buildSelectedPlugin();

      // Build source mappings for multi-plugin scenarios
      // Track which plugins contributed to the selection
      const sourceMappings: Array<{ pluginName: string; sourceDir: string }> = [];

      plugins.forEach((plugin) => {
        // Check if this plugin has any selected components
        const hasSelection =
          plugin.commands.some((_, idx) => selection.get(`${plugin.name}-command-${idx}`)) ||
          plugin.agents.some((_, idx) => selection.get(`${plugin.name}-agent-${idx}`)) ||
          plugin.skills.some((_, idx) => selection.get(`${plugin.name}-skill-${idx}`)) ||
          plugin.hooks.some((_, idx) => selection.get(`${plugin.name}-hook-${idx}`)) ||
          plugin.mcps.some((_, idx) => selection.get(`${plugin.name}-mcp-${idx}`));

        if (hasSelection) {
          sourceMappings.push({
            pluginName: plugin.name,
            sourceDir: plugin.source,
          });
        }
      });

      // Save (always pass sourceMappings if we have any)
      const result = await saveSelection(selectedPlugin, {
        outputDir,
        pluginName: 'curated-plugin',
        overwrite,
        sourceMappings: sourceMappings.length > 0 ? sourceMappings : undefined,
      });

      if (!result.success) {
        return {
          success: false,
          message: result.message,
        };
      }

      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }, [validateSelection, outputDir, buildSelectedPlugin, plugins, selection]);

  const handleSave = useCallback(async () => {
    const result = await performSave(false);
    setSaveResult(result);
  }, [performSave]);

  const handleOverwriteConfirm = useCallback(async () => {
    const result = await performSave(true);
    setSaveResult(result);
  }, [performSave]);

  const handleOverwriteCancel = useCallback(() => {
    setIsOverwritePrompt(false);
    setSaveResult({
      success: false,
      message: 'Save operation cancelled',
    });
  }, []);

  const clearResult = useCallback(() => {
    setSaveResult(null);
  }, []);

  return {
    handleSave,
    handleOverwriteConfirm,
    handleOverwriteCancel,
    clearResult,
    saveResult,
    isOverwritePrompt,
  };
}
