'use client';

import { useState, useCallback } from 'react';
import { openCheckout } from '@/lib/paddle';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  priceId: string;
  popular?: boolean;
}

interface CustomerData {
  customer_id?: string;
}

export function PricingCard({ title, price, features, priceId, popular }: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/auth/signup';
        return;
      }

      // Get customer ID from database
      const { data: customer } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('email', user.email)
        .single() as { data: CustomerData | null };

      await openCheckout(priceId, user.email!, customer?.customer_id);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  }, [priceId]);

  return (
    <div className={`
      relative p-8 rounded-2xl border h-full flex flex-col transition-all duration-300 
      transform hover:-translate-y-1 hover:shadow-2xl
      ${popular 
        ? 'border-blue-600 dark:border-blue-400 shadow-xl bg-white dark:bg-gray-800' 
        : 'border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800'
      }
    `}>
      {popular && (
        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/80 px-4 py-2 text-sm font-medium text-blue-800 dark:text-blue-200">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Most Popular
        </span>
      )}
      
      <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white mt-2 text-center">
        {title}
      </h3>
      
      <p className="text-4xl md:text-5xl font-extrabold mb-6 text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          {price}
        </span>
      </p>
      
      <ul className="mt-4 space-y-3 flex-grow mb-6">
        {features.map((feature, index) => (
          <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mr-3 mt-0.5" />
            <span className="text-base">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`
          w-full py-4 px-8 rounded-lg font-medium transition-all duration-300 
          transform hover:-translate-y-0.5 flex items-center justify-center
          disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
          ${popular 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl' 
            : 'border-2 border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400 text-gray-800 dark:text-gray-200 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'
          }
        `}
        aria-label={`Get started with ${title} plan`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </button>
    </div>
  );
}