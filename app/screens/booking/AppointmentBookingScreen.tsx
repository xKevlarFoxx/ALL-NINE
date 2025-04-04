import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedView } from '@/components/ThemedView';
import { Calendar } from '@/components/common/Calendar';
import { DayPicker } from '@/components/service/DayPicker';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { colors, spacing, shadows, typography } from '@/constants/DesignSystem';


type BookingStackParamList = {
  AppointmentBooking: {
    providerId: string;
    serviceId: string;
  };
  BookingConfirmation: {
    bookingId: string;
  };
};

type Props = NativeStackScreenProps<BookingStackParamList, 'AppointmentBooking'>;

interface BookingData {
  date: Date;
  time: string;
  notes: string;
}

export const AppointmentBookingScreen = ({ route, navigation }: Props) => {
  const { providerId, serviceId } = route.params;
  const [booking, setBooking] = useState<BookingData>({
    date: new Date(),
    time: '',
    notes: ''
  });

  const handleDateSelect = (date: Date) => {
    setBooking(prev => ({ ...prev, date }));
  };

  const handleTimeSelect = (time: string) => {
    setBooking(prev => ({ ...prev, time }));
  };

  const handleSubmit = async () => {
    try {
      // Add booking creation logic
      navigation.navigate('BookingConfirmation', {
        bookingId: 'temp-id' // Replace with actual booking ID
      });
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Calendar
        selectedDate={booking.date}
        onSelectDate={handleDateSelect}
        style={styles.calendar}
      />
      <DayPicker
        selectedDate={booking.date}
        selectedTime={booking.time}
        onTimeSelect={handleTimeSelect}
        style={styles.timePicker}
      />

      <Input
        placeholder="Add notes for the service provider"
        value={booking.notes}
        onChangeText={(notes) => setBooking(prev => ({ ...prev, notes }))}
        multiline
        style={styles.notes}
      />

      <Button
        variant="primary"
        onPress={handleSubmit}
        disabled={!booking.time}
        style={styles.button}
      >
        Confirm Booking
      </Button>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.medium,
  },
  calendar: {
    marginBottom: spacing.medium,
    ...shadows.medium,
  },
  timePicker: {
    marginBottom: spacing.medium,
  },
  notes: {
    marginBottom: spacing.large,
  },
  button: {
    ...shadows.medium,
  },
});

export default AppointmentBookingScreen;