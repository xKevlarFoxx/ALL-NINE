// utils/imageUpload.ts
import * as ImagePicker from 'expo-image-picker';

export const pickImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (!permissionResult.granted) {
    throw new Error('Permission to access camera roll is required!');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }

  return null;
};

export const uploadImage = async (uri: string) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);

    // Replace with your actual API endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    throw new Error('Failed to upload image');
  }
};