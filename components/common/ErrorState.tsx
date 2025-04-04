// components/common/ErrorState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Button } from './Button';
import { Feather } from '@expo/vector-icons';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while loading the content.',
  onRetry,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Feather 
        name="alert-circle" 
        size={48} 
        color={theme.colors.error.main} 
      />
      <Text style={[theme.typography.h3, styles.title]}>
        {title}
      </Text>
      <Text style={[theme.typography.body1, styles.message]}>
        {message}
      </Text>
      {onRetry && (
        <Button 
          variant="primary" 
          onPress={onRetry}
          style={styles.button}
        >
          Try Again
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  button: {
    minWidth: 120,
  },
});