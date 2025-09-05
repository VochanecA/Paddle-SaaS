'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AIChat from '@/components/AIChat';
import { User } from '@supabase/supabase-js';

// This is a client component, so all logic runs in the browser.
export default function WebAppPage() {
  const [user, setUser] = useState<User | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // We are now handling authentication and subscription on the client side.
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data: { user: fetchedUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !fetchedUser) {
        console.error('Authentication error or user not found:', authError);
        redirect('/auth/login');
        return;
      }

      if (!fetchedUser.email) {
        console.error('User email not found for authenticated user');
        redirect('/account?message=user_error');
        return;
      }

      // Check subscription status
      const isSubscribed = await checkSubscriptionStatus(fetchedUser.email);
      
      if (!isSubscribed) {
        redirect('/account?message=subscription_required');
        return;
      }

      setUser(fetchedUser);
      setHasActiveSubscription(isSubscribed);
      setIsLoading(false);
    };

    fetchUserData();
  }, []); // Empty dependency array ensures this runs once on component mount

  /**
   * Checks the subscription status for a user based on their email.
   * This function is now called on the client side.
   * @param userEmail The email of the user to check.
   * @returns A promise that resolves to a boolean indicating if the user has an active or trialing subscription.
   */
  async function checkSubscriptionStatus(userEmail: string): Promise<boolean> {
    const supabase = createClient();

    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('email', userEmail)
        .single();

      if (customerError || !customer) {
        console.error('Customer not found for email:', userEmail);
        return false;
      }

      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('subscription_status')
        .eq('customer_id', customer.customer_id)
        .in('subscription_status', ['active', 'trialing']);

      if (subscriptionsError) {
        console.error('Error checking subscriptions:', subscriptionsError);
        return false;
      }

      return !!(subscriptions && subscriptions.length > 0);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  if (isLoading || !user) {
    // You can add a nice loading spinner or placeholder here
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-all duration-700">
        <div className="text-xl text-gray-800 dark:text-gray-200">Loading...</div>
      </div>
    );
  }

  // The rest of your existing UI code remains the same.
  // The theme will now change correctly because the component is a client component.
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-all duration-700">
      <main className="relative">
        {/* Hero Section */}
        <section className="pt-8 pb-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800/50 mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Premium AI Assistant Active
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                Chat with{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Advanced AI
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Experience the power of premium AI assistance. Ask questions, get insights, and unlock your productivity.
              </p>
            </div>
          </div>
        </section>

        {/* AI Chat Section */}
        <section className="pb-8 px-4 sm:px-6 lg:px-8">
    <div className="flex-1 min-h-0">
                  <AIChat className="w-full h-full" userId={user.id} />
                </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <p className="text-gray-700 dark:text-gray-400 font-medium">Uptime</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                  &lt;100ms
                </div>
                <p className="text-gray-700 dark:text-gray-400 font-medium">Response Time</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <p className="text-gray-700 dark:text-gray-400 font-medium">Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pro Tips */}
        {/* <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl p-8 border border-amber-200/50 dark:border-amber-800/30">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    💡 Pro Tips for Better Conversations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <div className="space-y-2">
                      <p className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Be specific and detailed in your questions</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>Ask follow-up questions to dive deeper</span>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Use AI for brainstorming and analysis</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                        <span>
                          Visit{' '}
                          <Link href="/account" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            account settings
                          </Link>
                          {' '}for preferences
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}
      </main>
    </div>
  );
}
