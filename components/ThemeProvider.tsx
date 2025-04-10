// components/ThemeProvider.tsx
import React, { createContext, useContext } from 'react';
import { theme } from '../constants/DesignSystem/theme';
import type { Theme } from '../constants/DesignSystem/theme';

const ThemeContext = createContext<Theme>(theme);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.warn('useTheme called outside of ThemeProvider. Falling back to default theme.'); // Added warning
    return theme; // Fallback to default theme
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Theme;
}

/**
 * ThemeProvider component provides a theme context to its children.
 * Use the `useTheme` hook to access the theme within the component tree.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  theme: customTheme = theme
}) => {
  return (
    <ThemeContext.Provider value={customTheme}>
      {children}
    </ThemeContext.Provider>
  );
};