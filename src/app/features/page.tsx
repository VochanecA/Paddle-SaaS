// src/app/features/page.tsx
import { Metadata } from 'next';
import Image from 'next/image';
import { FeatureCard, FeatureCardProps } from '@/components/FeatureCard';
import Link from 'next/link';

// Define feature data with proper typing
const featuresData: FeatureCardProps[] = [
  {
    title: "Supabase Authentication",
    description: "Secure, scalable auth with SSR, social logins, and passwordless options out of the box.",
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
    )
  },
  {
    title: "Paddle Payments",
    description: "Global subscriptions and billing, pre-integrated and production-ready.",
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
    )
  },
  {
    title: "Modern Tech Stack",
    description: "Next.js App Router, Tailwind CSS, and TypeScript for performance and scalability.",
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
    )
  },
  {
    title: "Responsive Design",
    description: "Beautiful, mobile-first design that works flawlessly on all devices.",
    icon: (
      <div className="relative">
        <div className="absolute -inset-2 bg-pink-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-pink-900/30" />
        <svg className="relative w-12 h-12 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    )
  },
  {
    title: "Analytics Dashboard",
    description: "Comprehensive analytics to track user behavior and business metrics.",
    icon: (
      <div className="relative">
        <div className="absolute -inset-2 bg-yellow-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-yellow-900/30" />
        <svg className="relative w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
    )
  },
  {
    title: "API Integration",
    description: "Seamless integration with third-party services through robust APIs.",
    icon: (
      <div className="relative">
        <div className="absolute -inset-2 bg-indigo-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-indigo-900/30" />
        <svg className="relative w-12 h-12 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }
];

// Generate metadata for the features page
export const metadata: Metadata = {
  title: "Features | My SaaS",
  description: "Explore all the powerful features of My SaaS platform designed to boost your productivity and streamline workflows.",
  keywords: ["SaaS features", "productivity tools", "business automation", "workflow management"],
  openGraph: {
    title: "Features | My SaaS",
    description: "Explore all the powerful features of My SaaS platform designed to boost your productivity and streamline workflows.",
    url: "/features",
  },
  twitter: {
    title: "Features | My SaaS",
    description: "Explore all the powerful features of My SaaS platform designed to boost your productivity and streamline workflows.",
  },
};

/**
 * Features page component that displays all product features in a responsive grid
 * Includes a hero section and feature cards with proper accessibility and performance optimizations
 */
export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 md:px-8 bg-gradient-to-b from-background to-background-alt dark:to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-blue-900 dark:opacity-10" aria-hidden="true" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 dark:bg-indigo-900 dark:opacity-10" aria-hidden="true" />
        <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 dark:bg-purple-900 dark:opacity-10" aria-hidden="true" />
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Powerful Features for{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Modern Teams
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Everything you need to build, launch, and grow your SaaS product with confidence.
          </p>
          <div className="mt-10 flex justify-center">
            <Link 
              href="/pricing"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="View pricing plans"
            >
              View Pricing
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Grid Section */}
      <section className="py-20 px-4 md:px-8 bg-background relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <FeatureCard
                key={`${feature.title}-${index}`}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-background to-background-alt dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied customers using our platform to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              aria-label="Sign up for free trial"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/pricing"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500 font-medium py-4 px-8 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              aria-label="View pricing plans"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}