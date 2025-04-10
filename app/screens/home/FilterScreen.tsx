import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Tabs } from '@/components/common/Tabs';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Rating } from '@/components/common/Rating';

interface FilterOptions {
  priceRange: { min: number; max: number };
  rating: number;
  distance: number;
  categories: string[];
}

const CATEGORIES = [
  { key: 'all', title: 'All Services' },
  { key: 'cleaning', title: 'Cleaning' },
  { key: 'repair', title: 'Repair' },
  { key: 'plumbing', title: 'Plumbing' },
  { key: 'electrical', title: 'Electrical' }
];

const FILTER_RESULTS_SCREEN = '/screens/home/FilterResultsScreen'; // Use constants for navigation paths

export default function FilterScreen() {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    distance: 10,
    categories: []
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(true);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const updatedCategories = category === 'all' 
      ? [] 
      : [...filters.categories, category];
    setFilters(prev => ({ ...prev, categories: updatedCategories }));
  };

  const handlePriceChange = (key: 'min' | 'max', value: string) => {
    const numValue = Number(value) || 0;
    setFilters(prev => ({
      ...prev,
      priceRange: { ...prev.priceRange, [key]: numValue }
    }));
  };

  const handleRatingChange = (value: number) => {
    setFilters(prev => ({ ...prev, rating: value }));
  };

  const handleDistanceChange = (value: string) => {
    setFilters(prev => ({ ...prev, distance: Number(value) || 0 }));
  };

  const handleApplyFilters = () => {
    try {
      router.push({
        pathname: FILTER_RESULTS_SCREEN,
        params: { filters: JSON.stringify(filters) }
      });
    } catch (error) {
      console.error('Navigation to filter results failed:', error); // Add error handling
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView className="flex-1 p-4">
          <View className="mb-6">
            <ThemedText className="text-lg font-bold mb-4">Categories</ThemedText>
            <Tabs
              tabs={CATEGORIES}
              selectedTab={selectedCategory}
              onTabChange={handleCategoryChange}
            />
          </View>

          <View className="mb-6">
            <ThemedText className="text-lg font-bold mb-4">Price Range</ThemedText>
            <View className="flex-row space-x-4">
              <Input
                placeholder="Min"
                value={filters.priceRange.min.toString()}
                onChangeText={(value) => handlePriceChange('min', value)}
                keyboardType="numeric"
                className="flex-1"
                accessibilityLabel="Enter minimum price"
              />
              <Input
                placeholder="Max"
                value={filters.priceRange.max.toString()}
                onChangeText={(value) => handlePriceChange('max', value)}
                keyboardType="numeric"
                className="flex-1"
                accessibilityLabel="Enter maximum price"
              />
            </View>
          </View>

          <View className="mb-6">
            <ThemedText className="text-lg font-bold mb-4">Minimum Rating</ThemedText>
            <Rating
              value={filters.rating}
              onChange={handleRatingChange}
              size={24}
              accessibilityLabel="Select minimum rating"
            />
          </View>

          <View className="mb-6">
            <ThemedText className="text-lg font-bold mb-4">Distance (km)</ThemedText>
            <Input
              value={filters.distance.toString()}
              onChangeText={handleDistanceChange}
              keyboardType="numeric"
              accessibilityLabel="Enter maximum distance"
            />
          </View>
        </ScrollView>

        <BottomSheet
            isVisible={isBottomSheetVisible}
            onClose={() => setIsBottomSheetVisible(false)}
            >
          <Button
            children="Apply Filters"
            onPress={handleApplyFilters}
            variant="primary"
            fullWidth
            accessibilityLabel="Apply selected filters"
            accessibilityRole="button"
          />
        </BottomSheet>
      </ThemedView>
    </SafeAreaView>
  );
}