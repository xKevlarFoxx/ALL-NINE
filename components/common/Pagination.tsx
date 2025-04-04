// components/common/Pagination.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Feather } from '@expo/vector-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  style?: ViewStyle;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  style,
}) => {
  const theme = useTheme();

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={[
          styles.arrow,
          currentPage === 1 && { opacity: 0.5 },
        ]}
      >
        <Feather
          name="chevron-left"
          size={20}
          color={theme.colors.grey[800]}
        />
      </TouchableOpacity>

      <View style={styles.pageNumbers}>
        {getPageNumbers().map((page, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => typeof page === 'number' && onPageChange(page)}
            disabled={typeof page === 'string'}
            style={[
              styles.pageNumber,
              typeof page === 'number' && page === currentPage && {
                backgroundColor: theme.colors.primary.main,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.body2,
                {
                  color:
                    typeof page === 'number' && page === currentPage
                      ? theme.colors.grey[50]
                      : theme.colors.grey[800],
                },
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={[
          styles.arrow,
          currentPage === totalPages && { opacity: 0.5 },
        ]}
      >
        <Feather
          name="chevron-right"
          size={20}
          color={theme.colors.grey[800]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageNumber: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  arrow: {
    padding: 8,
  },
});