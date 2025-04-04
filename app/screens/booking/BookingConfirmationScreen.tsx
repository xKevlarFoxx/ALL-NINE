// BookingConfirmationScreen.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedView } from '@/components/ThemedView';
import { LoadingState } from '@/components/common/LoadingState';
import { BookingConfirmation } from '@/components/service/BookingConfirmation';
import { Button } from '@/components/common/Button';
import { colors, spacing, shadows } from '@/constants/DesignSystem';
import { BookingData } from '@/types/booking';

type BookingStackParamList = {
    BookingConfirmation: { bookingId: string };
    BookingHistory: undefined;
  };

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingConfirmation'>;

export const BookingConfirmationScreen = ({ route, navigation }: Props) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      setBooking(data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {booking ? (
        <BookingConfirmation booking={booking} />
      ) : (
        <LoadingState.Card />
      )}
      <Button
        variant="primary"
        onPress={() => navigation.navigate('BookingHistory')}
        style={styles.button}
      >
        View Bookings
      </Button>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.medium
  },
  confirmation: {
    ...shadows.medium,
    marginBottom: spacing.large
  },
  button: {
    ...shadows.medium
  }
});

// BookingHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedView } from '@/components/ThemedView';
import { ServiceCard } from '@/components/service/ServiceCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { colors, spacing } from '@/constants/DesignSystem';

interface BookingHistory {
  id: string;
  providerName: string;
  serviceName: string;
  date: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export const BookingHistoryScreen = ({ navigation }: NativeStackScreenProps<any>) => {
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings/history');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
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
            onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
            style={styles.card}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  list: {
    padding: spacing.medium
  },
  card: {
    marginBottom: spacing.medium,
    ...shadows.medium
  }
});