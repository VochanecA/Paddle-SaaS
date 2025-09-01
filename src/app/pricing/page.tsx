import { PricingCard } from '@/components/PricingCard';

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a free trial. No credit card required. 
            Cancel or change your plan anytime.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PricingCard key={plan.title} {...plan} />
          ))}
        </div>
      </div>
    </div>
  );
}