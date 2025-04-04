// components/common/BottomSheet.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  BackHandler,
} from 'react-native';
import { useTheme } from '../ThemeProvider';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  enableBackdropDismiss?: boolean;
  enableDragDown?: boolean;
  style?: ViewStyle;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DEFAULT_SNAP_POINTS = [0.9, 0.5, 0];

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  children,
  snapPoints = DEFAULT_SNAP_POINTS,
  initialSnap = 1,
  enableBackdropDismiss = true,
  enableDragDown = true,
  style,
}) => {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const convertedSnapPoints = snapPoints.map(point => 
    SCREEN_HEIGHT - (point * SCREEN_HEIGHT)
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableDragDown,
      onMoveShouldSetPanResponder: (_, { dy }) => 
        enableDragDown && Math.abs(dy) > 20,
      onPanResponderMove: (_, { dy }) => {
        const newPosition = dy;
        if (newPosition >= 0) {
          translateY.setValue(convertedSnapPoints[initialSnap] + dy);
        }
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        const currentPosition = convertedSnapPoints[initialSnap] + dy;
        let closestSnap = convertedSnapPoints[initialSnap];
        let minDistance = Math.abs(currentPosition - closestSnap);

        convertedSnapPoints.forEach(snapPoint => {
          const distance = Math.abs(currentPosition - snapPoint);
          if (distance < minDistance) {
            minDistance = distance;
            closestSnap = snapPoint;
          }
        });

        if (
          closestSnap === convertedSnapPoints[convertedSnapPoints.length - 1] ||
          (vy > 0.5 && dy > 50)
        ) {
          hideBottomSheet();
        } else {
          Animated.spring(translateY, {
            toValue: closestSnap,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const showBottomSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: convertedSnapPoints[initialSnap],
        useNativeDriver: true,
        bounciness: 4,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [initialSnap, convertedSnapPoints]);

  const hideBottomSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      showBottomSheet();
    } else {
      hideBottomSheet();
    }
  }, [isVisible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (isVisible) {
          hideBottomSheet();
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
            backgroundColor: theme.colors.grey[900],
          },
        ]}
        onTouchEnd={() => {
          if (enableBackdropDismiss) {
            hideBottomSheet();
          }
        }}
      />
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            backgroundColor: theme.colors.grey[50],
          },
          style,
        ]}
        {...panResponder.panHandlers}
      >
        {enableDragDown && (
          <View style={styles.dragIndicator}>
            <View
              style={[
                styles.dragIndicatorBar,
                { backgroundColor: theme.colors.grey[300] },
              ]}
            />
          </View>
        )}
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 200,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  dragIndicator: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragIndicatorBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});