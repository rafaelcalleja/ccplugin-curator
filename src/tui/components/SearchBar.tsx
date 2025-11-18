/**
 * Search Bar Component
 *
 * Input field for filtering plugins by name.
 * Shows search icon and query with clear indicator.
 */

import React from 'react';
import { Box, Text } from 'ink';

interface SearchBarProps {
  query: string;
  isActive: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, isActive }) => {
  const displayQuery = query || 'Type to search...';
  const isPlaceholder = !query;

  return (
    <Box borderStyle="single" borderColor={isActive ? 'cyan' : 'gray'} paddingX={1}>
      <Text color="cyan">🔍 </Text>
      <Text
        backgroundColor={isActive ? 'blue' : undefined}
        dimColor={isPlaceholder}
      >
        {displayQuery}
        {isActive && '_'}
      </Text>
      {query && (
        <Box marginLeft={1}>
          <Text dimColor>(Press ESC to clear)</Text>
        </Box>
      )}
    </Box>
  );
};
