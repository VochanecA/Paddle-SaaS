// src/app/account/subscriptions/page.tsx
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { Suspense } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Home,
  CreditCard,
  Shield,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

// --- Custom Components ---
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
  );
}

export default async function SubscriptionsPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Sidebar navigation items
  const navigationItems = [
    {
      name: 'Overview',
      href: '/account',
      icon: Home,
      description: 'Account overview and information',
      current: false
    },
    {
      name: 'Billing',
      href: '/account/billing',
      icon: CreditCard,
      description: 'Billing and payment methods',
      current: false
    },
    {
      name: 'Security',
      href: '/account/security',
      icon: Shield,
      description: 'Security settings and password',
      current: false
    },
    {
      name: 'Subscriptions',
      href: '/account/subscriptions',
      icon: Settings,
      description: 'Manage your subscriptions',
      current: true
    },
    {
      name: 'Web App',
      href: '/web-app',
      icon: ExternalLink,
      description: 'Access the web application',
      current: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/account"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Overview
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Subscriptions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage your active subscriptions and plans.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isExternal = item.href.startsWith('http') || item.name === 'Web App';
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg border transition-colors group ${
                      item.current 
                        ? 'bg-white border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white' 
                        : 'border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm dark:hover:bg-gray-800 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      item.current 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {isExternal && <ExternalLink className="h-3 w-3" />}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  View and manage your active subscriptions and plans.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-1/3" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    </div>
                  }
                >
                  <SubscriptionManager
                    key={Date.now().toString()}
                    user={user}
                    forceRefresh={false}
                  />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';