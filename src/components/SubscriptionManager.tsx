'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

// Type-safe definition of subscription row
interface Subscription {
  subscription_id: string;
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAST_DUE' | 'TRIALING'; // extend as needed
  user_id: string;
  created_at: string;
}

export default function SubscriptionDetails() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('subscription_id');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!subscriptionId) return;

    const fetchSubscription = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from<Subscription>('subscriptions')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error.message);
        setSubscription(null);
      } else {
        setSubscription(data);
      }
      setLoading(false);
    };

    void fetchSubscription();
  }, [subscriptionId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600 dark:text-gray-300">
        Loading subscription details...
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-4 text-center text-red-600 dark:text-red-400">
        Subscription not found.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg max-w-lg mx-auto">
      {/* Header with title, subscription ID, and status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            Subscription
          </div>
          <span className="mt-1 sm:mt-0 text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded break-all">
            #{subscription.subscription_id}
          </span>
        </div>

        {/* Status badge */}
        <div className="mt-2 sm:mt-0">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              subscription.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : subscription.status === 'CANCELED'
                ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                : subscription.status === 'TRIALING'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            {subscription.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            User ID:
          </span>{' '}
          <span className="text-gray-600 dark:text-gray-400 break-all">
            {subscription.user_id}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Created At:
          </span>{' '}
          <span className="text-gray-600 dark:text-gray-400">
            {new Date(subscription.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}