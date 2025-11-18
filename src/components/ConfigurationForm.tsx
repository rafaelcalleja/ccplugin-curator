import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { TextInput } from './TextInput.js';
import fs from 'fs/promises';
import path from 'path';

export interface ConfigFormData {
  marketplaceName: string;
  pluginName: string;
  sourceDirectory: string;
  outputDirectory: string;
  authorEmail: string;
}

interface ConfigurationFormProps {
  onSubmit: (data: ConfigFormData) => void;
  onCancel: () => void;
}

type FieldName = 'marketplaceName' | 'pluginName' | 'sourceDirectory' | 'outputDirectory' | 'authorEmail';

interface FieldState {
  value: string;
  error: string;
  valid: boolean;
  touched: boolean;
}

const PLACEHOLDERS: Record<FieldName, string> = {
  marketplaceName: 'my-marketplace',
  pluginName: 'My Awesome Plugin',
  sourceDirectory: '~/.claude/plugins',
  outputDirectory: './output',
  authorEmail: 'you@example.com',
};

const FIELD_LABELS: Record<FieldName, string> = {
  marketplaceName: 'Marketplace Name',
  pluginName: 'Plugin Name',
  sourceDirectory: 'Source Plugin Directory',
  outputDirectory: 'Output Directory',
  authorEmail: 'Author Email',
};

const FIELD_HELP: Record<FieldName, string> = {
  marketplaceName: 'Used in package.json name field (lowercase, numbers, hyphens)',
  pluginName: 'Display name for your curated plugin',
  sourceDirectory: 'Directory containing source plugins to curate',
  outputDirectory: 'Where to save the curated plugin',
  authorEmail: 'Optional email for plugin metadata',
};

const FIELDS: FieldName[] = ['marketplaceName', 'pluginName', 'sourceDirectory', 'outputDirectory', 'authorEmail'];

