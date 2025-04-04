import { create } from 'zustand';

export interface Provider {
  id: string;
  name: string;
  rating: number;
  services: string[];
  price: number;
  image: string;
}

interface ProviderStore {
  providers: Provider[];
  loading: boolean;
  error: string | null;
  fetchProviders: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProviderStore = create<ProviderStore>((set) => ({
  providers: [],
  loading: false,
  error: null,
  fetchProviders: async () => {
    set({ loading: true });
    try {
      // TODO: Replace with actual API call
      const mockProviders: Provider[] = [
        {
          id: '1',
          name: 'John Doe',
          rating: 4.5,
          services: ['Cleaning', 'Maintenance'],
          price: 50,
          image: 'https://placeholder.com/150'
        },
        // Add more mock data as needed
      ];
      set({ providers: mockProviders, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch providers' });
    } finally {
      set({ loading: false });
    }
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error })
}));