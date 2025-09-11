// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import React from 'react';
import { Providers } from '@/components/Providers';
import { Navigation } from '@/components/Navigation';
import { ToastProvider } from '@/components/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com';

  return {
    title: {
      default: 'My SaaS',
      template: '%s | My SaaS',
    },
    description: 'Discover the awesome features of My SaaS app, designed to boost your productivity and streamline workflows.',
    keywords: ['SaaS', 'productivity', 'web app', 'subscription', 'business tools'],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: 'My SaaS',
      description: 'Awesome SaaS app for productivity and workflow efficiency.',
      url: baseUrl,
      siteName: 'My SaaS',
      images: [{ url: `${baseUrl}/og-image.jpg`, width: 1200, height: 630, alt: 'My SaaS App Preview' }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'My SaaS',
      description: 'Awesome SaaS app for productivity and workflow efficiency.',
      images: [`${baseUrl}/og-image.jpg`],
      creator: '@YourHandle',
    },
    alternates: {
      canonical: baseUrl,
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-icon.png',
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'My SaaS',
    url: process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com',
    logo: `${process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com'}/logo.png`,
    sameAs: ['https://twitter.com/YourHandle', 'https://facebook.com/YourPage'],
    description: 'Awesome SaaS app for productivity and workflow efficiency.',
  } satisfies Record<string, unknown>;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) as string }}
        />
      </head>
      <body className={`${inter.className} bg-background text-foreground transition-colors`}>
        <Providers>
          <ToastProvider>
            <Navigation />
            <main className="min-h-screen">{children}</main>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}