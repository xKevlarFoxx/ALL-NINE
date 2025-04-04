// components/common/LoadingState.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useTheme } from '../ThemeProvider';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const theme = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000 }),
      -1,
      true
    );

    return () => {
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.grey[300],
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const LoadingState = {
  Row: ({ style }: { style?: ViewStyle }) => (
    <View style={[styles.row, style]}>
      <Skeleton width={40} height={40} borderRadius={20} style={styles.avatar} />
      <View style={styles.content}>
        <Skeleton width="60%" height={16} style={styles.marginBottom} />
        <Skeleton width="90%" height={12} />
      </View>
    </View>
  ),

  Card: ({ style }: { style?: ViewStyle }) => (
    <View style={[styles.card, style]}>
      <Skeleton width="100%" height={200} style={styles.marginBottom} />
      <Skeleton width="80%" height={24} style={styles.marginBottom} />
      <Skeleton width="90%" height={16} style={styles.marginBottom} />
      <Skeleton width="60%" height={16} />
    </View>
  ),
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  card: {
    padding: 16,
  },
  marginBottom: {
    marginBottom: 8,
  },
});