export function ConfigurationForm({ onSubmit, onCancel }: ConfigurationFormProps) {
  const [currentField, setCurrentField] = useState<number>(0);
  const [fields, setFields] = useState<Record<FieldName, FieldState>>({
    marketplaceName: { value: '', error: '', valid: false, touched: false },
    pluginName: { value: '', error: '', valid: false, touched: false },
    sourceDirectory: { value: '', error: '', valid: false, touched: false },
    outputDirectory: { value: '', error: '', valid: false, touched: false },
    authorEmail: { value: '', error: '', valid: true, touched: false }, // Optional
  });
  const [pluginCount, setPluginCount] = useState<number>(0);
  const [isScanning, setIsScanning] = useState(false);

  const currentFieldName = FIELDS[currentField];

  // Auto-fill output directory from marketplace name
  useEffect(() => {
    if (fields.marketplaceName.value && !fields.outputDirectory.touched) {
      const autoFilled = `./output/${fields.marketplaceName.value}`;
      setFields(prev => ({
        ...prev,
        outputDirectory: {
          ...prev.outputDirectory,
          value: autoFilled,
          valid: true,
        },
      }));
    }
  }, [fields.marketplaceName.value, fields.outputDirectory.touched]);

  // Scan source directory when it changes
  useEffect(() => {
    if (fields.sourceDirectory.value && fields.sourceDirectory.valid) {
      scanDirectory(fields.sourceDirectory.value);
    }
  }, [fields.sourceDirectory.value, fields.sourceDirectory.valid]);

  async function scanDirectory(dir: string) {
    setIsScanning(true);
    try {
      const expandedPath = dir.replace(/^~/, process.env.HOME || '~');
      const absolutePath = path.resolve(expandedPath);
      const entries = await fs.readdir(absolutePath, { withFileTypes: true });

      let count = 0;
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginJsonPath = path.join(absolutePath, entry.name, '.claude-plugin', 'plugin.json');
          try {
            await fs.access(pluginJsonPath);
            count++;
          } catch {
            // Not a plugin directory
          }
        }
      }
      setPluginCount(count);
    } catch (err) {
      setPluginCount(0);
    } finally {
      setIsScanning(false);
    }
  }

  function validateField(name: FieldName, value: string): { valid: boolean; error: string } {
    if (name === 'marketplaceName') {
      if (!value) {
        return { valid: false, error: '' };
      }
      const regex = /^[a-z0-9-]+$/;
      if (!regex.test(value)) {
        return { valid: false, error: 'Only lowercase, numbers, hyphens allowed (3-50 chars)' };
      }
      if (value.length < 3 || value.length > 50) {
        return { valid: false, error: 'Must be 3-50 characters' };
      }
      return { valid: true, error: '' };
    }

    if (name === 'pluginName') {
      if (!value) {
        return { valid: false, error: '' };
      }
      if (value.length < 3 || value.length > 100) {
        return { valid: false, error: 'Must be 3-100 characters' };
      }
      return { valid: true, error: '' };
    }

    if (name === 'sourceDirectory') {
      if (!value) {
        return { valid: false, error: '' };
      }
      return { valid: true, error: '' }; // Async validation done in useEffect
    }

    if (name === 'outputDirectory') {
      if (!value) {
        return { valid: false, error: '' };
      }
      return { valid: true, error: '' };
    }

    if (name === 'authorEmail') {
      if (!value) {
        return { valid: true, error: '' }; // Optional
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, error: 'Invalid email format' };
      }
      return { valid: true, error: '' };
    }

    return { valid: true, error: '' };
  }

  function handleFieldChange(value: string) {
    const validation = validateField(currentFieldName, value);
    setFields(prev => ({
      ...prev,
      [currentFieldName]: {
        value,
        error: validation.error,
        valid: validation.valid,
        touched: true,
      },
    }));
  }

  function isFormValid(): boolean {
    return (
      fields.marketplaceName.valid &&
      fields.pluginName.valid &&
      fields.sourceDirectory.valid &&
      fields.outputDirectory.valid &&
      fields.authorEmail.valid &&
      pluginCount > 0
    );
  }

  useInput((input, key) => {
    // ESC: Cancel
    if (key.escape) {
      onCancel();
      return;
    }

    // Arrow keys: Navigate fields
    if (key.upArrow || (key.tab && key.shift)) {
      setCurrentField(prev => (prev > 0 ? prev - 1 : FIELDS.length - 1));
      return;
    }

    if (key.downArrow || key.tab) {
      setCurrentField(prev => (prev < FIELDS.length - 1 ? prev + 1 : 0));
      return;
    }

    // ENTER: Submit if valid
    if (key.return) {
      if (isFormValid()) {
        onSubmit({
          marketplaceName: fields.marketplaceName.value,
          pluginName: fields.pluginName.value,
          sourceDirectory: fields.sourceDirectory.value,
          outputDirectory: fields.outputDirectory.value,
          authorEmail: fields.authorEmail.value,
        });
      }
      return;
    }
  });

  function renderField(fieldName: FieldName, index: number) {
    const field = fields[fieldName];
    const isFocused = currentField === index;
    const isRequired = fieldName !== 'authorEmail' && fieldName !== 'outputDirectory';
    const showPlaceholder = !field.value && !field.touched;

    return (
      <Box key={fieldName} flexDirection="column" marginBottom={1}>
        {/* Label */}
        <Text>
          {FIELD_LABELS[fieldName]}
          {isRequired && <Text color="red">*</Text>}
        </Text>

        {/* Input Box */}
        <Box
          borderStyle="single"
          borderColor={isFocused ? 'blue' : field.error ? 'red' : 'gray'}
          paddingX={1}
        >
          {isFocused ? (
            <TextInput
              value={field.value}
              placeholder={showPlaceholder ? PLACEHOLDERS[fieldName] : ''}
              onChange={handleFieldChange}
              showCursor={true}
            />
          ) : (
            <Text color={showPlaceholder ? 'gray' : 'white'}>
              {showPlaceholder ? PLACEHOLDERS[fieldName] : field.value || ' '}
            </Text>
          )}
          {field.valid && field.value && <Text color="green"> ✓</Text>}
          {field.error && <Text color="red"> ✗</Text>}
        </Box>

        {/* Help text or error */}
        <Text dimColor={!field.error} color={field.error ? 'red' : undefined}>
          {field.error || FIELD_HELP[fieldName]}
        </Text>

        {/* Special: Source directory scanning feedback */}
        {fieldName === 'sourceDirectory' && field.valid && (
          <Text color="cyan">
            → {isScanning ? 'Scanning...' : `Found ${pluginCount} plugin${pluginCount !== 1 ? 's' : ''}`}
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      {/* Title */}
      <Box borderStyle="single" borderColor="cyan" paddingX={1}>
        <Text bold color="cyan">
          CREATE CURATED PLUGIN
        </Text>
      </Box>

      <Box height={1} />

      {/* Required Fields */}
      <Box borderStyle="single" borderColor="yellow" flexDirection="column" paddingX={2} paddingY={1}>
        <Text color="yellow" bold>
          REQUIRED FIELDS
        </Text>
        <Box height={1} />
        {renderField('marketplaceName', 0)}
        {renderField('pluginName', 1)}
        {renderField('sourceDirectory', 2)}
      </Box>

      <Box height={1} />

      {/* Optional Fields */}
      <Box borderStyle="single" borderColor="gray" flexDirection="column" paddingX={2} paddingY={1}>
        <Text dimColor bold>
          OPTIONAL FIELDS
        </Text>
        <Box height={1} />
        {renderField('outputDirectory', 3)}
        {renderField('authorEmail', 4)}
      </Box>

      <Box height={1} />

      {/* Help */}
      <Box borderStyle="single" borderColor="gray">
        <Text dimColor>
          ↑↓/TAB: Navigate | Type to edit | ENTER: {isFormValid() ? 'Start Curating →' : 'Fill required fields'} | ESC: Cancel
        </Text>
      </Box>

      {/* Validation errors */}
      {pluginCount === 0 && fields.sourceDirectory.valid && (
        <Box marginTop={1}>
          <Text color="red">✗ No plugins found in directory</Text>
        </Box>
      )}
    </Box>
  );
}
