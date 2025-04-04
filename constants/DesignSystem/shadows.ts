// shadows.ts
import { Platform, ViewStyle } from 'react-native';

type Elevation = 0 | 1 | 2 | 3 | 4 | 5;

export const generateShadow = (elevation: Elevation): ViewStyle => {
 if (Platform.OS === 'ios') {
   return {
     shadowColor: '#000000',
     shadowOffset: {
       width: 0,
       height: elevation * 2,
     },
     shadowOpacity: elevation * 0.05,
     shadowRadius: elevation * 4,
   };
 }
 return {
   elevation: elevation * 2,
 };
};

export const shadows = {
 small: generateShadow(1),
 medium: generateShadow(2),
 large: generateShadow(3)
};