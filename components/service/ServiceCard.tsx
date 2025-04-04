// components/service/ServiceCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
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
}) => {
  const theme = useTheme();

  return (
    <Card
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.header}>
        <Avatar
          size="small"
          source={providerAvatar ? { uri: providerAvatar } : undefined}
          initials={providerName.slice(0, 2)}
        />
        <View style={styles.headerText}>
          <Text style={[theme.typography.body1, styles.providerName]}>
            {providerName}
          </Text>
          <RatingDisplay
            value={rating}
            reviewCount={reviewCount}
            size="small"
          />
        </View>
        {distance && (
          <View style={styles.distance}>
            <Feather name="map-pin" size={12} color={theme.colors.grey[500]} />
            <Text style={[theme.typography.caption, styles.distanceText]}>
              {distance}
            </Text>
          </View>
        )}
      </View>

      <Text style={[theme.typography.h4, styles.serviceName]}>
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
        <Text style={[theme.typography.h3, styles.price]}>
          {currency === 'USD' ? '$' : currency}{price}
        </Text>
        <TouchableOpacity
          style={[
            styles.bookButton,
            { backgroundColor: theme.colors.primary.main }
          ]}
        >
          <Text style={[theme.typography.button, styles.bookButtonText]}>
            Book Now
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

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