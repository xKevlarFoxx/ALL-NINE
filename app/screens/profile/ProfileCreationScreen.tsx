import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  ViewStyle,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/components/ThemeProvider';
import { EditFieldModal } from '@/components/service/EditFieldModal';
import { ServiceModal } from '@/components/service/ServiceModal';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FadeInView } from '@/components/animations/FadeInView';
import { SlideInView } from '@/components/animations/SlideInView';
import { validateField } from '@/utils/validation';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { RatingDisplay } from '@/components/common/Rating';
import type {
  ServiceProvider,
  Review,
  EditableField,
  Service,
} from '@/types/user';

const ProfileCreationScreen = () => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    header: {
      padding: 20,
      alignItems: 'center',
    },
    profileImageContainer: {
      marginBottom: 16,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: theme.colors.grey[50],
    },
    editImageOverlay: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary.main,
      padding: 8,
      borderRadius: 20,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.grey[900],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    profileInfo: {
      alignItems: 'center',
      marginBottom: 16,
    },
    name: {
      color: theme.colors.grey[50],
      marginBottom: 4,
    },
    profession: {
      color: theme.colors.grey[200],
      marginBottom: 8,
    },
    verifiedBadge: {
      marginTop: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      padding: 16,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      height: 24,
      backgroundColor: theme.colors.grey[400],
      marginHorizontal: 16,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.grey[50],
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.grey[300],
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.grey[50],
      borderRadius: 12,
      margin: 20,
      padding: 4,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: theme.colors.grey[100],
    },
    tabText: {
      marginLeft: 8,
      color: theme.colors.grey[600],
    },
    activeTabText: {
      color: theme.colors.primary.main,
    },
    sectionContainer: {
      padding: 20,
    },
    section: {
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionContent: {
      color: theme.colors.grey[800],
      lineHeight: 20,
    },
    serviceItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.grey[200],
    },
    serviceInfo: {
      flex: 1,
    },
    serviceDescription: {
      color: theme.colors.grey[600],
      fontSize: 14,
      marginTop: 4,
      marginBottom: 8,
    },
    serviceActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    servicePrice: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary.main,
      marginRight: 16,
    },
    editButton: {
      padding: 8,
    },
    deleteButton: {
      padding: 8,
    },
    durationBadge: {
      alignSelf: 'flex-start',
    },
    reviewsContainer: {
      flex: 1,
    },
    reviewsList: {
      padding: 20,
    },
    reviewCard: {
      marginBottom: 12,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reviewInfo: {
      flex: 1,
      marginLeft: 12,
    },
    reviewerName: {
      fontWeight: '600',
      marginBottom: 2,
    },
    reviewDate: {
      fontSize: 12,
      color: theme.colors.grey[600],
    },
    reviewContent: {
      color: theme.colors.grey[800],
      lineHeight: 20,
    },
    emptyState: {
      margin: 20,
      padding: 32,
      alignItems: 'center',
    },
    emptyStateText: {
      marginTop: 16,
      color: theme.colors.grey[600],
      textAlign: 'center',
    },
    availabilityContent: {
      marginTop: 8,
    },
    availabilityDays: {
      color: theme.colors.grey[800],
      marginBottom: 4,
    },
    availabilityHours: {
      color: theme.colors.grey[600],
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'information'>('reviews');
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [profileData, setProfileData] = useState<ServiceProvider>({
    id: '',
    name: '',
    profession: '',
    rating: 0,
    reviewCount: 0,
    verified: false,
    location: '',
    experience: '',
    description: '',
    services: [],
    availability: { days: [], hours: '' },
  });

  // Fetch Profile Data
  const fetchProfileData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Implement your data fetching logic here
      // const response = await api.getProfile();
      // setProfileData(response.data);
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Handle Pull to Refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProfileData();
    setIsRefreshing(false);
  }, [fetchProfileData]);

  // Image Picker Handler
  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to change your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        await handleProfileUpdate({ avatar: result.assets[0].uri });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile picture');
    }
  };

  // Profile Update Handler
  const handleProfileUpdate = async (updates: Partial<ServiceProvider>) => {
    try {
      setIsSaving(true);
      // Implement your update logic here
      // await api.updateProfile(updates);
      setProfileData(prev => ({ ...prev, ...updates }));
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Service Management Handlers
  const handleAddService = async (service: Service) => {
    try {
      const updatedServices = [...profileData.services, service];
      await handleProfileUpdate({ services: updatedServices });
      setShowServiceModal(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to add service');
    }
  };

  const handleEditService = async (service: Service) => {
    try {
      const updatedServices = profileData.services.map(s => 
        s.id === service.id ? service : s
      );
      await handleProfileUpdate({ services: updatedServices });
      setShowServiceModal(false);
      setSelectedService(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedServices = profileData.services.filter(
                s => s.id !== serviceId
              );
              await handleProfileUpdate({ services: updatedServices });
            } catch (err) {
              Alert.alert('Error', 'Failed to delete service');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <FadeInView duration={500}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileImageContainer}
          onPress={handleImagePick}
        >
          <Avatar
            size="large"
            source={profileData.avatar ? { uri: profileData.avatar } : undefined}
            initials={profileData.name.slice(0, 2)}
            style={styles.profileImage}
          />
          <View style={styles.editImageOverlay}>
            <Feather name="camera" size={20} color={theme.colors.grey[50]} />
          </View>
        </TouchableOpacity>
   
        <View style={styles.profileInfo}>
          <Text style={[theme.typography.h3, styles.name]}>
            {profileData.name}
          </Text>
          <Text style={[theme.typography.body1, styles.profession]}>
            {profileData.profession}
          </Text>
          {profileData.verified && (
            <Badge
              label="Verified"
              variant="success"
              size="small"
              style={styles.verifiedBadge}
            />
          )}
        </View>
   
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <RatingDisplay 
              value={profileData.rating} 
              size="medium"
            />
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profileData.services.length}</Text>
            <Text style={styles.statLabel}>Services</Text>
          </View>
        </View>
      </View>
    </FadeInView>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'information' && styles.activeTab
        ]}
        onPress={() => setActiveTab('information')}
      >
        <Feather
          name="info"
          size={20}
          color={activeTab === 'information' 
            ? theme.colors.primary.main 
            : theme.colors.grey[600]
          }
        />
        <Text style={[
          styles.tabText,
          activeTab === 'information' && styles.activeTabText
        ]}>
          Information
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'reviews' && styles.activeTab
        ]}
        onPress={() => setActiveTab('reviews')}
      >
        <Feather
          name="message-circle"
          size={20}
          color={activeTab === 'reviews' 
            ? theme.colors.primary.main 
            : theme.colors.grey[600]
          }
        />
        <Text style={[
          styles.tabText,
          activeTab === 'reviews' && styles.activeTabText
        ]}>
          Reviews ({profileData.reviewCount})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInformation = () => (
    <SlideInView duration={300}>
      <View style={styles.sectionContainer}>
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={theme.typography.h4}>About</Text>
            <TouchableOpacity onPress={() => setEditingField({
              key: 'description',
              label: 'About',
              type: 'multiline'
            })}>
              <Feather name="edit-2" size={20} color={theme.colors.primary.main} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionContent}>
            {profileData.description || 'No description provided'}
          </Text>
        </Card>
   
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={theme.typography.h4}>Services</Text>
            <TouchableOpacity onPress={() => {
              setSelectedService(null);
              setShowServiceModal(true);
            }}>
              <Feather name="plus" size={20} color={theme.colors.primary.main} />
            </TouchableOpacity>
          </View>
          {profileData.services.map((service) => (
            <View key={service.id} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={theme.typography.body1}>{service.name}</Text>
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
                <Badge
                  label={`${service.duration} min`}
                  variant="info"
                  size="small"
                  style={styles.durationBadge}
                />
              </View>
              <View style={styles.serviceActions}>
                <Text style={styles.servicePrice}>
                  ${service.price.toFixed(2)}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedService(service);
                    setShowServiceModal(true);
                  }}
                  style={styles.editButton}
                >
                  <Feather name="edit-2" size={16} color={theme.colors.grey[600]} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeleteService(service.id)}
                  style={styles.deleteButton}
                >
                  <Feather name="trash-2" size={16} color={theme.colors.error.main} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </Card>
   
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={theme.typography.h4}>Availability</Text>
            <TouchableOpacity onPress={() => setEditingField({
              key: 'availability',
              label: 'Availability',
              type: 'availability'
            })}>
              <Feather name="edit-2" size={20} color={theme.colors.primary.main} />
            </TouchableOpacity>
          </View>
          <View style={styles.availabilityContent}>
            <Text style={styles.availabilityDays}>
              {profileData.availability.days.join(', ') || 'No days set'}
            </Text>
            <Text style={styles.availabilityHours}>
              {profileData.availability.hours || 'No hours set'}
            </Text>
          </View>
        </Card>
      </View>
    </SlideInView>
  );

  const renderReviews = () => (
    <SlideInView duration={300}>
      <View style={styles.reviewsContainer}>
        {profileData.reviewCount === 0 ? (
          <Card style={styles.emptyState}>
            <Feather 
              name="message-square" 
              size={48} 
              color={theme.colors.grey[400]}
            />
            <Text style={styles.emptyStateText}>No reviews yet</Text>
          </Card>
        ) : (
          <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Avatar
                    size="small"
                    source={item.userAvatar ? { uri: item.userAvatar } : undefined}
                    initials={item.userName.slice(0, 2)}
                  />
                  <View style={styles.reviewInfo}>
                    <Text style={styles.reviewerName}>{item.userName}</Text>
                    <Text style={styles.reviewDate}>
                      {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                    </Text>
                  </View>
                  <RatingDisplay value={item.rating} size="small" />
                </View>
                <Text style={styles.reviewContent}>{item.comment}</Text>
              </Card>
            )}
            contentContainerStyle={styles.reviewsList}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary.main}
              />
            }
          />
        )}
      </View>
    </SlideInView>
  );

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <StatusBar 
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        
        <LinearGradient
          colors={[theme.colors.primary.main, theme.colors.primary.dark]}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.colors.grey[50]}
                />
              }
            >
              {renderHeader()}
              {renderTabs()}
              {activeTab === 'information' ? renderInformation() : renderReviews()}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>

        <EditFieldModal
          visible={!!editingField}
          field={editingField}
          initialValue={editingField ? profileData[editingField.key] : ''}
          onClose={() => setEditingField(null)}
          onSave={(value) => {
            if (editingField) {
              handleProfileUpdate({ [editingField.key]: value });
              setEditingField(null);
            }
          }}
        />

        <ServiceModal
          visible={showServiceModal}
          initialService={selectedService || undefined}
          onClose={() => {
            setShowServiceModal(false);
            setSelectedService(null);
          }}
          onSave={(service) => {
            if (selectedService) {
              handleEditService(service);
            } else {
              handleAddService(service);
            }
          }}
        />

        <LoadingOverlay visible={isLoading || isSaving} />
      </View>
    </ErrorBoundary>
  );
};

export default ProfileCreationScreen;