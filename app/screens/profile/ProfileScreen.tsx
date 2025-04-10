import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/ui/Avatar';

export default function ProfileScreen() {
  const handleEditProfile = () => {
    router.push('/screens/profile/ProfileCreationScreen');
  };

  const handleSettings = () => {
    router.push('/screens/profile/SettingsScreen');
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="items-center mb-6">
            <Avatar size={100} source={{ uri: 'https://via.placeholder.com/100' }} />
            <ThemedText className="text-2xl font-bold mt-4">John Doe</ThemedText>
            <ThemedText className="text-gray-600">johndoe@example.com</ThemedText>
          </View>

          <Button
            title="Edit Profile"
            onPress={handleEditProfile}
            variant="primary"
            accessibilityLabel="Edit your profile"
            accessibilityRole="button"
          />

          <Button
            title="Settings"
            onPress={handleSettings}
            variant="secondary"
            accessibilityLabel="Go to settings"
            accessibilityRole="button"
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}