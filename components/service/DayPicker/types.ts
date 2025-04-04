import { ViewStyle } from 'react-native';

export interface DayPickerProps {
  selectedDate: Date;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  style?: ViewStyle;
}