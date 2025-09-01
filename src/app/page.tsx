import { Hero } from "@/components/Hero";
import { FeatureCard } from "@/components/FeatureCard";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Hero */}
      <Hero />

      {/* Features Section */}
      <section className="py-24 px-4 md:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-center mb-16">
            Features That Empower Your SaaS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard
              title="Supabase Authentication"
              description="Secure, scalable auth with SSR, social logins, and passwordless options out of the box."
              icon={
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48..."></path>
                </svg>
              }
            />
            <FeatureCard
              title="Paddle Payments"
              description="Global subscriptions and billing, pre-integrated and production-ready."
              icon={
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2a10 10 0 00-7.07..."></path>
                </svg>
              }
            />
            <FeatureCard
              title="Modern Tech Stack"
              description="Next.js App Router, Tailwind CSS, and TypeScript for performance and scalability."
              icon={
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 12l10 10..."></path>
                </svg>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
