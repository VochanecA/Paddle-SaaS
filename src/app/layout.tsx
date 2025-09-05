// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'My SaaS',
  description: 'Awesome SaaS app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}
      >
        <Providers>
          <Navigation />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
