/**
 * Status bar - shows keyboard shortcuts
 * Spec 003 lines 361-367, Spec 004 lines 233, 261
 */

import React from 'react';
import { Text } from 'ink';

type Panel = 'plugins' | 'components' | 'preview';

interface StatusBarProps {
  currentPanel: Panel;
  multiPlugin?: boolean;
}

export function StatusBar({ currentPanel, multiPlugin = false }: StatusBarProps) {
  const baseKeys = '←→: Switch Panel | ↑↓: Navigate | SPACE: Toggle | A: All | N: None | S: Save | Q: Quit';
  const tabKeys = multiPlugin ? ' | TAB: Next Plugin | SHIFT+TAB: Prev Plugin' : '';

  return (
    <Text>
      {baseKeys}{tabKeys}
    </Text>
  );
}
