import React, { useState } from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';

const onboardingSteps = [
  {
    id: '1',
    title: 'Welcome to ALL-NINE',
    description: 'Discover and book services with ease.',
    image: require('@/assets/images/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Find Trusted Providers',
    description: 'Browse verified providers near you.',
    image: require('@/assets/images/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Seamless Payments',
    description: 'Pay securely through the app.',
    image: require('@/assets/images/onboarding3.png'),
  },
];

export const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.replace('Home'); // Navigate to the home screen after onboarding
    }
  };

  const { title, description, image } = onboardingSteps[currentStep];

  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Button title={currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'} onPress={handleNext} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
});