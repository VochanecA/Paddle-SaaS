'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SubscriptionCard } from './SubscriptionCard';
import type { Subscription } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

interface SubscriptionManagerProps {
  user: User;
}

export function SubscriptionManager({ user }: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  const fetchSubscriptions = async () => {
    try {
      // Get customer record
      const { data: customer } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('email', user.email!)
        .single();

      if (!customer) {
        setSubscriptions([]);
        return;
      }

      // Get subscriptions for this customer
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('customer_id', customer.customer_id)
        .order('created_at', { ascending: false });

      if (subs) {
        setSubscriptions(subs);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user.email]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Subscriptions</h2>
        {subscriptions.length === 0 && (
          <a 
            href="/pricing" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Browse Plans
          </a>
        )}
      </div>
      
      {subscriptions.length > 0 ? (
        <div className="space-y-4">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.subscription_id}
              subscription={subscription}
              onUpdate={fetchSubscriptions}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions yet</h3>
          <p className="text-gray-500 mb-6">Get started with one of our plans</p>
          <a 
            href="/pricing" 
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium inline-block"
          >
            View Pricing Plans
          </a>
        </div>
      )}
    </div>
  );
}