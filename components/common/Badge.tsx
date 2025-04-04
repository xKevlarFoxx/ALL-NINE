// components/common/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';

type ColorVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: ColorVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  outline?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  style,
  outline = false,
}) => {
  const theme = useTheme();

  const getVariantColors = () => {
    const variants: Record<ColorVariant, { main: string; contrast: string }> = {
      default: { 
        main: theme.colors.grey[500], 
        contrast: '#FFFFFF' 
      },
      success: { 
        main: theme.colors.success.main, 
        contrast: theme.colors.success.contrast || '#FFFFFF' 
      },
      error: { 
        main: theme.colors.error.main, 
        contrast: theme.colors.error.contrast || '#FFFFFF' 
      },
      warning: { 
        main: theme.colors.warning.main, 
        contrast: theme.colors.warning.contrast || '#FFFFFF' 
      },
      info: { 
        main: theme.colors.info.main, 
        contrast: theme.colors.info.contrast || '#FFFFFF' 
      },
    };

    const color = variants[variant];
    return {
      background: outline ? 'transparent' : color.main,
      text: outline ? color.main : color.contrast,
      border: color.main,
    };
  };

  const getSizeStyles = () => {
    const sizes: Record<BadgeSize, { padding: number; fontSize: number }> = {
      small: {
        padding: 4,
        fontSize: 10,
      },
      medium: {
        padding: 6,
        fontSize: 12,
      },
      large: {
        padding: 8,
        fontSize: 14,
      },
    };
    return sizes[size];
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: outline ? 1 : 0,
          padding: sizeStyles.padding,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});