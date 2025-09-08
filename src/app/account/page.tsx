import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { Suspense } from 'react';
import Link from 'next/link';
import { SubscriptionTable } from '@/components/SubscriptionTable';

// Interface for Paddle subscription
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
      description?: string; // plan/price description
    };
  }>;
}

// Interface for Paddle portal session response
interface PaddlePortalSession {
  data: {
    urls: {
      general: {
        overview: string;
      };
      subscriptions: Array<{
        id: string;
        cancel_subscription?: string;
        update_subscription_payment_method?: string;
      }>;
    };
  };
}

// Interface for portal data
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

// Function to generate Paddle customer portal session with subscription deep links
async function generatePaddlePortalLink(customerId: string): Promise<PortalData> {
  try {
    // Get subscriptions with status + items
    const response = await fetch(
      `https://sandbox-api.paddle.com/subscriptions?customer_id=${customerId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Paddle API response (subscriptions):', errorText);
      throw new Error(`Paddle API error: ${response.statusText}`);
    }

    const data = (await response.json()) as { data?: PaddleSubscription[] };
    const subscriptions = data.data ?? [];

    // Extract subscription IDs
    const subscriptionIds = subscriptions.map((sub) => sub.id);

    // Request portal session
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
      const errorText = await portalResponse.text();
      console.error('Paddle API response (portal session):', errorText);
      throw new Error(`Paddle API error: ${portalResponse.statusText}`);
    }

    const portalData = (await portalResponse.json()) as PaddlePortalSession;

    // Merge status + plan name + price into subscriptions
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
      const normalized = Number(priceAmountRaw) / 100; // cents → major unit
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
  searchParams: Promise<{
    refresh?: string;
    checkout_success?: string;
  }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;

  const supabase = createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch customer data
  const { data: customerData } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('email', user.email)
    .single();

  // Handle checkout refresh
  if (params.checkout_success) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const refreshKey =
    params.checkout_success || params.refresh || Date.now().toString();
  const shouldRevalidate = Boolean(params.checkout_success || params.refresh);

  // Generate Paddle portal links
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
                <svg
                  className="h-5 w-5 text-green-500 dark:text-indigo-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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
          <h1 className="text-3xl font-bold text-blue-400 dark:text-blue-400">
            Account Overview
          </h1>
          <p className="text-gray-800 dark:text-gray-300">
            Manage your subscriptions, billing, and payment history
          </p>
        </div>

        {/* Account Details Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Email Address
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {user.email}
              </p>
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-gray-700 dark:text-indigo-400">
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

          {/* Paddle Customer Portal Button + Subscriptions */}
          {portalData.overview ? (
            <div className="mt-6">
              <a
                href={portalData.overview}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                Manage Billing in Paddle
              </a>

              {/* Subscription Table */}
              {portalData.subscriptions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Subscriptions
                  </h3>
                  <SubscriptionTable
                    subscriptions={portalData.subscriptions}
                    rowsPerPage={5}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="mt-6 text-sm text-red-600 dark:text-red-400">
              Unable to load billing portal. Please ensure your account is set up
              or contact support.
            </p>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

          {/* Web App Access */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Web App Access
              </h3>
              <p className="text-gray-800 dark:text-gray-300 mb-4">
                Once you have an active subscription, you can access our web
                application.
              </p>
              <Link
                href="/web-app"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                Access Web App
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
