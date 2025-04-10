import { create } from 'zustand';
import axios from 'axios'; // Use axios for API calls

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

  // Fetch providers from the API
  fetchProviders: async () => {
    set({ loading: true });
    try {
      const response = await axios.get<Provider[]>('/api/providers'); // Replace with actual API endpoint
      set({ providers: response.data, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch providers';
      set({ error: errorMessage });
      console.error('Error fetching providers:', errorMessage); // Log the error
    } finally {
      set({ loading: false });
    }
  },

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error state
  setError: (error) => set({ error })
}));