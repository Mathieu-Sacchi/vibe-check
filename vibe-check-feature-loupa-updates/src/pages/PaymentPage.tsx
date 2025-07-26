import React, { useState } from 'react';
import { Check, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const plans = [
  {
    id: 'single',
    name: 'Single Analysis',
    price: 9.99,
    description: 'Perfect for one-time project analysis',
    features: [
      'Complete audit results',
      'AI-generated fixes',
      'Copy-paste solutions',
      'Priority recommendations',
      '30-day access to results'
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 29.99,
    description: 'Best for regular code reviews',
    features: [
      'Unlimited project analysis',
      'All audit types included',
      'Real-time GitHub integration',
      'Priority support',
      'Team collaboration features',
      'Export reports (PDF/CSV)'
    ],
    popular: true
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 299.99,
    originalPrice: 359.88,
    description: 'Maximum value for serious developers',
    features: [
      'Everything in Monthly',
      'Advanced security scanning',
      'Custom compliance rules',
      'API access',
      'Dedicated account manager',
      '60% savings vs monthly'
    ]
  }
];

export const PaymentPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      // Redirect to success or back to audit
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center space-y-8 mb-12">
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock detailed analysis results and AI-generated fixes for your project
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${
                selectedPlan === plan.id ? 'border-black border-2' : ''
              } ${plan.popular ? 'ring-2 ring-black' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-gray-500 line-through ml-2">${plan.originalPrice}</span>
                    )}
                    {plan.id !== 'single' && <span className="text-gray-600">/{plan.id === 'yearly' ? 'year' : 'month'}</span>}
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={selectedPlan === plan.id ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Complete Your Purchase</h2>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {plans.find(p => p.id === selectedPlan)?.name}
                </span>
                <span className="font-bold">
                  ${plans.find(p => p.id === selectedPlan)?.price}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Payment Method</h3>
              <div className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Credit or Debit Card</span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="text"
                    placeholder="Card number"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder name"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay $${plans.find(p => p.id === selectedPlan)?.price}`}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Secure payment processed by Stripe. Your card information is encrypted and never stored.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};