// components/ThemeProvider.tsx
import React, { createContext, useContext, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'light',
  fontSize: 'medium',
  setTheme: (theme: string) => {},
  setFontSize: (size: string) => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');

  return (
    <ThemeContext.Provider value={{ theme, fontSize, setTheme, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);