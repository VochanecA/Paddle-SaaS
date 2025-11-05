'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Server, Database, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Status {
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'loading';
  lastChecked: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  details: string[];
}

export default function StatusPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [statuses, setStatuses] = useState<Status[]>([
    {
      name: 'Next.js Frontend',
      status: 'operational',
      lastChecked: new Date().toISOString(),
      icon: Server,
      details: ['Client09-11-2025', 'Client-side rendering operational', 'Page load successful']
    },
    {
      name: 'Vercel Hosting',
      status: 'loading',
      lastChecked: new Date().toISOString(),
      icon: Server,
      details: ['Awaiting status check', 'Contact Vercel for real-time status']
    },
    {
      name: 'Supabase Database',
      status: 'loading',
      lastChecked: new Date().toISOString(),
      icon: Database,
      details: ['Fetching status from Supabase', 'Check status.supabase.com for details']
    }
  ]);

  useEffect(() => {
    setMounted(true);

    // Mock fetching Supabase status (replace with real API if available)
    const fetchSupabaseStatus = async () => {
      try {
        // Placeholder: Supabase status API or status page data
        // For real implementation, use: https://status.supabase.com/api/v2/status.json
        const response = await fetch('https://status.supabase.com/api/v2/status.json');
        const data = await response.json();
        const supabaseStatus = data.status.indicator === 'none' ? 'operational' : 'degraded';

        setStatuses((prev) =>
          prev.map((status) =>
            status.name === 'Supabase Database'
              ? {
                  ...status,
                  status: supabaseStatus,
                  lastChecked: new Date().toISOString(),
                  details: [
                    `Status: ${supabaseStatus}`,
                    'Last checked: ' + new Date().toLocaleString()
                  ]
                }
              : status
          )
        );
      } catch (error) {
        setStatuses((prev) =>
          prev.map((status) =>
            status.name === 'Supabase Database'
              ? {
                  ...status,
                  status: 'down',
                  details: ['Failed to fetch status', 'Check status.supabase.com']
                }
              : status
          )
        );
      }
    };

    // Mock Vercel status (replace with real API if available)
    const fetchVercelStatus = () => {
      // Vercel does not provide a public status API; using placeholder
      setStatuses((prev) =>
        prev.map((status) =>
          status.name === 'Vercel Hosting'
            ? {
                ...status,
                status: 'operational',
                lastChecked: new Date().toISOString(),
                details: [
                  'Hosting operational (mock data)',
                  'Contact Vercel support for real-time status'
                ]
              }
            : status
        )
      );
    };

    fetchSupabaseStatus();
    fetchVercelStatus();
  }, []);

  if (!mounted) {
    return null;
  }

  const isLight = resolvedTheme === 'light';

  return (
    <div className={`min-h-screen py-12 transition-colors duration-300 ${isLight ? 'bg-white' : 'bg-gradient-to-b from-gray-900 to-gray-800'}`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Server className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4 transition-colors duration-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            System Status
          </h1>
          <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Monitor the health of our services, powered by Next.js, Vercel, and Supabase.
          </p>
          <p className={`text-sm mt-2 transition-colors duration-300 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>

        {/* Status Grid */}
        <div className="space-y-8 mb-16">
          {statuses.map((status) => {
            const IconComponent = status.icon;
            const statusColor =
              status.status === 'operational'
                ? 'text-green-500'
                : status.status === 'degraded'
                ? 'text-yellow-500'
                : status.status === 'down'
                ? 'text-red-500'
                : 'text-gray-500';

            return (
              <div
                key={status.name}
                className={`rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
                  isLight
                    ? 'bg-white border border-gray-200 shadow-md hover:shadow-lg'
                    : 'bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <div className="flex items-start mb-4">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                    <IconComponent size={20} />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-xl font-semibold transition-colors duration-300 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        {status.name}
                      </h3>
                      <span className={`text-sm font-medium ${statusColor}`}>
                        {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                      </span>
                    </div>
                    <p className={`mt-1 transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      Last checked: {new Date(status.lastChecked).toLocaleString()}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 ml-8">
                  {status.details.map((detail, i) => (
                    <li
                      key={i}
                      className={`flex items-start transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}
                    >
                      <span className={`mr-2 ${statusColor}`}>
                        {status.status === 'operational' ? (
                          <CheckCircle size={16} />
                        ) : (
                          <AlertTriangle size={16} />
                        )}
                      </span>
                      <span className="text-sm">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className={`rounded-2xl p-8 text-center transition-colors duration-300 ${isLight ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-blue-900/30 to-purple-900/30'}`}>
          <h2 className="text-2xl font-bold mb-4 transition-colors duration-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Have Questions About System Status?
          </h2>
          <p className={`mb-6 max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Reach out to our support team or check external status pages for more details.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://status.supabase.com"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Supabase Status
            </a>
            <a
              href="/support"
              className={`px-6 py-3 rounded-lg font-medium border transition-colors ${isLight ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}`}
            >
              Contact Our Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}