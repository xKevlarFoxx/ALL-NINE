// components/common/Carousel.tsx
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../ThemeProvider';

interface CarouselProps {
  data: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showIndicator?: boolean;
  indicatorStyle?: ViewStyle;
  style?: ViewStyle;
  onPageChange?: (index: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const Carousel: React.FC<CarouselProps> = ({
  data,
  autoPlay = true,
  interval = 3000,
  showIndicator = true,
  indicatorStyle,
  style,
  onPageChange,
}) => {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const scrollToIndex = useCallback((index: number) => {
    scrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / SCREEN_WIDTH);
    if (index !== activeIndex) {
      setActiveIndex(index);
      onPageChange?.(index);
    }
  };

  const startAutoPlay = useCallback(() => {
    if (autoPlay && data.length > 1) {
      autoPlayRef.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % data.length;
        scrollToIndex(nextIndex);
      }, interval);
    }
  }, [autoPlay, interval, activeIndex, data.length]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  }, []);

  React.useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={stopAutoPlay}
        onTouchEnd={startAutoPlay}
        onMomentumScrollEnd={() => {
          stopAutoPlay();
          startAutoPlay();
        }}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.slide}>
            {item}
          </View>
        ))}
      </ScrollView>

      {showIndicator && data.length > 1 && (
        <View style={[styles.indicatorContainer, indicatorStyle]}>
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === activeIndex
                    ? theme.colors.primary.main
                    : theme.colors.grey[300],
                  width: index === activeIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
  },
  slide: {
    width: SCREEN_WIDTH,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    transition: '0.3s',
  },
});