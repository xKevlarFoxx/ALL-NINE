export interface BookingData {
    id: string;
    date: Date;
    time: string;
    notes?: string;
    provider: {
        name: string;
        profession: string;
    };
    serviceName: string;
    status: 'upcoming' | 'completed' | 'cancelled';
    price?: number;
    duration?: number;
    location?: string;
    email?: string;
}