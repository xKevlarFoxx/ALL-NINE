import { palette } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { generateShadow } from './shadows';
import { animations } from './animations';

export const theme = {
  colors: palette,
  typography,
  spacing,
  shadows: {
    xs: generateShadow(0),
    sm: generateShadow(1),
    md: generateShadow(2),
    lg: generateShadow(3),
    xl: generateShadow(4),
    '2xl': generateShadow(5),
  },
  animations,
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
};

export type Theme = typeof theme;