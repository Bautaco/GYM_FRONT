import type { ReactNode } from 'react';
import { AuthProvider } from '../../shared/auth/AuthContext.js';
import { ThemeProvider } from '../../shared/theme/ThemeContext.js';

/** Agrupa los providers que deben envolver a toda la aplicación. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
