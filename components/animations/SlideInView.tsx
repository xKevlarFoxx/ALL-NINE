// components/animations/SlideInView.tsx
import React, { useEffect } from 'react';
import { Animated, ViewProps, Dimensions } from 'react-native';

interface SlideInViewProps extends ViewProps {
  direction?: 'left' | 'right' | 'top' | 'bottom';
  duration?: number;
  delay?: number;
}

export const SlideInView: React.FC<SlideInViewProps> = ({
  children,
  direction = 'bottom',
  duration = 300,
  delay = 0,
  style,
  ...props
}) => {
  const { width, height } = Dimensions.get('window');
  const translation = new Animated.Value(
    direction === 'left' ? -width :
    direction === 'right' ? width :
    direction === 'top' ? -height : height
  );

  useEffect(() => {
    Animated.timing(translation, {
      toValue: 0,
      duration,
      delay,
      useNativeDriver: true,
    }).start();

    return () => translation.setValue(0);
  }, []);

  const animatedStyle = {
    transform: [
      direction === 'left' || direction === 'right'
        ? { translateX: translation }
        : { translateY: translation }
    ],
  };

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};