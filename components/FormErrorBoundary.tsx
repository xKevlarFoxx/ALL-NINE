import React from 'react';
  import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

  interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
  }

  interface ErrorBoundaryProps {
    children: React.ReactNode;
  }

  export class FormErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
      // Log error details to an error reporting service here if needed.
      console.error('FormErrorBoundary caught an error:', error, info);
    }

    handleReset = () => {
      this.setState({ hasError: false, error: null });
    };

    render() {
      if (this.state.hasError) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </Text>
            <TouchableOpacity style={styles.errorButton} onPress={this.handleReset}>
              <Text style={styles.errorButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        );
      }
      return this.props.children;
    }
  }

  const styles = StyleSheet.create({
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#1e1e1e'
    },
    errorTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 10
    },
    errorMessage: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      textAlign: 'center',
      marginBottom: 20
    },
    errorButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 8
    },
    errorButtonText: {
      color: 'white',
      fontSize: 16
    }
  });