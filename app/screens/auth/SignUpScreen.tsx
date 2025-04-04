import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext, Suspense } from 'react';
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
  PanResponder,
  AccessibilityInfo,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  TextStyle
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/components/ThemeProvider';
import { Feather, AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { formatDistanceToNow, isValid as isValidDate, parse as parseDate } from 'date-fns';
import { debounce } from 'lodash';

// Types and Interfaces
type StepId = 'basicInfo' | 'security' | 'profile' | 'review';
type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';
type ThemeMode = 'light' | 'dark' | 'system';
type AnimationState = 'entering' | 'entered' | 'exiting' | 'exited';

interface ThemeType {
  colors: {
    primary: {
      dark: string;
      main: string;
      light: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    error: {
      main: string;
      light: string;
      dark: string;
    };
    background: {
      default: string;
      paper: string;
      gradient: string[];
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

interface Step {
  id: StepId;
  title: string;
  description: string;
  fields: Array<keyof FormData>;
  isCompleted: boolean;
  isOptional?: boolean;
  helpContent?: {
    title: string;
    content: string;
    examples?: string[];
    requirements?: string[];
  };
  validation?: ValidationRules;
}

interface HelpContent {
  title: string;
  content: string;
  examples?: string[];
  requirements?: string[];
}

interface ValidationRule {
  validator: (value: string, formData?: FormData) => boolean;
  message: string;
  level: 'error' | 'warning';
}

interface ValidationRules {
  [key: string]: ValidationRule[];
}

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  preferences?: UserPreferences;
}

interface UserPreferences {
  notifications: boolean;
  marketing: boolean;
  theme: ThemeMode;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

interface FormState {
  currentStep: number;
  data: FormData;
  validation: {
    errors: Record<string, string>;
    warnings: Record<string, string>;
    dirtyFields: Set<keyof FormData>;
    touchedFields: Set<keyof FormData>;
    isStepValid: boolean;
    status: ValidationStatus;
  };
  ui: {
    isLoading: boolean;
    showDatePicker: boolean;
    isPasswordVisible: boolean;
    focusedField: keyof FormData | null;
    helpModalVisible: boolean;
    currentHelpTopic: string | null;
    isOffline: boolean;
    lastSaved: Date | null;
    theme: ThemeMode;
    animation: AnimationState;
  };
}

type FormAction =
  | { type: 'SET_FIELD_VALUE'; payload: { field: keyof FormData; value: string } }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'VALIDATE_FIELD'; payload: { field: keyof FormData; result: ValidationResult } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_PASSWORD' }
  | { type: 'SET_FOCUS'; payload: keyof FormData | null }
  | { type: 'TOGGLE_HELP'; payload: string | null }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_ANIMATION'; payload: AnimationState }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'RESTORE_STATE'; payload: Partial<FormState> }
  | { type: 'RESET_FORM' };

// Constants
const { width, height } = Dimensions.get('window');
const LOGO_SIZE = width * 0.25;
const INPUT_HEIGHT = 56;
const ANIMATION_DURATION = 300;
const AUTOSAVE_DELAY = 1000;
const MAX_ATTEMPTS = 3;

const SPRING_CONFIG = {
  damping: 15,
  mass: 1,
  stiffness: 200,
  overshootClamping: false,
  restSpeedThreshold: 0.001,
  restDisplacementThreshold: 0.001,
} as const;

const SECURE_STORE_KEYS = {
  FORM_DATA: 'signup_form_data',
  USER_PREFERENCES: 'user_preferences',
  SENSITIVE_DATA: 'sensitive_data',
} as const;

const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_WEAK: 'Password is too weak',
  PASSWORD_MISMATCH: 'Passwords do not match',
  NETWORK_ERROR: 'You appear to be offline. Changes will be saved locally.',
  VALIDATION_ERROR: 'Please fix the highlighted errors before continuing',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  DATE_INVALID: 'Please enter a valid date',
  DATE_FUTURE: 'Date cannot be in the future',
  AGE_RESTRICTION: 'You must be at least 13 years old',
} as const;

const SUCCESS_MESSAGES = {
  SAVED: 'Progress saved successfully',
  STEP_COMPLETED: 'Step completed successfully!',
  ACCOUNT_CREATED: 'Account created successfully!',
} as const;
// Validation Rules
const VALIDATION_RULES: Record<keyof FormData, ValidationRule[]> = {
  fullName: [
    {
      validator: (value) => value.trim().length >= 2,
      message: 'Name must be at least 2 characters',
      level: 'error',
    },
    {
      validator: (value) => /^[a-zA-Z\s'-]+$/.test(value),
      message: 'Name can only contain letters, spaces, hyphens and apostrophes',
      level: 'error',
    },
  ],
  email: [
    {
      validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: ERROR_MESSAGES.INVALID_EMAIL,
      level: 'error',
    },
  ],
  phoneNumber: [
    {
      validator: (value) => /^\+?[\d\s-]{10,}$/.test(value.replace(/\D/g, '')),
      message: ERROR_MESSAGES.INVALID_PHONE,
      level: 'error',
    },
  ],
  password: [
    {
      validator: (value) => value.length >= 8,
      message: 'Password must be at least 8 characters',
      level: 'error',
    },
    {
      validator: (value) => /[A-Z]/.test(value),
      message: 'Must contain at least one uppercase letter',
      level: 'error',
    },
    {
      validator: (value) => /[0-9]/.test(value),
      message: 'Must contain at least one number',
      level: 'error',
    },
    {
      validator: (value) => /[!@#$%^&*]/.test(value),
      message: 'Must contain at least one special character (!@#$%^&*)',
      level: 'error',
    },
  ],
  confirmPassword: [
    {
      validator: (value, formData) => value === formData?.password,
      message: ERROR_MESSAGES.PASSWORD_MISMATCH,
      level: 'error',
    },
  ],
  dateOfBirth: [
    {
      validator: (value) => {
        const date = parseDate(value, 'yyyy-MM-dd', new Date());
        if (!isValidDate(date)) return false;
        const age = Math.floor(
          (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
        );
        return age >= 13;
      },
      message: ERROR_MESSAGES.AGE_RESTRICTION,
      level: 'error',
    },
  ],
  preferences: [
    {
      validator: (value) => true, // Add specific validation if needed
      message: 'Invalid preferences',
      level: 'error',
    },
  ],
};

// Step configurations with help content
const STEPS: Step[] = [
  {
    id: 'basicInfo',
    title: 'Basic Information',
    description: `Let's start with your basic details`,
    fields: ['fullName', 'email', 'phoneNumber'],
    isCompleted: false,
    helpContent: {
      title: 'Basic Information Help',
      content: 'Please provide your basic contact information.',
      examples: [
        'Full Name: John Doe',
        'Email: john.doe@example.com',
        'Phone: +1234567890',
      ],
    },
  },
  {
    id: 'security',
    title: 'Create Password',
    description: 'Set up a secure password for your account',
    fields: ['password', 'confirmPassword'],
    isCompleted: false,
    helpContent: {
      title: 'Password Requirements',
      content: 'Your password must meet the following requirements:',
      requirements: [
        'At least 8 characters long',
        'Include at least one uppercase letter',
        'Include at least one number',
        'Include at least one special character (!@#$%^&*)',
      ],
    },
  },
  {
    id: 'profile',
    title: 'Complete Profile',
    description: 'Add some additional details to your profile',
    fields: ['dateOfBirth'],
    isCompleted: false,
    helpContent: {
      title: 'Date of Birth',
      content: 'Please enter your date of birth. You must be at least 13 years old to create an account.',
    },
  },
  {
    id: 'review',
    title: 'Review Information',
    description: 'Please review your information before creating your account',
    fields: [],
    isCompleted: false,
    isOptional: true,
  },
];

// Form Context
const FormContext = createContext<{
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
} | null>(null);

// Initial form state
const initialFormState: FormState = {
  currentStep: 0,
  data: {
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    preferences: {
      notifications: true,
      marketing: false,
      theme: 'system',
    },
  },
  validation: {
    errors: {},
    warnings: {},
    dirtyFields: new Set(),
    touchedFields: new Set(),
    isStepValid: false,
    status: 'idle',
  },
  ui: {
    isLoading: false,
    showDatePicker: false,
    isPasswordVisible: false,
    focusedField: null,
    helpModalVisible: false,
    currentHelpTopic: null,
    isOffline: false,
    lastSaved: null,
    theme: 'system',
    animation: 'entered',
  },
};

// Error Boundary Component
class FormErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Form Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Form Provider Component
const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = React.useReducer(formReducer, initialFormState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

// Custom Hooks
const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
};

const useKeyboardAwareAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0.8,
            duration: Platform.OS === 'ios' ? e.duration : 250,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -Math.min(e.endCoordinates.height / 2, height * 0.2),
            duration: Platform.OS === 'ios' ? e.duration : 250,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 0.8,
            ...SPRING_CONFIG,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      e => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: Platform.OS === 'ios' ? e.duration : 250,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: Platform.OS === 'ios' ? e.duration : 250,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            ...SPRING_CONFIG,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  return { fadeAnim, slideAnim, logoScale };
};

const useAutoSave = (state: FormState) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const saveData = async () => {
      try {
        // Save non-sensitive data
        await AsyncStorage.setItem(
          SECURE_STORE_KEYS.FORM_DATA,
          JSON.stringify({
            currentStep: state.currentStep,
            data: {
              fullName: state.data.fullName,
              email: state.data.email,
              phoneNumber: state.data.phoneNumber,
              dateOfBirth: state.data.dateOfBirth,
              preferences: state.data.preferences,
            },
          })
        );

        // Save sensitive data securely
        if (state.data.password) {
          await setItemAsync(
            SECURE_STORE_KEYS.SENSITIVE_DATA,
            JSON.stringify({
              password: state.data.password,
              confirmPassword: state.data.confirmPassword,
            })
          );
        }

        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(saveData, AUTOSAVE_DELAY);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [state]);

  return lastSaved;
};

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

// Form Reducer
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.field]: action.payload.value,
        },
        validation: {
          ...state.validation,
          dirtyFields: new Set([
            ...state.validation.dirtyFields,
            action.payload.field,
          ]),
        },
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
        validation: {
          ...state.validation,
          isStepValid: false,
        },
        ui: {
          ...state.ui,
          animation: 'entering',
        },
      };

    case 'VALIDATE_FIELD':
      return {
        ...state,
        validation: {
          ...state.validation,
          errors: {
            ...state.validation.errors,
            [action.payload.field]: action.payload.result.errors[action.payload.field] || '',
          },
          warnings: {
            ...state.validation.warnings,
            [action.payload.field]: action.payload.result.warnings?.[action.payload.field] || '',
          },
          touchedFields: new Set([...state.validation.touchedFields, action.payload.field]),
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload,
        },
      };

    case 'TOGGLE_PASSWORD':
      return {
        ...state,
        ui: {
          ...state.ui,
          isPasswordVisible: !state.ui.isPasswordVisible,
        },
      };

    case 'SET_FOCUS':
      return {
        ...state,
        ui: {
          ...state.ui,
          focusedField: action.payload,
        },
      };

    case 'TOGGLE_HELP':
      return {
        ...state,
        ui: {
          ...state.ui,
          helpModalVisible: !state.ui.helpModalVisible,
          currentHelpTopic: action.payload,
        },
      };

    case 'SET_THEME':
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };

    case 'SET_ANIMATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          animation: action.payload,
        },
      };

    case 'SET_OFFLINE':
      return {
        ...state,
        ui: {
          ...state.ui,
          isOffline: action.payload,
        },
      };

    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.payload,
      };

    case 'RESET_FORM':
      return initialFormState;

    default:
      return state;
  }
};

