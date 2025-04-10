import { create } from 'zustand';

interface SplashState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  resetSplashState: () => void; // Add a method to reset the state
}

export const useSplashStore = create<SplashState>((set) => ({
  isLoading: true,

  // Set the loading state
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Reset the splash state to its initial value
  resetSplashState: () => set({ isLoading: true }),
}));