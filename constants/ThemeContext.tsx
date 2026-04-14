import React, { createContext, useContext, useState, ReactNode } from 'react';

<<<<<<< HEAD
type AccentColor = string;
=======
type AccentColor = '#000000' | '#3B82F6' | '#10B981' | '#F97316' | '#8B5CF6';
>>>>>>> 7c7837d88a9248518e6399d5a8bc04ada2517257

interface ThemeContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accentColor, setAccentColor] = useState<AccentColor>('#000000');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
