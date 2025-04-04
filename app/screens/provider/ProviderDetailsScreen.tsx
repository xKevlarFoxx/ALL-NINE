// app/screens/ProviderDetailsScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { StyleProp, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { FadeInView } from '@/components/animations/FadeInView';
import { colors } from '@/constants/DesignSystem/colors';
import { shadows } from '@/constants/DesignSystem/shadows';
import { spacing } from '@/constants/DesignSystem/spacing';
import { typography } from '@/constants/DesignSystem/typography';
import { useServiceProvider } from '@/hooks/useServiceProvider';
import { useReviews } from '@/hooks/useReviews';
import { useModal } from '@/hooks/useModal';
import { ProfileHeader } from '@/components/service/ProfileHeader';
import { ServiceDetails } from '@/components/service/ServiceDetails';
import { ReviewCard } from '@/components/service/ReviewCard';
import { BookingForm } from '@/components/service/BookingForm';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { pickImage, uploadImage } from '@/utils/imageUpload';
import { ThemedView } from '@/components/ThemedView';
import { AnimatedList } from '@/components/patterns/AnimatedList';

// Define the navigation params for all screens
type RootStackParamList = {
  ProviderDetails: {
    providerId: string;
  };
  // Add other screens here as needed
};

// Define props type using NativeStackScreenProps
type Props = NativeStackScreenProps<RootStackParamList, 'ProviderDetails'>;

interface BookingData {
  date: Date;
  time: Date;
  notes?: string;
}
interface AnimatedListProps {
  children: React.ReactNode;
  delay?: number;
}

async function createBooking(bookingData: BookingData & { providerId: string; }) {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    return await response.json();
  } catch (error) {
    throw new Error('Failed to create booking');
  }
}

export const ProviderDetailsScreen = ({ route, navigation }: Props) => {
  const { providerId } = route.params;
  const { provider, loading: providerLoading, error: providerError } = useServiceProvider(providerId);
  const { reviews, loading: reviewsLoading, hasMore } = useReviews({ providerId });
  const { isVisible, showModal, hideModal } = useModal();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async () => {
    try {
      setUploading(true);
      const imageUri = await pickImage();
      if (imageUri) {
        const uploadedUrl = await uploadImage(imageUri);
        // Update provider image in your backend
      }
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleBooking = async (bookingData: BookingData) => {
    try {
      await createBooking({ providerId, ...bookingData });
      hideModal();
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  if (providerLoading) return <LoadingState.Card />;
  if (providerError) return <ErrorState onRetry={() => {}} />;
  if (!provider) return null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <FadeInView>
          <ProfileHeader
            name={provider.name}
            avatar={provider.avatar}
            profession={provider.profession}
            rating={provider.rating}
            reviewCount={provider.reviewCount}
            verified={provider.verified}
            location={provider.location}
            experience={provider.experience}
            onImagePress={handleImageUpload}
            style={styles.header}
          />
        </FadeInView>

        <FadeInView delay={150}>
          <ServiceDetails
            description={provider.description}
            categories={provider.categories}
            features={provider.features}
            pricing={provider.pricing}
            availability={provider.availability}
            style={styles.section}
          />
        </FadeInView>

        <View style={styles.reviewsSection}>
          {reviews.map(review => (
            <AnimatedList key={review.id} delay={200}>
              <ReviewCard
                reviewerName={review.reviewerName}
                reviewerAvatar={review.reviewerAvatar}
                rating={review.rating}
                comment={review.comment}
                date={new Date(review.date)}
                style={styles.reviewCard}
              />
            </AnimatedList>
          ))}
          {reviewsLoading && <LoadingState.Row />}
        </View>
      </ScrollView>

      <Button
        variant="primary"
        onPress={showModal}
        style={StyleSheet.flatten(styles.bookButton)}
      >
        Book Now
      </Button>

      <Modal
        visible={isVisible}
        onClose={hideModal}
        title="Book Service"
      >
        <BookingForm onSubmit={handleBooking} />
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    ...shadows.medium,
    marginBottom: spacing.medium,
  },
  section: {
    marginHorizontal: spacing.medium,
    marginBottom: spacing.large,
    ...shadows.small,
  },
  reviewsSection: {
    padding: spacing.medium,
  },
  reviewCard: {
    marginBottom: spacing.small,
    ...shadows.small,
  },
  bookButton: {
    position: 'absolute',
    bottom: spacing.medium,
    left: spacing.medium,
    right: spacing.medium,
    ...shadows.large,
  },
});

export default ProviderDetailsScreen;