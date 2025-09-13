// ./src/app/page.tsx
// src/app/page.tsx
import Hero from "@/components/Hero"; // Changed from named import to default import
import { FeatureCard } from "@/components/FeatureCard";
import Image from "next/image";
import { getNextVersion } from "@/lib/getNextVersion";
import Link from "next/link";

// ... rest of the file remains the same ...

/**
 * HomePage component - The main landing page for the SaaS Starter Kit
 * Includes Hero section, Features section with animated backgrounds, and CTAs
 * Optimized for performance, accessibility, and SEO
 */
export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Hero */}
      <Hero />
      
      {/* Features Section */}
      <section 
        className="py-24 px-4 md:px-8 bg-gradient-to-b from-background to-background-alt dark:to-gray-900 relative overflow-hidden"
        aria-labelledby="features-heading"
      >
        {/* Background decorative blobs */}
        <div 
          className="absolute top-20 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-blue-900 dark:opacity-10" 
          aria-hidden="true"
        />
        <div 
          className="absolute top-40 right-1/4 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 dark:bg-indigo-900 dark:opacity-10" 
          aria-hidden="true"
        />
        <div 
          className="absolute bottom-40 left-1/3 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 dark:bg-purple-900 dark:opacity-10" 
          aria-hidden="true"
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 
              id="features-heading"
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
            >
              Features That{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Empower
              </span>{" "}
              Your SaaS
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to build, launch, and grow your SaaS product
              with confidence.
            </p>
          </div>
          
          {/* Feature cards grid — 1 on mobile, 2 on tablets, 3 on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Supabase Authentication"
              description="Secure, scalable auth with SSR, social logins, and passwordless options out of the box."
              icon={
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
              }
            />
            <FeatureCard
              title="Paddle Payments"
              description="Global subscriptions and billing, pre-integrated and production-ready."
              icon={
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
              }
            />
            <FeatureCard
              title="Modern Tech Stack"
              description={`Next.js ${getNextVersion()} App Router, Tailwind CSS, and TypeScript for performance and scalability.`}
              icon={
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
              }
            />
          </div>
          
          {/* CTA at the bottom */}
          <div className="text-center mt-20">
            <div className="inline-flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/features"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                aria-label="Explore all features"
              >
                Explore All Features
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <Link 
                href="/docs"
                className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500 font-medium py-4 px-8 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                aria-label="View documentation"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}