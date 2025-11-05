// src/components/SubscriptionManager.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Subscription } from '@/lib/types';

interface SubscriptionManagerProps {
  user: User;
  forceRefresh?: boolean;
  onSubscriptionChange?: (hasActiveSubscription: boolean) => void;
}

export function SubscriptionManager({
  user,
  forceRefresh = false,
  onSubscriptionChange,
}: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const supabase = createClient();

  const fetchSubscriptions = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setIsLoading(true);
          setError(null);
        }

        console.log('🔄 Fetching subscriptions for user:', user.email);

        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('customer_id')
          .eq('email', user.email)
          .single();

        if (customerError) {
          if (customerError.code === 'PGRST116') {
            console.log('No customer found for user:', user.email);
            setSubscriptions([]);
            onSubscriptionChange?.(false);
            return;
          }
          throw customerError;
        }

        if (!customer) {
          console.log('Customer record exists but no data returned');
          setSubscriptions([]);
          onSubscriptionChange?.(false);
          return;
        }

        console.log('Found customer:', customer.customer_id);

        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('customer_id', customer.customer_id)
          .order('created_at', { ascending: false });

        if (subscriptionsError) throw subscriptionsError;

        const subs = subscriptionsData || [];
        console.log(`Found ${subs.length} subscriptions`);
        setSubscriptions(subs);

        const hasActiveSubscription = subs.some(
          (sub) => sub.subscription_status === 'active' || sub.subscription_status === 'trialing',
        );
        
        console.log('Has active subscription:', hasActiveSubscription);
        onSubscriptionChange?.(hasActiveSubscription);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
        onSubscriptionChange?.(false);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [user.email, onSubscriptionChange, supabase],
  );

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // short polling if forceRefresh is true
  useEffect(() => {
    if (!forceRefresh) return;

    console.log('🔄 Force refresh enabled, starting polling...');
    const interval = setInterval(() => {
      console.log('🔄 Polling for subscription updates...');
      fetchSubscriptions(false);
    }, 5000);
    
    const timeout = setTimeout(() => {
      console.log('⏹️ Stopping force refresh polling');
      clearInterval(interval);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [forceRefresh, fetchSubscriptions]);

  // continuous polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSubscriptions(false);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchSubscriptions]);

  const handleOpenCustomerPortal = useCallback(async () => {
    try {
      console.log('🔄 Opening Paddle Customer Portal...');
      
      // Koristite sandbox URL za development
      const paddleCustomerPortalUrl = `https://sandbox-customer-portal.paddle.com/subscriptions`;
      console.log('Opening Paddle customer portal:', paddleCustomerPortalUrl);
      window.open(paddleCustomerPortalUrl, '_blank');
      
    } catch (err) {
      console.error('Error opening customer portal:', err);
      // Fallback na sandbox portal
      const paddleCustomerPortalUrl = `https://sandbox-customer-portal.paddle.com/subscriptions`;
      window.open(paddleCustomerPortalUrl, '_blank');
    }
  }, []);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Subscriptions</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Loading your subscriptions…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Subscriptions</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Unable to load subscriptions</p>
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => fetchSubscriptions(true)}
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Subscriptions</h2>
     

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          type="button"
          onClick={() => fetchSubscriptions(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors"
        >
          Refresh
        </button>

       
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No subscriptions found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You don&apos;t have any active subscriptions yet. Choose a plan to get started with our
            premium features.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            View Plans
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.subscription_id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700"
            >
              {/* header: title, id, badge */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    Subscription
                  </div>
                  <span className="mt-1 sm:mt-0 text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded break-all">
                    #{subscription.subscription_id}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider self-start sm:self-center ${
                    subscription.subscription_status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : subscription.subscription_status === 'trialing'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : subscription.subscription_status === 'canceled'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : subscription.subscription_status === 'past_due'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {subscription.subscription_status}
                </span>
              </div>

              <hr className="border-gray-200 dark:border-gray-700 mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-5">
                {subscription.price_id && (
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                      Price ID
                    </div>
                    <div className="font-mono text-gray-900 dark:text-gray-100 text-sm bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded truncate">
                      {subscription.price_id}
                    </div>
                  </div>
                )}
                {subscription.product_id && (
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                      Product ID
                    </div>
                    <div className="font-mono text-gray-900 dark:text-gray-100 text-sm bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded truncate">
                      {subscription.product_id}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Created
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {new Date(subscription.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                    Updated
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {new Date(subscription.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              {subscription.scheduled_change && (
                <div className="mb-5">
                  <div className="flex items-start p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-700">
                    <div className="min-w-0">
                      <div className="text-amber-800 dark:text-amber-300 font-medium text-sm mb-1">
                        Scheduled Change
                      </div>
                      <p className="text-amber-700 dark:text-amber-200 text-sm">
                        {subscription.scheduled_change}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};