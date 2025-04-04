// types/user.ts
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface Availability {
  days: string[];
  hours: string;
}

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
  services: Service[];
  availability: Availability;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
}

export type EditableField = {
  key: keyof ServiceProvider;
  label: string;
  type: 'text' | 'multiline' | 'number' | 'list' | 'availability';
  multiline?: boolean;
};

export interface Availability {
  days: string[];
  hours: string;
}