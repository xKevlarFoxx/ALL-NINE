// components/common/Tabs.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '../ThemeProvider';

interface Tab {
  key: string;
  title: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  selectedTab: string;
  onTabChange: (tabKey: string) => void;
  style?: ViewStyle;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  selectedTab,
  onTabChange,
  style,
}) => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const tabPositions = useRef<{ [key: string]: number }>({});
  const tabWidths = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    const position = tabPositions.current[selectedTab] || 0;
    const width = tabWidths.current[selectedTab] || 0;

    Animated.spring(indicatorAnim, {
      toValue: position,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [selectedTab]);

  const handleTabLayout = (
    key: string,
    event: LayoutChangeEvent,
    index: number
  ) => {
    const { x, width } = event.nativeEvent.layout;
    tabPositions.current[key] = x;
    tabWidths.current[key] = width;

    if (key === selectedTab) {
      indicatorAnim.setValue(x);
    }
  };

  const handleTabPress = (tab: Tab, index: number) => {
    onTabChange(tab.key);
    
    // Scroll the tab into view
    scrollViewRef.current?.scrollTo({
      x: Math.max(0, tabPositions.current[tab.key] - 16),
      animated: true,
    });
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab, index)}
            onLayout={(e) => handleTabLayout(tab.key, e, index)}
            style={[
              styles.tab,
              {
                opacity: selectedTab === tab.key ? 1 : 0.7,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.button,
                {
                  color:
                    selectedTab === tab.key
                      ? theme.colors.primary.main
                      : theme.colors.grey[600],
                },
              ]}
            >
              {tab.title}
            </Text>
            {tab.badge !== undefined && tab.badge > 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.primary.main },
                ]}
              >
                <Text
                  style={[
                    theme.typography.caption,
                    { color: theme.colors.grey[50] },
                  ]}
                >
                  {tab.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: theme.colors.primary.main,
              transform: [{ translateX: indicatorAnim }],
              width: tabWidths.current[selectedTab] || 0,
            },
          ]}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  tab: {
    height: 46,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
});