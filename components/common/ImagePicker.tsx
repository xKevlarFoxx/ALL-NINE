// components/common/ImagePicker.tsx
import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ExpoImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../ThemeProvider';
import { permissionService, PermissionType } from '../../services/permissions/PermissionService';
import { fileManagementService } from '../../services/file/FileManagementService';

interface ImagePickerProps {
  onImageSelected: (uri: string) => void;
  onError?: (error: Error) => void;
  maxSize?: number; // in bytes
  aspectRatio?: number;
  placeholder?: React.ReactNode;
  style?: ViewStyle;
  allowsEditing?: boolean;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  onError,
  maxSize = 5 * 1024 * 1024, // 5MB default
  aspectRatio = 1,
  placeholder,
  style,
  allowsEditing = true,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleImagePick = async () => {
    try {
      setLoading(true);
      
      const permissionResult = await permissionService.requestPermission(
        PermissionType.PHOTO_LIBRARY
      );

      if (!permissionResult.granted) {
        throw new Error('Permission to access gallery was denied');
      }

      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing,
        aspect: [aspectRatio, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageInfo = await fileManagementService.getFileInfo(result.assets[0].uri);
        
        if (imageInfo && imageInfo.size > maxSize) {
          const compressedUri = await fileManagementService.compressImage(
            result.assets[0].uri,
            {
              quality: 0.8,
              maxWidth: 1024,
            }
          );
          setImageUri(compressedUri);
          onImageSelected(compressedUri);
        } else {
          setImageUri(result.assets[0].uri);
          onImageSelected(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Image picking failed:', error);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <View style={[styles.placeholder, { backgroundColor: theme.colors.grey[200] }]}>
        <Feather name="camera" size={24} color={theme.colors.grey[500]} />
        <Text style={[theme.typography.caption, styles.placeholderText]}>
          Select Image
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={handleImagePick}
      disabled={loading}
      style={[styles.container, style]}
    >
      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.grey[200] }]}>
          <ActivityIndicator color={theme.colors.primary.main} />
        </View>
      ) : imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        renderPlaceholder()
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});