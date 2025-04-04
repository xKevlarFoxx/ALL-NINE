// components/ThemeProvider.tsx
import React, { createContext, useContext } from 'react';
import { theme } from '../constants/DesignSystem/theme';
import type { Theme } from '../constants/DesignSystem/theme';

const ThemeContext = createContext<Theme>(theme);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  theme?: Theme;
}

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