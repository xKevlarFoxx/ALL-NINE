import React, { useState } from 'react';
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Button, StyleSheet } from 'react-native';

const mockMarkers = [
  { id: '1', latitude: 37.78825, longitude: -122.4324, title: 'Service A' },
  { id: '2', latitude: 37.78925, longitude: -122.4224, title: 'Service B' },
];

const mockHeatmapPoints = [
  { latitude: 37.78825, longitude: -122.4324, weight: 1 },
  { latitude: 37.78925, longitude: -122.4224, weight: 2 },
];

export const InteractiveMapScreen = () => {
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {mockMarkers.map(marker => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
          />
        ))}

        {showHeatmap && (
          <Heatmap
            points={mockHeatmapPoints}
            radius={20}
            opacity={0.7}
            gradient={{
              colors: ['#00ff00', '#ffff00', '#ff0000'],
              startPoints: [0.1, 0.5, 1],
              colorMapSize: 256,
            }}
          />
        )}
      </MapView>

      <Button title={showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'} onPress={() => setShowHeatmap(!showHeatmap)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});