'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Subscription } from '@/lib/types';
import { redirect } from 'next/navigation';

interface WebAppWrapperProps {
  user: User;
}

export function WebAppWrapper({ user }: WebAppWrapperProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data: customer } = await supabase
          .from('customers')
          .select('customer_id')
          .eq('email', user.email)
          .single();

        if (!customer) {
          redirect('/account');
          return;
        }

        const { data: subs } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('customer_id', customer.customer_id)
          .order('created_at', { ascending: false });

        if (!subs?.some((s) => s.subscription_status === 'active')) {
          redirect('/account');
          return;
        }

        setSubscriptions(subs);
      } catch (err) {
        console.error(err);
        redirect('/account');
      }
    };

    fetchSubscriptions();
  }, [user.email, supabase]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar subscriptions={subscriptions} />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Web Application</h1>
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Your Web App</h2>
          <p className="text-gray-600">
            Accessible only with an active subscription.
          </p>
        </div>
      </div>
    </div>
  );
}
