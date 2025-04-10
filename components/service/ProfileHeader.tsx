import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Avatar } from '../common/Avatar';
import { RatingDisplay } from '../common/Rating';
import { Badge } from '../common/Badge';
import { ThemedText } from '../ThemedText';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ProfileHeaderProps {
  name: string;
  avatar?: string;
  profession: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  location: string;
  experience: string;
  onImagePress?: () => void;
  onLocationPress?: () => void;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  avatar,
  profession,
  rating,
  reviewCount,
  verified,
  location,
  experience,
  onImagePress,
  onLocationPress,
  style,
  loading = false,
}) => {
  const theme = useTheme();
  const [avatarError, setAvatarError] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleImagePress = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      onImagePress?.();
    } catch (error) {
      console.error('Error handling image press:', error);
    }
  }, [onImagePress, scaleAnim]);

  const handleAvatarError = useCallback(() => {
    setAvatarError(true);
    console.error('Failed to load avatar image');
  }, []);

  const accessibilityLabel = `${name}, ${profession}${verified ? ', Verified Provider' : ''}. Rating: ${rating} out of 5 based on ${reviewCount} reviews. Located in ${location}. ${experience} of experience.`;

  return (
    <Animated.View 
      style={[
        styles.container,
        style,
        { transform: [{ scale: scaleAnim }] }
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="header"
    >
      <View style={styles.avatarContainer}>
        <Avatar
          size="large"
          source={avatar && !avatarError ? { uri: avatar } : undefined}
          initials={name.slice(0, 2)}
          onPress={handleImagePress}
          onError={handleAvatarError}
          borderColor={theme.colors.primary.main}
          accessibilityLabel={`${name}'s profile picture`}
          loading={loading}
        />
        {verified && (
          <View 
            style={[
              styles.verifiedBadge,
              { backgroundColor: theme.colors.primary.main }
            ]}
            accessibilityLabel="Verified provider badge"
          >
            <Feather name="check" size={12} color="#FFF" />
          </View>
        )}
      </View>

      <ThemedText 
        style={[theme.typography.h3, styles.name]}
        accessibilityRole="text"
      >
        {name}
      </ThemedText>
      
      <ThemedText 
        style={[theme.typography.body1, styles.profession]}
        accessibilityRole="text"
      >
        {profession}
      </ThemedText>

      <View 
        style={styles.ratingContainer}
        accessibilityLabel={`Rating: ${rating} out of 5, ${reviewCount} reviews`}
      >
        <RatingDisplay 
          value={rating} 
          reviewCount={reviewCount} 
          size="medium"
          accessibilityLabel={`${rating} out of 5 stars`}
        />
      </View>

      <View style={styles.infoContainer}>
        <TouchableOpacity 
          style={styles.infoItem}
          onPress={onLocationPress}
          disabled={!onLocationPress}
          accessibilityRole="button"
          accessibilityLabel={`Located in ${location}`}
          accessibilityHint="Tap to view location on map"
        >
          <Feather 
            name="map-pin" 
            size={16} 
            color={theme.colors.grey[600]} 
          />
          <ThemedText style={[theme.typography.body2, styles.infoText]}>
            {location}
          </ThemedText>
        </TouchableOpacity>

        <View 
          style={styles.infoItem}
          accessibilityLabel={`${experience} of experience`}
        >
          <Feather 
            name="clock" 
            size={16} 
            color={theme.colors.grey[600]} 
          />
          <ThemedText style={[theme.typography.body2, styles.infoText]}>
            {experience}
          </ThemedText>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  verifiedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  name: {
    marginBottom: 4,
    textAlign: 'center',
  },
  profession: {
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoText: {
    marginLeft: 6,
    color: '#666',
  },
});