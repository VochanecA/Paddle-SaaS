'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthError } from '@supabase/supabase-js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Redirect after successful login
      router.push('/account');
      router.refresh();
    } catch (err) {
      if (err instanceof AuthError) {
        setMessage(`❌ ${err.message}`);
      } else {
        console.error('Unexpected error:', err);
        setMessage('❌ Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-background transition-colors duration-500">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="text-2xl font-extrabold text-accent">
            SaaS Starter
          </Link>
        </div>

        <h1 className="mt-8 text-center text-3xl font-extrabold text-foreground">
          Sign in to your account
        </h1>

        <p className="mt-2 text-center text-sm text-foreground/60">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-accent hover:text-accent-alt transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background-alt py-8 px-6 shadow-xl rounded-2xl ring-1 ring-foreground/20 transition-colors duration-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-foreground/30 bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-foreground/30 bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.startsWith('✅')
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-white bg-accent hover:bg-accent-alt disabled:opacity-50 transition-colors"
            >
              {loading ? 'Loading…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}