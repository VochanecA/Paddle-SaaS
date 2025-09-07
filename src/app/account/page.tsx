import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { Suspense } from 'react';
import Link from 'next/link';

interface AccountPageProps {
  searchParams: Promise<{
    refresh?: string;
    checkout_success?: string;
  }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;

  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Give webhook/Stripe time to update the database after successful checkout
  if (params.checkout_success) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Create a unique key that changes when we want to force refresh
  const refreshKey = params.checkout_success || params.refresh || Date.now().toString();
  const shouldRevalidate = Boolean(params.checkout_success || params.refresh);

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success Message */}
        {params.checkout_success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500 dark:text-indigo-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Subscription activated successfully!
                </h3>
                <p className="mt-1 text-sm text-gray-800 dark:text-gray-300">
                  Your subscription is now active and will appear below shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-400 dark:text-blue-400">
            Account Overview
          </h1>
          <p className="text-gray-800 dark:text-gray-300">
            Manage your subscriptions, billing, and payment history
          </p>
        </div>

        {/* Account Details Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Email Address
              </label>
              <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Member Since
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Account Status
              </label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-gray-700 dark:text-indigo-400">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Subscription Management */}
          <div className="space-y-6">
            <Suspense
              fallback={
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4" />
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              }
            >
              <SubscriptionManager 
                key={refreshKey} // Force re-render when refresh is needed
                user={user} 
                forceRefresh={shouldRevalidate} 
              />
            </Suspense>
          </div>

          {/* Web App Access Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center dark:bg-gray-700">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Web App Access
                  </h3>
                  <p className="text-gray-800 dark:text-gray-300 mb-4">
                    Once you have an active subscription, you&apos;ll be able to
                    access our web application with all its features.
                  </p>
                  <Link
                    href="/web-app"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Access Web App
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500 dark:text-indigo-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Need Help?
              </h3>
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-300">
                If you have questions about your subscription or billing, feel
                free to{' '}
                <a
                  href="/contact"
                  className="font-medium underline hover:text-blue-600 dark:hover:text-indigo-400"
                >
                  contact our support team
                </a>{' '}
                or check our{' '}
                <a
                  href="/help"
                  className="font-medium underline hover:text-blue-600 dark:hover:text-indigo-400"
                >
                  help documentation
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';