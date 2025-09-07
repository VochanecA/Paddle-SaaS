// src/components/SubscriptionManager.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingSubscriptions, setCancelingSubscriptions] = useState<Set<string>>(
    () => new Set()
  );
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const supabase = useMemo(() => createClient(), []);

  // Log theme changes (kept intentionally lightweight)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Theme changed to:', resolvedTheme);
  }, [resolvedTheme]);

  const fetchSubscriptions = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        setError(null);

        // Get customer_id for this user
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('customer_id')
          .eq('email', user.email)
          .single();

        if (customerError) {
          // PostgREST "row not found" style error code may vary; handle gracefully
          // If it's a not-found code, treat as no subscriptions
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error customerError may have code
          if ((customerError as { code?: string }).code === 'PGRST116') {
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

        // Fetch subscriptions for that customer
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from<Subscription>('subscriptions')
          .select('*')
          .eq('customer_id', customer.customer_id)
          .order('created_at', { ascending: false });

        if (subscriptionsError) {
          throw subscriptionsError;
        }

        const subs = subscriptionsData ?? [];
        setSubscriptions(subs);

        const hasActiveSubscription = subs.some(
          (sub) =>
            // adapt to your DB field names (subscription_status vs status). Keep both checks just in case.
            (sub as unknown as Record<string, unknown>).subscription_status === 'active' ||
            (sub as unknown as Record<string, unknown>).subscription_status === 'trialing' ||
            // alternate property name
            (sub as unknown as Record<string, unknown>).status === 'active' ||
            (sub as unknown as Record<string, unknown>).status === 'trialing'
        );
        onSubscriptionChange?.(hasActiveSubscription);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching subscriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
        onSubscriptionChange?.(false);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [onSubscriptionChange, supabase, user.email]
  );

  // initial fetch
  useEffect(() => {
    void fetchSubscriptions();
  }, [fetchSubscriptions]);

  // short polling when forceRefresh true (every 5s for 30s)
  useEffect(() => {
    if (!forceRefresh) return undefined;

    const interval = setInterval(() => {
      void fetchSubscriptions(false);
    }, 5000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [forceRefresh, fetchSubscriptions]);

  // continuous polling every 30s (no loading indicator)
  useEffect(() => {
    const interval = setInterval(() => {
      void fetchSubscriptions(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchSubscriptions]);

  const handleCancelSubscription = useCallback(
    async (subscriptionId: string, immediate = false) => {
      // mark as canceling (create new Set to avoid mutating state)
      setCancelingSubscriptions((prev) => {
        const next = new Set(prev);
        next.add(subscriptionId);
        return next;
      });

      try {
        const response = await fetch('/api/subscriptions/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionId,
            action: 'cancel',
            immediate,
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            `${responseData.error || 'Failed to cancel subscription'} (Request ID: ${
              responseData.request_id ?? 'unknown'
            })`
          );
        }

        // eslint-disable-next-line no-console
        console.log('Subscription cancellation successful:', responseData);
        // refresh without loading spinner
        await fetchSubscriptions(false);
        setShowCancelModal(null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error canceling subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      } finally {
        setCancelingSubscriptions((prev) => {
          const next = new Set(prev);
          next.delete(subscriptionId);
          return next;
        });
      }
    },
    [fetchSubscriptions]
  );

  const handleUpdateSubscription = useCallback(async (subscriptionId: string) => {
    try {
      const response = await fetch('/api/subscriptions/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? 'Failed to get management URL');
      }

      if (data.managementUrl) {
        // open in a new tab/window
        window.open(data.managementUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error getting management URL:', err);
      setError(err instanceof Error ? err.message : 'Failed to get management URL');
    }
  }, []);

  const CancelModal = useCallback(
    ({ subscriptionId }: { subscriptionId: string }) => (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <h3 id="cancel-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cancel Subscription
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            When would you like to cancel your subscription?
          </p>

          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => void handleCancelSubscription(subscriptionId, false)}
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
              onClick={() => void handleCancelSubscription(subscriptionId, true)}
              disabled={cancelingSubscriptions.has(subscriptionId)}
              className="w-full text-left p-4 border border-red-200 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <div className="font-medium text-red-900 dark:text-red-300 mb-1">Cancel immediately</div>
              <div className="text-sm text-red-600 dark:text-red-400">Access will be revoked immediately</div>
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
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
    [cancelingSubscriptions, handleCancelSubscription]
  );

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h2>
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-3 flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                </div>
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Subscriptions</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Unable to load subscriptions</h3>
              <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
              <button
                type="button"
                onClick={() => void fetchSubscriptions(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Subscriptions</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your active subscriptions and billing</p>
          </div>
          <button
            type="button"
            onClick={() => void fetchSubscriptions(true)}
            className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-md transition-colors w-full sm:w-auto"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No subscriptions found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              You&apos;re not subscribed to any plans yet. Choose a plan to get started with our premium features.
            </p>
            <a href="/pricing" className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
              View Plans
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.subscription_id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                  {/* Title + ID */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">Subscription</div>
                    <span className="mt-1 sm:mt-0 text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded break-all">
                      #{subscription.subscription_id}
                    </span>
                  </div>

                  {/* Status badge (moves under on mobile) */}
                  <div className="mt-2 sm:mt-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider self-start sm:self-center ${
                        (subscription as unknown as Record<string, unknown>).subscription_status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : (subscription as unknown as Record<string, unknown>).subscription_status === 'trialing'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : (subscription as unknown as Record<string, unknown>).subscription_status === 'canceled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : (subscription as unknown as Record<string, unknown>).subscription_status === 'past_due'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {/* Show subscription_status if available, fallback to status or '-' */}
                      {(subscription as unknown as Record<string, unknown>).subscription_status ??
                        (subscription as unknown as Record<string, unknown>).status ??
                        '-'}
                    </span>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700 mb-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-5">
                  {((subscription as unknown) as Record<string, unknown>).price_id && (
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Price ID</div>
                      <div className="font-mono text-gray-900 dark:text-gray-100 text-sm bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded truncate">
                        {String((subscription as unknown as Record<string, unknown>).price_id)}
                      </div>
                    </div>
                  )}
                  {((subscription as unknown) as Record<string, unknown>).product_id && (
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Product ID</div>
                      <div className="font-mono text-gray-900 dark:text-gray-100 text-sm bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded truncate">
                        {String((subscription as unknown as Record<string, unknown>).product_id)}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Created</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {new Date(String((subscription as unknown as Record<string, unknown>).created_at)).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Updated</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {new Date(String((subscription as unknown as Record<string, unknown>).updated_at)).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {((subscription as unknown) as Record<string, unknown>).scheduled_change && (
                  <div className="mb-5">
                    <div className="flex items-start p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-700">
                      <div className="min-w-0">
                        <div className="text-amber-800 dark:text-amber-300 font-medium text-sm mb-1">Scheduled Change</div>
                        <p className="text-amber-700 dark:text-amber-200 text-sm">
                          {String((subscription as unknown as Record<string, unknown>).scheduled_change)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                  <button
                    type="button"
                    onClick={() => void handleUpdateSubscription(subscription.subscription_id)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-md transition-colors w-full sm:w-auto"
                  >
                    Update
                  </button>

                  {(
                    (subscription as unknown as Record<string, unknown>).subscription_status === 'active' ||
                    (subscription as unknown as Record<string, unknown>).subscription_status === 'trialing'
                  ) && (
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(subscription.subscription_id)}
                      disabled={cancelingSubscriptions.has(subscription.subscription_id)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors w-full sm:w-auto"
                    >
                      {cancelingSubscriptions.has(subscription.subscription_id) ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
      </div>

      {showCancelModal && <CancelModal subscriptionId={showCancelModal} />}
    </>
  );
}