// Helper Components
const ProgressIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  return (
    <View style={styles.progressContainer}>
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <MotiView
            style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive,
              step.isCompleted && styles.progressDotCompleted,
            ]}
            animate={{
              scale: index === currentStep ? 1.2 : 1,
              backgroundColor: 
                index === currentStep 
                  ? 'rgba(255, 255, 255, 1)' 
                  : index < currentStep 
                    ? 'rgba(255, 255, 255, 0.8)'
                    : 'rgba(255, 255, 255, 0.3)',
            }}
            transition={SPRING_CONFIG}
          />
          {index < STEPS.length - 1 && (
            <View 
              style={[
                styles.progressLine,
                index < currentStep && styles.progressLineActive
              ]} 
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

interface FormInputProps {
  field: keyof FormData;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  themedStyles: { errorText: TextStyle };
  options?: {
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
    help?: boolean;
    onPress?: () => void;
  };
}

const FormInput: React.FC<FormInputProps> = ({ field, label, icon, themedStyles, options = {} }) => {
  const { state, dispatch } = useFormContext();
  const { data, ui, validation } = state;
  const isFocused = ui.focusedField === field;
  const handleChange = useCallback(
    (text: string) => {
      dispatch({
        type: 'SET_FIELD_VALUE',
        payload: { field, value: text },
      });
    },
    [field]
  );

  const handleFocus = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: 'SET_FOCUS', payload: field });
  };

  const handleBlur = () => {
    dispatch({ type: 'SET_FOCUS', payload: null });
  };

  // Animated values for focus effects
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const interpolatedBorderColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.3)']
  });

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: ANIMATION_DURATION }}
      style={styles.inputContainer}
    >
      <View style={styles.labelRow}>
        {options.help && (
          <TouchableOpacity
            onPress={() => dispatch({ type: 'TOGGLE_HELP', payload: field })}
            style={styles.helpButton}
            accessibilityLabel={`Get help for ${label}`}
            accessibilityRole="button"
          >
            <Feather name="help-circle" size={18} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        )}
      </View>

      <BlurView
        intensity={80}
        tint="dark"
        style={[
          styles.inputWrapper,
          ui.focusedField === field && styles.inputWrapperFocused,
          validation.errors[field] && styles.inputWrapperError,
        ]}
      >
        <Feather
          name={icon}
          size={20}
          color={ui.focusedField === field ? 'white' : 'rgba(255, 255, 255, 0.6)'}
          style={styles.inputIcon}
        />

