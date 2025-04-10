// components/service/BookingForm.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isAfter, startOfDay, addMinutes } from 'date-fns';

interface BookingFormProps {
  onSubmit: (bookingData: BookingData) => void;
  loading?: boolean;
}

interface BookingData {
  date: Date;
  time: Date;
  notes: string;
}

interface ValidationErrors {
  date?: string;
  time?: string;
  notes?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const theme = useTheme();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validation functions
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    const now = new Date();
    const selectedDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    // Check if date is in the past
    if (!isAfter(startOfDay(date), startOfDay(now))) {
      newErrors.date = 'Please select a future date';
    }

    // Check if time is in the past for today's date
    if (isAfter(startOfDay(now), startOfDay(date))) {
      newErrors.time = 'Please select a valid time';
    } else if (
      startOfDay(now).getTime() === startOfDay(date).getTime() &&
      !isAfter(selectedDateTime, addMinutes(now, 30))
    ) {
      newErrors.time = 'Please select a time at least 30 minutes from now';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [date, time]);

  // Handlers
  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setErrors(prev => ({ ...prev, date: undefined }));
    }
  }, []);

  const handleTimeChange = useCallback((event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setTime(selectedDate);
      setErrors(prev => ({ ...prev, time: undefined }));
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSubmit({
        date,
        time,
        notes: notes.trim(),
      });
    }
  }, [date, time, notes, validateForm, onSubmit]);

  // Memoized date and time strings
  const formattedDate = useMemo(() => format(date, 'MMMM dd, yyyy'), [date]);
  const formattedTime = useMemo(() => format(time, 'hh:mm a'), [time]);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.inputContainer}>
        <Input
          label="Date"
          value={formattedDate}
          onFocus={() => setShowDatePicker(true)}
          startIcon="calendar"
          editable={false}
          error={errors.date}
          accessibilityLabel={`Selected date: ${formattedDate}`}
          accessibilityRole="button"
          accessibilityHint="Double tap to change date"
        />

        <Input
          label="Time"
          value={formattedTime}
          onFocus={() => setShowTimePicker(true)}
          startIcon="clock"
          editable={false}
          error={errors.time}
          accessibilityLabel={`Selected time: ${formattedTime}`}
          accessibilityRole="button"
          accessibilityHint="Double tap to change time"
        />

        <Input
          label="Additional Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          style={styles.notes}
          placeholder="Add any special requests or instructions"
          accessibilityLabel="Additional notes"
          accessibilityHint="Enter any special requests or instructions"
        />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <Button
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
        disabled={loading}
        accessibilityLabel="Confirm booking"
        accessibilityHint="Double tap to submit booking request"
      >
        Confirm Booking
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  inputContainer: {
    gap: 16,
  },
  notes: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 24,
  },
});