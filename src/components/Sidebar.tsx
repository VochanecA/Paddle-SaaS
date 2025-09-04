'use client';

import Link from 'next/link';
import { Home, Monitor, CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import type { Subscription } from '@/lib/types';

interface SidebarProps {
  subscriptions: Subscription[];
}

export function Sidebar({ subscriptions }: SidebarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const hasActive = subscriptions.some(sub => sub.subscription_status === 'active');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render nothing or a very minimal fallback UI during server-side render/hydration
    return null;
  }

  return (
    <div
      className={`w-64 min-h-screen p-6 flex flex-col justify-between transition-colors duration-300 shadow-lg ${
        resolvedTheme === 'dark' ? 'bg-gray-900 text-cyan-50' : 'bg-white text-gray-900'
      }`}
    >
      {/* Navigation */}
      <div>
        <h2
          className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
            resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          Navigation
        </h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href="/account"
                className={`flex items-center p-2 rounded transition-colors duration-300 ${
                  resolvedTheme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                }`}
              >
                <Home
                  className={`w-5 h-5 mr-2 transition-colors duration-300 ${
                    resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                />
                Account
              </Link>
            </li>

            {hasActive && (
              <li>
                <Link
                  href="/web-app"
                  className={`flex items-center p-2 rounded transition-colors duration-300 ${
                    resolvedTheme === 'dark'
                      ? 'bg-green-900 text-green-200 hover:bg-gray-800'
                      : 'bg-green-100 text-green-950 hover:bg-gray-200'
                  }`}
                >
                  <Monitor
                    className={`w-5 h-5 mr-2 transition-colors duration-300 ${
                      resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  />
                  Web App
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
      
      {/* Subscription Status */}
      <div
        className={`mt-6 transition-colors duration-300 rounded px-3 py-2 text-sm font-medium w-max flex items-center ${
          hasActive
            ? resolvedTheme === 'dark'
              ? 'bg-green-900 text-green-200'
              : 'bg-green-100 text-green-800'
            : resolvedTheme === 'dark'
            ? 'bg-red-900 text-red-200'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {hasActive ? (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            Active Subscription
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-1" />
            No Active Subscription
          </>
        )}
      </div>
    </div>
  );
}
