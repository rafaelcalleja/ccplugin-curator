/**
 * Components Panel Component
 * Implements: docs/spec/003-tui-visual-spec.md (COMPONENTS Panel section)
 */

import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import type { ComponentTreeNode } from '../state/types';

interface ComponentsPanelProps {
  tree: ComponentTreeNode[];
  selection: Map<string, boolean>;
  expandedCategories: Set<string>;
  cursorPosition: number;
  isActive: boolean;
  onToggleSelection: (componentId: string) => void;
  onToggleCategory: (category: string) => void;
}

export function ComponentsPanel({
  tree,
  selection,
  expandedCategories,
  cursorPosition,
  isActive,
  onToggleSelection,
  onToggleCategory,
}: ComponentsPanelProps) {
  // Flatten tree for cursor navigation
  const flatItems = useMemo(() => {
    const items: Array<{ node: ComponentTreeNode; depth: number }> = [];

    tree.forEach((node) => {
      items.push({ node, depth: 0 });

      if (node.type === 'category' && node.category && expandedCategories.has(node.category)) {
        node.children?.forEach((child) => {
          items.push({ node: child, depth: 1 });
        });
      }
    });

    return items;
  }, [tree, expandedCategories]);

  const totalComponents = useMemo(() => {
    let count = 0;
    tree.forEach((cat) => {
      count += cat.children?.length || 0;
    });
    return count;
  }, [tree]);

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={isActive ? 'cyan' : 'gray'} paddingX={1} width="40%">
      <Text bold color="white">
        COMPONENTS ({totalComponents})
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {flatItems.length === 0 ? (
          <Text dimColor>No components</Text>
        ) : (
          <>
            {/* Show indicator if there are items above visible range */}
            {visibleRange.start > 0 && (
              <Text dimColor>... {visibleRange.start} more above ...</Text>
            )}
            {visibleItems.map((item) => {
              const isCurrent = item.absoluteIndex === cursorPosition;
              const { node, depth } = item;

            if (node.type === 'category') {
              const isExpanded = node.category ? expandedCategories.has(node.category) : false;

              return (
                <Box key={node.id}>
                  <Text
                    bold
                    color={isCurrent && isActive ? 'yellow' : 'white'}
                    backgroundColor={isCurrent && isActive ? 'yellow' : undefined}
                    inverse={isCurrent && isActive}
                  >
                    {isCurrent ? '> ' : '  '}
                    {isExpanded ? '▼ ' : '▶ '}
                    {node.label}
                  </Text>
                </Box>
              );
            } else {
              const isSelected = selection.get(node.id) || false;

              return (
                <Box key={node.id}>
                  <Text
                    color={isCurrent && isActive ? 'yellow' : 'white'}
                    backgroundColor={isCurrent && isActive ? 'yellow' : undefined}
                    inverse={isCurrent && isActive}
                  >
                    {isCurrent ? '> ' : '  '}
                    {'  '.repeat(depth)}
                    <Text color={isSelected ? 'green' : 'white'}>{isSelected ? '[✓] ' : '[ ] '}</Text>
                    {node.label}
                  </Text>
                </Box>
              );
            }
          })}
            {/* Show indicator if there are items below visible range */}
            {visibleRange.end < flatItems.length && (
              <Text dimColor>... {flatItems.length - visibleRange.end} more below ...</Text>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
