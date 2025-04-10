// BookingConfirmationScreen.tsx
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedView } from '@/components/ThemedView';
import { BookingConfirmation } from '@/components/service/BookingConfirmation';
import { Button } from '@/components/common/Button';
import { shadows } from '@/constants/DesignSystem/shadows';
import { spacing } from '@/constants/DesignSystem';
import { NotificationService } from '@/services/notifications/NotificationService';
import { BookingData } from '@/types/booking';
import { LoadingState } from '@/components/common/LoadingState';

type BookingStackParamList = {
    BookingConfirmation: { bookingId: string };
    BookingHistory: undefined;
  };

type Props = NativeStackScreenProps<BookingStackParamList, 'BookingConfirmation'>;

export const BookingConfirmationScreen = ({ route, navigation }: Props) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<BookingData | null>(null);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    if (booking) {
      const sendNotifications = async () => {
        await NotificationService.scheduleNotification(
          'Booking Confirmed!',
          `Your booking with ${booking.provider.name} is confirmed for ${booking.date}.`,
          Date.now() + 1000 * 60 * 60 // 1 hour from now
        );

        NotificationService.sendInAppNotification(
          `Booking confirmed with ${booking.provider.name}`
        );

        if (booking.email) {
          await NotificationService.sendEmailNotification(
            booking.email,
            'Booking Confirmation',
            `Your booking with ${booking.provider.name} is confirmed for ${booking.date}.`
          );
        }
      };

      sendNotifications();
    }
  }, [booking]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data: BookingData = await response.json();
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
    padding: spacing.medium,
  },
  confirmation: {
    marginBottom: spacing.large,
  },
  button: {
    ...shadows.medium,
  },
});

// BookingHistoryScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedView } from '@/components/ThemedView';
import { ServiceCard } from '@/components/service/ServiceCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { shadows } from '@/constants/DesignSystem/shadows';
import { spacing } from '@/constants/DesignSystem';

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
    flex: 1,
    padding: spacing.medium,
  },
  list: {
    flexGrow: 1,
    paddingBottom: spacing.large,
  },
  card: {
    marginVertical: spacing.small,
    ...shadows.medium,
  },
});