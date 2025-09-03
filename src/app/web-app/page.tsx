import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function checkSubscriptionStatus(userEmail: string) {
  const supabase = createClient(cookies());
  
  try {
    // Find customer by email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', userEmail)
      .single();

    if (customerError || !customer) {
      return false; // No customer found
    }

    // Check for active subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('subscription_status')
      .eq('customer_id', customer.customer_id)
      .in('subscription_status', ['active', 'trialing']);

    if (subscriptionsError) {
      console.error('Error checking subscriptions:', subscriptionsError);
      return false;
    }

    return subscriptions && subscriptions.length > 0;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

export default async function WebAppPage() {
  const supabase = createClient(cookies());
  
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  // Redirect to login if not authenticated
  if (!user) {
    redirect('/auth/login');
  }

  // Check subscription status
  const hasActiveSubscription = await checkSubscriptionStatus(user.email!);
  
  // Redirect to account page if no active subscription
  if (!hasActiveSubscription) {
    redirect('/account?message=subscription_required');
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Header */}
      <header className="bg-background-alt border-b border-foreground/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/account" className="text-2xl font-bold text-accent">
                SaaS Starter
              </Link>
              <span className="ml-4 text-foreground/60">Web App</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-foreground/60">Welcome, {user.email}</span>
              <Link
                href="/account"
                className="inline-flex items-center px-3 py-2 border border-foreground/30 text-sm font-medium rounded-md text-foreground bg-background hover:bg-foreground/10 transition-colors"
              >
                Account
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-accent/10 to-accent-alt/10 rounded-lg p-8 mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to Your Web App! 🎉
            </h1>
            <p className="text-xl text-foreground/80 mb-4">
              You have successfully accessed the premium web application.
            </p>
            <div className="flex items-center space-x-2 text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Subscription Active</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Feature 1 */}
          <div className="bg-background-alt rounded-lg p-6 border border-foreground/20 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground ml-3">Analytics Dashboard</h3>
            </div>
            <p className="text-foreground/60">
              View detailed analytics and insights about your data with interactive charts and reports.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-background-alt rounded-lg p-6 border border-foreground/20 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground ml-3">Advanced Settings</h3>
            </div>
            <p className="text-foreground/60">
              Configure advanced settings and customize your experience with premium options.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-background-alt rounded-lg p-6 border border-foreground/20 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground ml-3">Premium Tools</h3>
            </div>
            <p className="text-foreground/60">
              Access exclusive premium tools and features available only to subscribed users.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-background-alt rounded-lg border border-foreground/20 shadow-sm">
          <div className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Your Web App is Ready!
              </h2>
              <p className="text-foreground/60 mb-6">
                This is your premium web application. Start building amazing things with all the features available to you as a subscriber.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="inline-flex items-center px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent-alt transition-colors">
                  Get Started
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button className="inline-flex items-center px-6 py-3 border border-foreground/30 text-foreground font-medium rounded-md hover:bg-foreground/10 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Pro Tip</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  Make sure to explore all the premium features available to you. You can always return to your{' '}
                  <Link href="/account" className="font-medium underline hover:text-blue-600 dark:hover:text-blue-300">
                    account page
                  </Link>
                  {' '}to manage your subscription or access billing information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}