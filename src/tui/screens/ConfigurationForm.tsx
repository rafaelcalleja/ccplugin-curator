import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { FormField } from '../components/FormField';
import {
  validateMarketplaceName,
  validatePluginName,
  validateEmail,
  validateSourceDirectory,
  validateOutputDirectory,
  autoFillOutputDirectory,
  ValidationResult
} from '../../validation/formValidation';

export interface FormData {
  marketplaceName: string;
  pluginName: string;
  sourceDirectory: string;
  outputDirectory: string;
  authorEmail: string;
}

export interface ConfigurationFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

type FieldName = 'marketplaceName' | 'pluginName' | 'sourceDirectory' | 'outputDirectory' | 'authorEmail';

const fields: { name: FieldName; label: string; placeholder: string; helpText: string; required: boolean }[] = [
  {
    name: 'marketplaceName',
    label: 'Marketplace Name',
    placeholder: 'my-marketplace',
    helpText: 'Used in package.json name field (lowercase, numbers, hyphens)',
    required: true
  },
  {
    name: 'pluginName',
    label: 'Plugin Name',
    placeholder: 'My Awesome Plugin',
    helpText: 'Display name for your curated plugin',
    required: true
  },
  {
    name: 'sourceDirectory',
    label: 'Source Plugin Directory',
    placeholder: '~/.claude/plugins',
    helpText: 'Directory containing source plugins to curate',
    required: true
  },
  {
    name: 'outputDirectory',
    label: 'Output Directory',
    placeholder: './output',
    helpText: 'Where to save the curated plugin',
    required: false
  },
  {
    name: 'authorEmail',
    label: 'Author Email',
    placeholder: 'you@example.com',
    helpText: 'Optional email for plugin metadata',
    required: false
  }
];

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({ onSubmit, onCancel }) => {
  const [focusedFieldIndex, setFocusedFieldIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    marketplaceName: '',
    pluginName: '',
    sourceDirectory: '',
    outputDirectory: '',
    authorEmail: ''
  });

  const [validationResults, setValidationResults] = useState<Record<FieldName, ValidationResult>>({
    marketplaceName: { valid: false },
    pluginName: { valid: false },
    sourceDirectory: { valid: false },
    outputDirectory: { valid: true },
    authorEmail: { valid: true }
  });

  const [pluginScanResult, setPluginScanResult] = useState<string>('');

  // Auto-fill output directory when marketplace name changes
  useEffect(() => {
    if (formData.marketplaceName && !formData.outputDirectory) {
      const autoFilled = autoFillOutputDirectory(formData.marketplaceName);
      setFormData(prev => ({ ...prev, outputDirectory: autoFilled }));
    }
  }, [formData.marketplaceName]);

  // Validate field
  const validateField = async (fieldName: FieldName, value: string) => {
    let result: ValidationResult;

    switch (fieldName) {
      case 'marketplaceName':
        result = validateMarketplaceName(value);
        break;
      case 'pluginName':
        result = validatePluginName(value);
        break;
      case 'sourceDirectory':
        const sourceDirResult = await validateSourceDirectory(value);
        if (sourceDirResult.valid && sourceDirResult.pluginCount) {
          setPluginScanResult(
            `Scanning... Found ${sourceDirResult.pluginCount} plugin${sourceDirResult.pluginCount !== 1 ? 's' : ''} (${sourceDirResult.pluginNames?.join(', ')})`
          );
        } else {
          setPluginScanResult('');
        }
        result = sourceDirResult;
        break;
      case 'outputDirectory':
        result = await validateOutputDirectory(value);
        break;
      case 'authorEmail':
        result = validateEmail(value);
        break;
      default:
        result = { valid: true };
    }

    setValidationResults(prev => ({ ...prev, [fieldName]: result }));
  };

  // Handle input
  useInput((input, key) => {
    const currentField = fields[focusedFieldIndex];

    // Navigation
    if (key.upArrow) {
      setFocusedFieldIndex(prev => Math.max(0, prev - 1));
      return;
    }

    if (key.downArrow || key.tab) {
      setFocusedFieldIndex(prev => Math.min(fields.length - 1, prev + 1));
      return;
    }

    // Cancel
    if (key.escape) {
      onCancel();
      return;
    }

    // Submit
    if (key.return) {
      // Check if all required fields are valid
      const requiredFields = fields.filter(f => f.required);
      const allValid = requiredFields.every(f => {
        const hasValue = formData[f.name] && formData[f.name].trim() !== '';
        const isValid = validationResults[f.name].valid;
        return hasValue && isValid;
      });

      if (allValid) {
        onSubmit(formData);
      }
      return;
    }

    // Text input
    if (key.backspace || key.delete) {
      const newValue = formData[currentField.name].slice(0, -1);
      setFormData(prev => ({ ...prev, [currentField.name]: newValue }));
      validateField(currentField.name, newValue);
      return;
    }

    // Regular character input
    if (input && !key.ctrl && !key.meta) {
      const newValue = formData[currentField.name] + input;
      setFormData(prev => ({ ...prev, [currentField.name]: newValue }));
      validateField(currentField.name, newValue);
    }
  });

  const isFormComplete = fields
    .filter(f => f.required)
    .every(f => formData[f.name] && validationResults[f.name].valid);

  return (
    <Box flexDirection="column" padding={1}>
      {/* Title */}
      <Box borderStyle="single" borderColor="cyan">
        <Text bold color="cyan"> CREATE CURATED PLUGIN</Text>
      </Box>

      {/* Form sections */}
      <Box flexDirection="column" marginTop={1}>
        {/* Required fields */}
        <Box flexDirection="column" borderStyle="single" padding={1} marginBottom={1}>
          <Text color="yellow">─ REQUIRED FIELDS ──────────────────────────────────────────────</Text>
          <Box flexDirection="column" marginTop={1}>
            {fields.filter(f => f.required).map((field, index) => {
              const globalIndex = fields.findIndex(f => f.name === field.name);
              return (
                <FormField
                  key={field.name}
                  label={field.label}
                  value={formData[field.name]}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                  onChange={() => {}} // Handled by useInput
                  isValid={validationResults[field.name].valid}
                  error={validationResults[field.name].error}
                  isFocused={focusedFieldIndex === globalIndex}
                  additionalInfo={field.name === 'sourceDirectory' ? pluginScanResult : undefined}
                />
              );
            })}
          </Box>
        </Box>

        {/* Optional fields */}
        <Box flexDirection="column" borderStyle="single" padding={1}>
          <Text color="yellow">─ OPTIONAL FIELDS ──────────────────────────────────────────────</Text>
          <Box flexDirection="column" marginTop={1}>
            {fields.filter(f => !f.required).map((field, index) => {
              const globalIndex = fields.findIndex(f => f.name === field.name);
              return (
                <FormField
                  key={field.name}
                  label={field.label}
                  value={formData[field.name]}
                  placeholder={field.placeholder}
                  helpText={field.helpText}
                  onChange={() => {}} // Handled by useInput
                  isValid={validationResults[field.name].valid}
                  error={validationResults[field.name].error}
                  isFocused={focusedFieldIndex === globalIndex}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Status bar */}
      <Box borderStyle="single" borderColor="gray" marginTop={1}>
        <Text dimColor>
          {isFormComplete
            ? ' ENTER: Start Curating → | ESC: Cancel'
            : ' ↑↓/TAB: Navigate | Type to edit (placeholder disappears) | ENTER: Continue | ESC: Cancel'}
        </Text>
      </Box>
    </Box>
  );
};
