import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

interface ProviderLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const MapScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [providers, setProviders] = useState<ProviderLocation[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Fetch provider locations (mocked for now)
      setProviders([
        { id: '1', name: 'Provider A', latitude: currentLocation.coords.latitude + 0.01, longitude: currentLocation.coords.longitude + 0.01 },
        { id: '2', name: 'Provider B', latitude: currentLocation.coords.latitude - 0.01, longitude: currentLocation.coords.longitude - 0.01 },
      ]);
    })();
  }, []);

  if (!location) {
    return null; // Add a loading state if needed
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {providers.map(provider => (
          <Marker
            key={provider.id}
            coordinate={{ latitude: provider.latitude, longitude: provider.longitude }}
            title={provider.name}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});