<TextInput
  style={[styles.input, ui.focusedField === field && styles.inputFocused]}
  value={typeof data[field] === 'string' ? data[field] as string : ''}
  onChangeText={handleChange}
  onFocus={handleFocus}
  onBlur={handleBlur}
  placeholder={label}
  placeholderTextColor="rgba(255, 255, 255, 0.4)"
  secureTextEntry={options.secureTextEntry && !ui.isPasswordVisible}
  keyboardType={options.keyboardType || 'default'}
  autoCapitalize={options.autoCapitalize || 'none'}
  autoCorrect={false}
  accessibilityLabel={label}
  accessibilityHint={`Enter your ${label.toLowerCase()}`}
  accessibilityRole="none"
/>

        {options.secureTextEntry && (
          <TouchableOpacity
            onPress={() => dispatch({ type: 'TOGGLE_PASSWORD' })}
            accessibilityLabel={ui.isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Feather
              name={ui.isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="rgba(255, 255, 255, 0.6)"
            />
          </TouchableOpacity>
        )}
      </BlurView>

      {validation.errors[field] && (
        <MotiView
          from={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <Text style={themedStyles.errorText}>{validation.errors[field]}</Text>
        </MotiView>
      )}
    </MotiView>
  );
};
// Add this component before SignUpScreenContent
const DatePickerModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  currentDate?: Date;
}> = ({ visible, onClose, onSelect, currentDate }) => {
  const [date, setDate] = useState(currentDate || new Date());
  const theme = useTheme();

  const handleConfirm = () => {
    onSelect(date);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', ...SPRING_CONFIG }}
          style={styles.datePickerContainer}
        >
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>

          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(_, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: theme.colors.secondary.main }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </MotiView>
      </BlurView>
    </Modal>
  );
};

