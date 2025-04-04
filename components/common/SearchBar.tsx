// components/common/SearchBar.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeProvider';
import { DebounceUtils } from '../../utils/debounce/DebounceUtils';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceTime?: number;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  debounceTime = 300,
  style,
  autoFocus = false,
}) => {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const debouncedSearch = useCallback(
    DebounceUtils.debounce((text: string) => {
      onSearch(text);
    }, debounceTime),
    [onSearch, debounceTime]
  );

  const handleChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.grey[100],
          borderColor: theme.colors.grey[300],
        },
        style,
      ]}
    >
      <Feather
        name="search"
        size={20}
        color={theme.colors.grey[500]}
        style={styles.searchIcon}
      />
      <TextInput
        value={query}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.grey[400]}
        style={[
          styles.input,
          theme.typography.body1,
          { color: theme.colors.grey[900] },
        ]}
        autoFocus={autoFocus}
        returnKeyType="search"
        clearButtonMode="never"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Feather
            name="x"
            size={20}
            color={theme.colors.grey[500]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});