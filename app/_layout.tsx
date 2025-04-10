// app/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProvider } from '@/components/ThemeProvider';
import { theme } from '@/constants/DesignSystem/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded, error] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    } else if (error) {
      console.error('Font loading failed:', error); // Added error handling
    }
  }, [loaded, error]);

  if (!loaded) return null;

  return (
    <ThemeProvider theme={theme}> {/* Ensure consistent theming */}
      <Stack
        screenOptions={({ route }) => ({
          headerShown: false, // Dynamic screen options
          title: route.name === 'index' ? 'Home' : undefined,
        })}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar 
        style={colorScheme === 'dark' ? 'light' : 'dark'} 
        backgroundColor="transparent" 
        translucent 
      />
    </ThemeProvider>
  );
}