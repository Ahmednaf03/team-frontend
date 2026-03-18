// src/contexts/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Import your theme dictionaries and global styles
import { lightTheme } from '../themes/theme';
import { darkTheme } from '../themes/darkTheme';
import { warmTheme } from '../themes/warmTheme';
import { GlobalStyle } from '../themes/GlobalStyles';

// 1. Create the Context
const ThemeContext = createContext();

// 2. Create a custom hook so any component can access or change the theme
export const useThemeContext = () => useContext(ThemeContext);

// 3. Create the Provider Component
export const CustomThemeProvider = ({ children, initialTheme = 'default' }) => {
  const [themeName, setThemeName] = useState(initialTheme);

  // If the backend tenantConfig loads slightly late, this ensures the theme updates
  useEffect(() => {
    if (initialTheme) {
      setThemeName(initialTheme);
    }
  }, [initialTheme]);

  // Helper to grab the correct color dictionary
  const getThemeObject = (name) => {
    switch (name) {
      case 'dark': return darkTheme;
      case 'warm': return warmTheme;
      default: return lightTheme;
    }
  };

  const currentThemeObject = getThemeObject(themeName);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName }}>
      {/* This is the styled-components provider that passes colors to all your styled components */}
      <StyledThemeProvider theme={currentThemeObject}>
        {/* GlobalStyle applies the background color to the entire <body> */}
        <GlobalStyle />
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};