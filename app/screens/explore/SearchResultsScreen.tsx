import { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/components/common/SearchBar';
import { ServiceCard } from '@/components/service/ServiceCard';
import { Button } from '@/components/common/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { useProviderStore } from '@/store/providers';

interface FilterOptions {
  priceRange: { min: number; max: number };
  rating: number;
  distance: number;
  categories: string[];
}

export default function SearchResultsScreen() {
  const { query, filters: filterString } = useLocalSearchParams<{ 
    query: string;
    filters?: string;
  }>();
  
  const [searchQuery, setSearchQuery] = useState(query || '');
  const { providers, loading, error } = useProviderStore();
  const filters: FilterOptions | null = filterString ? JSON.parse(filterString) : null;

  const filteredProviders = providers.filter(provider => {
    let matches = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.services.some(service => 
        service.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (filters) {
      const { priceRange, rating, categories } = filters;
      matches = matches &&
        provider.price >= priceRange.min &&
        provider.price <= priceRange.max &&
        provider.rating >= rating;

      if (categories.length > 0) {
        matches = matches && provider.services.some(service =>
          categories.includes(service.toLowerCase())
        );
      }
    }

    return matches;
  });

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleProviderPress = (providerId: string) => {
    router.push({
      pathname: '/screens/provider/ProviderDetailsScreen',
      params: { id: providerId }
    });
  };

  const handleFilter = () => {
    router.push('/screens/home/FilterScreen');
  };

  if (loading) return <LoadingState.Card />;
  if (error) return <ErrorState message={error} />;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <View className="p-4 border-b border-gray-200">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search services..."
            autoFocus
          />
          <View className="flex-row justify-between items-center mt-4">
            <ThemedText className="text-gray-600">
              {filteredProviders.length} results found
            </ThemedText>
            <Button
              children="Filter"
              onPress={handleFilter}
              variant="secondary"
            />
          </View>
        </View>

        <FlatList
          data={filteredProviders}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              id={item.id}
              providerName={item.name}
              serviceName={item.services[0]}
              rating={item.rating}
              reviewCount={0}
              price={item.price}
              categories={item.services}
              onPress={() => handleProviderPress(item.id)}
            />
          )}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View className="p-4 items-center">
              <ThemedText className="text-gray-500">
                No results found for "{searchQuery}"
              </ThemedText>
            </View>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}