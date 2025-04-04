// components/service/DayPicker.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useTheme } from '../ThemeProvider';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DayPickerProps {
  selectedDays: string[];
  hours: string;
  onDaysChange: (days: string[]) => void;
  onHoursChange: (hours: string) => void;
}

export const DayPicker: React.FC<DayPickerProps> = ({
  selectedDays,
  hours,
  onDaysChange,
  onHoursChange,
}) => {
  const theme = useTheme();

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[theme.typography.body1, styles.label]}>Working Days</Text>
      <View style={styles.daysContainer}>
        {DAYS.map(day => (
          <Button
            key={day}
            variant={selectedDays.includes(day) ? 'primary' : 'outlined'}
            onPress={() => toggleDay(day)}
            style={styles.dayButton}
          >
            {day.slice(0, 3)}
          </Button>
        ))}
      </View>

      <Text style={[theme.typography.body1, styles.label]}>Working Hours</Text>
      <Input
        value={hours}
        onChangeText={onHoursChange}
        placeholder="e.g., 9:00 AM - 5:00 PM"
        style={styles.hoursInput}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayButton: {
    margin: 4,
    minWidth: 80,
  },
  hoursInput: {
    marginBottom: 16,
  },
});