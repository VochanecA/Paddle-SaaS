import { cookies } from 'next/headers';
import AccountPageClient from '@/components/AccountPageClient';
import { createClient } from '@/lib/supabase/server';
import { getCustomerSubscriptions } from '@/lib/paddle';

export default async function AccountPage() {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in to view your account.</div>;
  }

  const { data: customerData } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('email', user.email)
    .single();

  const subscriptions = customerData?.customer_id
    ? (await getCustomerSubscriptions(customerData.customer_id))
    : [];

  return (
    <AccountPageClient
      user={{ email: user.email, created_at: user.created_at }}
      customerId={customerData?.customer_id}
      subscriptions={subscriptions}
    />
  );
}
