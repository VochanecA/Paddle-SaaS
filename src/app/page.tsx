// ./src/app/page.tsx
import { Hero } from "@/components/Hero";
import { FeatureCard } from "@/components/FeatureCard";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Hero */}
      <Hero />

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 bg-gradient-to-b from-background to-background-alt dark:to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob dark:bg-blue-900 dark:opacity-10"></div>
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 dark:bg-indigo-900 dark:opacity-10"></div>
        <div className="absolute bottom-40 left-1/3 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 dark:bg-purple-900 dark:opacity-10"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Features That{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Empower
              </span>{' '}
              Your SaaS
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to build, launch, and grow your SaaS product with confidence.
            </p>
          </div>
          
          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Supabase Authentication"
              description="Secure, scalable auth with SSR, social logins, and passwordless options out of the box."
              icon={
                <div className="relative">
                  <div className="absolute -inset-2 bg-blue-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-blue-900/30"></div>
                  <svg
                    className="w-12 h-12 text-blue-600 dark:text-blue-400 relative"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M21.999 10.871l-9.08-8.771c-.334-.322-.798-.322-1.032 0l-9.28 8.771c-.214.212-.334.515-.334.818 0 .606.466 1.091 1.042 1.091h1.294v8.966c0 .606.466 1.091 1.042 1.091h5.444v-6.677h3.626v6.677h5.843c.576 0 1.042-.485 1.042-1.091v-8.966h1.124c.576 0 1.042-.485 1.042-1.091 0-.303-.12-.606-.333-.818z"/>
                  </svg>
                </div>
              }
            />
<FeatureCard
  title="Paddle Payments"
  description="Global subscriptions and billing, pre-integrated and production-ready."
  icon={
    <div className="relative">
      <div className="absolute -inset-2 bg-green-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-green-900/30"></div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 text-green-600 dark:text-green-400 relative"
        fill="currentColor"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path d="M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936q-.002-.165.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.6 6.6 0 0 0 10.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z" />
      </svg>
    </div>
  }
/>

            <FeatureCard
              title="Modern Tech Stack"
              description="Next.js App Router, Tailwind CSS, and TypeScript for performance and scalability."
              icon={
                <div className="relative">
                  <div className="absolute -inset-2 bg-purple-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-purple-900/30"></div>
                  <svg
                    className="w-12 h-12 text-purple-600 dark:text-purple-400 relative"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2l9.5 5.5v9L12 22l-9.5-5.5v-9L12 2zm0 2.5L5.5 9 12 13.5 18.5 9 12 4.5zm-9.5 9v6.5L12 20l9.5-5.5v-6.5L12 15.5 2.5 10v6.5z"/>
                  </svg>
                </div>
              }
            />
            <FeatureCard
              title="Database Management"
              description="Built-in PostgreSQL database with real-time subscriptions and row-level security."
              icon={
                <div className="relative">
                  <div className="absolute -inset-2 bg-cyan-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-cyan-900/30"></div>
                  <svg
                    className="w-12 h-12 text-cyan-600 dark:text-cyan-400 relative"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
              }
            />
            <FeatureCard
              title="Email Templates"
              description="Beautiful, responsive email templates for onboarding, notifications, and marketing."
              icon={
                <div className="relative">
                  <div className="absolute -inset-2 bg-pink-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-pink-900/30"></div>
                  <svg
                    className="w-12 h-12 text-pink-600 dark:text-pink-400 relative"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              }
            />
            <FeatureCard
              title="Admin Dashboard"
              description="Complete admin panel to manage users, subscriptions, and application settings."
              icon={
                <div className="relative">
                  <div className="absolute -inset-2 bg-orange-100 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 dark:bg-orange-900/30"></div>
                  <svg
                    className="w-12 h-12 text-orange-600 dark:text-orange-400 relative"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              }
            />
          </div>

          {/* CTA at the bottom of features section */}
          <div className="text-center mt-20">
            <div className="inline-flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center">
                Explore All Features
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500 font-medium py-4 px-8 rounded-lg transition-all duration-300">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}