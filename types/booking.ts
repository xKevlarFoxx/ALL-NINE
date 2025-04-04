export interface BookingData {
    id: string;
    date: Date;
    time: string;
    notes?: string;
    providerName: string;
    serviceName: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    price?: number;
    duration?: number;
    location?: string;
  }