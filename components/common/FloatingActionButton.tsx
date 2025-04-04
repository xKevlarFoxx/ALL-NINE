// components/common/FloatingActionButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeProvider';
import * as Haptics from 'expo-haptics';

interface FABAction {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  label?: string;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  icon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
  color?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  actions,
  icon = 'plus',
  onPress,
  position = 'bottomRight',
  color,
  style,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const animation = React.useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    if (disabled) return;

    if (actions?.length) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsOpen(!isOpen);
      Animated.spring(animation, {
        toValue: isOpen ? 0 : 1,
        useNativeDriver: true,
      }).start();
    } else if (onPress) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'bottomLeft':
        return { left: 16, bottom: 16 };
      case 'topRight':
        return { right: 16, top: 16 };
      case 'topLeft':
        return { left: 16, top: 16 };
      default:
        return { right: 16, bottom: 16 };
    }
  };

  return (
    <View style={[styles.container, getPositionStyle(), style]}>
      {actions?.map((action, index) => (
        <Animated.View
          key={index}
          style={[
            styles.actionButton,
            {
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -16 - (index + 1) * 56],
                  }),
                },
              ],
              opacity: animation,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButtonInner,
              {
                backgroundColor: action.color || theme.colors.secondary.main,
              },
            ]}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              action.onPress();
              setIsOpen(false);
              Animated.spring(animation, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
            }}
          >
            <Feather
              name={action.icon}
              size={24}
              color={theme.colors.grey[50]}
            />
          </TouchableOpacity>
        </Animated.View>
      ))}

      <TouchableOpacity
        style={[
          styles.mainButton,
          {
            backgroundColor: color || theme.colors.primary.main,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        onPress={handlePress}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                {
                  rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Feather name={icon} size={24} color={theme.colors.grey[50]} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});