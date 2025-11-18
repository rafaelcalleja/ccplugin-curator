/**
 * Search Box Component
 * Allows filtering components by name with fuzzy matching
 */

import React from 'react';
import { Box, Text } from 'ink';

interface SearchBoxProps {
  searchQuery: string;
  matchCount: number;
  totalCount: number;
  isActive: boolean;
}

export function SearchBox({ searchQuery, matchCount, totalCount, isActive }: SearchBoxProps) {
  const hasQuery = searchQuery.length > 0;

  return (
    <Box
      borderStyle="single"
      borderColor={isActive ? 'yellow' : 'gray'}
      paddingX={1}
      marginBottom={1}
    >
      <Text bold color={isActive ? 'yellow' : 'white'}>
        Search:
      </Text>
      <Text> </Text>
      {hasQuery ? (
        <>
          <Text color="cyan">{searchQuery}</Text>
          <Text color="green"> ({matchCount}/{totalCount} matches)</Text>
        </>
      ) : (
        <Text dimColor>Type to filter components... (Press / to focus, ESC to clear)</Text>
      )}
    </Box>
  );
}
