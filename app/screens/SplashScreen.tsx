import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useSplashStore } from '@/store/splashStore';
import { theme } from '@/constants/DesignSystem/theme';

const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.4; // 40% of screen width
const SIGN_IN_SCREEN = '/screens/auth/SignInScreen'; // Use a constant for navigation path

export default function CustomSplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { setIsLoading } = useSplashStore();

  useEffect(() => {
    // Start fade-in and scale animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Wait for 2 seconds, then fade out and navigate
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        try {
          setIsLoading(false);
          router.replace(SIGN_IN_SCREEN); // Use constant for navigation
        } catch (error) {
          console.error('Navigation failed:', error); // Add error handling
        }
      });
    }, 2000);

    return () => {
      clearTimeout(timer); // Ensure timer is cleared
      fadeAnim.stopAnimation();
      scaleAnim.stopAnimation();
    };
  }, [fadeAnim, scaleAnim, setIsLoading]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary.main, // Use theme color
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});