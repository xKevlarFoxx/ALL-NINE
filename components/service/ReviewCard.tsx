// components/service/ReviewCard.tsx
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Rating } from '../common/Rating';
import { formatDistanceToNow } from 'date-fns';

interface ReviewCardProps {
 reviewerName: string;
 reviewerAvatar?: string;
 rating: number;
 comment: string;
 date: Date;
 style?: StyleProp<ViewStyle>;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
 reviewerName,
 reviewerAvatar,
 rating,
 comment,
 date,
 style
}) => {
 const theme = useTheme();

 return (
   <Card style={[styles.container, style]}>
     <View style={styles.header}>
       <Avatar
         size="small"
         source={reviewerAvatar ? { uri: reviewerAvatar } : undefined}
         initials={reviewerName.slice(0, 2)}
       />
       <View style={styles.headerText}>
         <Text style={theme.typography.body1}>{reviewerName}</Text>
         <Text style={[theme.typography.caption, styles.date]}>
           {formatDistanceToNow(date, { addSuffix: true })}
         </Text>
       </View>
       <Rating value={rating} readonly size={16} />
     </View>
     <Text style={[theme.typography.body2, styles.comment]}>{comment}</Text>
   </Card>
 );
};

const styles = StyleSheet.create({
 container: {
   marginHorizontal: 16,
   marginVertical: 8,
 },
 header: {
   flexDirection: 'row',
   alignItems: 'center',
   marginBottom: 12,
 },
 headerText: {
   flex: 1,
   marginLeft: 12,
 },
 date: {
   color: '#666',
 },
 comment: {
   lineHeight: 20,
 },
});