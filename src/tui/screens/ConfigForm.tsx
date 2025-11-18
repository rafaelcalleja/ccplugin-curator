/**
 * Configuration Form Screen
 *
 * Form for collecting plugin configuration before launching TUI.
 * Includes validation, placeholders, auto-fill, and directory scanning.
 *
 * Spec: docs/spec/009-tui-setup-screens.md (Section 2)
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { useInput } from 'ink';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { scanPlugins } from '../../core/plugin-loader.js';

export interface ConfigFormData {
  marketplaceName: string;
  pluginName: string;
  sourceDirectory: string;
  outputDirectory: string;
  authorEmail: string;
}

interface ConfigFormProps {
  onSubmit: (config: ConfigFormData) => void;
  onCancel: () => void;
}

interface FieldState {
  value: string;
  isValid: boolean | null; // null = not validated yet
  errorMessage?: string;
  isFocused: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({ onSubmit, onCancel }) => {
  const [currentField, setCurrentField] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('');

  const [fields, setFields] = useState<Record<string, FieldState>>({
    marketplaceName: { value: '', isValid: null, isFocused: true },
    pluginName: { value: '', isValid: null, isFocused: false },
    sourceDirectory: { value: '', isValid: null, isFocused: false },
    outputDirectory: { value: '', isValid: null, isFocused: false },
    authorEmail: { value: '', isValid: null, isFocused: false },
  });

  const fieldOrder = [
    'marketplaceName',
    'pluginName',
    'sourceDirectory',
    'outputDirectory',
    'authorEmail',
  ];

  const fieldLabels: Record<string, string> = {
    marketplaceName: 'Marketplace Name *',
    pluginName: 'Plugin Name *',
    sourceDirectory: 'Source Directory *',
    outputDirectory: 'Output Directory',
    authorEmail: 'Author Email',
  };

  const fieldPlaceholders: Record<string, string> = {
    marketplaceName: 'my-curated-plugins',
    pluginName: 'my-plugin',
    sourceDirectory: './plugins',
    outputDirectory: './output/my-curated-plugins',
    authorEmail: 'author@example.com',
  };

  const fieldHelp: Record<string, string> = {
    marketplaceName: 'Lowercase, numbers, hyphens only (3-50 chars)',
    pluginName: 'Name for your curated plugin',
    sourceDirectory: 'Directory containing plugins to curate',
    outputDirectory: 'Where to save the curated plugin',
    authorEmail: 'Optional: Your email for marketplace metadata',
  };

  // Validation functions
  const validateMarketplaceName = (value: string): { valid: boolean; error?: string } => {
    if (!value) return { valid: false, error: 'Required field' };
    if (!/^[a-z0-9-]{3,50}$/.test(value)) {
      return { valid: false, error: 'Must be lowercase, numbers, hyphens (3-50 chars)' };
    }
    return { valid: true };
  };

  const validatePluginName = (value: string): { valid: boolean; error?: string } => {
    if (!value) return { valid: false, error: 'Required field' };
    if (!/^[a-z0-9-]{3,50}$/.test(value)) {
      return { valid: false, error: 'Must be lowercase, numbers, hyphens (3-50 chars)' };
    }
    return { valid: true };
  };

  const validateSourceDirectory = (value: string): { valid: boolean; error?: string } => {
    if (!value) return { valid: false, error: 'Required field' };

    const resolvedPath = resolve(process.cwd(), value);
    if (!existsSync(resolvedPath)) {
      return { valid: false, error: 'Directory does not exist' };
    }

    // Check for plugins
    try {
      const scanResult = scanPlugins(resolvedPath);
      if (scanResult.plugins.length === 0) {
        return { valid: false, error: 'No valid plugins found' };
      }
      setScanStatus(`Found ${scanResult.plugins.length} plugin(s)`);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Failed to scan directory' };
    }
  };

  const validateEmail = (value: string): { valid: boolean; error?: string } => {
    if (!value) return { valid: true }; // Optional field

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
  };

  const validateField = (fieldName: string, value: string) => {
    let result: { valid: boolean; error?: string };

    switch (fieldName) {
      case 'marketplaceName':
        result = validateMarketplaceName(value);
        break;
      case 'pluginName':
        result = validatePluginName(value);
        break;
      case 'sourceDirectory':
        result = validateSourceDirectory(value);
        break;
      case 'outputDirectory':
        // Optional, no validation needed
        result = { valid: true };
        break;
      case 'authorEmail':
        result = validateEmail(value);
        break;
      default:
        result = { valid: true };
    }

    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isValid: result.valid,
        errorMessage: result.error,
      },
    }));
  };

  // Auto-fill output directory when marketplace name changes
  useEffect(() => {
    const marketplaceName = fields.marketplaceName.value;
    if (marketplaceName && !fields.outputDirectory.value) {
      setFields((prev) => ({
        ...prev,
        outputDirectory: {
          ...prev.outputDirectory,
          value: `./output/${marketplaceName}`,
        },
      }));
    }
  }, [fields.marketplaceName.value]);

  useInput((input, key) => {
    const currentFieldName = fieldOrder[currentField];

    // ESC - cancel
    if (key.escape) {
      onCancel();
      return;
    }

    // Up/Down arrows or TAB - navigate fields
    if (key.upArrow || (key.shift && key.tab)) {
      const newField = Math.max(0, currentField - 1);
      setCurrentField(newField);
      setFields((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key].isFocused = key === fieldOrder[newField];
        });
        return updated;
      });
      return;
    }

    if (key.downArrow || key.tab) {
      const newField = Math.min(fieldOrder.length - 1, currentField + 1);
      setCurrentField(newField);
      setFields((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          updated[key].isFocused = key === fieldOrder[newField];
        });
        return updated;
      });
      return;
    }

    // Enter - validate and move to next or submit
    if (key.return) {
      validateField(currentFieldName, fields[currentFieldName].value);

      if (currentField === fieldOrder.length - 1) {
        // Last field - try to submit
        const allValid = ['marketplaceName', 'pluginName', 'sourceDirectory'].every(
          (name) => fields[name].isValid === true
        );

        if (allValid) {
          onSubmit({
            marketplaceName: fields.marketplaceName.value,
            pluginName: fields.pluginName.value,
            sourceDirectory: fields.sourceDirectory.value,
            outputDirectory: fields.outputDirectory.value || `./output/${fields.marketplaceName.value}`,
            authorEmail: fields.authorEmail.value,
          });
        }
      } else {
        // Move to next field
        const newField = currentField + 1;
        setCurrentField(newField);
        setFields((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            updated[key].isFocused = key === fieldOrder[newField];
          });
          return updated;
        });
      }
      return;
    }

    // Backspace - delete character
    if (key.backspace || key.delete) {
      setFields((prev) => ({
        ...prev,
        [currentFieldName]: {
          ...prev[currentFieldName],
          value: prev[currentFieldName].value.slice(0, -1),
          isValid: null, // Reset validation
        },
      }));
      return;
    }

    // Regular character input
    if (input && !key.ctrl && !key.meta) {
      setFields((prev) => ({
        ...prev,
        [currentFieldName]: {
          ...prev[currentFieldName],
          value: prev[currentFieldName].value + input,
          isValid: null, // Reset validation
        },
      }));
    }
  });

  const renderField = (fieldName: string) => {
    const field = fields[fieldName];
    const label = fieldLabels[fieldName];
    const placeholder = fieldPlaceholders[fieldName];
    const help = fieldHelp[fieldName];

    let statusIndicator = '';
    if (field.isValid === true) {
      statusIndicator = '✓';
    } else if (field.isValid === false) {
      statusIndicator = '✗';
    }

    const displayValue = field.value || placeholder;
    const isPlaceholder = !field.value;

    return (
      <Box key={fieldName} flexDirection="column" marginY={0}>
        {/* Label */}
        <Box>
          <Text bold={field.isFocused} color={field.isFocused ? 'cyan' : undefined}>
            {label}
          </Text>
          {statusIndicator && (
            <Text color={field.isValid ? 'green' : 'red'}> {statusIndicator}</Text>
          )}
        </Box>

        {/* Input */}
        <Box>
          <Text
            backgroundColor={field.isFocused ? 'blue' : undefined}
            dimColor={isPlaceholder}
          >
            {field.isFocused ? '► ' : '  '}
            {displayValue}
            {field.isFocused && '_'}
          </Text>
        </Box>

        {/* Help text */}
        <Box>
          <Text dimColor>{help}</Text>
        </Box>

        {/* Error message */}
        {field.errorMessage && (
          <Box>
            <Text color="red">  ✗ {field.errorMessage}</Text>
          </Box>
        )}

        {/* Scan status for source directory */}
        {fieldName === 'sourceDirectory' && scanStatus && (
          <Box>
            <Text color="green">  → {scanStatus}</Text>
          </Box>
        )}
      </Box>
    );
  };

  const allRequiredValid = ['marketplaceName', 'pluginName', 'sourceDirectory'].every(
    (name) => fields[name].isValid === true
  );

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">
          Plugin Configuration
        </Text>
      </Box>

      {/* Form Fields */}
      <Box flexDirection="column" marginY={1} paddingX={1}>
        {fieldOrder.map((fieldName) => renderField(fieldName))}
      </Box>

      {/* Footer - Instructions */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text dimColor>
          ↑↓/TAB: Navigate | Type to edit | ENTER: {allRequiredValid ? 'Submit' : 'Next field'} | ESC: Cancel
        </Text>
      </Box>
    </Box>
  );
};
