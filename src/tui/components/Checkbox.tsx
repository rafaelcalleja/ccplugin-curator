import React from 'react';
import { Text } from 'ink';

interface CheckboxProps {
  label: string;
  checked: boolean;
  focused?: boolean;
}

/**
 * Checkbox component for component selection
 */
export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, focused = false }) => {
  const checkbox = checked ? '[✓]' : '[ ]';
  const color = focused ? 'cyan' : undefined;

  return (
    <Text color={color}>
      {checkbox} {label}
    </Text>
  );
};
