import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { SearchBar } from '@/components/common/SearchBar';
import { Tabs } from '@/components/common/Tabs';
import { ServiceCard } from '@/components/service/ServiceCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorBoundary } from '@/components/errorBoundary';
import { useProviderStore } from '@/store/providers';
import { ThemedView } from '@/components/ThemedView';
import { AnimatedList } from '@/components/animations/AnimatedList';

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
    await fetchProviders();
    setRefreshing(false);
  }, [fetchProviders]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push({
        pathname: '/screens/home/SearchScreen',
        params: { query }
      });
    }
  };

  const handleTabChange = (tabKey: string) => {
    setSelectedTab(tabKey);
  };

  const handleProviderPress = (providerId: string) => {
    router.push({
      pathname: '/screens/provider/ProviderDetailsScreen',
      params: { id: providerId }
    });
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
                />
              ))}
            </AnimatedList>
          </ScrollView>
        </ThemedView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}