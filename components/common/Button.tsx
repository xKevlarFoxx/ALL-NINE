// components/common/Button.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  GestureResponderEvent
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import * as Haptics from 'expo-haptics';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const theme = useTheme();

  const handlePress = async (event: GestureResponderEvent) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(event);
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled 
            ? theme.colors.grey[300] 
            : theme.colors.primary.main,
        };
      case 'secondary':
        return {
          backgroundColor: disabled 
            ? theme.colors.grey[300] 
            : theme.colors.secondary.main,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled 
            ? theme.colors.grey[300] 
            : theme.colors.primary.main,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.sm,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        };
      default: // medium
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        };
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.grey[500];
    switch (variant) {
      case 'outlined':
      case 'text':
        return theme.colors.primary.main;
      default:
        return theme.colors.primary.contrast || '#FFFFFF';
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getTextColor()} size="small" />;
    }

    if (typeof children === 'string') {
      return (
        <Text
          style={[
            theme.typography.button,
            { color: getTextColor() },
            textStyle,
          ]}
        >
          {children}
        </Text>
      );
    }

    return children;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
});