// src/app/features/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { FeatureCard } from '@/components/FeatureCard';
import Image from 'next/image';
import { getNextVersion } from '@/lib/getNextVersion';

export const metadata: Metadata = {
  title: 'Features | Moj Medicinski AI Kit',
  description: 'Explore all the powerful features of our Moj Medicinski AI Kit platform',
  openGraph: {
    title: 'Features | Moj Medicinski AI Kit',
    description: 'Explore all the powerful features of our Moj Medicinski AI Kit platform',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Features | Moj Medicinski AI Kit',
    description: 'Explore all the powerful features of our Moj Medicinski AI Kit platform',
  },
};

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  category?: string;
}

const features: Feature[] = [
  {
    title: 'Supabase Authentication',
    description: 'Secure, scalable auth with SSR, social logins, and passwordless options out of the box.',
    icon: (
      <div className="relative">
        <div className="absolute -inset-2 bg-blue-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-blue-900/30" />
        <Image
          src="/supabase-logo-icon.png"
          alt="Supabase logo"
          width={48}
          height={48}
          className="relative w-12 h-12"
          priority
        />
      </div>
    ),
    category: 'Authentication',
  },
  {
    title: 'Paddle Payments',
    description: 'Global subscriptions and billing, pre-integrated and production-ready.',
    icon: (
      <div className="relative">
        <div className="absolute -inset-2 bg-green-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-green-900/30" />
        <Image
          src="/Paddle_Logo.jpg"
          alt="Paddle logo"
          width={48}
          height={48}
          className="relative w-12 h-12 object-contain"
          priority
        />
      </div>
    ),
    category: 'Payments',
  },
  {
    title: 'Modern Tech Stack',
    description: `Next.js ${getNextVersion()} App Router, Tailwind CSS, and TypeScript for performance and scalability.`,
    icon: (
      <div className="relative">
        <div className="absolute -inset-2 bg-purple-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-purple-900/30" />
        <Image
          src="/Next.js_Logo_1.png"
          alt="Next.js logo"
          width={48}
          height={48}
          className="relative w-12 h-12 object-contain"
          priority
        />
      </div>
    ),
    category: 'Technology',
  },
  {
    title: 'AI-Powered Assistant',
    description: 'Integrated AI chat with image analysis capabilities powered by OpenRouter.',
    icon: (
      <div className="relative">
        <div className="absolute -inset-2 bg-indigo-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-indigo-900/30" />
        <svg className="w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
    ),
    category: 'AI Features',
  },
  {
    title: 'Responsive Design',
    description: 'Beautiful, mobile-first design that works seamlessly across all devices.',
    icon: (
      <div className="relative">
        <div className="absolute -inset-2 bg-pink-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-pink-900/30" />
        <svg className="w-12 h-12 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    ),
    category: 'Design',
  },
  {
    title: 'Dark Mode Support',
    description: 'Built-in dark mode with automatic system preference detection.',
    icon: (
      <div className="relative">
        <div className="absolute -inset-2 bg-gray-800 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-gray-700/30" />
        <svg className="w-12 h-12 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
    ),
    category: 'Design',
  },
];

const categories = Array.from(new Set(features.map(feature => feature.category)));

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-b from-background to-background-alt dark:to-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Powerful Features for Your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              SaaS Application
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to build, launch, and grow your SaaS product with confidence.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              All Features at a Glance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our comprehensive set of features designed to accelerate your development process.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
              All Features
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are already building amazing SaaS applications with our starter kit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl text-center"
            >
              View Pricing Plans
            </Link>
            <Link
              href="/"
              className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}