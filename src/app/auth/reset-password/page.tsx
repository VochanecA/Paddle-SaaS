'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ResetPasswordMessage {
  type: 'success' | 'error';
  text: string;
}

export default function ResetPasswordPage(): JSX.Element {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<ResetPasswordMessage | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Password updated! Redirecting to login...' });
      setTimeout(() => router.push('/auth/login'), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Reset your password</h1>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
