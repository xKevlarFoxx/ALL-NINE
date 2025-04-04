import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/components/common/SearchBar';
import { Card } from '@/components/common/Card';
import { AnimatedList } from '@/components/animations/AnimatedList';

const CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'repair', name: 'Repair', icon: '🔧' },
  { id: 'plumbing', name: 'Plumbing', icon: '🚰' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'moving', name: 'Moving', icon: '📦' },
  { id: 'gardening', name: 'Gardening', icon: '🌱' }
];

const TRENDING_SEARCHES = [
  'House Cleaning',
  'Plumber Emergency',
  'Electrician',
  'Moving Help',
  'Lawn Care'
];

export default function ExploreScreen() {
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push({
        pathname: '/screens/explore/SearchResultsScreen',
        params: { query }
      });
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/screens/explore/CategoryScreen',
      params: { category: categoryId }
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <View className="p-4">
          <ThemedText className="text-2xl font-bold mb-4">Explore Services</ThemedText>
          <SearchBar
            onSearch={handleSearch}
            placeholder="What service do you need?"
          />
        </View>

        <ScrollView className="flex-1">
          <View className="p-4">
            <ThemedText className="text-lg font-bold mb-4">Categories</ThemedText>
            <AnimatedList>
              <View className="flex-row flex-wrap justify-between">
                {CATEGORIES.map(category => (
                  <Card
                    key={category.id}
                    onPress={() => handleCategoryPress(category.id)}
                    className="w-[48%] mb-4 p-4 items-center"
                  >
                    <ThemedText className="text-2xl mb-2">{category.icon}</ThemedText>
                    <ThemedText className="font-medium">{category.name}</ThemedText>
                  </Card>
                ))}
              </View>
            </AnimatedList>
          </View>

          <View className="p-4">
            <ThemedText className="text-lg font-bold mb-4">Trending Searches</ThemedText>
            <AnimatedList>
              {TRENDING_SEARCHES.map((search, index) => (
                <Card
                  key={index}
                  onPress={() => handleSearch(search)}
                  className="mb-2 p-4"
                >
                  <ThemedText>{search}</ThemedText>
                </Card>
              ))}
            </AnimatedList>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}