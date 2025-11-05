'use client';

import Link from 'next/link';
import { Home, Monitor, CheckCircle, XCircle, CreditCard, Settings, HelpCircle, LogOut, User, FileText } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import type { Subscription } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarProps {
  subscriptions?: Subscription[];
}

const navigation = [
  { name: 'Account', href: '/account', icon: Home },
  { name: 'Subscription', href: '/account/subscription', icon: CreditCard },
  { name: 'Billing', href: '/account/billing', icon: FileText },
  { name: 'Settings', href: '/account/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

export function Sidebar({ subscriptions = [] }: SidebarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  // Safe check for subscriptions with default empty array
  const hasActive = subscriptions?.some(sub => sub.subscription_status === 'active') || false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!mounted) {
    return null;
  }

  const isLight = resolvedTheme === 'light';

  return (
    <div
      className={`w-64 min-h-screen flex flex-col transition-colors duration-300 ${
        isLight ? 'bg-white border-r border-gray-200 text-gray-900' : 'bg-gray-900 border-r border-gray-700 text-gray-100'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          SaaS Starter
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : isLight
                  ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}

        {/* Web App Access (if active subscription) */}
        {hasActive && (
          <Link
            href="/web-app"
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isLight
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-green-900/30 text-green-300 hover:bg-green-900/50'
            }`}
          >
            <Monitor className="w-5 h-5 mr-3" />
            Web App
          </Link>
        )}
      </nav>

      {/* Subscription Status */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div
          className={`rounded-md px-3 py-2 text-sm font-medium flex items-center ${
            hasActive
              ? isLight
                ? 'bg-green-100 text-green-800'
                : 'bg-green-900/30 text-green-300'
              : isLight
              ? 'bg-red-100 text-red-800'
              : 'bg-red-900/30 text-red-300'
          }`}
        >
          {hasActive ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Active Subscription
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              No Active Subscription
            </>
          )}
        </div>
      </div>

      {/* User section */}
      <div className="flex items-center p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">User Account</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">Manage your account</p>
        </div>
      </div>

      {/* Sign out button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSignOut}
          className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isLight
              ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );
}