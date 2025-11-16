/**
 * Save Operation Hook
 * Implements: docs/spec/003-tui-visual-spec.md (Save Operation section)
 * Implements: docs/spec/007-save-operation-rules.md
 */

import { useState, useCallback } from 'react';
import * as fs from 'fs';
import type { NormalizedPlugin } from '../../types/normalized';
import { saveSelection } from '../../core/save';

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
    const result: NormalizedPlugin = {
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

    plugins.forEach((plugin) => {
      plugin.commands.forEach((cmd, idx) => {
        if (selection.get(`${plugin.name}-command-${idx}`)) {
          result.commands.push(cmd);
        }
      });

      plugin.agents.forEach((agent, idx) => {
        if (selection.get(`${plugin.name}-agent-${idx}`)) {
          result.agents.push(agent);
        }
      });

      plugin.skills.forEach((skill, idx) => {
        if (selection.get(`${plugin.name}-skill-${idx}`)) {
          result.skills.push(skill);
        }
      });

      plugin.hooks.forEach((hook, idx) => {
        if (selection.get(`${plugin.name}-hook-${idx}`)) {
          result.hooks.push(hook);
        }
      });

      plugin.mcps.forEach((mcp, idx) => {
        if (selection.get(`${plugin.name}-mcp-${idx}`)) {
          result.mcps.push(mcp);
        }
      });
    });

    return result;
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

      // Save
      const result = await saveSelection(selectedPlugin, {
        outputDir,
        pluginName: 'curated-plugin',
        overwrite,
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
  }, [validateSelection, outputDir, buildSelectedPlugin]);

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
