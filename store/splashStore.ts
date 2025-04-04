import { create } from 'zustand';

interface SplashState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useSplashStore = create<SplashState>((set) => ({
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));