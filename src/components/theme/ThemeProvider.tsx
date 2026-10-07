'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
};

export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      disableTransitionOnChange
      themes={['dark', 'light']}
      storageKey="ridelink-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
