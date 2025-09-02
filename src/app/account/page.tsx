import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { Suspense } from 'react';

interface AccountPageProps {
  searchParams: {
    refresh?: string;
    checkout_success?: string;
  };
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  // Pass cookies() to createClient so it can read cookieStore.getAll()
  const supabase = createClient(cookies());
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Force fresh data if coming from checkout or refresh param
  const shouldRevalidate = searchParams.checkout_success || searchParams.refresh;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success Message */}
        {searchParams.checkout_success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Subscription activated successfully!
                </h3>
                <div className="mt-1 text-sm text-green-700">
                  <p>Your subscription is now active and will appear below shortly.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Overview</h1>
          <p className="text-gray-600">Manage your subscriptions, billing, and payment history</p>
        </div>
       
        {/* Account Details Card */}
        <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
              <p className="text-gray-900 font-medium">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
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
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              }
            >
              <SubscriptionManager user={user} forceRefresh={!!shouldRevalidate} />
            </Suspense>
          </div>
         
          {/* Transaction History */}
          <div className="space-y-6">
            {/* <TransactionHistory user={user} /> */}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  If you have questions about your subscription or billing, feel free to{' '}
                  <a href="/contact" className="font-medium underline hover:text-blue-600">
                    contact our support team
                  </a>
                  {' '}or check our{' '}
                  <a href="/help" className="font-medium underline hover:text-blue-600">
                    help documentation
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this to force dynamic rendering when search params are present
export const dynamic = 'force-dynamic';