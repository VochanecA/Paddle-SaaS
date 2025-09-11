'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ForgotPasswordMessage {
  type: 'success' | 'error';
  text: string;
}

export default function ForgotPasswordPage(): JSX.Element {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<ForgotPasswordMessage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for a reset link.' });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Forgot your password?</h1>
        <p className="text-sm mb-6 text-gray-600 dark:text-gray-400">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />

          {message && (
            <div
              className={`text-sm p-2 rounded-md ${
                message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
