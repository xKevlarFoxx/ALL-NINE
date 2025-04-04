// components/common/List.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Feather } from '@expo/vector-icons';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon = 'chevron-right',
  onPress,
  disabled = false,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const theme = useTheme();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        {
          backgroundColor: disabled
            ? theme.colors.grey[100]
            : '#FFFFFF',
        },
        style,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      {leftIcon && (
        <Feather
          name={leftIcon}
          size={24}
          color={theme.colors.grey[600]}
          style={styles.leftIcon}
        />
      )}
      <View style={styles.content}>
        <Text
          style={[
            theme.typography.body1,
            styles.title,
            {
              color: disabled
                ? theme.colors.grey[400]
                : theme.colors.grey[900],
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              theme.typography.body2,
              styles.subtitle,
              {
                color: disabled
                  ? theme.colors.grey[400]
                  : theme.colors.grey[600],
              },
              subtitleStyle,
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightIcon && (
        <Feather
          name={rightIcon}
          size={20}
          color={theme.colors.grey[400]}
          style={styles.rightIcon}
        />
      )}
    </Container>
  );
};

export const ListDivider: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: theme.colors.grey[200] },
        style,
      ]}
    />
  );
};

export const ListSection: React.FC<{
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ title, children, style }) => {
  const theme = useTheme();

  return (
    <View style={[styles.section, style]}>
      <Text
        style={[
          theme.typography.caption,
          styles.sectionTitle,
          { color: theme.colors.grey[600] },
        ]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  leftIcon: {
    marginRight: 16,
  },
  rightIcon: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  subtitle: {
    opacity: 0.7,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
});