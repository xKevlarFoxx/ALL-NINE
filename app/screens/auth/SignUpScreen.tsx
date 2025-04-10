import { encryptData } from '../../utils/encryption';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { router } from 'expo-router';

import { FormErrorBoundary } from '@/components/FormErrorBoundary';
import FormInput from '@/components/FormInput';
import DatePickerModal from '@/components/DatePickerModal';
import HelpModal from '@/components/HelpModal';
import ProgressIndicator from '@/components/ProgressIndicator';
import { useFormContext, FormProvider } from '@/hooks/useFormContext';
import { useKeyboardAwareAnimations } from '@/hooks/useKeyboardAwareAnimations';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, STEPS, VALIDATION_RULES, SECURE_STORE_KEYS, AUTOSAVE_DELAY } from '@/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';

// Use network status hook
const useNetworkStatus = () => {
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);
  return isOffline;
};

// Auto-save hook
const useAutoSave = (state: any) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout>();
  const isOffline = useNetworkStatus();
  useEffect(() => {
    const saveData = async () => {
      if (isOffline) return;
      try {
        await AsyncStorage.setItem(
          SECURE_STORE_KEYS.FORM_DATA,
          JSON.stringify({
            currentStep: state.currentStep,
            data: {
              fullName: state.data.fullName,
              email: state.data.email,
              phoneNumber: state.data.phoneNumber,
              dateOfBirth: state.data.dateOfBirth,
              preferences: state.data.preferences
            }
          })
        );
        if (state.data.password) {
          const sensitiveInfo = {
            password: state.data.password,
            confirmPassword: state.data.confirmPassword
          };
          const encryptedData = encryptData(JSON.stringify(sensitiveInfo));
          await setItemAsync(SECURE_STORE_KEYS.SENSITIVE_DATA, encryptedData);
        }
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error auto-saving:', error);
      }
    };

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(saveData, AUTOSAVE_DELAY);
    return () => saveTimeout.current && clearTimeout(saveTimeout.current);
  }, [state, isOffline]);
  return lastSaved;
};

