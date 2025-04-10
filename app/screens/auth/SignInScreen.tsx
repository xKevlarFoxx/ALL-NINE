
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Image,
  Dimensions,
  Keyboard,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/components/ThemeProvider';
// Import your themes configuration which maps theme names to complete theme objects
import themes from '@/theme/themes'; // Adjusted the path to use an alias for the themes file.
import { Feather, AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';

// Types for our component
interface FormData {
  email: string;
  password: string;
}

interface StylesProps {
  theme: any;
  insets: { bottom: number };
}

const { width, height } = Dimensions.get('window');
const createStyles = (insets: { bottom: number }, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    logoContainer: {
      alignItems: 'center',
      marginTop: height * 0.12,
      marginBottom: height * 0.05,
    },
    logo: {
      width: width * 0.35,
      height: width * 0.35,
    },
    formContainer: {
      flex: 1,
      paddingHorizontal: 24,
    },
    inputWrapper: {
      marginBottom: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    inputWrapperFocused: {
      shadowOpacity: 0.2,
      shadowRadius: 5.84,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      overflow: 'hidden',
    },
    input: {
      flex: 1,
      marginLeft: 12,
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    eyeIcon: {
      padding: 4,
    },
    rememberedSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      width: '100%',
    },
    rememberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.colors.secondary.main,
      borderColor: theme.colors.secondary.main,
    },
    rememberText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 14,
      fontWeight: '500',
    },
    forgotPassword: {
      alignSelf: 'flex-end',
    },
    forgotPasswordText: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 14,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20,
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.grey[900],
    },
    closeButton: {
      padding: 4,
    },
    modalDescription: {
      color: theme.colors.grey[600],
      marginBottom: 20,
      lineHeight: 20,
    },
    modalInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.grey[100],
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 50,
      marginBottom: 20,
    },
    modalInputText: {
      flex: 1,
      marginLeft: 12,
      color: theme.colors.grey[900],
      fontSize: 16,
    },
    resetButton: {
      height: 50,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resetButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    signInButton: {
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    signInButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 32,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dividerText: {
      color: 'rgba(255, 255, 255, 0.6)',
      paddingHorizontal: 16,
      fontSize: 14,
    },
    socialContainer: {
      gap: 12,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: 48,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    appleButton: {
      backgroundColor: '#000000',
    },
    googleButton: {
      backgroundColor: '#DB4437',
    },
    socialButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 12,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 32,
      paddingBottom: insets?.bottom + 16 || 16,
    },
    footerText: {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: 16,
    },
    footerLink: {
      color: 'white',
      fontSize: 16,
      fontWeight: '700',
      textDecorationLine: 'underline',
    },
    createAccountButton: {
      padding: 4,
    },
  });

const SIGN_UP_SCREEN = '/screens/auth/SignUpScreen'; // Use constants for navigation paths
const TABS_SCREEN = '/(tabs)';

