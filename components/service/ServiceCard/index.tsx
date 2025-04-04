// components/service/ServiceCard/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ServiceCardProps } from './types';
import { colors, spacing, typography, shadows } from '@/constants/DesignSystem';
import { Clock, MapPin, DollarSign } from 'lucide-react-native';

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  subtitle,
  status,
  date,
  price,
  duration,
  location,
  onPress,
  style
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'upcoming':
        return colors.success.main;
      case 'completed':
        return colors.primary.main; // Instead of info
      case 'cancelled':
        return colors.error.main;
      default:
        return colors.text.secondary;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('default', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? 
      `${hours}h ${mins > 0 ? `${mins}m` : ''}` : 
      `${mins}m`;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.dateText}>{formatDate(date)}</Text>
        
        <View style={styles.infoContainer}>
          {duration && (
            <View style={styles.infoItem}>
              <Clock size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>{formatDuration(duration)}</Text>
            </View>
          )}
          
          {price && (
            <View style={styles.infoItem}>
              <DollarSign size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>${price}</Text>
            </View>
          )}
          
          {location && (
            <View style={styles.infoItem}>
              <MapPin size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>{location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.paper,
    borderRadius: spacing.md,
    padding: spacing.medium,
    ...shadows.medium
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.medium
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.medium
  },
  title: {
    ...typography.body2,
    color: colors.text.primary,
    marginBottom: spacing.xs
  },
  subtitle: {
    ...typography.body2,
    color: colors.text.secondary
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm
  },
  statusText: {
    ...typography.h4,
    color: colors.background.paper,
    textTransform: 'capitalize'
  },
  details: {
    gap: spacing.sm
  },
  dateText: {
    ...typography.body2,
    color: colors.text.primary
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.medium
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  infoText: {
    ...typography.body2,
    color: colors.text.secondary
  }
});