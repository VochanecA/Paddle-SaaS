// src/lib/seo.ts
import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com'

export const seoConfig: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Moj Medicinski AI',
    template: '%s | Moj Medicinski AI',
  },
  description:
    'Discover the awesome features of Moj Medicinski AI app, designed to boost your productivity and streamline workflows.',
  keywords: ['SaaS', 'productivity', 'web app', 'subscription', 'business tools'],
  authors: [{ name: 'Moj Medicinski AI Team', url: baseUrl }],
  creator: 'Moj Medicinski AI',
  publisher: 'Moj Medicinski AI',
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
    title: 'Moj Medicinski AI',
    description:
      'Awesome SaaS app for productivity and workflow efficiency.',
    url: baseUrl,
    siteName: 'Moj Medicinski AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Moj Medicinski AI App Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moj Medicinski AI',
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