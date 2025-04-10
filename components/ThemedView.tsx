import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from './ThemeProvider';

interface ThemedViewProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({ style, children }) => {
  const { theme } = useTheme();

  const themedStyles = StyleSheet.create({
    container: {
      backgroundColor: theme === 'light' ? '#ffffff' : '#121212',
      flex: 1,
    },
  });

  return <View style={[themedStyles.container, style]}>{children}</View>;
};
