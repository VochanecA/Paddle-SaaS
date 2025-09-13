// src/app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata, ResolvingMetadata } from 'next';
import React from 'react';
import { Providers } from '@/components/Providers';
import { Navigation } from '@/components/Navigation';
import { ToastProvider } from '@/components/ToastProvider';
import Footer from '@/components/Footer';

// Initialize Inter font with subsets and display settings
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Define type for structured data
interface StructuredData {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  description: string;
}

/**
 * Generate metadata for the application
 * This function runs at build time and generates metadata for all pages
 */
export async function generateMetadata(): Promise<Metadata> {
  // Get base URL from environment variable with fallback
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com';
  
  // Ensure environment variables are properly set in production
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_URL) {
    console.warn('NEXT_PUBLIC_URL environment variable is not set. Using fallback URL.');
  }

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: 'My SaaS',
      template: '%s | My SaaS',
    },
    description: 'Discover the awesome features of My SaaS app, designed to boost your productivity and streamline workflows.',
    keywords: ['SaaS', 'productivity', 'web app', 'subscription', 'business tools'],
    authors: [{ name: 'My SaaS Team', url: baseUrl }],
    creator: 'My SaaS',
    publisher: 'My SaaS',
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
      images: [
        { 
          url: '/og-image.jpg', 
          width: 1200, 
          height: 630, 
          alt: 'My SaaS App Preview',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'My SaaS',
      description: 'Awesome SaaS app for productivity and workflow efficiency.',
      images: ['/og-image.jpg'],
      creator: '@YourHandle',
      site: '@YourHandle',
    },
    alternates: {
      canonical: baseUrl,
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'manifest', url: '/manifest.json' },
      ],
    },
    manifest: '/manifest.json',
    category: 'technology',
  };
}

/**
 * RootLayout component - The main layout wrapper for the entire application
 * Includes font configuration, structured data, providers, and main layout structure
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Get base URL from environment variable with fallback
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com';

  // Define structured data for SEO with proper typing
  const schemaData: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'My SaaS',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/YourHandle', 
      'https://facebook.com/YourPage'
    ],
    description: 'Awesome SaaS app for productivity and workflow efficiency.',
  };

  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      className={`${inter.variable} font-sans`}
    >
      <head>
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(schemaData) 
          }}
        />
        
        {/* Additional meta tags for better SEO and performance */}
        <meta name="application-name" content="My SaaS" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="My SaaS" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Theme color for browser UI */}
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head>
      
      <body 
        className={`${inter.className} bg-background text-foreground transition-colors min-h-screen flex flex-col`}
      >
        <Providers>
          <ToastProvider>
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}