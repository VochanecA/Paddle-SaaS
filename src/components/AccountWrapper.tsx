'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from './Sidebar';
import { SubscriptionManager } from './SubscriptionManager';
import type { User } from '@supabase/supabase-js';
import type { Subscription } from '@/lib/types';
import { redirect } from 'next/navigation';
import { ThemeProvider } from 'next-themes';

interface AccountWrapperProps {
  user: User;
  rawSearchParams?: Record<string, string | undefined>;
}

export function AccountWrapper({ user, rawSearchParams }: AccountWrapperProps) {
  const searchParams = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [forceRefresh, setForceRefresh] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkoutSuccess = searchParams?.get('checkout_success') ?? rawSearchParams?.checkout_success;
    const refresh = searchParams?.get('refresh') ?? rawSearchParams?.refresh;
    setForceRefresh(!!(checkoutSuccess || refresh));
  }, [searchParams, rawSearchParams]);

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

        setSubscriptions(subs || []);
      } catch (err) {
        console.error('AccountWrapper: Error fetching subscriptions', err);
      }
    };

    fetchSubscriptions();
  }, [user.email, supabase]);

  return (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
<div className="flex min-h-screen bg-gray-50 dark:bg-transparent p-0 box-border">
  <Sidebar subscriptions={subscriptions} />
  <div className="flex-1 py-8 px-2 max-w-full bg-white dark:bg-gray-900">
    <SubscriptionManager user={user} forceRefresh={forceRefresh} />
  </div>
</div>

</ThemeProvider>

  );
}
