// types/index.ts
export interface ServiceProvider {
    id: string;
    name: string;
    avatar?: string;
    profession: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    location: string;
    experience: string;
    description: string;
    categories: string[];
    features: string[];
    pricing: {
      basePrice: number;
      currency: string;
      unit: string;
    };
    availability: {
      days: string[];
      hours: string;
    };
  }
  
  export interface Review {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string;
    rating: number;
    comment: string;
    date: Date;
    providerId: string;
  }
  
  export interface Booking {
    id: string;
    providerId: string;
    userId: string;
    date: Date;
    time: Date;
    notes?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  }