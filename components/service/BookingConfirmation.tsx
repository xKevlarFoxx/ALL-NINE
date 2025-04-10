// components/service/BookingConfirmation.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../components/ThemeProvider';
import { Button } from '../common/Button';
import { format } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface BookingConfirmationProps {
  booking: {
    date: Date;
    time: Date;
    provider: {
      name: string;
      profession: string;
    };
    price: number;
    id?: string;
    location?: string;
  };
  onClose: () => void;
  onViewDetails?: (bookingId: string) => void;
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  booking,
  onClose,
  onViewDetails,
}) => {
  const theme = useTheme();

  // Format price with proper currency
  const formattedPrice = useMemo(() => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(booking.price);
    } catch (error) {
      console.error('Price formatting failed:', error);
      return `$${booking.price}`;
    }
  }, [booking.price]);

  // Format date and time
  const formattedDate = useMemo(() => format(booking.date, 'MMMM dd, yyyy'), [booking.date]);
  const formattedTime = useMemo(() => format(booking.time, 'hh:mm a'), [booking.time]);

  const handleClose = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onClose();
    } catch (error) {
      console.error('Failed to trigger haptic feedback:', error);
      onClose();
    }
  };

  const handleViewDetails = () => {
    if (booking.id && onViewDetails) {
      onViewDetails(booking.id);
    }
  };

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel="Booking confirmation"
    >
      <View style={styles.iconContainer}>
        <Feather 
          name="check-circle" 
          size={64} 
          color={theme.colors.success.main}
          accessibilityLabel="Success checkmark"
        />
      </View>

      <Text 
        style={[theme.typography.h3, styles.title]}
        accessibilityRole="header"
      >
        Booking Confirmed!
      </Text>

      <View 
        style={styles.details}
        accessible={true}
        accessibilityLabel={`Booking details: ${booking.provider.name}, ${booking.provider.profession}, on ${formattedDate} at ${formattedTime}`}
      >
        <Text style={[theme.typography.body1, styles.providerName]}>
          {booking.provider.name}
        </Text>
        <Text style={[theme.typography.body2, styles.profession]}>
          {booking.provider.profession}
        </Text>
        <Text style={[theme.typography.body2, styles.datetime]}>
          {formattedDate} at {formattedTime}
        </Text>
        {booking.location && (
          <Text style={[theme.typography.body2, styles.location]}>
            📍 {booking.location}
          </Text>
        )}
        <Text style={[theme.typography.h4, styles.price]}>
          {formattedPrice}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          onPress={handleClose}
          style={styles.button}
          accessibilityLabel="Close confirmation"
          accessibilityHint="Returns to the previous screen"
        >
          Done
        </Button>
        {booking.id && onViewDetails && (
          <Button
            variant="outlined"
            onPress={handleViewDetails}
            style={styles.button}
            accessibilityLabel="View booking details"
            accessibilityHint="Shows full booking information"
          >
            View Details
          </Button>
        )}
      </View>
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
    width: '100%',
  },
  providerName: {
    marginBottom: 4,
    fontWeight: '600',
  },
  profession: {
    marginBottom: 16,
    opacity: 0.8,
  },
  datetime: {
    marginBottom: 8,
  },
  location: {
    marginBottom: 16,
  },
  price: {
    marginTop: 8,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
  },
});