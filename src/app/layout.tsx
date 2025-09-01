import './globals.css';
import { Inter } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import { AuthButton } from '@/components/AuthButton';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    template: '%s | SaaS Starter',
    default: 'SaaS Starter',
  },
  description: 'Paddle + Supabase SSR SaaS Starter',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`
  ),
  openGraph: {
    title: 'SaaS Starter',
    description: 'Paddle + Supabase SSR SaaS Starter',
    url: '/',
    siteName: 'SaaS Starter',
    images: '/og-image.png',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaaS Starter',
    description: 'Paddle + Supabase SSR SaaS Starter',
    images: '/og-image.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navigation authSection={<AuthButton />} />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
