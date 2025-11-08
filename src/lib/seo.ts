// src/lib/seo.ts
import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com'

export const seoConfig: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'My SaaS',
    template: '%s | My SaaS',
  },
  description:
    'Discover the awesome features of My SaaS app, designed to boost your productivity and streamline workflows.',
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
    description:
      'Awesome SaaS app for productivity and workflow efficiency.',
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
    description:
      'Awesome SaaS app for productivity and workflow efficiency.',
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
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'manifest', url: '/manifest.json' }],
  },
  manifest: '/manifest.json',
  category: 'technology',
}