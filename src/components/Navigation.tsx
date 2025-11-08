'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import {
  Menu,
  X,
  UserCircle,
  LogOut,
  Settings,
  Home,
  DollarSign,
  UserPlus,
  LogIn,
  Heart,
  Rocket,
  Mail,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { signOut } from '@/actions/auth';

interface UserSession {
  session: Session | null;
}

export function Navigation(): JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use useCallback to memoize the function and prevent unnecessary re-creations
  const updateUserState = useCallback((session: Session | null): void => {
    if (session?.user) {
      const name = session.user.user_metadata?.full_name || session.user.email;
      setUserName(name || null);
      setUserEmail(session.user.email || null);
    } else {
      setUserName(null);
      setUserEmail(null);
    }
    // Explicitly close the user menu on session change to prevent auto-opening
    setIsUserMenuOpen(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
// Get initial session and validate with server
  const getInitialSession = async (): Promise<void> => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      // Validate the session with the server
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData.user) {
        // Session is invalid, clear it
        await supabase.auth.signOut();
        updateUserState(null);
      } else {
        updateUserState(sessionData.session);
      }
    } else {
      updateUserState(null);
    }
  };

  getInitialSession().catch((error) => {
    console.error('Error fetching initial session:', error);
    updateUserState(null); // Clear state on error
  });

    // Listen to auth changes
const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
    if (['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event)) {
      updateUserState(session);
    }
  });
return () => {
    subscription.unsubscribe();
  };
  }, [updateUserState]);

const handleLogout = async (): Promise<void> => {
  try {
    const supabase = createClient();
    // Clear the Supabase session
    await supabase.auth.signOut();
    // Clear local storage
    localStorage.removeItem('supabase.auth.token');
    // Clear user-token cookie
    document.cookie = 'user-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    // Clear user state
    setUserName(null);
    setUserEmail(null);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    // Redirect to login page
    router.push('/auth/login');
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

// ili clearing lokal cookie
//  const handleLogout = async (): Promise<void> => {
//   try {
//     const supabase = createClient();
//     // Clear the Supabase session
//     await supabase.auth.signOut();
//     // Optionally clear local storage
//     localStorage.removeItem('supabase.auth.token');
//     // Clear user state
//     setUserName(null);
//     setUserEmail(null);
//     setIsUserMenuOpen(false);
//     setIsMobileMenuOpen(false);
//     // Force a refresh
//     router.refresh();
//   } catch (error) {
//     console.error('Error logging out:', error);
//   }
// };
  const closeMobileMenu = useCallback((): void => {
    setIsMobileMenuOpen(false);
  }, []);

  if (!mounted) {
    return (
      <nav className="relative py-6 px-4 md:px-8 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="hidden md:flex items-center gap-4">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="relative py-6 px-4 md:px-8 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link 
          href="/" 
          className="text-2xl font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2 z-20 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <Rocket className="w-7 h-7" />
          Moj Medicinski AI
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors"
          >
            Pricing
          </Link>
          {userName && (
            <>
              <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
              <Link
                href="/web-app"
                className="flex items-center gap-2 text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <Rocket className="w-5 h-5" />
                Web App
              </Link>
              <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            </>
          )}
          
          {userName ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={(): void => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                type="button"
              >
                <UserCircle className="w-6 h-6" />
                <span className="hidden lg:inline">{userName.split(' ')[0]}</span>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <Link 
                    href="/account" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 w-full text-left transition-colors"
                    onClick={(): void => setIsUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Account
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 w-full text-left transition-colors"
                    type="button"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </>
          )}
          
          <ThemeToggle className="shadow-sm hover:shadow-md" />
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle className="p-2" iconClass="w-6 h-6" />
          <button
            onClick={(): void => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
            type="button"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg py-6 px-4 z-40 transition-all duration-300 ease-in-out">
          <div className="flex flex-col items-start w-full gap-4">
            {userName && (
              <>
                <div className="flex items-center gap-3 w-full py-2">
                  <UserCircle className="w-6 h-6 text-blue-800 dark:text-blue-400" />
                  <div className="flex flex-col text-sm">
                    <span className="font-semibold text-blue-800 dark:text-blue-300">{userName}</span>
                    {userEmail && (
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {userEmail}
                      </span>
                    )}
                  </div>
                </div>
                <hr className="w-full border-t border-gray-200 dark:border-gray-700 mb-2" />
              </>
            )}
            <Link
              href="/"
              className="flex items-center gap-3 text-lg font-medium text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 w-full py-2"
              onClick={closeMobileMenu}
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-3 text-lg font-medium text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 w-full py-2"
              onClick={closeMobileMenu}
            >
              <DollarSign className="w-5 h-5" />
              Pricing
            </Link>
            {userName && (
              <>
                <hr className="w-full border-t border-gray-200 dark:border-gray-700 mb-2" />
                <Link
                  href="/web-app"
                  className="flex items-center gap-3 text-lg font-medium text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 w-full py-2"
                  onClick={closeMobileMenu}
                >
                  <Rocket className="w-5 h-5" />
                  Web App
                </Link>
                <hr className="w-full border-t border-gray-200 dark:border-gray-700 mb-2" />
              </>
            )}
            {userName ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center gap-3 text-lg font-medium text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 w-full py-2"
                  onClick={closeMobileMenu}
                >
                  <Settings className="w-5 h-5" />
                  Account
                </Link>
                <button
                  onClick={(): void => {
                    handleLogout();
                    closeMobileMenu();
                  }}
                  className="flex items-center gap-3 text-lg font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 w-full py-2 text-left"
                  type="button"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 text-lg font-medium text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 w-full py-2"
                  onClick={closeMobileMenu}
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-3 text-lg font-medium text-blue-800 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 w-full py-2"
                  onClick={closeMobileMenu}
                >
                  <UserPlus className="w-5 h-5" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <ThemeToggle showLabel iconClass="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            Made with <Heart className="w-4 h-4 text-red-500" /> by Alen 2025
          </div>
        </div>
      )}
    </nav>
  );
}