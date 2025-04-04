// components/service/FilterModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../components/ThemeProvider';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Rating } from '../common/Rating';
import { SearchFilters } from '../../utils/search';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Filter Results">
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Input
            label="Location"
            value={filters.location}
            onChangeText={(text) => setFilters(prev => ({ ...prev, location: text }))}
            startIcon="map-pin"
          />
        </View>

        <View style={styles.section}>
          <Input
            label="Maximum Price"
            value={filters.maxPrice?.toString()}
            onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: parseInt(text) || undefined }))}
            startIcon="dollar-sign"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={[theme.typography.body1, styles.sectionTitle]}>
            Minimum Rating
          </Text>
          <Rating
            value={filters.minRating || 0}
            onChange={(rating) => setFilters(prev => ({ ...prev, minRating: rating }))}
            size={24}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="outlined"
            onPress={handleReset}
            style={styles.resetButton}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            onPress={handleApply}
            style={styles.applyButton}
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
  },
  sectionTitle: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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