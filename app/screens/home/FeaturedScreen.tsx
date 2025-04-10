import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ServiceCard } from '@/components/service/ServiceCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { useProviderStore } from '@/store/providers';

const PROVIDER_DETAILS_SCREEN = '/screens/provider/ProviderDetailsScreen'; // Use constants for navigation paths

export default function FeaturedScreen() {
  const { providers, loading, error } = useProviderStore();

  // Filter providers with a rating of 4.5 or higher
  const featuredProviders = providers.filter(provider => provider.rating >= 4.5);

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

  if (loading) return <LoadingState.Card />;
  if (error) return <ErrorState message={error} />;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <View className="p-4">
          <ThemedText className="text-2xl font-bold mb-2">Featured Providers</ThemedText>
          <ThemedText className="text-gray-600 mb-4">
            Top-rated service providers in your area
          </ThemedText>
        </View>

        <FlatList
          data={featuredProviders}
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
              accessibilityLabel={`View details for ${item.name}`}
              accessibilityRole="button"
            />
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View className="p-4 items-center">
              <ThemedText className="text-gray-500">
                No featured providers available at the moment
              </ThemedText>
            </View>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}