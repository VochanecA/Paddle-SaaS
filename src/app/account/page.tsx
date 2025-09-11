import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { PasswordChangeForm } from '@/components/PasswordChangeForm';
import { Suspense } from 'react';
import Link from 'next/link';
import { SubscriptionTable } from '@/components/SubscriptionTable';

// --- Interfaces ---
interface PaddleSubscription {
  id: string;
  status: string;
  customer_id: string;
  items?: Array<{
    price: {
      product_id: string;
      unit_price: {
        amount: string;
        currency_code: string;
      };
      description?: string;
    };
  }>;
}

interface PaddlePortalSession {
  data: {
    urls: {
      general: { overview: string };
      subscriptions: Array<{
        id: string;
        cancel_subscription?: string;
        update_subscription_payment_method?: string;
      }>;
    };
  };
}

interface PortalData {
  overview: string | null;
  subscriptions: Array<{
    id: string;
    cancel_subscription?: string;
    update_subscription_payment_method?: string;
    status?: string;
    plan_name?: string;
    price?: string;
  }>;
  activeCount: number;
}

// --- Function to generate Paddle portal link ---
async function generatePaddlePortalLink(customerId: string): Promise<PortalData> {
  try {
    const response = await fetch(
      `https://sandbox-api.paddle.com/subscriptions?customer_id=${customerId}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` },
      }
    );

    if (!response.ok) {
      console.error('Paddle API error (subscriptions):', await response.text());
      throw new Error(`Paddle API error: ${response.statusText}`);
    }

    const data = (await response.json()) as { data?: PaddleSubscription[] };
    const allSubscriptions = data.data ?? [];
    
    // COUNT active subscriptions separately
    const activeCount = allSubscriptions.filter(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    ).length;

    // But still use ALL subscriptions for portal session
    const subscriptionIds = allSubscriptions.map((s) => s.id);
    const requestBody =
      subscriptionIds.length > 0 ? { subscription_ids: subscriptionIds } : {};

    const portalResponse = await fetch(
      `https://sandbox-api.paddle.com/customers/${customerId}/portal-sessions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!portalResponse.ok) {
      console.error('Paddle API error (portal session):', await portalResponse.text());
      throw new Error(`Paddle API error: ${portalResponse.statusText}`);
    }

    const portalData = (await portalResponse.json()) as PaddlePortalSession;

    const subscriptionsWithStatus =
      portalData.data?.urls?.subscriptions.map((sub) => {
        const match = allSubscriptions.find((s) => s.id === sub.id);
        const firstItem = match?.items?.[0];
        const priceAmountRaw = firstItem?.price.unit_price.amount;
        const priceCurrency = firstItem?.price.unit_price.currency_code;
        const planName =
          firstItem?.price.description || `Product ${firstItem?.price.product_id}`;

        let formattedPrice: string | undefined;
        if (priceAmountRaw && priceCurrency) {
          const normalized = Number(priceAmountRaw) / 100;
          formattedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: priceCurrency,
            minimumFractionDigits: 2,
          }).format(normalized);
        }

        return {
          ...sub,
          status: match?.status ?? 'inactive',
          plan_name: planName,
          price: formattedPrice,
        };
      }) || [];

    return {
      overview: portalData.data?.urls?.general?.overview || null,
      subscriptions: subscriptionsWithStatus,
      activeCount,
    };
  } catch (error) {
    console.error('Error generating Paddle portal link:', error);
    return { overview: null, subscriptions: [], activeCount: 0 };
  }
}

interface AccountPageProps {
  searchParams: Promise<{ refresh?: string; checkout_success?: string }>;
}

// --- AccountPage Component ---
export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: customerData } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('email', user.email)
    .single();

  if (params.checkout_success) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const refreshKey = params.checkout_success || params.refresh || Date.now().toString();
  const shouldRevalidate = Boolean(params.checkout_success || params.refresh);

  const portalData = customerData?.customer_id
    ? await generatePaddlePortalLink(customerData.customer_id)
    : { overview: null, subscriptions: [], activeCount: 0 };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {params.checkout_success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Subscription activated successfully!
                </h3>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  Your account has been upgraded. You can now access all premium features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Account Overview
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your subscriptions, billing, and account settings
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Web App Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Web App</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Access our premium web application with your active subscription
            </p>
            <Link
              href="/web-app"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              Launch App
            </Link>
          </div>

          {/* Billing Portal Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Portal</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              Manage subscriptions, update payment methods, and view billing history
            </p>
            {portalData.overview ? (
              <a
                href={portalData.overview}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors"
              >
                Manage Billing
              </a>
            ) : (
              <p className="text-sm text-red-600 dark:text-red-400">
                Billing portal unavailable
              </p>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Account Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Email Address
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Member Since
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Active
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Customer ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">
                    {customerData?.customer_id || 'Not available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Security
              </h2>
              <PasswordChangeForm userEmail={user.email!} />
            </div>
          </div>

          {/* Right Column - Subscriptions */}
          <div className="lg:col-span-2 space-y-6">
            {/* All Subscriptions (including cancelled) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Subscriptions
                </h2>
                <div className="flex items-center space-x-2">
                  {portalData.activeCount > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {portalData.activeCount} active
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {portalData.subscriptions.length} total
                  </span>
                </div>
              </div>
              
              {/* Show ALL subscriptions including cancelled ones */}
              <SubscriptionTable 
                subscriptions={portalData.subscriptions} 
                rowsPerPage={5} 
              />
            </div>

            {/* Subscription Management */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Manage Subscriptions
              </h2>
              <Suspense
                fallback={
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                }
              >
                <SubscriptionManager
                  key={refreshKey}
                  user={user}
                  forceRefresh={shouldRevalidate}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';