// src/app/layout.tsx
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import React from 'react'
import { Providers } from '@/components/Providers'
import { Navigation } from '@/components/Navigation'
import { ToastProvider } from '@/components/ToastProvider'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/next'
import { seoConfig } from '@/lib/seo'
import ScrollToTop from '@/components/ScrollToTop';
import { GDPRBanner } from '@/components/GDPRBanner';

// Initialize Inter font with subsets and display settings
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// ✅ Direktno koristiš centralni SEO config
export const metadata: Metadata = seoConfig

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://yourdomain.com'

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Moj Medicinski AI',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      'https://twitter.com/YourHandle',
      'https://facebook.com/YourPage',
    ],
    description:
      'Awesome SaaS app for productivity and workflow efficiency.',
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} font-sans`}
    >
      <head>
        {/* ✅ Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />

        {/* ✅ PWA + Performance meta */}
        <meta name="application-name" content="Moj Medicinski AI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Moj Medicinski AI" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head>

      <body
        className={`${inter.className} bg-background text-foreground transition-colors min-h-screen flex flex-col`}
      >
        <Providers>
          <ToastProvider>
            <Navigation />
            {/* ScrollToTop je bolje staviti ovdje - izvan main za globalni efekat */}
            <ScrollToTop />
            <main className="flex-grow">
              {children}
              <Analytics />
            </main>
            <Footer />
              <GDPRBanner />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  )
}