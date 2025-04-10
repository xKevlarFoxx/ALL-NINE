// components/service/ReviewCard.tsx
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Rating } from '../common/Rating';
import { ThemedText } from '../ThemedText';
import { formatDistanceToNow } from 'date-fns';
import { Feather } from '@expo/vector-icons';

interface ReviewCardProps {
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
  style?: StyleProp<ViewStyle>;
  onReply?: () => void;
  onReport?: () => void;
  helpful?: number;
  onHelpful?: () => void;
  verified?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  reviewerAvatar,
  rating,
  comment,
  date,
  style,
  onReply,
  onReport,
  helpful = 0,
  onHelpful,
  verified = false,
}) => {
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = comment.length > 150;

  const displayedComment = shouldTruncate && !isExpanded 
    ? `${comment.slice(0, 150)}...` 
    : comment;

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <Card 
      style={[styles.container, style]}
      accessibilityRole="article"
      accessibilityLabel={`Review by ${reviewerName}, rated ${rating} stars`}
    >
      <View style={styles.header}>
        <Avatar
          size="small"
          source={reviewerAvatar ? { uri: reviewerAvatar } : undefined}
          initials={reviewerName.slice(0, 2)}
          accessibilityLabel={`${reviewerName}'s avatar`}
        />
        <View style={styles.headerText}>
          <View style={styles.nameContainer}>
            <ThemedText 
              style={theme.typography.body1}
              accessibilityRole="header"
            >
              {reviewerName}
            </ThemedText>
            {verified && (
              <Feather 
                name="check-circle" 
                size={16} 
                color={theme.colors.success.main}
                style={styles.verifiedIcon}
                accessibilityLabel="Verified review"
              />
            )}
          </View>
          <ThemedText style={[theme.typography.caption, styles.date]}>
            {formatDistanceToNow(date, { addSuffix: true })}
          </ThemedText>
        </View>
        <Rating 
          value={rating} 
          readonly 
          size={16}
          accessibilityLabel={`Rated ${rating} out of 5 stars`}
        />
      </View>

      <ThemedText 
        style={[theme.typography.body2, styles.comment]}
        accessibilityLabel={`Review comment: ${comment}`}
      >
        {displayedComment}
      </ThemedText>

      {shouldTruncate && (
        <TouchableOpacity 
          onPress={toggleExpand}
          style={styles.expandButton}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? "Show less" : "Read more"}
        >
          <ThemedText style={[theme.typography.caption, styles.expandText]}>
            {isExpanded ? "Show less" : "Read more"}
          </ThemedText>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        {onHelpful && (
          <TouchableOpacity 
            style={styles.helpfulButton} 
            onPress={onHelpful}
            accessibilityRole="button"
            accessibilityLabel={`Mark as helpful. Currently ${helpful} people found this helpful`}
          >
            <Feather 
              name="thumbs-up" 
              size={16} 
              color={theme.colors.grey[600]}
            />
            <ThemedText style={[theme.typography.caption, styles.helpfulCount]}>
              {helpful}
            </ThemedText>
          </TouchableOpacity>
        )}

        {onReply && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onReply}
            accessibilityRole="button"
            accessibilityLabel="Reply to review"
          >
            <Feather 
              name="message-circle" 
              size={16} 
              color={theme.colors.grey[600]}
            />
            <ThemedText style={[theme.typography.caption, styles.actionText]}>
              Reply
            </ThemedText>
          </TouchableOpacity>
        )}

        {onReport && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onReport}
            accessibilityRole="button"
            accessibilityLabel="Report review"
          >
            <Feather 
              name="flag" 
              size={16} 
              color={theme.colors.grey[600]}
            />
            <ThemedText style={[theme.typography.caption, styles.actionText]}>
              Report
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
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
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  date: {
    color: '#666',
    marginTop: 2,
  },
  comment: {
    lineHeight: 20,
  },
  expandButton: {
    marginTop: 8,
  },
  expandText: {
    color: '#666',
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  helpfulCount: {
    marginLeft: 4,
    color: '#666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    color: '#666',
  },
});