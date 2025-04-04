// hooks/useServiceProvider.ts
import { useState, useEffect } from 'react';
import { ServiceProvider } from '@/types';

export const useServiceProvider = (id: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        // Replace with your actual API call
        const response = await fetch(`/api/providers/${id}`);
        const data = await response.json();
        setProvider(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  return { provider, loading, error };
};