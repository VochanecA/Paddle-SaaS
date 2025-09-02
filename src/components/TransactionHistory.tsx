'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Transaction } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

interface TransactionHistoryProps {
  user: User;
}

export function TransactionHistory({ user }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get customer record
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('email', user.email!)
        .single();

      if (customerError) {
        throw customerError;
      }
      if (!customer) {
        setTransactions([]);
        return;
      }

      // Get transactions for this customer
      const { data: txns, error: txnError } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customer.customer_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txnError) {
        throw txnError;
      }

      setTransactions(txns || []);
    } catch (err: unknown) { // Use unknown instead of PostgrestError | Error
      console.error('Error fetching transactions:', err);
      if (err instanceof PostgrestError) {
        // Use PostgrestError properties to align with PostgREST error format
        const errorMessage = err.details
          ? `${err.message}: ${err.details}`
          : err.message;
        setError(errorMessage || 'Failed to load transaction history');
      } else if (err instanceof Error) {
        // Handle generic JavaScript errors
        setError(err.message || 'Failed to load transaction history');
      } else {
        // Handle unexpected error types
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user.email, supabase]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'billed':
      case 'ready':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'draft':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'canceled':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    }
  };

  const formatCurrency = (amount: number | null, currencyCode: string | null) => {
    if (!amount || !currencyCode) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Transaction History</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading transactions</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
        <button 
          onClick={fetchTransactions}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Refresh
        </button>
      </div>
      
      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div 
              key={transaction.transaction_id} 
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      Transaction {transaction.transaction_id.substring(0, 12)}...
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  
                  {transaction.subscription_id && (
                    <p className="text-xs text-gray-500 font-mono mb-1">
                      Subscription: {transaction.subscription_id.substring(0, 12)}...
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatDate(transaction.created_at)}</span>
                    {transaction.billed_at && transaction.billed_at !== transaction.created_at && (
                      <span>• Billed: {formatDate(transaction.billed_at)}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(transaction.amount, transaction.currency_code)}
                  </p>
                  {transaction.currency_code && (
                    <p className="text-xs text-gray-500 uppercase">
                      {transaction.currency_code}
                    </p>
                  )}
                </div>
              </div>
              
              {(transaction.status === 'paid' || transaction.status === 'completed') && (
                <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-green-700">
                    Payment {transaction.status === 'completed' ? 'completed' : 'received'} successfully
                  </p>
                </div>
              )}
              
              {transaction.status === 'canceled' && (
                <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="ml-2 text-sm text-red-700">
                    Transaction was canceled
                  </p>
                </div>
              )}
            </div>
          ))}
          
          {transactions.length >= 50 && (
            <div className="text-center py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing last 50 transactions
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-500 mb-6">Your payment history will appear here once you make a purchase</p>
        </div>
      )}
    </div>
  );
}