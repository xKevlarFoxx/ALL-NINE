// components/service/BookingConfirmation.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../components/ThemeProvider';
import { Button } from '../common/Button';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';  // Added this import

interface BookingConfirmationProps {
  booking: {
    date: Date;
    time: Date;
    provider: {
      name: string;
      profession: string;
    };
    price: number;
  };
  onClose: () => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  onClose,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Feather name="check-circle" size={64} color={theme.colors.success.main} />
      </View>

      <Text style={[theme.typography.h3, styles.title]}>
        Booking Confirmed!
      </Text>

      <View style={styles.details}>
        <Text style={theme.typography.body1}>
          {booking.provider.name} - {booking.provider.profession}
        </Text>
        <Text style={theme.typography.body2}>
          {format(booking.date, 'MMMM dd, yyyy')}
        </Text>
        <Text style={theme.typography.body2}>
          {format(booking.time, 'hh:mm a')}
        </Text>
      </View>

      <Button
        variant="primary"
        onPress={onClose}
        style={styles.button}
      >
        Done
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  details: {
    alignItems: 'center',
    marginBottom: 24,
  },
  button: {
    width: '100%',
  },
});