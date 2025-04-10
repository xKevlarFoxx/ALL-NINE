import React, { useState } from 'react';
import { Image, ActivityIndicator, StyleSheet, View } from 'react-native';

interface LazyImageProps {
  source: { uri: string };
  style?: object;
}

export const LazyImage: React.FC<LazyImageProps> = ({ source, style }) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={[styles.container, style]}>
      {loading && <ActivityIndicator style={styles.loader} />}
      <Image
        source={source}
        style={[styles.image, style]}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  image: {
    width: '100%',
    height: '100%',
  },
});