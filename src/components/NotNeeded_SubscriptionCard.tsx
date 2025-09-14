'use client';

import { useState } from 'react';
import type { Subscription } from '@/lib/types';

interface SubscriptionCardProps {
  subscription: Subscription;
  onUpdate: () => void;
}

export function SubscriptionCard({ subscription, onUpdate }: SubscriptionCardProps) {
  // New state to manage and display error messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleAction = async (action: 'pause' | 'cancel' | 'resume'): Promise<void> => {
    setLoading(action);
    setErrorMessage(null); // Clear any previous errors on new action attempt
    try {
      const response = await fetch('/api/subscriptions/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscription_id,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      onUpdate();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Subscription action error:', error.message);
        setErrorMessage(`Failed to update subscription: ${error.message}. Please try again.`);
      } else {
        console.error('Subscription action error: unknown error', error);
        setErrorMessage('Failed to update subscription due to unknown error. Please try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'trialing':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'past_due':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'paused':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'canceled':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canPause = subscription.subscription_status === 'active';
  const canResume = subscription.subscription_status === 'paused';
  const canCancel = ['active', 'paused', 'trialing'].includes(subscription.subscription_status);

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Subscription</h3>
            <p className="text-sm text-gray-500 font-mono">
              ID: {subscription.subscription_id.substring(0, 12)}...
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${getStatusColor(
              subscription.subscription_status,
            )}`}
          >
            {subscription.subscription_status}
          </span>
        </div>

        {/* Scheduled Change */}
        {subscription.scheduled_change && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800">Scheduled change</p>
                <p className="text-sm text-yellow-700">{subscription.scheduled_change}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error message display */}
      {errorMessage && (
        <div className="p-4 mx-6 my-4 rounded-lg text-sm text-red-800 bg-red-100 border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* Details Section - Collapsible */}
      {showDetails && (
        <div className="p-6 bg-gray-50 border-b border-gray-100">
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Created:</span>
              <span className="text-gray-900">{formatDate(subscription.created_at)}</span>
            </div>
            {subscription.started_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Started:</span>
                <span className="text-gray-900">{formatDate(subscription.started_at)}</span>
              </div>
            )}
            {subscription.first_billed_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">First billed:</span>
                <span className="text-gray-900">{formatDate(subscription.first_billed_at)}</span>
              </div>
            )}
            {subscription.paused_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Paused:</span>
                <span className="text-gray-900">{formatDate(subscription.paused_at)}</span>
              </div>
            )}
            {subscription.canceled_at && (
              <div className="flex justify-between">
                <span className="text-gray-500">Canceled:</span>
                <span className="text-gray-900">{formatDate(subscription.canceled_at)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Last updated:</span>
              <span className="text-gray-900">{formatDate(subscription.updated_at)}</span>
            </div>
            {subscription.price_id && (
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Price ID:</span>
                <span className="text-gray-900">{subscription.price_id.substring(0, 16)}...</span>
              </div>
            )}
            {subscription.product_id && (
              <div className="flex justify-between font-mono text-xs">
                <span className="text-gray-500">Product ID:</span>
                <span className="text-gray-900">{subscription.product_id.substring(0, 16)}...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium md:order-first"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>

          <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-2 md:ml-auto">
            {canResume && (
              <button
                type="button"
                onClick={() => handleAction('resume')}
                disabled={loading === 'resume'}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors min-w-0 flex-1 md:flex-initial"
              >
                {loading === 'resume' ? 'Resuming...' : 'Resume'}
              </button>
            )}
            {canPause && (
              <button
                type="button"
                onClick={() => handleAction('pause')}
                disabled={loading === 'pause'}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors min-w-0 flex-1 md:flex-initial"
              >
                {loading === 'pause' ? 'Pausing...' : 'Pause'}
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={() => handleAction('cancel')}
                disabled={loading === 'cancel'}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors min-w-0 flex-1 md:flex-initial"
              >
                {loading === 'cancel' ? 'Canceling...' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}