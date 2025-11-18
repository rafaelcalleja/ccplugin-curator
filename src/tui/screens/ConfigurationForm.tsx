/**
 * Configuration Form Screen
 * Implements: docs/spec/009-tui-setup-screens.md (Screen 2)
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface FormData {
  marketplaceName: string;
  pluginName: string;
  sourceDirectory: string;
  outputDirectory: string;
  authorEmail: string;
}

interface ConfigurationFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

interface FieldState {
  value: string;
  placeholder: string;
  isValid: boolean;
  error?: string;
  helpText: string;
}

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [focusedFieldIndex, setFocusedFieldIndex] = useState(0);
  const [pluginCount, setPluginCount] = useState<number | null>(null);
  const [pluginNames, setPluginNames] = useState<string[]>([]);

  // Field definitions
  const [fields, setFields] = useState<FieldState[]>([
    {
      value: '',
      placeholder: 'my-marketplace',
      isValid: false,
      helpText: 'Used in package.json name field (lowercase, numbers, hyphens)',
    },
    {
      value: '',
      placeholder: 'My Awesome Plugin',
      isValid: false,
      helpText: 'Display name for your curated plugin',
    },
    {
      value: '',
      placeholder: '~/.claude/plugins',
      isValid: false,
      helpText: 'Directory containing source plugins to curate',
    },
    {
      value: '',
      placeholder: './output',
      isValid: true, // Optional field
      helpText: 'Where to save the curated plugin',
    },
    {
      value: '',
      placeholder: 'you@example.com',
      isValid: true, // Optional field
      helpText: 'Optional email for plugin metadata',
    },
  ]);

  const fieldLabels = [
    'Marketplace Name',
    'Plugin Name',
    'Source Plugin Directory',
    'Output Directory',
    'Author Email',
  ];

  const requiredFields = [0, 1, 2]; // Indices of required fields

  // Validation functions
  const validateMarketplaceName = (value: string): boolean => {
    return /^[a-z0-9-]{3,50}$/.test(value);
  };

  const validatePluginName = (value: string): boolean => {
    return value.length >= 3 && value.length <= 100;
  };

  const validateDirectory = (value: string): boolean => {
    try {
      const expandedPath = value.replace(/^~/, process.env.HOME || '~');
      return fs.existsSync(expandedPath);
    } catch {
      return false;
    }
  };

  const validateEmail = (value: string): boolean => {
    if (value === '') return true; // Optional field
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // Scan plugins in directory
  const scanPlugins = async (directory: string) => {
    try {
      const expandedPath = directory.replace(/^~/, process.env.HOME || '~');
      const pluginPaths = await glob('**/.claude-plugin/plugin.json', {
        cwd: expandedPath,
        absolute: false,
      });

      const names = pluginPaths.map((p) => {
        const parts = p.split('/');
        return parts[parts.length - 3]; // Get parent directory name
      });

      setPluginCount(names.length);
      setPluginNames(names);
    } catch {
      setPluginCount(0);
      setPluginNames([]);
    }
  };

  // Update field value and validation
  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index].value = value;

    // Validate based on field type
    switch (index) {
      case 0: // Marketplace Name
        newFields[index].isValid = validateMarketplaceName(value);
        // Auto-fill output directory
        if (newFields[index].isValid && newFields[3].value === '') {
          newFields[3].value = `./output/${value}`;
          newFields[3].isValid = true;
        }
        break;
      case 1: // Plugin Name
        newFields[index].isValid = validatePluginName(value);
        break;
      case 2: // Source Directory
        newFields[index].isValid = validateDirectory(value);
        if (newFields[index].isValid) {
          scanPlugins(value);
        } else {
          setPluginCount(null);
          setPluginNames([]);
        }
        break;
      case 3: // Output Directory (optional)
        newFields[index].isValid = true;
        break;
      case 4: // Author Email (optional)
        newFields[index].isValid = validateEmail(value);
        break;
    }

    setFields(newFields);
  };

  // Handle keyboard input
  useInput((input, key) => {
    if (key.escape) {
      onCancel();
      return;
    }

    if (key.return) {
      // Check if all required fields are valid
      const allValid = requiredFields.every((i) => fields[i].isValid);
      if (allValid) {
        onSubmit({
          marketplaceName: fields[0].value,
          pluginName: fields[1].value,
          sourceDirectory: fields[2].value.replace(/^~/, process.env.HOME || '~'),
          outputDirectory: fields[3].value || './output',
          authorEmail: fields[4].value,
        });
      }
      return;
    }

    if (key.upArrow || (key.shift && key.tab)) {
      setFocusedFieldIndex((prev) => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow || key.tab) {
      setFocusedFieldIndex((prev) => Math.min(fields.length - 1, prev + 1));
      return;
    }

    if (key.backspace || key.delete) {
      const current = fields[focusedFieldIndex].value;
      updateField(focusedFieldIndex, current.slice(0, -1));
      return;
    }

    // Regular character input
    if (input && !key.ctrl && !key.meta) {
      const current = fields[focusedFieldIndex].value;
      updateField(focusedFieldIndex, current + input);
    }
  });

  // Check if form is complete
  const isComplete = requiredFields.every((i) => fields[i].isValid);

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      {/* Header */}
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">
          CREATE CURATED PLUGIN
        </Text>
      </Box>

      {/* Required Fields Section */}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="yellow"
        paddingX={2}
        paddingY={1}
        marginTop={1}
      >
        <Text bold color="yellow">
          ─ REQUIRED FIELDS ───────────────────────────────────────
        </Text>

        {requiredFields.map((fieldIndex) => (
          <Box key={fieldIndex} flexDirection="column" marginTop={1}>
            <Text>{fieldLabels[fieldIndex]}</Text>
            <Box>
              <Box
                borderStyle="single"
                borderColor={focusedFieldIndex === fieldIndex ? 'blue' : 'gray'}
                width={80}
                paddingX={1}
              >
                <Text>
                  {focusedFieldIndex === fieldIndex ? '► ' : '  '}
                  {fields[fieldIndex].value || (
                    <Text dimColor>{fields[fieldIndex].placeholder}</Text>
                  )}
                  {focusedFieldIndex === fieldIndex && fields[fieldIndex].value && '█'}
                </Text>
              </Box>
              {fields[fieldIndex].value && (
                <Text color={fields[fieldIndex].isValid ? 'green' : 'red'}>
                  {' '}
                  {fields[fieldIndex].isValid ? '✓' : '✗'}
                </Text>
              )}
            </Box>
            <Text dimColor>{fields[fieldIndex].helpText}</Text>

            {/* Show plugin scan results for source directory */}
            {fieldIndex === 2 && pluginCount !== null && (
              <Text color="cyan">
                → Scanning... Found {pluginCount} plugin
                {pluginCount !== 1 ? 's' : ''}{' '}
                {pluginNames.length > 0 && `(${pluginNames.join(', ')})`}
              </Text>
            )}
          </Box>
        ))}
      </Box>

      {/* Optional Fields Section */}
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="yellow"
        paddingX={2}
        paddingY={1}
        marginTop={1}
      >
        <Text bold color="yellow">
          ─ OPTIONAL FIELDS ───────────────────────────────────────
        </Text>

        {[3, 4].map((fieldIndex) => (
          <Box key={fieldIndex} flexDirection="column" marginTop={1}>
            <Text>{fieldLabels[fieldIndex]}</Text>
            <Box>
              <Box
                borderStyle="single"
                borderColor={focusedFieldIndex === fieldIndex ? 'blue' : 'gray'}
                width={80}
                paddingX={1}
              >
                <Text>
                  {focusedFieldIndex === fieldIndex ? '► ' : '  '}
                  {fields[fieldIndex].value || (
                    <Text dimColor>{fields[fieldIndex].placeholder}</Text>
                  )}
                  {focusedFieldIndex === fieldIndex && fields[fieldIndex].value && '█'}
                </Text>
              </Box>
              {fields[fieldIndex].value && (
                <Text color={fields[fieldIndex].isValid ? 'green' : 'red'}>
                  {' '}
                  {fields[fieldIndex].isValid ? '✓' : '✗'}
                </Text>
              )}
            </Box>
            <Text dimColor>
              {fieldIndex === 3 &&
              fields[0].isValid &&
              fields[3].value.includes(fields[0].value)
                ? 'Where to save the curated plugin (auto-filled from marketplace name)'
                : fields[fieldIndex].helpText}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Status Bar */}
      <Box borderStyle="single" marginTop={1} paddingX={1}>
        <Text>
          {isComplete ? (
            <Text color="green">ENTER: Start Curating → | </Text>
          ) : (
            <Text dimColor>↑↓/TAB: Navigate | Type to edit | </Text>
          )}
          <Text>ESC: Cancel</Text>
        </Text>
      </Box>
    </Box>
  );
};
