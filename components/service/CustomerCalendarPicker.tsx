import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CustomerCalendarPickerProps {
  onDateSelected: (date: Date) => void;
}

export const CustomerCalendarPicker: React.FC<CustomerCalendarPickerProps> = ({ onDateSelected }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date.');
      return;
    }
    onDateSelected(selectedDate);
    Alert.alert('Success', 'Date selected successfully.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Date</Text>

      <Button title="Pick a Date" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <Button title="Confirm" onPress={handleConfirm} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});