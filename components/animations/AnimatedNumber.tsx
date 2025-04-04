import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, { 
  useAnimatedProps, 
  withTiming, 
  useSharedValue 
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle;
  duration?: number;
  formatter?: (value: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  style,
  duration = 1000,
  formatter = (val) => val.toFixed(0)
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration });
  }, [value, duration]);

  const animatedProps = useAnimatedProps(() => ({
    text: formatter(animatedValue.value)
  }));

  return (
    <AnimatedText
      style={style}
      animatedProps={animatedProps}
    />
  );
};