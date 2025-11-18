import React, { useState } from 'react';
import { Text, useInput } from 'ink';

interface TextInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  showCursor?: boolean;
}

/**
 * Simple text input component compatible with Ink 4
 */
export function TextInput({ value, placeholder, onChange, showCursor = true }: TextInputProps) {
  const [cursorOffset, setCursorOffset] = useState(value.length);

  useInput((input, key) => {
    if (key.leftArrow) {
      setCursorOffset(Math.max(0, cursorOffset - 1));
    } else if (key.rightArrow) {
      setCursorOffset(Math.min(value.length, cursorOffset + 1));
    } else if (key.backspace || key.delete) {
      if (cursorOffset > 0) {
        const newValue = value.slice(0, cursorOffset - 1) + value.slice(cursorOffset);
        onChange(newValue);
        setCursorOffset(cursorOffset - 1);
      }
    } else if (input && !key.ctrl && !key.meta) {
      const newValue = value.slice(0, cursorOffset) + input + value.slice(cursorOffset);
      onChange(newValue);
      setCursorOffset(cursorOffset + 1);
    }
  });

  const displayValue = value || placeholder || '';
  const isPlaceholder = !value && placeholder;

  if (showCursor && !isPlaceholder) {
    const beforeCursor = displayValue.slice(0, cursorOffset);
    const afterCursor = displayValue.slice(cursorOffset);
    return (
      <Text>
        {beforeCursor}
        <Text inverse> </Text>
        {afterCursor}
      </Text>
    );
  }

  return <Text color={isPlaceholder ? 'gray' : 'white'}>{displayValue}</Text>;
}
