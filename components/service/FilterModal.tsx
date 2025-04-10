// components/service/FilterModal.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../components/ThemeProvider';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Rating } from '../common/Rating';
import { ThemedText } from '../ThemedText';
import { SearchFilters } from '../../utils/search';
import { Badge } from '../common/Badge';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  categories?: string[];
}

interface ValidationErrors {
  maxPrice?: string;
  location?: string;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  categories = [],
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.categories || []
  );

  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
      setSelectedCategories(initialFilters.categories || []);
      setErrors({});
    }
  }, [visible, initialFilters]);

  const validateFilters = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (filters.maxPrice !== undefined) {
      if (isNaN(filters.maxPrice)) {
        newErrors.maxPrice = 'Please enter a valid price';
      } else if (filters.maxPrice < 0) {
        newErrors.maxPrice = 'Price cannot be negative';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [filters]);

  const handleApply = useCallback(() => {
    if (validateFilters()) {
      onApply({
        ...filters,
        categories: selectedCategories,
      });
      onClose();
    }
  }, [filters, selectedCategories, validateFilters, onApply, onClose]);

  const handleReset = useCallback(() => {
    setFilters({});
    setSelectedCategories([]);
    setErrors({});
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  return (
    <Modal 
      visible={visible} 
      onClose={onClose} 
      title="Filter Results"
      accessibilityLabel="Filter options"
    >
      <ScrollView 
        style={styles.container}
        accessibilityRole="adjustable"
      >
        <View style={styles.section}>
          <Input
            label="Location"
            value={filters.location}
            onChangeText={(text) => {
              setFilters(prev => ({ ...prev, location: text }));
              if (errors.location) setErrors(prev => ({ ...prev, location: undefined }));
            }}
            startIcon="map-pin"
            error={errors.location}
            accessibilityLabel="Filter by location"
            accessibilityHint="Enter location to filter service providers"
          />
        </View>

        <View style={styles.section}>
          <Input
            label="Maximum Price"
            value={filters.maxPrice?.toString()}
            onChangeText={(text) => {
              const price = text ? parseInt(text) : undefined;
              setFilters(prev => ({ ...prev, maxPrice: price }));
              if (errors.maxPrice) setErrors(prev => ({ ...prev, maxPrice: undefined }));
            }}
            startIcon="dollar-sign"
            keyboardType="numeric"
            error={errors.maxPrice}
            accessibilityLabel="Filter by maximum price"
            accessibilityHint="Enter maximum price to filter services"
          />
        </View>

        <View style={styles.section}>
          <ThemedText 
            style={[theme.typography.body1, styles.sectionTitle]}
            accessibilityRole="header"
          >
            Minimum Rating
          </ThemedText>
          <Rating
            value={filters.minRating || 0}
            onChange={(rating) => setFilters(prev => ({ ...prev, minRating: rating }))}
            size={24}
            accessibilityLabel="Filter by minimum rating"
            accessibilityHint="Select minimum rating to filter services"
          />
        </View>

        {categories.length > 0 && (
          <View style={styles.section}>
            <ThemedText 
              style={[theme.typography.body1, styles.sectionTitle]}
              accessibilityRole="header"
            >
              Categories
            </ThemedText>
            <View style={styles.categories}>
              {categories.map((category) => (
                <Badge
                  key={category}
                  label={category}
                  variant={selectedCategories.includes(category) ? "primary" : "outlined"}
                  onPress={() => toggleCategory(category)}
                  style={styles.categoryBadge}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedCategories.includes(category) }}
                  accessibilityLabel={`Category ${category}${selectedCategories.includes(category) ? ', selected' : ''}`}
                />
              ))}
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            variant="outlined"
            onPress={handleReset}
            style={styles.resetButton}
            accessibilityLabel="Reset filters"
            accessibilityHint="Clear all filter selections"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            onPress={handleApply}
            style={styles.applyButton}
            accessibilityLabel="Apply filters"
            accessibilityHint="Apply selected filters to search results"
          >
            Apply Filters
          </Button>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: '80%',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryBadge: {
    marginRight: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
  },
});