import React from 'react';
  import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
  import { BlurView } from 'expo-blur';
  import { MotiView } from 'moti';
  import { Feather } from '@expo/vector-icons';

  interface HelpContent {
    title: string;
    content: string;
    examples?: string[];
    requirements?: string[];
  }

  interface HelpModalProps {
    visible: boolean;
    helpContent: HelpContent | null;
    onClose: () => void;
  }

  const HelpModal: React.FC<HelpModalProps> = ({ visible, helpContent, onClose }) => {
    if (!visible || !helpContent) return null;
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
        <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{helpContent.title}</Text>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Close help" accessibilityRole="button">
                <Feather name="x" size={24} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>{helpContent.content}</Text>
            {helpContent.requirements && (
              <View style={styles.requirementsList}>
                {helpContent.requirements.map((req, idx) => (
                  <View key={idx} style={styles.requirementItem}>
                    <Feather name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            )}
            {helpContent.examples && (
              <View style={styles.examplesList}>
                {helpContent.examples.map((ex, idx) => (
                  <Text key={idx} style={styles.exampleText}>{ex}</Text>
                ))}
              </View>
            )}
          </MotiView>
        </BlurView>
      </Modal>
    );
  };

  export default HelpModal;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    },
    modalContent: {
      backgroundColor: 'rgba(30,30,30,0.9)',
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 400
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    },
    modalText: {
      color: 'rgba(255,255,255,0.8)',
      marginBottom: 16
    },
    requirementsList: {
      marginTop: 12
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    requirementText: {
      color: 'rgba(255,255,255,0.8)',
      marginLeft: 8
    },
    examplesList: {
      marginTop: 12,
      padding: 12,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 8
    },
    exampleText: {
      color: 'rgba(255,255,255,0.7)',
      marginBottom: 8
    }
  });