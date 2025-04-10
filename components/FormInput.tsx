import React, { useCallback, useEffect, useRef, useState } from 'react';
  import { TextInput, View, Text, TouchableOpacity, StyleSheet, Animated, TextStyle } from 'react-native';
  import { Feather } from '@expo/vector-icons';
  import { BlurView } from 'expo-blur';
  import * as Haptics from 'expo-haptics';
  import { MotiView } from 'moti';
  import { useFormContext } from '../hooks/useFormContext';

  interface FormInputProps {
    field: string;
    label: string;
    icon: keyof typeof Feather.glyphMap;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    onHelpPress?: () => void;
  }

  const FormInput: React.FC<FormInputProps> = React.memo(({
    field,
    label,
    icon,
    error,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
    onHelpPress
  }) => {
    const { state, dispatch } = useFormContext();
    const value = state.data[field] as string;
    const isFocused = state.ui.focusedField === field;

    const handleChange = useCallback(
      (text: string) => {
        dispatch({ type: 'SET_FIELD_VALUE', payload: { field, value: text } });
      },
      [dispatch, field]
    );

    const handleFocus = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      dispatch({ type: 'SET_FOCUS', payload: field });
    };

    const handleBlur = () => {
      dispatch({ type: 'SET_FOCUS', payload: null });
    };

    // Animation for border color
    const animation = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(animation, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false
      }).start();
    }, [isFocused]);

    const interpolatedBorderColor = animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)']
    });

    return (
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        style={styles.inputContainer}
      >
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>{label}</Text>
          {onHelpPress && (
            <TouchableOpacity onPress={onHelpPress} style={styles.helpButton} accessibilityLabel={`Help for ${label}`} accessibilityRole="button">
              <Feather name="help-circle" size={18} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
        <BlurView intensity={80} tint="dark" style={[styles.inputWrapper, { borderColor: interpolatedBorderColor }]}>
          <Feather name={icon} size={20} color={isFocused ? 'white' : 'rgba(255,255,255,0.6)'} style={styles.inputIcon} />
          <TextInput
            value={value}
            onChangeText={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={label}
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry={secureTextEntry && !state.ui.isPasswordVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            style={[styles.input, isFocused && styles.inputFocused]}
            accessibilityLabel={label}
            accessibilityHint={`Enter your ${label.toLowerCase()}`}
          />
          {secureTextEntry && (
            <TouchableOpacity onPress={() => dispatch({ type: 'TOGGLE_PASSWORD' })} accessibilityLabel={state.ui.isPasswordVisible ? 'Hide password' : 'Show password'} accessibilityRole="button">
              <Feather name={state.ui.isPasswordVisible ? 'eye-off' : 'eye'} size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </BlurView>
        {error ? (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'timing', duration: 200 }}
          >
            <Text style={styles.errorText}>{error}</Text>
          </MotiView>
        ) : null}
      </MotiView>
    );
  });

  export default FormInput;

  const styles = StyleSheet.create({
    inputContainer: {
      marginBottom: 24
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      paddingLeft: 28
    },
    inputLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      fontWeight: '500'
    },
    helpButton: {
      padding: 4
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 8
    },
    inputIcon: {
      marginRight: 12
    },
    input: {
      flex: 1,
      color: 'white',
      fontSize: 16,
      fontWeight: '500'
    },
    inputFocused: {
      color: 'white'
    },
    errorText: {
      color: 'rgba(255,68,68,0.9)',
      fontSize: 14,
      marginTop: 4,
      marginLeft: 4
    }
  });