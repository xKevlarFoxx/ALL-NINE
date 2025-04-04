// components/service/ServiceModal.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useTheme } from '../ThemeProvider';
import { Service } from '../../types/user';

interface ServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  initialService?: Service;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  visible,
  onClose,
  onSave,
  initialService,
}) => {
  const theme = useTheme();
  const [service, setService] = useState<Service>(initialService || {
    id: Date.now().toString(),
    name: '',
    description: '',
    price: 0,
    duration: 0,
  });

  const handleSave = () => {
    onSave(service);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={initialService ? 'Edit Service' : 'Add Service'}
    >
      <View style={styles.container}>
        <Input
          label="Service Name"
          value={service.name}
          onChangeText={(text) => setService(prev => ({ ...prev, name: text }))}
          style={styles.input}
        />
        
        <Input
          label="Description"
          value={service.description}
          onChangeText={(text) => setService(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        
        <Input
          label="Price"
          value={service.price.toString()}
          onChangeText={(text) => setService(prev => ({ ...prev, price: parseFloat(text) || 0 }))}
          keyboardType="numeric"
          style={styles.input}
        />
        
        <Input
          label="Duration (minutes)"
          value={service.duration.toString()}
          onChangeText={(text) => setService(prev => ({ ...prev, duration: parseInt(text) || 0 }))}
          keyboardType="numeric"
          style={styles.input}
        />

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
            disabled={!service.name || service.price <= 0}
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