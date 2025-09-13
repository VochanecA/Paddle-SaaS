import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { Suspense } from 'react';
import Link from 'next/link';
import { SubscriptionTable } from '@/components/SubscriptionTable';
import PasswordChangeForm from '@/components/PasswordChangeForm';

// --- Interfaces (unchanged) ---
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
    const subscriptions = data.data ?? [];

    const subscriptionIds = subscriptions.map((s) => s.id);
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
        const match = subscriptions.find((s) => s.id === sub.id);
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
    };
  } catch (error) {
    console.error('Error generating Paddle portal link:', error);
    return { overview: null, subscriptions: [] };
  }
}

interface AccountPageProps {
  searchParams: Promise<{ refresh?: string; checkout_success?: string }>;
}

// --- AccountPage Component ---
export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;

  const supabase = createClient(cookies());
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
    : { overview: null, subscriptions: [] };

  return (
    <div className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Success Message */}
        {params.checkout_success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Subscription activated successfully!
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-400">Account Overview</h1>
          <p className="text-gray-800 dark:text-gray-300">
            Manage your subscriptions, billing, and account security
          </p>
        </div>

        {/* Web App Access */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Web App Access
          </h3>
          <p className="text-gray-800 dark:text-gray-300 mb-4">
            Once you have an active subscription, you can access our web application.
          </p>
          <Link
            href="/web-app"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200"
          >
            Access Web App
          </Link>
        </div>

        {/* Account Information and Security Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Account Details Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg 
                className="h-5 w-5 text-gray-600 dark:text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account Information
              </h2>
            </div>
            
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
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Account Status
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-300">
                  Active
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Customer ID
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {customerData?.customer_id || 'Not available'}
                </p>
              </div>
            </div>
          </div>

          {/* Security Settings Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg 
                className="h-5 w-5 text-gray-600 dark:text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Security Settings
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Keep your account secure by updating your password regularly.
            </p>
            
            <PasswordChangeForm />
          </div>
        </div>

        {/* Billing Management Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <svg 
              className="h-5 w-5 text-gray-600 dark:text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Billing Management
            </h2>
          </div>

          {/* Paddle Customer Portal Button + Subscriptions */}
          {portalData.overview ? (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Manage your billing information, payment methods, and subscription details.
              </p>
              <a
                href={portalData.overview}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Manage Billing in Paddle
              </a>

              {portalData.subscriptions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Active Subscriptions
                  </h3>
                  <SubscriptionTable subscriptions={portalData.subscriptions} rowsPerPage={5} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400">
                Unable to load billing portal. Please ensure your account is set up or contact support.
              </p>
            </div>
          )}
        </div>

        {/* Subscription Management */}
        <div className="space-y-6">
          <Suspense
            fallback={
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3" />
                  </div>
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
  );
}

export const dynamic = 'force-dynamic';