const HelpModal: React.FC<{
  visible: boolean;
  topic: string | null;
  onClose: () => void;
}> = ({ visible, topic, onClose }) => {
  const currentStep = STEPS.find(step => step.fields.includes(topic as keyof FormData));
  const helpContent = currentStep?.helpContent;

  if (!visible || !helpContent) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', ...SPRING_CONFIG }}
          style={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{helpContent.title}</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close help"
              accessibilityRole="button"
            >
              <Feather name="x" size={24} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalText}>{helpContent.content}</Text>

          {helpContent.requirements && (
            <View style={styles.requirementsList}>
              {helpContent.requirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Feather name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.requirementText}>{requirement}</Text>
                </View>
              ))}
            </View>
          )}

          {helpContent.examples && (
            <View style={styles.examplesList}>
              {helpContent.examples.map((example, index) => (
                <Text key={index} style={styles.exampleText}>
                  {example}
                </Text>
              ))}
            </View>
          )}
        </MotiView>
      </BlurView>
    </Modal>
  );
};

// Main SignUpScreen Component
const SignUpScreenContent: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useFormContext();
  const { fadeAnim, slideAnim, logoScale } = useKeyboardAwareAnimations();
  const isOffline = useNetworkStatus();
  const lastSaved = useAutoSave(state);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Theme-dependent styles
  const themedStyles = StyleSheet.create({
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.error.main,
      marginBottom: theme.spacing.xs,
    },
  });

  const validateValue = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    } else if (value === undefined) {
      return '';
    } else {
      return JSON.stringify(value);
    }
  };
