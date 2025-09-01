import Link from 'next/link';
import { FeatureCard } from '@/components/FeatureCard';

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <div className="py-20 px-4 md:px-8 bg-white dark:bg-gray-950 transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Section */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground dark:text-foreground leading-tight mb-4">
              Launch Your SaaS, <br className="hidden md:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-alt">Faster Than Ever</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 mb-8">
              A comprehensive and production-ready starter kit that provides all the essential tools—from authentication to payments—so you can focus on building your product.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href="/auth/signup" 
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-accent rounded-xl hover:bg-accent-alt transition-transform transform hover:scale-105 shadow-lg"
              >
                Get Started
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link 
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-foreground dark:text-foreground border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
          {/* Image Placeholder */}
          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-md h-72 lg:h-96 rounded-3xl bg-background dark:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-center p-4 shadow-xl border border-gray-300 dark:border-gray-700">
              Image Placeholder
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-900 py-20 px-4 md:px-8 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-foreground dark:text-foreground mb-12">
            Features That Will Set You Up for Success
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Supabase Authentication"
              description="Secure and scalable authentication with server-side rendering, social logins, and passwordless options."
              icon={(
                <svg className="w-8 h-8 text-accent dark:text-accent-dark" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9a1 1 0 01-1-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1zm-2-4H7a1 1 0 01-1-1V9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1zm-2-4H3a1 1 0 01-1-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1zm8 8h-2a1 1 0 01-1-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1zm2-4h-2a1 1 0 01-1-1V9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1zm-2-4h-2a1 1 0 01-1-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1zm8 4h-2a1 1 0 01-1-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1zm-2-4h-2a1 1 0 01-1-1V9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1zm-2-4h-2a1 1 0 01-1-1V5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1z"></path>
                </svg>
              )}
            />
            <FeatureCard
              title="Paddle Payments"
              description="A robust billing system for global payments, subscriptions, and webhooks. Integrated and ready to go."
              icon={(
                <svg className="w-8 h-8 text-accent dark:text-accent-dark" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 00-7.07 17.07A10 10 0 1012 2zm0 18a8 8 0 110-16 8 8 0 010 16zm-2-12a2 2 0 114 0h-4zm0 4h4v2h-4v-2zm-2 4h8a2 2 0 012 2v2a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2a2 2 0 012-2zm2-2h4v2h-4v-2z"></path>
                </svg>
              )}
            />
            <FeatureCard
              title="Modern Tech Stack"
              description="Leverage Next.js App Router, Tailwind CSS, and TypeScript for a high-performance and scalable foundation."
              icon={(
                <svg className="w-8 h-8 text-accent dark:text-accent-dark" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 12l10 10 10-10L12 2zm0 1.414L20.586 12 12 20.586 3.414 12 12 3.414zM12 5.828L5.828 12 12 18.172 18.172 12 12 5.828z"></path>
                </svg>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
