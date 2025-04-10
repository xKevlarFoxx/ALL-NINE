import { useRef } from 'react';
import { Animated, Keyboard } from 'react-native';

export const useKeyboardAwareAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  Keyboard.addListener('keyboardDidShow', () => {
    Animated.timing(fadeAnim, { toValue: 0.5, duration: 300, useNativeDriver: true }).start();
    Animated.timing(slideAnim, { toValue: -50, duration: 300, useNativeDriver: true }).start();
    Animated.timing(logoScale, { toValue: 0.8, duration: 300, useNativeDriver: true }).start();
  });

  Keyboard.addListener('keyboardDidHide', () => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    Animated.timing(logoScale, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  });

  return { fadeAnim, slideAnim, logoScale };
};