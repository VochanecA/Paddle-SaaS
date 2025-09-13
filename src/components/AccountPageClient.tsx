'use client';

import { useState } from 'react';
import { SubscriptionTable } from '@/components/SubscriptionTable';
import PasswordChangeForm from '@/components/PasswordChangeForm';

interface AccountPageClientProps {
  user: { email: string; created_at: string };
  customerId?: string;
  subscriptions: Array<{
    id: string;
    status: string;
    plan_name?: string;
    price?: string;
  }>;
}

export default function AccountPageClient({
  user,
  customerId,
  subscriptions: initialSubscriptions,
}: AccountPageClientProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  const handleOpenPortal = async () => {
    if (!customerId) return;

    try {
      const res = await fetch('/api/paddle-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.portalUrl) window.open(data.portalUrl, '_blank');
      else alert('Billing portal is not available.');
    } catch (err) {
      console.error(err);
      alert('Failed to open billing portal.');
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 space-y-8">
      <h1 className="text-3xl font-bold text-blue-400 mb-4">Account Overview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
          <p><strong>Customer ID:</strong> {customerId ?? 'N/A'}</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
          <PasswordChangeForm />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Billing Management</h2>
        <button
          onClick={handleOpenPortal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Open Billing Portal
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Your Subscriptions</h2>
        <SubscriptionTable subscriptions={subscriptions} />
      </div>
    </div>
  );
}
