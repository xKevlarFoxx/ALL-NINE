import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { PaymentService } from '@/services/payments/PaymentService';

export const BookingPaymentScreen = () => {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'mobileMoney' | null>(null);
  const [amount, setAmount] = useState(50); // Example amount

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }

    const paymentService = new PaymentService();

    try {
      if (selectedMethod === 'stripe') {
        const result = await paymentService.processStripePayment(amount, 'usd', 'test_source');
        Alert.alert('Success', `Payment successful! Transaction ID: ${result.id}`);
      } else if (selectedMethod === 'mobileMoney') {
        await paymentService.processMobileMoneyPayment(amount, '255123456789');
        Alert.alert('Success', 'Mobile money payment successful!');
      }
    } catch (error) {
      Alert.alert('Error', `Payment failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>

      <Button title="Pay with Stripe" onPress={() => setSelectedMethod('stripe')} />
      <Button title="Pay with Mobile Money" onPress={() => setSelectedMethod('mobileMoney')} />

      <Button title="Confirm Payment" onPress={handlePayment} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});