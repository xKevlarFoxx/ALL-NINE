// Define the AuthState type
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

// Define the ProfileState type
export interface ProfileState {
  username: string;
  email: string;
}

// Define the UIState type
export interface UIState {
  theme: 'light' | 'dark';
  language: string;
}