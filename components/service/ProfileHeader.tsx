import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Avatar } from '../common/Avatar';
import { RatingDisplay } from '../common/Rating';
import { Badge } from '../common/Badge';
import { Feather } from '@expo/vector-icons';

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
 style?: StyleProp<ViewStyle>;
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
 style,
}) => {
 const theme = useTheme();

 return (
   <Animated.View style={[styles.container, style]}>
     <View style={styles.avatarContainer}>
       <Avatar
         size="large"
         source={avatar ? { uri: avatar } : undefined}
         initials={name.slice(0, 2)}
         onPress={onImagePress}
         borderColor={theme.colors.primary.main}
       />
       {verified && (
         <View style={[
           styles.verifiedBadge,
           { backgroundColor: theme.colors.primary.main }
         ]}>
           <Feather name="check" size={12} color="#FFF" />
         </View>
       )}
     </View>

     <Text style={[theme.typography.h3, styles.name]}>{name}</Text>
     <Text style={[theme.typography.body1, styles.profession]}>{profession}</Text>

     <View style={styles.ratingContainer}>
       <RatingDisplay value={rating} reviewCount={reviewCount} size="medium" />
     </View>

     <View style={styles.infoContainer}>
       <View style={styles.infoItem}>
         <Feather name="map-pin" size={16} color={theme.colors.grey[600]} />
         <Text style={[theme.typography.body2, styles.infoText]}>{location}</Text>
       </View>
       <View style={styles.infoItem}>
         <Feather name="clock" size={16} color={theme.colors.grey[600]} />
         <Text style={[theme.typography.body2, styles.infoText]}>{experience}</Text>
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
 },
 name: {
   marginBottom: 4,
 },
 profession: {
   marginBottom: 12,
 },
 ratingContainer: {
   marginBottom: 16,
 },
 infoContainer: {
   flexDirection: 'row',
   justifyContent: 'center',
   flexWrap: 'wrap',
 },
 infoItem: {
   flexDirection: 'row',
   alignItems: 'center',
   marginHorizontal: 12,
   marginVertical: 4,
 },
 infoText: {
   marginLeft: 6,
   color: '#666',
 },
});