// components/common/Rating.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeProvider';

interface RatingProps {
  value: number;
  maxValue?: number;
  size?: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
  activeColor?: string;
  inactiveColor?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  maxValue = 5,
  size = 20,
  readonly = false,
  onChange,
  activeColor,
  inactiveColor,
}) => {
  const theme = useTheme();
  
  const activeStarColor = activeColor || theme.colors.secondary.light;
  const inactiveStarColor = inactiveColor || theme.colors.grey[300];

  const handlePress = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(maxValue)].map((_, index) => {
        const rating = index + 1;
        const active = rating <= value;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(rating)}
            disabled={readonly}
            style={styles.star}
          >
            <Feather
              name={active ? 'star' : 'star'}
              size={size}
              color={active ? activeStarColor : inactiveStarColor}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

interface RatingDisplayProps {
  value: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  value,
  reviewCount,
  size = 'medium',
}) => {
  const theme = useTheme();

  const getStarSize = (): number => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 24;
      default:
        return 16;
    }
  };

  return (
    <View style={styles.displayContainer}>
      <Rating
        value={value}
        readonly
        size={getStarSize()}
        activeColor={theme.colors.secondary.light}
      />
      {reviewCount !== undefined && (
        <View style={styles.reviewCount}>
          <Text 
            style={[
              theme.typography.caption,
              { color: theme.colors.grey[600] }
            ]}
          >
            ({reviewCount})
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCount: {
    marginLeft: 4,
  },
});