const SignUpScreenContent: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useFormContext();
  const { fadeAnim, slideAnim, logoScale } = useKeyboardAwareAnimations();
  const isOffline = useNetworkStatus();
  const lastSaved = useAutoSave(state);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Manage help content for current field – in a real app this might be derived from the step config.
  const [currentHelpContent, setCurrentHelpContent] = useState<any>(null);

  // Validate current step fields using the provided VALIDATION_RULES
  const validateCurrentStep = useCallback((): boolean => {
    const currentFields = STEPS[state.currentStep].fields;
    const newErrors: Record<string, string> = {};
    currentFields.forEach((field: string) => {
      const value = String(state.data[field] || '');
      const rules = VALIDATION_RULES[field];
      if (rules) {
        for (const rule of rules) {
          if (!rule.validator(value, state.data)) {
            newErrors[field] = rule.message;
            break;
          }
        }
      }
    });
    if (Object.keys(newErrors).length > 0) {
      dispatch({
        type: 'VALIDATE_FIELD',
        payload: { field: currentFields[0], result: { errors: newErrors, isValid: false } }
      });
      return false;
    }
    return true;
  }, [state, dispatch]);

  const simulateAPICall = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleSubmit = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await simulateAPICall();
      await Promise.all([
        AsyncStorage.removeItem(SECURE_STORE_KEYS.FORM_DATA),
        deleteItemAsync(SECURE_STORE_KEYS.SENSITIVE_DATA)
      ]);
      Alert.alert(
        'Success',
        SUCCESS_MESSAGES.ACCOUNT_CREATED,
        [{ text: 'Continue', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error) {
      console.error('Account creation failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleNext = async () => {
    if (state.currentStep < STEPS.length - 1) {
      if (validateCurrentStep()) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        dispatch({ type: 'SET_STEP', payload: state.currentStep + 1 });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', ERROR_MESSAGES.VALIDATION_ERROR);
      }
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (state.currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dispatch({ type: 'SET_STEP', payload: state.currentStep - 1 });
    }
  };

  // Render inputs for current step
  const renderCurrentStep = () => {
    const step = STEPS[state.currentStep];
    const motiTransitionConfig: { type: 'timing'; duration: number } = { type: 'timing', duration: 300 };

    const handleHelpPress = useCallback((field: string) => {
      setCurrentHelpContent(step.helpContent || null);
      dispatch({ type: 'TOGGLE_HELP', payload: field });
    }, [dispatch, step.helpContent]);

    return (
      <MotiView
        from={{ opacity: 0, translateX: 20 }}
        animate={{ opacity: 1, translateX: 0 }}
        exit={{ opacity: 0, translateX: -20 }}
        transition={motiTransitionConfig}
        style={styles.stepContainer}
      >
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>
        {step.fields.map((field: string) => (
          <FormInput
            key={field}
            field={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            icon={
              field === 'email'
                ? 'mail'
                : field === 'password' || field === 'confirmPassword'
                ? 'lock'
                : field === 'dateOfBirth'
                ? 'calendar'
                : 'user'
            }
            error={state.validation.errors[field] || ''}
            secureTextEntry={field.toLowerCase().includes('password')}
            onHelpPress={() => handleHelpPress(field)}
          />
        ))}
        {step.id === 'profile' && (
          <TouchableOpacity
            onPress={() => {
              setShowDatePicker(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.datePickerText}>Open Date Picker</Text>
          </TouchableOpacity>
        )}
      </MotiView>
    );
  };

  return (
    <FormErrorBoundary>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingBottom: insets.bottom }]}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['rgba(47,125,121,1)', 'rgba(83,144,127,1)', 'rgba(186,144,75,1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {isOffline && (
          <MotiView from={{ opacity: 0, translateY: -50 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>{ERROR_MESSAGES.NETWORK_ERROR}</Text>
          </MotiView>
        )}
        <Animated.ScrollView style={{ transform: [{ translateY: slideAnim }] }} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="App logo" />
          </Animated.View>
          <ProgressIndicator currentStep={state.currentStep} totalSteps={STEPS.length} completedSteps={[]} />
          {renderCurrentStep()}
          <View style={styles.buttonContainer}>
            {state.currentStep > 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Go back" accessibilityRole="button">
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.nextButton, state.ui.isLoading && styles.nextButtonDisabled]} onPress={handleNext} disabled={state.ui.isLoading} accessibilityLabel={state.currentStep === STEPS.length - 1 ? 'Create account' : 'Next step'} accessibilityRole="button">
              {state.ui.isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.nextButtonText}>{state.currentStep === STEPS.length - 1 ? 'Create Account' : 'Next'}</Text>}
            </TouchableOpacity>
          </View>
          {lastSaved && (
            <Text style={styles.lastSavedText}>Last saved {formatDistanceToNow(lastSaved)} ago</Text>
          )}
        </Animated.ScrollView>
        <DatePickerModal
          visible={showDatePicker}
          currentDate={state.data.dateOfBirth ? new Date(state.data.dateOfBirth) : new Date()}
          onClose={() => setShowDatePicker(false)}
          onSelect={(date) => dispatch({ type: 'SET_FIELD_VALUE', payload: { field: 'dateOfBirth', value: date.toISOString().split('T')[0] } })}
        />
        <HelpModal visible={state.ui.helpModalVisible} helpContent={currentHelpContent} onClose={() => dispatch({ type: 'TOGGLE_HELP', payload: null })} />
      </KeyboardAvoidingView>
    </FormErrorBoundary>
  );
};

const SignUpScreen = () => {
  return (
    <FormProvider>
      <SignUpScreenContent />
    </FormProvider>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32
  },
  logo: {
    width: 100,
    height: 100
  },
  stepContainer: {
    flex: 1
  },
  stepHeader: {
    marginBottom: 24,
    alignItems: 'center'
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center'
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center'
  },
  datePickerText: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 16,
    textDecorationLine: 'underline'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  nextButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 120,
    alignItems: 'center'
  },
  nextButtonDisabled: {
    opacity: 0.5
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  offlineBanner: {
    backgroundColor: 'rgba(255,152,0,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  offlineBannerText: {
    color: 'white',
    fontSize: 14
  },
  lastSavedText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8
  }
});