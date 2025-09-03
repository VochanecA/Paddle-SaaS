'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Subscription } from '@/lib/types';

interface SubscriptionManagerProps {
  user: User;
  forceRefresh?: boolean;
  onSubscriptionChange?: (hasActiveSubscription: boolean) => void; // New prop
}

export function SubscriptionManager({ user, forceRefresh = false, onSubscriptionChange }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Find customer by email
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('email', user.email)
        .single();

      if (customerError) {
        if (customerError.code === 'PGRST116') {
          // No customer found yet
          setSubscriptions([]);
          onSubscriptionChange?.(false); // Notify parent: no active subscription
          return;
        }
        throw customerError;
      }

      if (!customer) {
        setSubscriptions([]);
        onSubscriptionChange?.(false); // Notify parent: no active subscription
        return;
      }

      // Fetch subscriptions for this customer
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', customer.customer_id)
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        throw subscriptionsError;
      }

      const subs = subscriptionsData || [];
      setSubscriptions(subs);
      
      // Check if user has any active subscription
      const hasActiveSubscription = subs.some(sub => 
        sub.subscription_status === 'active' || sub.subscription_status === 'trialing'
      );
      onSubscriptionChange?.(hasActiveSubscription); // Notify parent
      
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
      onSubscriptionChange?.(false); // Notify parent: no active subscription due to error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user.email, forceRefresh]);

  // Auto-refresh every 5 seconds if forceRefresh is true (for new checkouts)
  useEffect(() => {
    if (!forceRefresh) return;

    const interval = setInterval(() => {
      fetchSubscriptions();
    }, 5000);

    // Stop auto-refreshing after 30 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [forceRefresh]);

  const handleCancelSubscription = async (subscriptionId: string) => {
    // TODO: Implement subscription cancellation
    console.log('Cancel subscription:', subscriptionId);
  };

  const handleUpdateSubscription = async (subscriptionId: string) => {
    // TODO: Implement subscription updates
    console.log('Update subscription:', subscriptionId);
  };

  if (loading) {
    return (
      <div className="bg-background-alt rounded-lg p-6 border border-foreground/20 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Subscriptions</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-foreground/20 rounded w-full"></div>
          <div className="h-4 bg-foreground/20 rounded w-3/4"></div>
          <div className="h-4 bg-foreground/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background-alt rounded-lg p-6 border border-foreground/20 shadow-sm">
        <h2 className="text-xl font-semibold text-foreground mb-4">Subscriptions</h2>
        <div className="bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error loading subscriptions</h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-400">
                <p>{error}</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={fetchSubscriptions}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-alt rounded-lg p-6 border border-foreground/20 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-foreground">Subscriptions</h2>
        <button
          onClick={fetchSubscriptions}
          className="inline-flex items-center px-3 py-2 border border-foreground/30 shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-foreground">No subscriptions</h3>
          <p className="mt-1 text-sm text-foreground/60">
            You don&apos;t have any active subscriptions yet.
          </p>
          <div className="mt-6">
            <a
              href="/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            >
              View Plans
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <div key={subscription.subscription_id} className="border border-foreground/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-foreground">
                      Subscription {subscription.subscription_id.slice(-8)}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscription.subscription_status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : subscription.subscription_status === 'trialing'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : subscription.subscription_status === 'canceled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          : subscription.subscription_status === 'past_due'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
                      }`}
                    >
                      {subscription.subscription_status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-foreground/60 space-y-1">
                    {subscription.price_id && (
                      <p>Price ID: {subscription.price_id}</p>
                    )}
                    {subscription.product_id && (
                      <p>Product ID: {subscription.product_id}</p>
                    )}
                    <p>Created: {new Date(subscription.created_at).toLocaleDateString()}</p>
                    <p>Last Updated: {new Date(subscription.updated_at).toLocaleDateString()}</p>
                    {subscription.scheduled_change && (
                      <p className="text-amber-600 dark:text-amber-400">Scheduled Change: {subscription.scheduled_change}</p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 flex space-x-2">
                  <button
                    onClick={() => handleUpdateSubscription(subscription.subscription_id)}
                    className="inline-flex items-center px-3 py-2 border border-foreground/30 shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                  >
                    Update
                  </button>
                  {subscription.subscription_status === 'active' && (
                    <button
                      onClick={() => handleCancelSubscription(subscription.subscription_id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}