'use client';

import { useState } from 'react';
import { openCheckout } from '@/lib/paddle';
import { createClient } from '@/lib/supabase/client';

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  priceId: string;
  popular?: boolean;
}

export function PricingCard({ title, price, features, priceId, popular }: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
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
        .single();

      await openCheckout(priceId, user.email!, customer?.customer_id);
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${popular ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'} relative`}>
      {popular && (
        <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Most Popular
        </span>
      )}
      
      <h3 className="text-xl font-bold text-gray-900 mt-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-4">{price}</p>
      
      <ul className="mt-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="text-gray-600 flex items-start">
            <span className="text-green-500 mr-2 mt-1">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full mt-8 py-3 px-4 rounded-md font-medium transition-colors ${
          popular 
            ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50'
        }`}
      >
        {loading ? 'Loading...' : 'Get Started'}
      </button>
    </div>
  );
}