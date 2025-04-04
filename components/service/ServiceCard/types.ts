import { ViewStyle } from 'react-native';

export interface ServiceCardProps {
    title: string;
    subtitle: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    date: Date;
    price?: number;
    duration?: number;
    location?: string;
    onPress: () => void;
    style?: ViewStyle;
  }