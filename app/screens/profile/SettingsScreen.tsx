import { View, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/common/Button';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleToggleDarkMode = () => {
    setDarkModeEnabled(!darkModeEnabled);
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('User logged out');
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedView className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="mb-6">
            <ThemedText className="text-2xl font-bold mb-4">Settings</ThemedText>

            <View className="flex-row justify-between items-center mb-4">
              <ThemedText>Enable Notifications</ThemedText>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
              />
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <ThemedText>Dark Mode</ThemedText>
              <Switch
                value={darkModeEnabled}
                onValueChange={handleToggleDarkMode}
              />
            </View>
          </View>

          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            accessibilityLabel="Log out of your account"
            accessibilityRole="button"
          />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}