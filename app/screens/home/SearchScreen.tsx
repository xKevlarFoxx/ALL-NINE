import { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import { SearchBar } from '@/components/common/SearchBar';
import { ServiceCard } from '@/components/service/ServiceCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { ThemedView } from '@/components/ThemedView';
import { useProviderStore } from '@/store/providers';

export default function SearchScreen() {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState(query || '');
  const { providers, loading, error } = useProviderStore();
  const [filteredProviders, setFilteredProviders] = useState(providers);

  useEffect(() => {
    const results = providers.filter(provider => 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.services.some(service => 
        service.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredProviders(results);
  }, [searchQuery, providers]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleProviderPress = (providerId: string) => {
    router.push({
      pathname: '/screens/provider/ProviderDetailsScreen',
      params: { id: providerId }
    });
  };

  if (loading) return <LoadingState.Card />;
  if (error) return <ErrorState message={error} />;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search services..."
          autoFocus
        />
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
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      </ThemedView>
    </SafeAreaView>
  );
}