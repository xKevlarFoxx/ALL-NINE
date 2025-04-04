// utils/validation.ts
export const validateField = (
    field: string,
    value: any
  ): { isValid: boolean; error?: string } => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          return { isValid: false, error: 'Name must be at least 2 characters' };
        }
        break;
      case 'price':
        if (isNaN(value) || value <= 0) {
          return { isValid: false, error: 'Price must be greater than 0' };
        }
        break;
      case 'duration':
        if (isNaN(value) || value < 5) {
          return { isValid: false, error: 'Duration must be at least 5 minutes' };
        }
        break;
      // Add more validations as needed
    }
    return { isValid: true };
  };