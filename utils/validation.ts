// utils/validation.ts

// Centralized error messages
const ERROR_MESSAGES = {
  name: 'Name must be at least 2 characters',
  price: 'Price must be greater than 0',
  duration: 'Duration must be at least 5 minutes',
};

// Define valid fields as a TypeScript type
export type ValidField = 'name' | 'price' | 'duration';

export const validateField = (
  field: ValidField,
  value: any
): { isValid: boolean; error?: string } => {
  const validators: Record<ValidField, (value: any) => boolean> = {
    name: (value) => value && value.trim().length >= 2,
    price: (value) => !isNaN(value) && value > 0,
    duration: (value) => !isNaN(value) && value >= 5,
  };

  // Check if the field has a validator
  if (validators[field]) {
    const isValid = validators[field](value);
    return isValid ? { isValid: true } : { isValid: false, error: ERROR_MESSAGES[field] };
  }

  // Default to valid if no validator exists for the field
  return { isValid: true };
};