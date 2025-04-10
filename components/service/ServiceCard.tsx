import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { RatingDisplay } from '../common/Rating';
import { Badge } from '../common/Badge';
import { Feather } from '@expo/vector-icons';

interface ServiceCardProps {
  id: string;
  providerName: string;
  providerAvatar?: string;
  serviceName: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency?: string;
  categories: string[];
  distance?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const formatPrice = (price: number, currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (error) {
    console.error('Price formatting failed:', error);
    return `${currency === 'USD' ? '$' : currency}${price}`;
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = memo(({
  providerName,
  providerAvatar,
  serviceName,
  rating,
  reviewCount,
  price,
  currency = 'USD',
  categories,
  distance,
  onPress,
  style,
}) => {
  const theme = useTheme();

  const handlePress = useCallback(() => {
    try {
      onPress?.();
    } catch (error) {
      console.error('ServiceCard press handler failed:', error);
    }
  }, [onPress]);

  const handleBookPress = useCallback(() => {
    // Implement booking logic
    console.log('Book button pressed');
  }, []);

  const accessibilityLabel = `${providerName}, ${serviceName}. Rating: ${rating} out of 5${distance ? `. ${distance} away` : ''}`;

  return (
    <Card
      onPress={handlePress}
      style={[styles.container, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <Avatar
          size="small"
          source={providerAvatar ? { uri: providerAvatar } : undefined}
          initials={providerName.slice(0, 2)}
          accessibilityLabel={`${providerName}'s avatar`}
        />
        <View style={styles.headerText}>
          <Text
            style={[theme.typography.body1, styles.providerName]}
            numberOfLines={1}
          >
            {providerName}
          </Text>
          <RatingDisplay
            value={rating}
            reviewCount={reviewCount}
            size="small"
            accessibilityLabel={`Rating: ${rating} out of 5, ${reviewCount} reviews`}
          />
        </View>
        {distance && (
          <View style={styles.distance}>
            <Feather name="map-pin" size={12} color={theme.colors.grey[500]} />
            <Text
              style={[theme.typography.caption, styles.distanceText]}
              accessibilityLabel={`${distance} away`}
            >
              {distance}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[theme.typography.h4, styles.serviceName]}
        numberOfLines={2}
      >
        {serviceName}
      </Text>

      <View style={styles.categories}>
        {categories.map((category, index) => (
          <Badge
            key={index}
            label={category}
            variant="info"
            size="small"
            outline
            style={styles.badge}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text
          style={[theme.typography.h3, styles.price]}
          accessibilityLabel={`Price: ${formatPrice(price, currency)}`}
        >
          {formatPrice(price, currency)}
        </Text>
        <TouchableOpacity
          style={[
            styles.bookButton,
            { backgroundColor: theme.colors.primary.main }
          ]}
          onPress={handleBookPress}
          accessibilityLabel="Book Now"
          accessibilityRole="button"
        >
          <Text style={[theme.typography.button, styles.bookButtonText]}>
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
});

ServiceCard.displayName = 'ServiceCard';

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    marginBottom: 2,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    marginLeft: 4,
    color: '#666',
  },
  serviceName: {
    marginBottom: 8,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  badge: {
    marginRight: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: '#000',
  },
  bookButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#FFF',
  },
});