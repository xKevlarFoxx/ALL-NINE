// components/service/EditFieldModal.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useTheme } from '../ThemeProvider';
import { DayPicker } from './DayPicker';

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

  const renderEditor = () => {
    switch (field.type) {
      case 'text':
      case 'multiline':
        return (
          <Input
            value={value}
            onChangeText={setValue}
            multiline={field.multiline}
            numberOfLines={field.multiline ? 4 : 1}
            style={[
              styles.input,
              field.multiline && styles.multilineInput
            ]}
            placeholder={`Enter ${field.label}`}
          />
        );
      
      case 'number':
        return (
          <Input
            value={String(value)}
            onChangeText={(text) => setValue(Number(text))}
            keyboardType="numeric"
            style={styles.input}
            placeholder={`Enter ${field.label}`}
          />
        );

      case 'availability':
        return (
          <DayPicker
            selectedDays={value.days}
            hours={value.hours}
            onDaysChange={(days) => setValue({ ...value, days })}
            onHoursChange={(hours) => setValue({ ...value, hours })}
          />
        );

      default:
        return null;
    }
  };

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`Edit ${field.label}`}
    >
      <View style={styles.container}>
        {renderEditor()}
        <View style={styles.buttonContainer}>
          <Button
            variant="outlined"
            onPress={onClose}
            style={styles.button}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onPress={handleSave}
            style={styles.button}
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
  },
  button: {
    marginLeft: 8,
    minWidth: 100,
  },
});