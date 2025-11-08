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

        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('customer_id')
          .eq('email', user.email)
          .single();

        if (customerError) {
          if (customerError.code === 'PGRST116') {
            setSubscriptions([]);
            onSubscriptionChange?.(false);
            return;
          }
          throw customerError;
        }

        if (!customer) {
          setSubscriptions([]);
          onSubscriptionChange?.(false);
          return;
        }

        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('customer_id', customer.customer_id)
          .order('created_at', { ascending: false });

        if (subscriptionsError) throw subscriptionsError;

        const subs = subscriptionsData || [];
        setSubscriptions(subs);

        const hasActiveSubscription = subs.some(
          (sub) => sub.subscription_status === 'active' || sub.subscription_status === 'trialing',
        );
        
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

    const interval = setInterval(() => {
      fetchSubscriptions(false);
    }, 5000);
    
    const timeout = setTimeout(() => {
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
    const paddleCustomerPortalUrl = `https://sandbox-customer-portal.paddle.com/subscriptions`;
    window.open(paddleCustomerPortalUrl, '_blank');
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
      trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      canceled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
      past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      trialing: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
        </svg>
      ),
      canceled: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ),
      past_due: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      ),
    };
    return icons[status as keyof typeof icons] || null;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Subscriptions
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Getting your subscription information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">
              Unable to Load Subscriptions
            </h3>
          </div>
          <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => fetchSubscriptions(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeSubscription = subscriptions.find(
    sub => sub.subscription_status === 'active' || sub.subscription_status === 'trialing'
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Subscription Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your subscription details
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          type="button"
          onClick={() => fetchSubscriptions(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Status
        </button>
{/*  
        <button
          type="button"
          onClick={handleOpenCustomerPortal}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage in Paddle Portal
        </button> */}
      </div> 

      {subscriptions.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Active Subscription
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You don&apos;t have any active subscriptions. Upgrade to unlock premium features and enhance your experience.
          </p>
          <a
            href="/pricing"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            View Pricing Plans
          </a>
        </div>
      ) : (
        /* Subscription Cards */
        <div className="space-y-6">
          {activeSubscription && (
            /* Active Subscription Card */
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Active Plan
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You&apos;re currently subscribed to our premium service
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(activeSubscription.subscription_status)}`}>
                  {getStatusIcon(activeSubscription.subscription_status)}
                  <span className="ml-1.5 capitalize">{activeSubscription.subscription_status}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">
                    Subscription ID
                  </div>
                  <div className="font-mono text-gray-900 dark:text-gray-100 text-sm">
                    {activeSubscription.subscription_id}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">
                    Created
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {new Date(activeSubscription.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">
                    Last Updated
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {new Date(activeSubscription.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Subscriptions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Subscription History
            </h3>
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.subscription_id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <div className={`w-3 h-3 rounded-full ${
                        subscription.subscription_status === 'active' ? 'bg-green-400' :
                        subscription.subscription_status === 'trialing' ? 'bg-blue-400' :
                        subscription.subscription_status === 'canceled' ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {subscription.product_id || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {subscription.subscription_id}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.subscription_status)}`}>
                      {getStatusIcon(subscription.subscription_status)}
                      <span className="ml-1 capitalize">{subscription.subscription_status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Price ID:</span>{' '}
                      <span className="font-mono text-xs">{subscription.price_id || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(subscription.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {subscription.scheduled_change && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-700">
                      <div className="flex items-center text-amber-800 dark:text-amber-300">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Scheduled Change</span>
                      </div>
                      <p className="text-amber-700 dark:text-amber-200 text-sm mt-1">
                        {subscription.scheduled_change}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}