import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { CalendarService } from '@/services/calendar/CalendarService';
import DateTimePicker from '@react-native-community/datetimepicker';

export const AvailabilityScreen = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleAddAvailability = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select both start and end times.');
      return;
    }

    const hasPermission = await CalendarService.requestCalendarPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Calendar access is required to add availability.');
      return;
    }

    const eventId = await CalendarService.addEventToCalendar('Available Slot', startDate, endDate);
    if (eventId) {
      Alert.alert('Success', 'Availability added to your calendar.');
    } else {
      Alert.alert('Error', 'Failed to add availability.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your Availability</Text>

      <Button title="Select Start Time" onPress={() => setShowStartPicker(true)} />
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="datetime"
          display="default"
          onChange={(event, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}

      <Button title="Select End Time" onPress={() => setShowEndPicker(true)} />
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="datetime"
          display="default"
          onChange={(event, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      <Button title="Add Availability" onPress={handleAddAvailability} />
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