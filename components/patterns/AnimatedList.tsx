// AnimatedList.tsx
import React, { useCallback } from 'react';
import { ViewToken, FlatList, ViewStyle, StyleProp } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring
} from 'react-native-reanimated';

interface AnimatedListProps<T> {
  data?: T[];
  renderItem?: (item: T, index: number) => React.ReactNode;
  onViewableItemsChanged?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  delay?: number;
}

const AnimatedListItem = ({ children, style }: { 
  children: React.ReactNode; 
  style?: StyleProp<ViewStyle>;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(1, { damping: 20 }),
    transform: [{ translateY: withSpring(0, { damping: 20 }) }]
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

export const AnimatedList = <T extends any>({
  data,
  renderItem,
  onViewableItemsChanged,
  style,
  contentContainerStyle,
  children,
  delay,
  ...props
}: AnimatedListProps<T>) => {
  if (children) {
    return (
      <AnimatedListItem style={style}>
        {children}
      </AnimatedListItem>
    );
  }

  if (!data || !renderItem) return null;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  const onViewableItemsChangedCallback = useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      onViewableItemsChanged?.(info);
    },
    [onViewableItemsChanged]
  );

  return (
    <FlatList
      data={data}
      renderItem={({ item, index }) => (
        <AnimatedListItem>
          {renderItem(item, index)}
        </AnimatedListItem>
      )}
      onViewableItemsChanged={onViewableItemsChangedCallback}
      viewabilityConfig={viewabilityConfig}
      style={style}
      contentContainerStyle={contentContainerStyle}
      {...props}
    />
  );
};