// src/app/account/page.tsx
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { Suspense } from 'react';
import Link from 'next/link';
import { SubscriptionTable } from '@/components/SubscriptionTable';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import { 
  User, 
  Shield, 
  CreditCard, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Mail,
  Key
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

interface AccountPageProps {
  searchParams: Promise<{ refresh?: string; checkout_success?: string }>;
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

function Badge({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'secondary' | 'destructive'; 
  className?: string;
}) {
  const variants = {
    default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
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

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
  );
}

function Tabs({ children, defaultValue, className = '' }: { 
  children: React.ReactNode; 
  defaultValue: string; 
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`} data-tabs={defaultValue}>
      {children}
    </div>
  );
}

function TabsList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </div>
  );
}

function TabsTrigger({ children, value, className = '' }: { 
  children: React.ReactNode; 
  value: string; 
  className?: string;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow-sm dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50 ${className}`}
      data-value={value}
    >
      {children}
    </button>
  );
}

function TabsContent({ children, value, className = '' }: { 
  children: React.ReactNode; 
  value: string; 
  className?: string;
}) {
  return (
    <div 
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300 ${className}`}
      data-value={value}
    >
      {children}
    </div>
  );
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
    <div className="container py-8 max-w-6xl mx-auto px-4">
      {/* Success Message */}
      {params.checkout_success && (
        <Alert variant="success" className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Subscription activated!</AlertTitle>
          <AlertDescription>
            Your subscription has been successfully activated. You can now access all premium features.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Account</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account settings, subscriptions, and security preferences.
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</p>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Status</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer ID</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white">
                    {customerData?.customer_id || 'Not available'}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Web App Access Card */}
            <Card>
              <CardHeader>
                <CardTitle>Web App Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Access our web application with your active subscription.
                </p>
                <Link
                  href="/web-app"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full"
                >
                  Access Web App
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
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
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your password and security preferences to keep your account safe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                View and manage your active subscriptions and plans.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const dynamic = 'force-dynamic';