// src/app/account/billing/page.tsx
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SubscriptionTable } from '@/components/SubscriptionTable';
import { 
  CreditCard, 
  ExternalLink, 
  AlertCircle,
  Home,
  Shield,
  Settings,
  ArrowLeft
} from 'lucide-react';

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

// --- Custom Components ---
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-medium text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

function Alert({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'destructive' | 'success'; 
  className?: string;
}) {
  const variants = {
    default: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    destructive: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-300',
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-800 dark:text-green-300',
  };
  
  return (
    <div className={`p-4 rounded-lg border ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

function AlertTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h4 className={`font-medium mb-1 ${className}`}>
      {children}
    </h4>
  );
}

function AlertDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
}

export default async function BillingPage() {
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
    
  const portalData = customerData?.customer_id
    ? await generatePaddlePortalLink(customerData.customer_id)
    : { overview: null, subscriptions: [] };

  // Sidebar navigation items
  const navigationItems = [
    {
      name: 'Overview',
      href: '/account',
      icon: Home,
      description: 'Account overview and information',
      current: false
    },
    {
      name: 'Billing',
      href: '/account/billing',
      icon: CreditCard,
      description: 'Billing and payment methods',
      current: true
    },
    {
      name: 'Security',
      href: '/account/security',
      icon: Shield,
      description: 'Security settings and password',
      current: false
    },
    {
      name: 'Subscriptions',
      href: '/account/subscriptions',
      icon: Settings,
      description: 'Manage your subscriptions',
      current: false
    },
    {
      name: 'Web App',
      href: '/web-app',
      icon: ExternalLink,
      description: 'Access the web application',
      current: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/account"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Overview
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Billing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your payment methods, billing information, and invoices.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isExternal = item.href.startsWith('http') || item.name === 'Web App';
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg border transition-colors group ${
                      item.current 
                        ? 'bg-white border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white' 
                        : 'border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm dark:hover:bg-gray-800 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      item.current 
                        ? 'text-gray-700 dark:text-gray-300' 
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {item.name}
                        {isExternal && <ExternalLink className="h-3 w-3" />}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  Billing Management
                </CardTitle>
                <CardDescription>
                  Manage your payment methods, billing information, and invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {portalData.overview ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Manage your billing information, payment methods, and subscription details.
                        </p>
                      </div>
                      <a
                        href={portalData.overview}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Manage Billing
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </div>
                    
                    {portalData.subscriptions.length > 0 && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Subscriptions</h3>
                          <SubscriptionTable subscriptions={portalData.subscriptions} rowsPerPage={5} />
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Billing Portal Unavailable</AlertTitle>
                    <AlertDescription>
                      Unable to load billing portal. Please ensure your account is set up or contact support.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';