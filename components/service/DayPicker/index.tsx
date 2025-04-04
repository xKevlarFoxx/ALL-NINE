// components/service/DayPicker/index.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { DayPickerProps } from './types';
import { colors, spacing, typography } from '@/constants/DesignSystem';

export const DayPicker: React.FC<DayPickerProps> = ({
  selectedDate,
  selectedTime,
  onTimeSelect,
  style
}) => {
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('default', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const isTimeSlotAvailable = (time: string) => {
    // Add availability logic here
    return true;
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.dateHeader}>{formatDate(selectedDate)}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeSlotsContainer}
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
            >
              <Text style={[
                styles.timeText,
                isSelected && styles.selectedTimeText,
                !isAvailable && styles.unavailableTimeText
              ]}>
                {time}
              </Text>
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
    borderColor: colors.text.secondary // Changed from colors.border
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main
  },
  unavailableTimeSlot: {
    backgroundColor: colors.background.paper, // Changed from background.disabled
    borderColor: colors.text.secondary // Changed from colors.border
  },
  timeText: {
    ...typography.body2,
    color: colors.text.primary
  },
  selectedTimeText: {
    color: colors.primary.contrastText
  },
  unavailableTimeText: {
    color: colors.text.secondary // Changed from text.disabled
  }
});
export type { DayPickerProps } from './types';