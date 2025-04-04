// components/common/Avatar.tsx
import React from 'react';
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../ThemeProvider';

interface AvatarProps {
  size?: 'small' | 'medium' | 'large';
  source?: ImageSourcePropType;
  initials?: string;
  onPress?: () => void;
  style?: ViewStyle;
  borderColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 'medium',
  source,
  initials,
  onPress,
  style,
  borderColor,
}) => {
  const theme = useTheme();

  const getSize = (): number => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      default:
        return 48;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 24;
      default:
        return 18;
    }
  };

  const dimensions = {
    width: getSize(),
    height: getSize(),
    borderRadius: getSize() / 2,
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        dimensions,
        borderColor && { borderColor, borderWidth: 2 },
        style,
      ]}
      onPress={onPress}
    >
      {source ? (
        <Image
          source={source}
          style={[styles.image, dimensions]}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize: getFontSize(),
              color: theme.colors.primary.main,
            },
          ]}
        >
          {initials?.toUpperCase() || '?'}
        </Text>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontWeight: 'bold',
  },
});