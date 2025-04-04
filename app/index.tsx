import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useSplashStore } from '@/store/splashStore';
import CustomSplashScreen from './screens/SplashScreen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { isLoading } = useSplashStore();

  // Load fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  // Hide the native splash screen once fonts are loaded
  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    
    hideSplash();
  }, [fontsLoaded]);

  // Don't show anything while fonts are loading
  if (!fontsLoaded) {
    return null;
  }

  // Show custom splash screen while in loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <CustomSplashScreen />
      </View>
    );
  }

  // Redirect to SignInScreen when not loading
  return <Redirect href="/screens/auth/SignInScreen" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});