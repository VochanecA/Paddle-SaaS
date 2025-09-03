import { PricingCard } from '@/components/PricingCard';
import { ThemeToggle } from '@/components/ThemeToggle';

const plans = [
  {
    title: 'Starter',
    price: '$9/month',
    priceId: 'pri_01jqns42gg5tdqpaz3wh1ajfes',
    features: [
      '10 Projects',
      'Basic Support',
      '1GB Storage',
      'Standard Features'
    ]
  },
  {
    title: 'Pro',
    price: '$29/month', 
    priceId: 'pri_01jqns42gg5tdqpaz3wh1ajfes',
    features: [
      'Unlimited Projects',
      'Priority Support', 
      '10GB Storage',
      'Advanced Features',
      'API Access'
    ],
    popular: true
  },
  {
    title: 'Enterprise',
    price: '$99/month',
    priceId: 'pri_01jqns42gg5tdqpaz3wh1ajfes', 
    features: [
      'Everything in Pro',
      'Custom Integrations',
      '100GB Storage',
      'Dedicated Support',
      'SLA Guarantee'
    ]
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 transition-colors duration-300">

      
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
            Start with a free trial. No credit card required. 
            Cancel or change your plan anytime.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.title} {...plan} />
          ))}
        </div>

        {/* Additional information section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  Can I change my plan later?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  Is there a free trial?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Yes, all plans come with a 14-day free trial. No credit card required to start.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  We accept all major credit cards, PayPal, and bank transfers for annual plans.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
                  Do you offer refunds?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  Yes, we offer a 30-day money-back guarantee on all annual plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}