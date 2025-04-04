// components/service/BookingForm.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface BookingFormProps {
  onSubmit: (bookingData: BookingData) => void;
  loading?: boolean;
}

interface BookingData {
  date: Date;
  time: Date;
  notes: string;
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

  const handleSubmit = () => {
    onSubmit({
      date,
      time,
      notes,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Date"
        value={format(date, 'MMMM dd, yyyy')}
        onFocus={() => setShowDatePicker(true)}
        startIcon="calendar"
        editable={false}
      />

      <Input
        label="Time"
        value={format(time, 'hh:mm a')}
        onFocus={() => setShowTimePicker(true)}
        startIcon="clock"
        editable={false}
      />

      <Input
        label="Additional Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={4}
        style={styles.notes}
      />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) {
              setTime(selectedDate);
            }
          }}
        />
      )}

      <Button
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      >
        Confirm Booking
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  notes: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 24,
  },
});