import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

interface AnimatedListProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ 
  children, 
  delay = 150,
  style,
  ...props 
}) => {
  return (
    <View style={style} {...props}>
      {React.Children.map(children, (child, index) => (
        <Animated.View
          entering={FadeInDown.delay(index * delay)}
          layout={Layout.springify()}
        >
          {child}
        </Animated.View>
      ))}
    </View>
  );
};