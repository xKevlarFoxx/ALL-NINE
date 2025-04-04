import { TextStyle } from 'react-native';

type FontWeight = 'thin' | 'extraLight' | 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold' | 'black';

const fontFamily = (weight: FontWeight = 'regular', isItalic = false): string => {
 const weights = {
   thin: 'Poppins-Thin',
   extraLight: 'Poppins-ExtraLight',
   light: 'Poppins-Light',
   regular: 'Poppins-Regular',
   medium: 'Poppins-Medium',
   semiBold: 'Poppins-SemiBold',
   bold: 'Poppins-Bold',
   extraBold: 'Poppins-ExtraBold',
   black: 'Poppins-Black',
 };
 return `${weights[weight]}${isItalic ? 'Italic' : ''}`;
};

export const typography = {
 h1: {
   fontSize: 36,
   fontFamily: fontFamily('bold'),
   lineHeight: 43.2,
 } as TextStyle,
 h2: {
   fontSize: 30,
   fontFamily: fontFamily('bold'),
   lineHeight: 36,
 } as TextStyle,
 h3: {
   fontSize: 24,
   fontFamily: fontFamily('semiBold'),
   lineHeight: 28.8,
 } as TextStyle,
 h4: {
   fontSize: 20,
   fontFamily: fontFamily('semiBold'),
   lineHeight: 24,
 } as TextStyle,
 body1: {
   fontSize: 16,
   fontFamily: fontFamily('regular'),
   lineHeight: 24,
 } as TextStyle,
 body2: {
   fontSize: 14,
   fontFamily: fontFamily('regular'),
   lineHeight: 21,
 } as TextStyle,
 button: {
   fontSize: 16,
   fontFamily: fontFamily('medium'),
   lineHeight: 24,
 } as TextStyle
};