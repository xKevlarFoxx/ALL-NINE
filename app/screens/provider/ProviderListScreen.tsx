// app/screens/ProviderListScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ServiceCard } from '@/components/service/ServiceCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { FilterModal } from '@/components/service/FilterModal';
import { usePagination } from '@/hooks/usePagination';
import { filterProviders, SearchFilters } from '@/utils/search';
import { ServiceProvider } from '@/types';
import { Feather } from '@expo/vector-icons'; 

export const ProviderListScreen = () => { 
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const { currentPage, pageSize, hasMore, nextPage, updateHasMore } = usePagination();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Handlers
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filteredProviders = filterProviders(providers, filters, text);
    setProviders(filteredProviders);
  };

  const renderItem = ({ item }: { item: ServiceProvider }) => (
    <ServiceCard
      id={item.id}
      providerName={item.name}
      providerAvatar={item.avatar}
      serviceName={item.profession}
      rating={item.rating}
      reviewCount={item.reviewCount}
      price={item.pricing.basePrice}
      currency={item.pricing.currency}
      categories={item.categories}
      distance="2.5 km"
      onPress={() => {
        // Navigate to provider details
      }}
    />
  );

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/providers?page=${currentPage}&limit=${pageSize}`
      );
      const data = await response.json();
      setProviders(prev => 
        currentPage === 1 ? data.providers : [...prev, ...data.providers]
      );
      updateHasMore(data.hasMore);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorState onRetry={fetchProviders} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Input
          placeholder="Search providers..."
          value={searchQuery}
          onChangeText={handleSearch}
          startIcon="search"
          containerStyle={styles.searchInput}
        />
        <Button
          variant="outlined"
          onPress={() => setFilterModalVisible(true)}
        >
          <View style={styles.buttonContent}>
            <Feather name="filter" size={20} color="#000" />
            <Text style={styles.buttonText}>Filter</Text>
          </View>
        </Button>
      </View>
      
      <FlatList
        data={providers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        onEndReached={() => {
          if (hasMore && !loading) {
            nextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => 
          loading ? <LoadingState.Row /> : null
        }
        contentContainerStyle={styles.list}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          const filteredProviders = filterProviders(providers, newFilters, searchQuery);
          setProviders(filteredProviders);
        }}
        initialFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  searchInput: {
    flex: 1,
    marginRight: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 8,
  },
  list: {
    paddingBottom: 16,
  },
});

export default ProviderListScreen;