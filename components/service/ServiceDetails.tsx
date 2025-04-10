// components/service/ServiceDetails.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Feather } from '@expo/vector-icons';

interface ServiceDetailsProps {
  description: string;
  categories: string[];
  features: string[];
  pricing: {
    basePrice: number;
    currency: string;
    unit: string;
  };
  availability: {
    days: string[];
    hours: string;
  };
  style?: StyleProp<ViewStyle>;
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  description,
  categories,
  features,
  pricing,
  availability,
  style
}) => {
  const theme = useTheme();

  const formattedPrice = useMemo(() => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: pricing.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(pricing.basePrice);
    } catch (error) {
      console.error('Price formatting failed:', error);
      return `${pricing.currency === 'USD' ? '$' : pricing.currency}${pricing.basePrice}`;
    }
  }, [pricing.basePrice, pricing.currency]);

  return (
    <ScrollView 
      style={[styles.container, style]}
      accessibilityRole="scrollbar"
    >
      <Card style={styles.section}>
        <Text 
          style={[theme.typography.h4, styles.sectionTitle]}
          accessibilityRole="header"
        >
          About
        </Text>
        <Text 
          style={[theme.typography.body2, styles.description]}
          accessibilityLabel={`Service description: ${description}`}
        >
          {description || 'No description available'}
        </Text>

        <View 
          style={styles.categories}
          accessibilityLabel="Service categories"
        >
          {categories.map((category, index) => (
            <Badge
              key={index}
              label={category}
              variant="info"
              size="small"
              style={styles.badge}
              accessibilityLabel={`Category: ${category}`}
            />
          ))}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text 
          style={[theme.typography.h4, styles.sectionTitle]}
          accessibilityRole="header"
        >
          Features
        </Text>
        <View 
          style={styles.features}
          accessibilityLabel="Service features"
        >
          {features.map((feature, index) => (
            <View 
              key={index} 
              style={styles.featureItem}
              accessible={true}
            >
              <View 
                style={[styles.bullet, { backgroundColor: theme.colors.primary.main }]} 
              />
              <Text style={theme.typography.body2}>
                {feature}
              </Text>
            </View>
          ))}
          {features.length === 0 && (
            <Text style={[theme.typography.body2, { color: theme.colors.grey[600] }]}>
              No features listed
            </Text>
          )}
        </View>
      </Card>

      <Card style={styles.section}>
        <Text 
          style={[theme.typography.h4, styles.sectionTitle]}
          accessibilityRole="header"
        >
          Pricing
        </Text>
        <View 
          style={styles.pricing}
          accessibilityLabel={`Price: ${formattedPrice} per ${pricing.unit}`}
        >
          <Text style={[theme.typography.h3, styles.price]}>
            {formattedPrice}
          </Text>
          <Text style={[theme.typography.body2, styles.priceUnit]}>
            / {pricing.unit}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text 
          style={[theme.typography.h4, styles.sectionTitle]}
          accessibilityRole="header"
        >
          Availability
        </Text>
        <View 
          accessibilityLabel={`Available ${availability.days.join(', ')} during ${availability.hours}`}
        >
          <Text style={[theme.typography.body1, styles.days]}>
            {availability.days.join(', ')}
          </Text>
          <Text style={[theme.typography.body2, styles.hours]}>
            {availability.hours}
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    lineHeight: 24,
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    marginRight: 8,
    marginBottom: 8,
  },
  features: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    marginRight: 4,
  },
  priceUnit: {
    color: '#666',
  },
  days: {
    marginBottom: 4,
  },
  hours: {
    color: '#666',
  },
});