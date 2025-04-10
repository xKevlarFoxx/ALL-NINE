// components/ErrorBoundary/index.tsx
import React, { Component, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { trackError } from '../../utils/analytics';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode; // Custom fallback UI
  onReset?: () => void; // Callback for resetting error state
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error);
    trackError(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset(); // Invoke custom reset logic
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View style={styles.container}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <TouchableOpacity
              onPress={this.handleReset}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )
      );
    }

    return this.props.children;
  }
}