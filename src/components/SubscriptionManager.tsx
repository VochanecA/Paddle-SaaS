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
  const [cancelingSubscriptions, setCancelingSubscriptions] = useState<Set<string>>(new Set());
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const supabase = createClient();

  // log theme changes
  useEffect(() => {
    console.log('Theme changed to:', resolvedTheme);
  }, [resolvedTheme]);

  const fetchSubscriptions = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        setError(null);

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

    const interval = setInterval(() => fetchSubscriptions(false), 5000);
    const timeout = setTimeout(() => clearInterval(interval), 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [forceRefresh, fetchSubscriptions]);

  // continuous polling
  useEffect(() => {
    const interval = setInterval(() => fetchSubscriptions(false), 30000);
    return () => clearInterval(interval);
  }, [fetchSubscriptions]);

  const handleCancelSubscription = useCallback(
    async (subscriptionId: string, immediate = false) => {
      console.log('Canceling subscription:', { subscriptionId, immediate });
      setCancelingSubscriptions((prev) => new Set(prev.add(subscriptionId)));

      try {
        const response = await fetch('/api/subscriptions/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId, action: 'cancel', immediate }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            `${responseData.error || 'Failed to cancel subscription'} (Request ID: ${
              responseData.request_id || 'unknown'
            })`,
          );
        }

        console.log('Subscription cancellation successful:', responseData);
        await fetchSubscriptions(false);
        setShowCancelModal(null);
      } catch (err) {
        console.error('Error canceling subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      } finally {
        setCancelingSubscriptions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(subscriptionId);
          return newSet;
        });
      }
    },
    [fetchSubscriptions],
  );

  const handleUpdateSubscription = useCallback(async (subscriptionId: string) => {
    try {
      const response = await fetch('/api/subscriptions/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get management URL');
      }

      const result = await response.json();
      if (result.managementUrl) {
        window.open(result.managementUrl, '_blank');
      }
    } catch (err) {
      console.error('Error getting management URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to get management URL');
    }
  }, []);

  const CancelModal = useCallback(
    ({ subscriptionId }: { subscriptionId: string }) => (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Cancel Subscription
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            When would you like to cancel your subscription?
          </p>

          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleCancelSubscription(subscriptionId, false)}
              disabled={cancelingSubscriptions.has(subscriptionId)}
              className="w-full text-left p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                At the end of current billing period
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                You&apos;ll retain access until your next billing date
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCancelSubscription(subscriptionId, true)}
              disabled={cancelingSubscriptions.has(subscriptionId)}
              className="w-full text-left p-4 border border-red-200 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <div className="font-medium text-red-900 dark:text-red-300 mb-1">
                Cancel immediately
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">
                Access will be revoked immediately
              </div>
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowCancelModal(null)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Keep Subscription
            </button>
          </div>

          {cancelingSubscriptions.has(subscriptionId) && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing cancellation...
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    [cancelingSubscriptions, handleCancelSubscription],
  );

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
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage your active subscriptions and billing
      </p>

      <button
        type="button"
        onClick={() => fetchSubscriptions(true)}
        className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors w-full sm:w-auto"
      >
        Refresh
      </button>

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
        <div className="space-y-4 mt-4">
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

              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => handleUpdateSubscription(subscription.subscription_id)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-md transition-colors w-full sm:w-auto"
                >
                  Update
                </button>
                {(subscription.subscription_status === 'active' ||
                  subscription.subscription_status === 'trialing') && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(subscription.subscription_id)}
                    disabled={cancelingSubscriptions.has(subscription.subscription_id)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors w-full sm:w-auto"
                  >
                    {cancelingSubscriptions.has(subscription.subscription_id) ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Canceling...
                      </>
                    ) : (
                      'Cancel'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCancelModal && <CancelModal subscriptionId={showCancelModal} />}
    </>
  );