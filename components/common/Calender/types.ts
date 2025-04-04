// components/common/Calendar/types.ts
import * as reactNative from 'react-native';

export interface CalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    style?: reactNative.ViewStyle;
}