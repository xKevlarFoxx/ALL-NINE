// components/common/Calendar/index.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CalendarProps } from './types';
import { colors, spacing, typography, shadows } from '@/constants/DesignSystem';
import { ThemedView } from '@/components/ThemedView';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelectDate, style }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startPadding = Array(start.getDay()).fill(null);
    return [...startPadding, ...days];
  }, [currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(current => {
      const newMonth = new Date(current);
      newMonth.setMonth(current.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  return (
    <ThemedView style={[styles.container, style]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navigationButton}>
          <Text style={styles.navigationText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navigationButton}>
          <Text style={styles.navigationText}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {DAYS_OF_WEEK.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendarDays.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

          const isSelected = day.toDateString() === selectedDate?.toDateString();
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.dayCell,
                isSelected && styles.selectedDay,
                isToday && styles.today
              ]}
              onPress={() => onSelectDate(day)}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.selectedDayText,
                isToday && styles.todayText
              ]}>
                {format(day, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ThemedView>
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
    alignItems: 'center',
    marginBottom: spacing.medium
  },
  navigationButton: {
    padding: spacing.sm,
    borderRadius: spacing.sm
  },
  navigationText: {
    ...typography.h4,
    color: colors.primary.main
  },
  monthText: {
    ...typography.h4,
    color: colors.text.primary
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: spacing.sm
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: colors.text.secondary,
    ...typography.body2
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  dayText: {
    ...typography.body2,
    color: colors.text.primary
  },
  selectedDay: {
    backgroundColor: colors.primary.main,
    borderRadius: spacing.sm
  },
  selectedDayText: {
    color: colors.primary.contrastText,
    fontFamily: typography.body2.fontFamily
  },
  today: {
    borderWidth: 1,
    borderColor: colors.primary.main,
    borderRadius: spacing.sm
  },
  todayText: {
    color: colors.primary.main,
    fontFamily: typography.body2.fontFamily
  }
});

export { Calendar };
export type { CalendarProps } from './types';