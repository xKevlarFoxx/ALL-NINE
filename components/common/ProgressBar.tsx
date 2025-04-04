// components/common/ProgressBar.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  animated?: boolean;
  duration?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 4,
  animated = true,
  duration = 500,
  color,
  backgroundColor,
  style,
}) => {
  const theme = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, animated, duration]);

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: backgroundColor || theme.colors.grey[200],
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: color || theme.colors.primary.main,
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 999,
  },
  progress: {
    height: '100%',
    borderRadius: 999,
  },
});

// components/common/Chip.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeProvider';

interface ChipProps {
  label: string;
  onPress?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  onPress,
  onDelete,
  selected = false,
  disabled = false,
  loading = false,
  icon,
  style,
}) => {
  const theme = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.grey[200];
    if (selected) return theme.colors.primary.main;
    return theme.colors.grey[100];
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.grey[500];
    if (selected) return theme.colors.primary.contrast;
    return theme.colors.grey[900];
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.loader}
        />
      ) : (
        <>
          {icon && (
            <Feather
              name={icon}
              size={16}
              color={getTextColor()}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              theme.typography.caption,
              styles.label,
              { color: getTextColor() },
            ]}
          >
            {label}
          </Text>
          {onDelete && !disabled && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.deleteButton}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Feather
                name="x"
                size={14}
                color={getTextColor()}
              />
            </TouchableOpacity>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minHeight: 32,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    marginRight: onDelete => onDelete ? 4 : 0,
  },
  deleteButton: {
    marginLeft: 4,
  },
  loader: {
    marginHorizontal: 8,
  },
});

// components/common/EmptyState.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Feather } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Feather
        name={icon}
        size={48}
        color={theme.colors.grey[400]}
        style={styles.icon}
      />
      <Text
        style={[
          theme.typography.h4,
          styles.title,
          { color: theme.colors.grey[900] },
        ]}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={[
            theme.typography.body2,
            styles.description,
            { color: theme.colors.grey[600] },
          ]}
        >
          {description}
        </Text>
      )}
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary.main },
          ]}
        >
          <Text
            style={[
              theme.typography.button,
              { color: theme.colors.primary.contrast },
            ]}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});