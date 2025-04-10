import React, { useState } from 'react';
  import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
  import DateTimePicker from '@react-native-community/datetimepicker';
  import { BlurView } from 'expo-blur';
  import { MotiView } from 'moti';
  import { Feather } from '@expo/vector-icons';
  import { useTheme } from '@/components/ThemeProvider';

  interface DatePickerModalProps {
    visible: boolean;
    currentDate?: Date;
    onClose: () => void;
    onSelect: (date: Date) => void;
  }

  const DatePickerModal: React.FC<DatePickerModalProps> = ({ visible, currentDate, onClose, onSelect }) => {
    const [date, setDate] = useState<Date>(currentDate || new Date());
    const theme = useTheme();

    const handleConfirm = () => {
      onSelect(date);
      onClose();
    };

    if (Platform.OS === 'ios') {
      return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
          <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={styles.datePickerContainer}
            >
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Feather name="x" size={24} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={(_, selectedDate) => selectedDate && setDate(selectedDate)}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
              <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.colors.secondary.main }]} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </MotiView>
          </BlurView>
        </Modal>
      );
    }

    // Android: inline DateTimePicker in a Modal overlay
    return (
      visible ? (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onChange={(_, selectedDate) => {
            onClose();
            if (selectedDate) {
              onSelect(selectedDate);
            }
          }}
        />
      ) : null
    );
  };

  export default DatePickerModal;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    },
    datePickerContainer: {
      backgroundColor: 'rgba(30,30,30,0.9)',
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400
    },
    datePickerHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    },
    datePickerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: 'white'
    },
    closeButton: {
      padding: 8
    },
    confirmButton: {
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      marginTop: 16
    },
    confirmButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600'
    }
  });