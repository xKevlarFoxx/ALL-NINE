// components/common/Card.tsx
import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle, 
  TouchableOpacity,
  TouchableOpacityProps 
} from 'react-native';
import { useTheme } from '../ThemeProvider';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  onPress,
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: theme.colors.grey[300],
          backgroundColor: '#FFFFFF',
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.grey[100],
        };
      default: // elevated
        return {
          backgroundColor: '#FFFFFF',
          ...theme.shadows.md,
        };
    }
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.base,
        getVariantStyle(),
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    padding: 16,
  },
});