import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { SearchBar } from '@/components/common/SearchBar';
import { Tabs } from '@/components/common/Tabs';
import { ServiceCard } from '@/components/service/ServiceCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useProviderStore } from '@/store/providers';
import { ThemedView } from '@/components/ThemedView';
import { AnimatedList } from '@/components/animations/AnimatedList';

const SEARCH_SCREEN = '/screens/home/SearchScreen';
const PROVIDER_DETAILS_SCREEN = '/screens/provider/ProviderDetailsScreen'; // Use constants for navigation paths

type Tab = { key: string; title: string };

const TABS: Tab[] = [
  { key: 'all', title: 'All' },
  { key: 'popular', title: 'Popular' },
  { key: 'new', title: 'New' },
  { key: 'nearby', title: 'Nearby' }
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>(TABS[0].key);
  const { providers, fetchProviders, loading } = useProviderStore();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProviders();
    } catch (error) {
      console.error('Failed to refresh providers:', error); // Add error handling
    } finally {
      setRefreshing(false);
    }
  }, [fetchProviders]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      try {
        router.push({
          pathname: SEARCH_SCREEN,
          params: { query }
        });
      } catch (error) {
        console.error('Navigation to search screen failed:', error); // Add error handling
      }
    }
  };

  const handleTabChange = (tabKey: string) => {
    setSelectedTab(tabKey);
  };

  const handleProviderPress = (providerId: string) => {
    try {
      router.push({
        pathname: PROVIDER_DETAILS_SCREEN,
        params: { id: providerId }
      });
    } catch (error) {
      console.error('Navigation to provider details failed:', error); // Add error handling
    }
  };

  if (loading) {
    return <LoadingState.Card />;
  }

  return (
    <ErrorBoundary>
      <SafeAreaView className="flex-1">
        <ThemedView className="flex-1">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search services..."
            // accessibilityLabel removed as it is not part of SearchBarProps
          />
          <ScrollView
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Tabs
              tabs={TABS}
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
            />
            <AnimatedList>
              {providers.map(provider => (
                <ServiceCard
                  key={provider.id}
                  id={provider.id}
                  providerName={provider.name}
                  serviceName={provider.services[0]}
                  rating={provider.rating}
                  reviewCount={0}
                  price={provider.price}
                  categories={provider.services}
                  onPress={() => handleProviderPress(provider.id)}
                  accessibilityRole="button"
                />
              ))}
            </AnimatedList>
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}