// hooks/useServiceProvider.ts
import { useState, useEffect } from 'react';
import { ServiceProvider } from '@/types';

/**
 * useServiceProvider hook
 *
 * Retrieves detailed information about a service provider while properly managing loading and error states.
 *
 * @param id - Unique identifier of the service provider.
 * @returns An object containing the service provider's data, loading status, and error information if any.
 */
export const useServiceProvider = (id: string) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProvider = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/providers/${id}`, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setProvider(data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err as Error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProvider();

    return () => {
      controller.abort();
    };
  }, [id]);

  return { provider, loading, error };
};