const SignInScreen = () => {
  // Instead of receiving a full theme object, we destructure the theme name and other properties.
  const { theme: themeName, fontSize, setTheme, setFontSize } = useTheme();
  // Map the theme name to a complete theme object that includes colors and other config.
  const currentTheme = themes[themeName];

  const insets = useSafeAreaInsets();
  const styles = createStyles(insets, currentTheme);

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const inputsSlide = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Button press animations
  const socialButtonScales = {
    apple: useRef(new Animated.Value(1)).current,
    google: useRef(new Animated.Value(1)).current,
  };

  const animateButtonPress = (buttonRef: Animated.Value) => {
    Animated.sequence([
      Animated.timing(buttonRef, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonRef, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -height * 0.15,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(inputsSlide, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    animateButtonPress(buttonScale);

    try {
      // Add your authentication logic here
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.replace(TABS_SCREEN); // Use constant for navigation
    } catch (error) {
      console.error('Sign-in failed:', error);
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: 'apple' | 'google') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateButtonPress(socialButtonScales[provider]);
    try {
      // Add your social authentication logic here
      console.log(`Signing in with ${provider}`);
    } catch (error) {
      console.error(`${provider} sign-in failed:`, error);
      Alert.alert('Error', `Failed to sign in with ${provider}. Please try again.`);
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setResetEmail(email);
    setIsForgotPasswordVisible(true);
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsResetting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Add your password reset logic here
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsForgotPasswordVisible(false);
      Alert.alert('Success', 'Reset instructions have been sent to your email');
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const renderForgotPasswordModal = () => (
    <Modal
      visible={isForgotPasswordVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsForgotPasswordVisible(false)}
    >
      <BlurView intensity={Platform.OS === 'ios' ? 90 : 100} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <TouchableOpacity onPress={() => setIsForgotPasswordVisible(false)} style={styles.closeButton}>
              <Feather name="x" size={24} color={currentTheme.colors.grey[600]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalDescription}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
          <View style={styles.modalInput}>
            <Feather name="mail" size={20} color={currentTheme.colors.grey[400]} />
            <TextInput
              style={styles.modalInputText}
              placeholder="Enter your email"
              placeholderTextColor={currentTheme.colors.grey[400]}
              value={resetEmail}
              onChangeText={setResetEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
          </View>
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: currentTheme.colors.secondary.main }]}
            onPress={handleResetPassword}
            disabled={isResetting}
          >
            {isResetting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
            )}
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );

  const renderInputField = (
    type: 'email' | 'password',
    icon: string,
    placeholder: string,
    value: string,
    onChange: (text: string) => void
  ) => {
    const isFocused = focusedInput === type;
    return (
      <Animated.View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <BlurView intensity={80} style={styles.inputContainer}>
          <Feather name={icon as any} size={20} color={isFocused ? currentTheme.colors.primary.main : currentTheme.colors.grey[400]} />
          <TextInput
            style={[styles.input, isFocused && { color: currentTheme.colors.primary.main }]}
            placeholder={placeholder}
            placeholderTextColor={currentTheme.colors.grey[400]}
            value={value}
            onChangeText={onChange}
            onFocus={() => setFocusedInput(type)}
            onBlur={() => setFocusedInput(null)}
            secureTextEntry={type === 'password' && !isPasswordVisible}
            autoCapitalize="none"
            keyboardType={type === 'email' ? 'email-address' : 'default'}
          />
          {type === 'password' && (
            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
              <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={20} color={currentTheme.colors.grey[400]} />
            </TouchableOpacity>
          )}
        </BlurView>
      </Animated.View>
    );
  };

  const renderSocialButton = (
    provider: 'apple' | 'google',
    icon: React.ReactNode,
    text: string,
    style: object
  ) => (
    <Animated.View style={{ transform: [{ scale: socialButtonScales[provider] }] }}>
      <TouchableOpacity
        style={[styles.socialButton, style]}
        onPress={() => handleSocialSignIn(provider)}
        accessibilityLabel={`Sign in with ${provider}`}
        accessibilityRole="button"
      >
        {icon}
        <Text style={styles.socialButtonText}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[currentTheme.colors.primary.dark, currentTheme.colors.primary.main, currentTheme.colors.secondary.main]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: logoScale }],
          },
        ]}
      >
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>
      <MotiView style={styles.formContainer} from={{ opacity: 0, translateY: 50 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 1000 }}>
        {renderInputField('email', 'mail', 'Email', email, setEmail)}
        {renderInputField('password', 'lock', 'Password', password, setPassword)}
        <View style={styles.rememberedSection}>
          <TouchableOpacity
            style={styles.rememberContainer}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setRememberMe(!rememberMe);
            }}
            accessibilityLabel="Remember Me"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Feather name="check" size={14} color="white" />}
            </View>
            <Text style={styles.rememberText}>Remember Me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPassword} accessibilityLabel="Forgot Password" accessibilityRole="button">
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.signInButton, { backgroundColor: currentTheme.colors.secondary.main }]}
            onPress={handleSignIn}
            disabled={isLoading}
            accessibilityLabel="Sign In"
            accessibilityRole="button"
          >
            {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.signInButtonText}>Sign In</Text>}
          </TouchableOpacity>
        </Animated.View>
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>
        <View style={styles.socialContainer}>
          {renderSocialButton('apple', <AntDesign name="apple1" size={24} color="white" />, 'Sign in with Apple', styles.appleButton)}
          {renderSocialButton('google', <AntDesign name="google" size={24} color="white" />, 'Sign in with Google', styles.googleButton)}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Not part of the family yet? </Text>
          <TouchableOpacity onPress={() => router.push(SIGN_UP_SCREEN)} style={styles.createAccountButton} accessibilityLabel="Create Account" accessibilityRole="button">
            <Text style={styles.footerLink}>Create account</Text>
          </TouchableOpacity>
        </View>
      </MotiView>
      {renderForgotPasswordModal()}
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
