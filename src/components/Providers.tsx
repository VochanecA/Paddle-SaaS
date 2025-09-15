// src/components/Providers.tsx
'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"      // uses the "class" strategy for dark mode
      defaultTheme="system"   // default to system preference
      enableSystem={true}     // respect OS dark/light mode
    >
      {children}
    </ThemeProvider>
  );
}
