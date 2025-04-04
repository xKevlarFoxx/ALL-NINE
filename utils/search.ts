// utils/search.ts
import { ServiceProvider } from '../types';

export interface SearchFilters {
  category?: string;
  minRating?: number;
  maxPrice?: number;
  location?: string;
  availability?: string[];
}

export const filterProviders = (
  providers: ServiceProvider[],
  filters: SearchFilters,
  searchQuery?: string
): ServiceProvider[] => {
  return providers.filter(provider => {
    // Search query matching
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        provider.name.toLowerCase().includes(query) ||
        provider.profession.toLowerCase().includes(query) ||
        provider.description.toLowerCase().includes(query);
      if (!matchesQuery) return false;
    }

    // Category filter
    if (filters.category && !provider.categories.includes(filters.category)) {
      return false;
    }

    // Rating filter
    if (filters.minRating && provider.rating < filters.minRating) {
      return false;
    }

    // Price filter
    if (filters.maxPrice && provider.pricing.basePrice > filters.maxPrice) {
      return false;
    }

    // Location filter
    if (filters.location && !provider.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    // Availability filter
    if (filters.availability && !filters.availability.some(day => provider.availability.days.includes(day))) {
      return false;
    }

    return true;
  });
};