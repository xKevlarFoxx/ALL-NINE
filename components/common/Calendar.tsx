// components/common/Calendar.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Feather } from '@expo/vector-icons';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from 'date-fns';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  markedDates?: Date[];
  disabledDates?: Date[];
  style?: ViewStyle;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  markedDates = [],
  disabledDates = [],
  style,
}) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date)) return;
    onDateSelect?.(date);
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return disabledDates.some(disabledDate => 
      isSameDay(date, disabledDate)
    );
  };

  const isDateMarked = (date: Date): boolean => {
    return markedDates.some(markedDate => 
      isSameDay(date, markedDate)
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
        disabled={minDate && currentMonth <= minDate}
      >
        <Feather
          name="chevron-left"
          size={24}
          color={
            minDate && currentMonth <= minDate
              ? theme.colors.grey[300]
              : theme.colors.grey[900]
          }
        />
      </TouchableOpacity>
      <Text style={[theme.typography.h4, styles.monthText]}>
        {format(currentMonth, 'MMMM yyyy')}
      </Text>
      <TouchableOpacity
        onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
        disabled={maxDate && currentMonth >= maxDate}
      >
        <Feather
          name="chevron-right"
          size={24}
          color={
            maxDate && currentMonth >= maxDate
              ? theme.colors.grey[300]
              : theme.colors.grey[900]
          }
        />
      </TouchableOpacity>
    </View>
  );

  const renderDayNames = () => (
    <View style={styles.weekDays}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <Text
          key={day}
          style={[
            theme.typography.caption,
            styles.weekDay,
            { color: theme.colors.grey[600] },
          ]}
        >
          {day}
        </Text>
      ))}
    </View>
  );

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const startPadding = monthStart.getDay();
    const endPadding = 6 - monthEnd.getDay();

    return (
      <View style={styles.daysContainer}>
        {[...Array(startPadding)].map((_, index) => (
          <View key={`start-${index}`} style={styles.dayCell} />
        ))}

        {days.map(day => {
          const isDisabled = isDateDisabled(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isMarked = isDateMarked(day);
          const isCurrentDay = isToday(day);

          return (
            <TouchableOpacity
              key={day.toISOString()}
              style={[
                styles.dayCell,
                isSelected && {
                  backgroundColor: theme.colors.primary.main,
                  borderRadius: theme.borderRadius.full,
                },
              ]}
              onPress={() => handleDateSelect(day)}
              disabled={isDisabled}
            >
              <Text
                style={[
                  theme.typography.body2,
                  styles.dayText,
                  isDisabled && { color: theme.colors.grey[300] },
                  isSelected && { color: theme.colors.grey[50] },
                  isCurrentDay && { fontWeight: 'bold' },
                ]}
              >
                {format(day, 'd')}
              </Text>
              {isMarked && !isSelected && (
                <View
                  style={[
                    styles.marker,
                    { backgroundColor: theme.colors.primary.main },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}

        {[...Array(endPadding)].map((_, index) => (
          <View key={`end-${index}`} style={styles.dayCell} />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderHeader()}
      {renderDayNames()}
      {renderDays()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    textAlign: 'center',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayText: {
    textAlign: 'center',
  },
  marker: {
    position: 'absolute',
    bottom: '15%',
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});