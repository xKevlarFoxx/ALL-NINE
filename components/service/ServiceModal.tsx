// components/service/ServiceModal.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useTheme } from '../ThemeProvider';
import { ThemedText } from '../ThemedText';
import { Service } from '../../types/user';
import { validateField } from '../../utils/validation';

interface ServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  initialService?: Service;
  loading?: boolean;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  price?: string;
  duration?: string;
  general?: string;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  visible,
  onClose,
  onSave,
  initialService,
  loading = false,
}) => {
  const theme = useTheme();
  const [service, setService] = useState<Service>(initialService || {
    id: Date.now().toString(),
    name: '',
    description: '',
    price: 0,
    duration: 0,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setService(initialService || {
        id: Date.now().toString(),
        name: '',
        description: '',
        price: 0,
        duration: 0,
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [visible, initialService]);

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!service.name.trim()) {
      newErrors.name = 'Service name is required';
    } else if (service.name.length < 3) {
      newErrors.name = 'Service name must be at least 3 characters';
    }

    if (!service.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (service.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (service.duration < 5) {
      newErrors.duration = 'Duration must be at least 5 minutes';
    } else if (service.duration > 480) {
      newErrors.duration = 'Duration cannot exceed 8 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [service]);

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      await onSave(service);
      onClose();
    } catch (error) {
      console.error('Failed to save service:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to save service. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [service, validateForm, onSave, onClose]);

  const handlePriceChange = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9.]/g, '');
    const price = parseFloat(numericValue) || 0;
    setService(prev => ({ ...prev, price }));
    if (errors.price) {
      setErrors(prev => ({ ...prev, price: undefined }));
    }
  }, [errors.price]);

  const handleDurationChange = useCallback((text: string) => {
    const duration = parseInt(text) || 0;
    setService(prev => ({ ...prev, duration }));
    if (errors.duration) {
      setErrors(prev => ({ ...prev, duration: undefined }));
    }
  }, [errors.duration]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={initialService ? 'Edit Service' : 'Add Service'}
      accessibilityLabel={`${initialService ? 'Edit' : 'Add'} service form`}
    >
      <View 
        style={styles.container}
        importantForAccessibility="yes"
        accessibilityRole="form"
      >
        <Input
          label="Service Name"
          value={service.name}
          onChangeText={(text) => {
            setService(prev => ({ ...prev, name: text }));
            if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
          }}
          style={styles.input}
          error={errors.name}
          maxLength={50}
          accessibilityLabel="Service name input"
          accessibilityHint="Enter the name of your service"
          isRequired
        />
        
        <Input
          label="Description"
          value={service.description}
          onChangeText={(text) => {
            setService(prev => ({ ...prev, description: text }));
            if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
          }}
          multiline
          numberOfLines={3}
          style={styles.input}
          error={errors.description}
          maxLength={500}
          accessibilityLabel="Service description input"
          accessibilityHint="Enter a detailed description of your service"
          isRequired
        />
        
        <Input
          label="Price"
          value={service.price > 0 ? service.price.toFixed(2) : ''}
          onChangeText={handlePriceChange}
          keyboardType="decimal-pad"
          style={styles.input}
          error={errors.price}
          startIcon="dollar-sign"
          accessibilityLabel="Service price input"
          accessibilityHint="Enter the price for your service"
          isRequired
        />
        
        <Input
          label="Duration (minutes)"
          value={service.duration > 0 ? service.duration.toString() : ''}
          onChangeText={handleDurationChange}
          keyboardType="number-pad"
          style={styles.input}
          error={errors.duration}
          startIcon="clock"
          accessibilityLabel="Service duration input"
          accessibilityHint="Enter the duration of your service in minutes"
          isRequired
        />

        {errors.general && (
          <ThemedText style={[styles.errorText, { color: theme.colors.error.main }]}>
            {errors.general}
          </ThemedText>
        )}

        <View style={styles.buttonContainer}>
          <Button
            variant="outlined"
            onPress={onClose}
            style={styles.button}
            disabled={isSubmitting || loading}
            accessibilityLabel="Cancel"
            accessibilityHint="Discard changes and close the form"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSave}
            style={styles.button}
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading || !service.name || service.price <= 0}
            accessibilityLabel="Save service"
            accessibilityHint="Save the service details"
          >
            Save
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
    marginLeft: 8,
    minWidth: 100,
  },
});