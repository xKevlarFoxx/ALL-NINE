// services/feedback/FeedbackSystem.ts
import * as Haptics from 'expo-haptics';
import { Alert, Platform } from 'react-native';
import { analyticsService } from '../analytics/AnalyticsService';

export enum FeedbackType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export class FeedbackSystem {
  private static instance: FeedbackSystem;
  private toastRef: any; // Reference to toast component
  private isHapticsEnabled: boolean = true;

  static getInstance(): FeedbackSystem {
    if (!FeedbackSystem.instance) {
      FeedbackSystem.instance = new FeedbackSystem();
    }
    return FeedbackSystem.instance;
  }

  setToastRef(ref: any) {
    this.toastRef = ref;
  }

  async provideFeedback(type: FeedbackType, message: string, options?: {
    haptic?: boolean;
    duration?: number;
    action?: {
      label: string;
      onPress: () => void;
    };
  }) {
    // Visual feedback
    this.showToast(type, message, options);

    // Haptic feedback
    if (options?.haptic !== false && this.isHapticsEnabled) {
      await this.triggerHaptic(type);
    }

    // Log feedback event
    analyticsService.track('User_Feedback_Shown', {
      type,
      message,
      hasAction: !!options?.action
    });
  }

  private async triggerHaptic(type: FeedbackType) {
    try {
      switch (type) {
        case FeedbackType.SUCCESS:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case FeedbackType.ERROR:
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case FeedbackType.WARNING:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case FeedbackType.INFO:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
      }
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  private showToast(type: FeedbackType, message: string, options?: {
    duration?: number;
    action?: {
      label: string;
      onPress: () => void;
    };
  }) {
    if (this.toastRef) {
      this.toastRef.show({
        type,
        message,
        duration: options?.duration || 3000,
        action: options?.action
      });
    }
  }

  showProgressFeedback<T>(
    operation: () => Promise<T>,
    options: {
      loadingMessage: string;
      successMessage: string;
      errorMessage: string;
    }
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        this.showToast(FeedbackType.INFO, options.loadingMessage);
        const result = await operation();
        this.provideFeedback(FeedbackType.SUCCESS, options.successMessage);
        resolve(result);
      } catch (error) {
        this.provideFeedback(FeedbackType.ERROR, options.errorMessage);
        reject(error);
      }
    });
  }
}

// Component implementation for the toast
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

export interface ToastRef {
  show: (options: {
    type: FeedbackType;
    message: string;
    duration?: number;
    action?: {
      label: string;
      onPress: () => void;
    };
  }) => void;
}

export const Toast = forwardRef<ToastRef>((_, ref) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<FeedbackType>(FeedbackType.INFO);
  const [action, setAction] = useState<{ label: string; onPress: () => void; } | undefined>();
  
  const translateY = new Animated.Value(-100);

  useImperativeHandle(ref, () => ({
    show: (options) => {
      setMessage(options.message);
      setType(options.type);
      setAction(options.action);
      setVisible(true);

      Animated.sequence([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11
        }),
        Animated.delay(options.duration || 3000),
        Animated.spring(translateY, {
          toValue: -100,
          useNativeDriver: true
        })
      ]).start(() => setVisible(false));
    }
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
        { backgroundColor: theme.colors[type].main }
      ]}
    >
      <Text style={styles.message}>{message}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    color: '#FFFFFF',
    flex: 1,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 16,
  },
});