// Pan handler for swipe navigation
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20;
      },
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) > 50) {
          if (dx > 0 && state.currentStep > 0) {
            handleBack();
          } else if (dx < 0 && state.currentStep < STEPS.length - 1) {
            handleNext();
          }
        }
      },
    })
  ).current;

  useEffect(() => {
    const restoreState = async () => {
      try {
        const [formData, sensitiveData] = await Promise.all([
          AsyncStorage.getItem(SECURE_STORE_KEYS.FORM_DATA),
          getItemAsync(SECURE_STORE_KEYS.SENSITIVE_DATA),
        ]);

        if (formData) {
          const parsedData = JSON.parse(formData);
          dispatch({
            type: 'RESTORE_STATE',
            payload: {
              ...parsedData,
              data: {
                ...parsedData.data,
                ...(sensitiveData ? JSON.parse(sensitiveData) : {}),
              },
            },
          });
        }
      } catch (error) {
        console.error('Error restoring state:', error);
      }
    };

    restoreState();
  }, []);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => {
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 0.8,
            duration: Platform.OS === 'ios' ? e.duration : 250,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -Math.min(e.endCoordinates.height / 2, height * 0.2),
            duration: Platform.OS === 'ios' ? e.duration : 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );
  
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      e => {
        Animated.parallel([
          Animated.timing(logoScale, {
            toValue: 1,
            duration: Platform.OS === 'ios' ? e.duration : 250,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: Platform.OS === 'ios' ? e.duration : 250,
            useNativeDriver: true,
          }),
        ]).start();
      }
    );
  
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

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

  const handleSubmit = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Clear saved data
      await Promise.all([
        AsyncStorage.removeItem(SECURE_STORE_KEYS.FORM_DATA),
        deleteItemAsync(SECURE_STORE_KEYS.SENSITIVE_DATA),
      ]);

      Alert.alert(
        'Success',
        SUCCESS_MESSAGES.ACCOUNT_CREATED,
        [{ text: 'Continue', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentStepFields = STEPS[state.currentStep].fields;
    const newErrors: Record<string, string> = {};

    currentStepFields.forEach(field => {
      const value = validateValue(state.data[field]);
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
        payload: { field: currentStepFields[0], result: { errors: newErrors, isValid: false } },
      });
      return false;
    }

    return true;
  };

  const renderCurrentStep = () => {
    const step = STEPS[state.currentStep];

    return (
      <MotiView
        from={{ opacity: 0, translateX: 20 }}
        animate={{ opacity: 1, translateX: 0 }}
        exit={{ opacity: 0, translateX: -20 }}
        transition={{ type: 'timing', duration: ANIMATION_DURATION }}
        style={styles.stepContainer}
      >
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>

        {step.id === 'basicInfo' && (
          <>
            <FormInput
              field="fullName"
              label="Full Name"
              icon="user"
              themedStyles={themedStyles}
              options={{ autoCapitalize: 'words', help: true }}
            />
            <FormInput
              field="email"
              label="Email Address"
              icon="mail"
              themedStyles={themedStyles}
              options={{ keyboardType: 'email-address', help: true }}
            />
            <FormInput
              field="phoneNumber"
              label="Phone Number"
              icon="phone"
              themedStyles={themedStyles}
              options={{ keyboardType: 'phone-pad', help: true }}
            />
          </>
        )}

        {step.id === 'security' && (
          <>
            <FormInput
              field="password"
              label="Password"
              icon="lock"
              themedStyles={themedStyles}
              options={{ secureTextEntry: true, help: true }}
            />
            <FormInput
              field="confirmPassword"
              label="Confirm Password"
              icon="lock"
              themedStyles={themedStyles}
              options={{ secureTextEntry: true }}
            />
          </>
        )}

        {step.id === 'profile' && (
          <>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setShowDatePicker(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <FormInput
                field="dateOfBirth"
                label="Date of Birth"
                icon="calendar"
                themedStyles={themedStyles}
                options={{ 
                  help: true,
                  onPress: () => {
                    Keyboard.dismiss();
                    setShowDatePicker(true);
                  }
                }}
              />
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
              <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <BlurView intensity={90} tint="dark" style={styles.datePickerOverlay}>
                  <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerHeader}>
                      <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Feather name="x" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                    
                    <DateTimePicker
                      value={state.data.dateOfBirth ? new Date(state.data.dateOfBirth) : new Date()}
                      mode="date"
                      display="spinner"
                      maximumDate={new Date()}
                      minimumDate={new Date(1900, 0, 1)}
                      onChange={(_, date) => {
                        if (date) {
                          dispatch({
                            type: 'SET_FIELD_VALUE',
                            payload: { 
                              field: 'dateOfBirth', 
                              value: date.toISOString().split('T')[0] 
                            },
                          });
                        }
                      }}
                      textColor="white"
                    />

                    <TouchableOpacity 
                      style={styles.datePickerConfirm}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.datePickerConfirmText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Modal>
            ) : (
              showDatePicker && (
                <DateTimePicker
                  value={state.data.dateOfBirth ? new Date(state.data.dateOfBirth) : new Date()}
                  mode="date"
                  display="default"
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  onChange={(_, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      dispatch({
                        type: 'SET_FIELD_VALUE',
                        payload: { 
                          field: 'dateOfBirth', 
                          value: date.toISOString().split('T')[0] 
                        },
                      });
                    }
                  }}
                />
              )
            )}
          </>
        )}
      </MotiView>
    );
  };

  return (
    <FormErrorBoundary>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        {...panResponder.panHandlers}
      >
        <StatusBar style="light" />
        
        <LinearGradient
          colors={[
            'rgba(47, 125, 121, 1)',    // Teal
            'rgba(83, 144, 127, 1)',    // Teal/Green
            'rgba(186, 144, 75, 1)',    // Gold
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {isOffline && (
          <MotiView
            from={{ opacity: 0, translateY: -50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', ...SPRING_CONFIG }}
            style={styles.offlineBanner}
          >
            <Feather name="wifi-off" size={20} color="white" />
            <Text style={styles.offlineBannerText}>
              {ERROR_MESSAGES.NETWORK_ERROR}
            </Text>
          </MotiView>
        )}

        <Animated.ScrollView
          style={[
            styles.scrollView,
            { transform: [{ translateY: slideAnim }] }
          ]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.logoContainer,
              { transform: [{ scale: logoScale }] }
            ]}
          >
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="App logo"
            />
          </Animated.View>

          <ProgressIndicator currentStep={state.currentStep} />

          {renderCurrentStep()}

          <View style={styles.buttonContainer}>
            {state.currentStep > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                accessibilityLabel="Go back to previous step"
                accessibilityRole="button"
              >
                <Feather name="chevron-left" size={24} color="white" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                state.ui.isLoading && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={state.ui.isLoading}
              accessibilityLabel={
                state.currentStep === STEPS.length - 1
                  ? 'Create account'
                  : 'Next step'
              }
              accessibilityRole="button"
            >
              {state.ui.isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.nextButtonText}>
                  {state.currentStep === STEPS.length - 1
                    ? 'Create Account'
                    : 'Next'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {lastSaved && (
            <Text style={styles.lastSavedText}>
              Last saved {formatDistanceToNow(lastSaved)} ago
            </Text>
          )}
        </Animated.ScrollView>

        <HelpModal
          visible={state.ui.helpModalVisible}
          topic={state.ui.currentHelpTopic}
          onClose={() => dispatch({ type: 'TOGGLE_HELP', payload: null })}
        />
      </KeyboardAvoidingView>
    </FormErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  // Progress indicator styles
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: 'white',
  },
  progressDotCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  progressLine: {
    width: 16,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  // Button styles
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Input styles
  inputContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 28, //Make space for help button
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapperTouchable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor:'#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapperFocused: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0.2,
    shadowRadius: 5.84,
  },
  inputWrapperError: {
    borderColor: 'rgba(255, 68, 68, 0.5)',
  },
  inputBlurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  inputFocused: {
    color: 'white',
  },
  inputIcon: {
    marginRight: 12,
    opacity: 0.6,
  },
  // Help button styles
  helpButton: {
    position: 'absolute',
    left: -28,
    top: 18,
    zIndex: 1,
  },
  helpButtonBlur: {
    padding: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  eyeButton: {
    padding: 8,
  },
  // Error styles
  errorContainer: {
    marginTop: 8,
    overflow: 'hidden',
  },
  errorBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  errorText: {
    color: 'rgba(255, 68, 68, 0.9)',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  errorMessage: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  // Requirements list styles
  requirementsList: {
    marginTop: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  examplesList: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  exampleText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  // Status message styles
  offlineBanner: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineBannerText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  lastSavedText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  // Date picker specific styles
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },  
  datePickerContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  datePickerConfirm: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  datePickerConfirmText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  }
});

const SignUpScreen = () => {
  return (
    <FormProvider>
      <SignUpScreenContent />
    </FormProvider>
  );
};

export default SignUpScreen;