import React from 'react';
import { Text } from 'ink';

export interface TextInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  isActive: boolean;
}

/**
 * Simple text input component with placeholder support
 *
 * Note: Ink doesn't have a built-in text input component in the basic API,
 * so we'll display the value and let the parent handle input via useInput hook
 */
export const TextInput: React.FC<TextInputProps> = ({
  value,
  placeholder,
  isActive
}) => {
  if (!value || value === '') {
    return <Text dimColor>{placeholder}</Text>;
  }

  return (
    <Text>
      {value}
      {isActive && '█'}
    </Text>
  );
};
