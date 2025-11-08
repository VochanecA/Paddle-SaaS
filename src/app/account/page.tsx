// src/app/account/page.tsx
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SubscriptionTable } from '@/components/SubscriptionTable';
import { 
  User, 
  Shield, 
  CreditCard, 
  ExternalLink, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Home,
  Settings
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
      current: true
    },
    {
      name: 'Billing',
      href: '/account/billing',
      icon: CreditCard,
      description: 'Billing and payment methods',
      current: false
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Account</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account settings, subscriptions, and security preferences.
          </p>
        </div>

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

          {/* Main Content Area - Only Account Overview */}
          <div className="flex-1 min-w-0">
            <div className="space-y-6">
              {/* Overview Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    Account Overview
                  </CardTitle>
                  <CardDescription>
                    Your account information and quick access to other sections
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                    
                    {/* Quick Actions Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                          Quickly navigate to other account sections
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <Link
                            href="/account/billing"
                            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Billing & Payments</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Manage payment methods and invoices</p>
                            </div>
                          </Link>

                          <Link
                            href="/account/security"
                            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Shield className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Security Settings</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Update password and security</p>
                            </div>
                          </Link>

                          <Link
                            href="/account/subscriptions"
                            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <Settings className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Subscriptions</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your subscriptions</p>
                            </div>
                          </Link>

                          <Link
                            href="/web-app"
                            className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            <ExternalLink className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Web App</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Access the application</p>
                            </div>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Active Subscriptions Preview */}
              {portalData.subscriptions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Active Subscriptions</CardTitle>
                    <CardDescription>
                      Your current subscription plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubscriptionTable subscriptions={portalData.subscriptions} rowsPerPage={3} />
                    <div className="mt-4 flex justify-end">
                      <Link
                        href="/account/subscriptions"
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View all subscriptions →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';