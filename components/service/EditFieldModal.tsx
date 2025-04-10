// components/service/EditFieldModal.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useTheme } from '../ThemeProvider';
import { DayPicker } from './DayPicker';
import { validateField } from '@/utils/validation';

interface EditableField {
  key: string;
  label: string;
  type: 'text' | 'multiline' | 'number' | 'availability';
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

interface EditFieldModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (value: any) => void;
  field: EditableField;
  initialValue: any;
}

export const EditFieldModal: React.FC<EditFieldModalProps> = ({
  visible,
  onClose,
  onSave,
  field,
  initialValue,
}) => {
  const theme = useTheme();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInput = useCallback((inputValue: any): boolean => {
    if (field.validation?.required && !inputValue) {
      setError(`${field.label} is required`);
      return false;
    }

    if (field.type === 'number') {
      const numValue = Number(inputValue);
      if (isNaN(numValue)) {
        setError('Please enter a valid number');
        return false;
      }
      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        setError(`Minimum value is ${field.validation.min}`);
        return false;
      }
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        setError(`Maximum value is ${field.validation.max}`);
        return false;
      }
    }

    if (field.validation?.pattern && !field.validation.pattern.test(inputValue)) {
      setError('Invalid format');
      return false;
    }

    setError(null);
    return true;
  }, [field]);

  const handleChange = useCallback((newValue: any) => {
    setValue(newValue);
    if (error) {
      validateInput(newValue);
    }
  }, [error, validateInput]);

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      if (!validateInput(value)) {
        return;
      }

      await onSave(value);
      onClose();
    } catch (error) {
      setError('Failed to save changes. Please try again.');
      console.error('Save failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [value, validateInput, onSave, onClose]);

  const renderEditor = () => {
    switch (field.type) {
      case 'text':
      case 'multiline':
        return (
          <Input
            value={value}
            onChangeText={handleChange}
            multiline={field.type === 'multiline'}
            numberOfLines={field.type === 'multiline' ? 4 : 1}
            style={[
              styles.input,
              field.type === 'multiline' && styles.multilineInput
            ]}
            placeholder={`Enter ${field.label}`}
            error={error}
            accessibilityLabel={field.label}
            accessibilityHint={`Enter ${field.label}`}
            required={field.validation?.required}
          />
        );
      
      case 'number':
        return (
          <Input
            value={String(value)}
            onChangeText={(text) => handleChange(Number(text))}
            keyboardType="numeric"
            style={styles.input}
            placeholder={`Enter ${field.label}`}
            error={error}
            accessibilityLabel={field.label}
            accessibilityHint={`Enter a number for ${field.label}`}
            required={field.validation?.required}
          />
        );

      case 'availability':
        return (
          <DayPicker
            selectedDays={value.days}
            hours={value.hours}
            onDaysChange={(days) => handleChange({ ...value, days })}
            onHoursChange={(hours) => handleChange({ ...value, hours })}
            error={error}
            accessibilityLabel="Availability selection"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Edit ${field.label}`}
      accessibilityLabel={`Edit ${field.label}`}
    >
      <View 
        style={styles.container}
        accessibilityRole="form"
      >
        {renderEditor()}
        <View style={styles.buttonContainer}>
          <Button
            variant="outlined"
            onPress={onClose}
            style={styles.button}
            accessibilityLabel="Cancel editing"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSave}
            style={styles.button}
            loading={isSubmitting}
            disabled={!!error || isSubmitting}
            accessibilityLabel={`Save ${field.label}`}
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
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    marginLeft: 8,
    minWidth: 100,
  },
});