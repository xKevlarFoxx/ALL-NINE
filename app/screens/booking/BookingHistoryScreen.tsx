import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedView } from '@/components/ThemedView';
import { ServiceCard } from '@/components/service/ServiceCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { colors, spacing, shadows } from '@/constants/DesignSystem';
import { ThemedText } from '@/components/ThemedText';
import { typography } from '@/constants/DesignSystem';
import { ServiceCardProps } from '@/components/service/ServiceCard/types';

interface BookingHistory {
  id: string;
  providerName: string;
  serviceName: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  price: number;
  location?: string;
  duration: number;
}

type BookingStackParamList = {
  BookingHistory: undefined;
  BookingDetails: { bookingId: string };
};

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingHistory'>;

export const BookingHistoryScreen = ({ navigation }: Props) => {
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings/history');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleBookingPress = (bookingId: string) => {
    navigation.navigate('BookingDetails', { bookingId });
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={fetchBookings} />;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ServiceCard
            title={item.serviceName}
            subtitle={item.providerName}
            status={item.status}
            date={new Date(item.date)}
            price={item.price}
            duration={item.duration}
            location={item.location}
            onPress={() => handleBookingPress(item.id)}
            style={styles.card}
          />
        )}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              No bookings found
            </ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default
  },
  list: {
    padding: spacing.medium
  },
  card: {
    marginBottom: spacing.medium,
    ...shadows.medium
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxlarge
  },
  emptyText: {
    ...typography.body1,
    color: colors.text.secondary
  }
});

export default BookingHistoryScreen;