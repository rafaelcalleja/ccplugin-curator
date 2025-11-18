/**
 * Error Display Panel Component
 *
 * Displays validation errors and warnings in the TUI.
 * Shows inline error messages with dismiss functionality.
 *
 * Spec: Enhancement to TUI for better error visibility
 */

import React from 'react';
import { Box, Text } from 'ink';

export interface ErrorMessage {
  type: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  timestamp?: Date;
}

interface ErrorPanelProps {
  errors: ErrorMessage[];
  onDismiss?: () => void;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ errors, onDismiss }) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="red" paddingX={1} paddingY={0}>
      {/* Header */}
      <Box>
        <Text bold color="red">
          ⚠ ERRORS ({errors.length})
        </Text>
        <Box flexGrow={1} />
        {onDismiss && (
          <Text dimColor>Press ESC to dismiss</Text>
        )}
      </Box>

      {/* Error messages */}
      <Box flexDirection="column" marginTop={1}>
        {errors.map((error, index) => {
          const icon = error.type === 'error' ? '✗' : error.type === 'warning' ? '⚠' : 'ℹ';
          const color = error.type === 'error' ? 'red' : error.type === 'warning' ? 'yellow' : 'cyan';

          return (
            <Box key={index} flexDirection="column" marginBottom={index < errors.length - 1 ? 1 : 0}>
              <Box>
                <Text color={color} bold>
                  {icon} {error.message}
                </Text>
              </Box>
              {error.details && (
                <Box marginLeft={2}>
                  <Text dimColor>{error.details}</Text>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
