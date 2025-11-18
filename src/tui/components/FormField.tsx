import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { TextInput } from './TextInput';

export interface FormFieldProps {
  label: string;
  value: string;
  placeholder: string;
  helpText: string;
  onChange: (value: string) => void;
  isValid?: boolean;
  error?: string;
  isFocused: boolean;
  additionalInfo?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  placeholder,
  helpText,
  onChange,
  isValid,
  error,
  isFocused,
  additionalInfo
}) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Label */}
      <Text>{label}</Text>

      {/* Input box */}
      <Box>
        <Box
          borderStyle="single"
          borderColor={isFocused ? 'blue' : 'gray'}
          width={80}
          padding={1}
        >
          <Text>
            {isFocused && '► '}
          </Text>
          <TextInput
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            isActive={isFocused}
          />
        </Box>

        {/* Validation checkmark/error */}
        {value && (
          <Box marginLeft={1}>
            <Text color={isValid ? 'green' : 'red'}>
              {isValid ? '✓' : '✗'}
            </Text>
          </Box>
        )}
      </Box>

      {/* Help text or error message */}
      {error && value ? (
        <Text color="red" dimColor>{error}</Text>
      ) : (
        <Text dimColor>{helpText}</Text>
      )}

      {/* Additional info (e.g., plugin scan results) */}
      {additionalInfo && (
        <Text dimColor>→ {additionalInfo}</Text>
      )}
    </Box>
  );
};
