'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Shield, Clock, FileText, AlertCircle, CreditCard } from 'lucide-react';

const sections = [
  {
    id: 'refund-overview',
    title: 'Refund Policy Overview',
    description: 'Our refund policy is managed through Paddle, our trusted payment processor, ensuring secure and compliant transactions.',
    icon: FileText,
    details: [
      'All refund requests are processed by Paddle on a case-by-case basis.',
      'Refunds are subject to the terms outlined in Paddle’s Checkout Buyer Terms and Conditions.',
      'To request a refund, visit <a href="https://paddle.net" className="underline text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">paddle.net</a> and provide your transaction details.'
    ]
  },
  {
    id: 'eligibility',
    title: 'Eligibility for Refunds',
    description: 'Refunds may be granted under specific circumstances, as determined by Paddle’s policies.',
    icon: Shield,
    details: [
      'Refunds are considered for transactions within 60 days from the purchase date.',
      'Eligible cases include technical issues preventing product delivery or products not as described.',
      'Digital content that has been downloaded, streamed, or otherwise accessed is generally not eligible for refunds.'
    ]
  },
  {
    id: 'time-limits',
    title: 'Time Limits for Refund Requests',
    description: 'Timely submission of refund requests is critical to ensure eligibility.',
    icon: Clock,
    details: [
      'Card payments can be refunded within 120 days of the transaction.',
      'PayPal payments are eligible for refunds within 179 days of the transaction.',
      'Requests after 60 days from the transaction date will not be processed.'
    ]
  },
  {
    id: 'non-refunded-cases',
    title: 'Non-Refundable Scenarios',
    description: 'Certain situations may not qualify for a refund, as per Paddle’s policies.',
    icon: AlertCircle,
    details: [
      'No refunds are provided for unused subscription periods after cancellation.',
      'Refunds may be denied if there is evidence of fraud, refund abuse, or manipulative behavior.',
      'Wire transfer payments are not eligible for refunds under the Consumer Credit Act.'
    ]
  },
  {
    id: 'processing',
    title: 'Refund Processing',
    description: 'Once approved, refunds are processed promptly, though timing may vary.',
    icon: CreditCard,
    details: [
      'Card refunds typically take 3-5 business days to reflect in your account.',
      'PayPal refunds generally appear within 48 hours of approval.',
      'Tax adjustments or currency fluctuations may affect the refunded amount.'
    ]
  }
];

export default function RefundPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4 transition-colors duration-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Refund Policy
          </h1>
          <p className={`text-xl max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            We partner with Paddle to handle payments and refunds securely. Learn about our refund process below.
          </p>
          <p className={`text-sm mt-2 transition-colors duration-300 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            Last updated: September 11, 2025
          </p>
        </div>

        {/* Sections Grid */}
        <div className="space-y-8 mb-16">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div
                key={section.id}
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
                  <div className="ml-3">
                    <h3 className={`text-xl font-semibold transition-colors duration-300 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {section.title}
                    </h3>
                    <p className={`mt-1 transition-colors duration-300 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {section.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 ml-8">
                  {section.details.map((detail, i) => (
                    <li
                      key={i}
                      className={`flex items-start transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}
                      dangerouslySetInnerHTML={{ __html: detail }}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className={`rounded-2xl p-8 text-center transition-colors duration-300 ${isLight ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gradient-to-r from-blue-900/30 to-purple-900/30'}`}>
          <h2 className="text-2xl font-bold mb-4 transition-colors duration-300 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Need Assistance with Refunds?
          </h2>
          <p className={`mb-6 max-w-2xl mx-auto transition-colors duration-300 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
            Contact Paddle’s support team or reach out to us for help with your refund request.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://paddle.net"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Contact Paddle Support
            </a>
            <Link
              href="/support"
              className={`px-6 py-3 rounded-lg font-medium border transition-colors ${isLight ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-gray-600 text-gray-300 hover:bg-gray-800'}`}
            >
              Contact Our Support
            </Link>
          </div>
          <p className={`text-xs mt-4 transition-colors duration-300 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            For more details, view Paddle’s{' '}
            <a
              href="https://www.paddle.com/legal/checkout-buyer-terms"
              className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Checkout Buyer Terms and Conditions
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}