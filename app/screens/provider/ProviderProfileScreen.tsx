import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

interface ProviderProfile {
  name: string;
  avatar: string;
  certifications: string[];
  testimonials: { customer: string; feedback: string }[];
  portfolio: string[]; // URLs to portfolio images
}

const mockProviderProfile: ProviderProfile = {
  name: 'John Doe',
  avatar: 'https://example.com/avatar.jpg',
  certifications: ['Certified Cleaner', 'Eco-Friendly Practices'],
  testimonials: [
    { customer: 'Jane Smith', feedback: 'Excellent service, very professional!' },
    { customer: 'Mark Johnson', feedback: 'Highly recommend, great attention to detail.' },
  ],
  portfolio: [
    'https://example.com/portfolio1.jpg',
    'https://example.com/portfolio2.jpg',
  ],
};

export const ProviderProfileScreen = () => {
  const { name, avatar, certifications, testimonials, portfolio } = mockProviderProfile;

  return (
    <View style={styles.container}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <Text style={styles.name}>{name}</Text>

      <Text style={styles.sectionTitle}>Certifications</Text>
      <FlatList
        data={certifications}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.certification}>{item}</Text>}
      />

      <Text style={styles.sectionTitle}>Testimonials</Text>
      <FlatList
        data={testimonials}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.testimonialCard}>
            <Text style={styles.customer}>{item.customer}</Text>
            <Text>{item.feedback}</Text>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Portfolio</Text>
      <FlatList
        data={portfolio}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.portfolioImage} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  certification: {
    fontSize: 16,
    marginBottom: 4,
  },
  testimonialCard: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
  },
  customer: {
    fontWeight: 'bold',
  },
  portfolioImage: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 4,
  },
});