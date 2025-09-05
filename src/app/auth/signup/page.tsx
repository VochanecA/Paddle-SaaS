'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { useTheme } from 'next-themes';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate password match
    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      if (data.user && !data.user.email_confirmed_at) {
        setMessage('✅ Check your email for a confirmation link');
      } else {
        setMessage('✅ Account created successfully!');
        router.push('/account');
        router.refresh();
      }
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link href="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              SaaS Starter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLight = resolvedTheme === 'light';

  return (
    <div className={`min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${isLight ? 'bg-white' : 'bg-gray-900'}`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
            SaaS Starter
          </Link>
        </div>

        <h1 className="mt-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h1>

        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-6 shadow-xl rounded-2xl ring-1 transition-colors duration-500 ${isLight ? 'bg-gray-50 ring-gray-200' : 'bg-gray-800 ring-gray-700'}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isLight 
                    ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500' 
                    : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                }`}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
                    isLight 
                      ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500' 
                      : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  }`}
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className={`h-5 w-5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors pr-12 ${
                    isLight 
                      ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500' 
                      : 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className={`h-5 w-5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${isLight ? 'text-gray-500' : 'text-gray-400'}`} />
                  )}
                </button>
              </div>
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
              className="w-full py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {loading ? 'Creating Account…' : 'Create Account'}
              {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isLight ? 'border-gray-300' : 'border-gray-700'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isLight ? 'bg-gray-50 text-gray-500' : 'bg-gray-800 text-gray-400'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                  isLight 
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="sr-only">Sign up with Google</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
              </button>

              <button
                type="button"
                className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors ${
                  isLight 
                    ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="sr-only">Sign up with GitHub</span>
                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}