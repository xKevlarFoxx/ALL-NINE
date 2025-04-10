// components/service/DayPicker/index.tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { format, isBefore, isSameDay, addMinutes } from 'date-fns';
import { colors, spacing, typography } from '@/constants/DesignSystem';
import { ThemedText } from '@/components/ThemedText';

interface DayPickerProps {
  selectedDate: Date;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  style?: any;
  minDate?: Date;
  maxDate?: Date;
  interval?: number;
  unavailableSlots?: string[];
  error?: string;
}

export const DayPicker: React.FC<DayPickerProps> = ({
  selectedDate,
  selectedTime,
  onTimeSelect,
  style,
  minDate = new Date(),
  maxDate,
  interval = 30,
  unavailableSlots = [],
  error,
}) => {
  // Generate time slots based on interval
  const timeSlots = useMemo(() => {
    const slots = [];
    const start = new Date(selectedDate);
    start.setHours(9, 0, 0, 0); // Start at 9 AM
    const end = new Date(selectedDate);
    end.setHours(17, 0, 0, 0); // End at 5 PM

    while (isBefore(start, end)) {
      slots.push(format(start, 'HH:mm'));
      start.setMinutes(start.getMinutes() + interval);
    }
    return slots;
  }, [interval, selectedDate]);

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d');
  };

  const isTimeSlotAvailable = (time: string): boolean => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const slotDate = new Date(selectedDate);
      slotDate.setHours(hours, minutes, 0, 0);

      // Check if slot is in the past
      if (isSameDay(selectedDate, new Date()) && isBefore(slotDate, addMinutes(new Date(), 30))) {
        return false;
      }

      // Check if slot is within min/max date range
      if (minDate && isBefore(slotDate, minDate)) return false;
      if (maxDate && isBefore(maxDate, slotDate)) return false;

      // Check if slot is in unavailable slots
      return !unavailableSlots.includes(time);
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      return false;
    }
  };

  return (
    <View 
      style={[styles.container, style]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Time slot selection"
    >
      <ThemedText 
        style={styles.dateHeader}
        accessibilityRole="header"
      >
        {formatDate(selectedDate)}
      </ThemedText>

      {error && (
        <ThemedText style={styles.errorText}>
          {error}
        </ThemedText>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeSlotsContainer}
        accessibilityLabel="Available time slots"
      >
        {timeSlots.map((time) => {
          const isAvailable = isTimeSlotAvailable(time);
          const isSelected = time === selectedTime;
          
          return (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                isSelected && styles.selectedTimeSlot,
                !isAvailable && styles.unavailableTimeSlot
              ]}
              onPress={() => isAvailable && onTimeSelect(time)}
              disabled={!isAvailable}
              accessibilityRole="radio"
              accessibilityState={{ 
                selected: isSelected,
                disabled: !isAvailable 
              }}
              accessibilityLabel={`${time}${!isAvailable ? ', unavailable' : ''}`}
            >
              <ThemedText style={[
                styles.timeText,
                isSelected && styles.selectedTimeText,
                !isAvailable && styles.unavailableTimeText
              ]}>
                {time}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.default,
    padding: spacing.medium,
    borderRadius: spacing.sm
  },
  dateHeader: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.medium
  },
  errorText: {
    color: colors.error.main,
    marginBottom: spacing.sm
  },
  timeSlotsContainer: {
    paddingVertical: spacing.sm
  },
  timeSlot: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.background.paper,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.text.secondary,
    minWidth: 80,
    alignItems: 'center'
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main
  },
  unavailableTimeSlot: {
    backgroundColor: colors.background.paper,
    borderColor: colors.text.secondary,
    opacity: 0.5
  },
  timeText: {
    ...typography.body2,
    color: colors.text.primary
  },
  selectedTimeText: {
    color: colors.primary.contrastText
  },
  unavailableTimeText: {
    color: colors.text.secondary
  }
});