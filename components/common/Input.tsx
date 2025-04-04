// components/common/Input.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Animated,
  Platform,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Feather } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  startIcon?: keyof typeof Feather.glyphMap;
  endIcon?: keyof typeof Feather.glyphMap;
  onEndIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  startIcon,
  endIcon,
  onEndIconPress,
  containerStyle,
  value,
  onChangeText,
  onFocus,
  onBlur,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [labelAnimation] = useState(new Animated.Value(value ? 1 : 0));

  const handleFocus = (e: any) => {
    setIsFocused(true);
    animateLabel(1);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!value) {
      animateLabel(0);
    }
    onBlur?.(e);
  };

  const animateLabel = (toValue: number) => {
    Animated.timing(labelAnimation, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const labelStyle = {
    position: 'absolute' as const, // Fix for position type
    left: startIcon ? 48 : 16,
    top: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 4],
    }),
    fontSize: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error
      ? theme.colors.error.main
      : isFocused
      ? theme.colors.primary.main
      : theme.colors.grey[600],
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
      )}
      <View style={[
        styles.inputContainer,
        {
          borderColor: error
            ? theme.colors.error.main
            : isFocused
            ? theme.colors.primary.main
            : theme.colors.grey[300],
        },
      ]}>
        {startIcon && (
          <Feather
            name={startIcon}
            size={20}
            color={theme.colors.grey[500]}
            style={styles.startIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            theme.typography.body1,
            startIcon && styles.inputWithStartIcon,
            endIcon && styles.inputWithEndIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.grey[400]}
          {...props}
        />
        {endIcon && (
          <Feather
            name={endIcon}
            size={20}
            color={theme.colors.grey[500]}
            style={styles.endIcon}
            onPress={onEndIconPress}
          />
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.colors.error.main }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 16 : 8,
    color: '#000000',
  },
  inputWithStartIcon: {
    paddingLeft: 8,
  },
  inputWithEndIcon: {
    paddingRight: 8,
  },
  startIcon: {
    marginLeft: 16,
  },
  endIcon: {
    marginRight: 16,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
});