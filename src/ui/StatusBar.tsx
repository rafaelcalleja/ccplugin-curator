/**
 * Status bar - shows keyboard shortcuts
 */

import React from 'react';
import { Text } from 'ink';

type Panel = 'plugins' | 'components' | 'preview';

interface StatusBarProps {
  currentPanel: Panel;
}

export function StatusBar({ currentPanel }: StatusBarProps) {
  return (
    <Text>
      ←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit
    </Text>
  );
}
