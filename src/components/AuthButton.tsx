import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { signOut } from '@/actions/auth';

/**
 * A server component that displays an authentication button.
 * It fetches the current user's session and renders different
 * links based on the authentication state.
 */
export async function AuthButton() {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link 
          href="/account" 
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
        >
          Account
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link 
        href="/auth/login" 
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
      >
        Sign In
      </Link>
      <Link 
        href="/auth/signup" 
        className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 font-medium transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
}
