import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
}

export const ServicePackagesScreen = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [newPackage, setNewPackage] = useState({ name: '', description: '', price: '' });

  const addPackage = () => {
    if (!newPackage.name || !newPackage.description || !newPackage.price) {
      alert('Please fill out all fields.');
      return;
    }

    const newServicePackage: ServicePackage = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPackage.name,
      description: newPackage.description,
      price: parseFloat(newPackage.price),
    };

    setPackages([...packages, newServicePackage]);
    setNewPackage({ name: '', description: '', price: '' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Service Packages</Text>

      <FlatList
        data={packages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.packageCard}>
            <Text style={styles.packageName}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>${item.price.toFixed(2)}</Text>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Add New Package</Text>
      <TextInput
        style={styles.input}
        placeholder="Package Name"
        value={newPackage.name}
        onChangeText={text => setNewPackage({ ...newPackage, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={newPackage.description}
        onChangeText={text => setNewPackage({ ...newPackage, description: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        keyboardType="numeric"
        value={newPackage.price}
        onChangeText={text => setNewPackage({ ...newPackage, price: text })}
      />
      <Button title="Add Package" onPress={addPackage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  packageCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});