import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ServiceCard } from '@/components/service/ServiceCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { useProviderStore } from '@/store/providers';

const CATEGORY_DETAILS = {
  cleaning: { name: 'Cleaning Services', icon: '🧹' },
  repair: { name: 'Repair Services', icon: '🔧' },
  plumbing: { name: 'Plumbing Services', icon: '🚰' },
  electrical: { name: 'Electrical Services', icon: '⚡' },
  moving: { name: 'Moving Services', icon: '📦' },
  gardening: { name: 'Gardening Services', icon: '🌱' }
};

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: keyof typeof CATEGORY_DETAILS }>();
  const { providers, loading, error } = useProviderStore();

  const categoryDetails = CATEGORY_DETAILS[category];
  const filteredProviders = providers.filter(provider => 
    provider.services.some(service => service.toLowerCase().includes(category.toLowerCase()))
  );

  const handleProviderPress = (providerId: string) => {
    router.push({
      pathname: '/screens/provider/ProviderDetailsScreen',
      params: { id: providerId }
    });
  };

  if (loading) return <LoadingState.Card />;
  if (error) return <ErrorState message={error} />;
  if (!categoryDetails) return <ErrorState message="Category not found" />;

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <View className="p-4">
          <View className="flex-row items-center mb-4">
            <ThemedText className="text-3xl mr-2">{categoryDetails.icon}</ThemedText>
            <ThemedText className="text-2xl font-bold">{categoryDetails.name}</ThemedText>
          </View>
          <ThemedText className="text-gray-600">
            {filteredProviders.length} providers available
          </ThemedText>
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
                No providers available in this category
              </ThemedText>
            </View>
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}