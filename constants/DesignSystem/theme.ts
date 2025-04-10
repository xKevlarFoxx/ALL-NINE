import { palette } from './palette';
import { typography } from './typography';
import { spacing } from './spacing';
import { generateShadow } from './shadows';
import { animations } from './animations';

/**
 * Border radius tokens define the curvature of UI elements.
 */
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

/**
 * The theme object aggregates all design tokens into a single configuration.
 *
 * Use the theme object to ensure consistency across the UI.
 */
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
  borderRadius,
};

export type Theme = typeof theme;
