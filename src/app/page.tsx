// ./src/app/page.tsx
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
                  className="w-12 h-12 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M21.999 10.871l-9.08-8.771c-.334-.322-.798-.322-1.032 0l-9.28 8.771c-.214.212-.334.515-.334.818 0 .606.466 1.091 1.042 1.091h1.294v8.966c0 .606.466 1.091 1.042 1.091h5.444v-6.677h3.626v6.677h5.843c.576 0 1.042-.485 1.042-1.091v-8.966h1.124c.576 0 1.042-.485 1.042-1.091 0-.303-.12-.606-.333-.818z"/>
                </svg>
              }
            />
            <FeatureCard
              title="Paddle Payments"
              description="Global subscriptions and billing, pre-integrated and production-ready."
              icon={
                <svg
                  className="w-12 h-12 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M6 12.5h12m-12 4h12m-8.5-8.5h8.5m-11.5-3v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-14a1 1 0 0 0-1-1h-16a1 1 0 0 0-1 1z"/>
                </svg>
              }
            />
            <FeatureCard
              title="Modern Tech Stack"
              description="Next.js App Router, Tailwind CSS, and TypeScript for performance and scalability."
              icon={
                <svg
                  className="w-12 h-12 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2l9.5 5.5v9L12 22l-9.5-5.5v-9L12 2zm0 2.5L5.5 9 12 13.5 18.5 9 12 4.5zm-9.5 9v6.5L12 20l9.5-5.5v-6.5L12 15.5 2.5 10v6.5z"/>
                </svg>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}