import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AIChat from '@/components/AIChat';

async function checkSubscriptionStatus(userEmail: string) {
  const supabase = createClient(cookies());

  try {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', userEmail)
      .single();

    if (customerError || !customer) {
      return false;
    }

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

  if (!user) {
    redirect('/auth/login');
  }

  const hasActiveSubscription = await checkSubscriptionStatus(user.email!);

  if (!hasActiveSubscription) {
    redirect('/account?message=subscription_required');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Modern Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20">
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/account" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SaaS AI
              </Link>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">AI Chat Active</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-1">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <Link
                href="/account"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account
              </Link>
            </div>
          </div>
        </div> */}
      </header>

      {/* Main Content - AI Chat Focused */}
      <main className="relative">
        {/* Hero Section with AI Chat */}
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
            {/* Main AI Chat Container */}
            <div className="max-w-4xl mx-auto">
      <div className="p-6 flex flex-col h-[calc(100vh-12rem)]">
                  <AIChat className="w-full flex-1" userId={user.id} />
                </div>
            </div>
          </div>
        </div>

        {/* Quick Features Section */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Powered by Advanced AI
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Your premium subscription unlocks the full potential of our AI assistant
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-600 dark:text-gray-400">Get instant responses with our optimized AI engine</p>
              </div>

              <div className="group text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Smart & Intuitive</h3>
                <p className="text-gray-600 dark:text-gray-400">Context-aware conversations that understand your needs</p>
              </div>

              <div className="group text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure & Private</h3>
                <p className="text-gray-600 dark:text-gray-400">Your conversations are encrypted and completely private</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tip Section */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/50 dark:via-indigo-950/50 dark:to-purple-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    💡 Pro Tips for Better AI Conversations
                  </h3>
                  <div className="text-gray-600 dark:text-gray-300 space-y-2">
                    <p>• Be specific with your questions for more accurate responses</p>
                    <p>• Ask follow-up questions to dive deeper into topics</p>
                    <p>• Use the AI for brainstorming, analysis, coding help, and creative tasks</p>
                    <p>
                      • Need help with your account? Visit your{' '}
                      <Link href="/account" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline">
                        account page
                      </Link>
                      {' '}anytime
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}