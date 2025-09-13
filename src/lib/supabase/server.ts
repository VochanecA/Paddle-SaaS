// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
//   return createServerClient(supabaseUrl, supabaseKey, {
//     cookies: {
//       async getAll() {
//         return (await cookieStore).getAll();
//       },
//       setAll() {
//         // No-op: Cookie setting is handled by middleware
//       },
//     },
//   });
// };
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

// Environment validation with proper error handling
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined'
  );
}

// Validate URL format to prevent runtime errors
try {
  new URL(SUPABASE_URL);
} catch {
  throw new Error(`Invalid SUPABASE_URL format: ${SUPABASE_URL}`);
}

// Types
type CookieStore = ReturnType<typeof cookies>;
type SupabaseServerClient = SupabaseClient;

/**
 * Creates a production-ready Supabase server client with proper error handling,
 * security hardening, and performance optimizations for Vercel deployment
 */
export const createClient = (cookieStore: CookieStore): SupabaseServerClient => {
  try {
    return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        async getAll() {
          try {
            const store = await cookieStore;
            return store.getAll();
          } catch (error) {
            // Log error but don't throw to prevent app crashes
            console.error('Failed to retrieve cookies in Supabase client:', error);
            return [];
          }
        },

        async setAll(cookiesToSet) {
          try {
            const store = await cookieStore;
            
            // Apply security validation and hardening to each cookie
            cookiesToSet.forEach(({ name, value, options }) => {
              if (isValidCookieName(name) && isValidCookieValue(value)) {
                const secureOptions = getSecureCookieOptions(options);
                store.set(name, value, secureOptions);
              } else {
                console.warn(`Invalid cookie rejected: ${name}`);
              }
            });
          } catch (error) {
            // Log error but don't throw - this is often called in read-only contexts
            console.error('Failed to set cookies in Supabase client:', error);
          }
        },
      },
      auth: {
        // Security: Disable URL-based session detection (prevents CSRF)
        detectSessionInUrl: false,
        // Performance: Enable session persistence for better UX
        persistSession: true,
        // Security: Use secure storage in production
        storageKey: process.env.NODE_ENV === 'production' ? 'sb-auth-token' : 'sb-auth-token-dev',
      },
    });
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw new Error('Database connection initialization failed');
  }
};

/**
 * Creates a Supabase client optimized for Server Actions and Route Handlers
 * where cookie modification is expected and required
 */
export const createActionClient = (): SupabaseServerClient => {
  const cookieStore = cookies();
  return createClient(cookieStore);
};

/**
 * Security: Validates cookie names according to RFC 6265 specification
 * Prevents cookie injection attacks and malformed cookie names
 */
function isValidCookieName(name: string): boolean {
  if (typeof name !== 'string' || name.length === 0 || name.length > 255) {
    return false;
  }
  
  // RFC 6265 compliant cookie name pattern
  const validNamePattern = /^[!#$%&'*+\-.0-9A-Z^_`a-z|~]+$/;
  return validNamePattern.test(name);
}

/**
 * Security: Validates cookie values to prevent injection attacks
 * Ensures values are within safe limits and don't contain control characters
 */
function isValidCookieValue(value: string): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  
  // Check length limits (4KB is typical browser limit)
  if (value.length > 4096) {
    return false;
  }
  
  // Reject control characters that could cause issues
  const hasControlChars = /[\x00-\x1f\x7f]/.test(value);
  return !hasControlChars;
}

/**
 * Security: Applies secure cookie options optimized for production environments
 * Configures appropriate security headers and settings based on environment
 */
function getSecureCookieOptions(options?: CookieOptions): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasVercelUrl = Boolean(process.env.VERCEL_URL);
  const isHttps = hasVercelUrl || isProduction;
  
  return {
    ...options,
    // Security: Force secure cookies in production/HTTPS environments
    secure: isHttps,
    // Security: Prevent XSS attacks by making cookies HTTP-only
    httpOnly: options?.httpOnly ?? true,
    // Security: Configure SameSite for CSRF protection
    sameSite: options?.sameSite ?? (isProduction ? 'strict' : 'lax'),
    // Performance: Set reasonable expiration (7 days default)
    maxAge: options?.maxAge ?? 60 * 60 * 24 * 7,
    // Security: Scope cookies to current domain
    path: options?.path ?? '/',
    // Security: Add domain restriction in production
    ...(isProduction && hasVercelUrl && {
      domain: new URL(process.env.VERCEL_URL!).hostname,
    }),
  };
}

/**
 * Utility: Health check for Supabase configuration
 * Useful for debugging and monitoring in production
 */
export function validateSupabaseConfig(): {
  isValid: boolean;
  url?: string;
  hasKey: boolean;
  environment: string;
} {
  return {
    isValid: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
    url: SUPABASE_URL ? new URL(SUPABASE_URL).origin : undefined,
    hasKey: Boolean(SUPABASE_ANON_KEY),
    environment: process.env.NODE_ENV || 'development',
  };
}

/**
 * Utility: Creates a read-only Supabase client for static operations
 * Optimized for performance when cookie modifications aren't needed
 */
export const createReadOnlyClient = (): SupabaseServerClient => {
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      async getAll() {
        try {
          const cookieStore = await cookies();
          return cookieStore.getAll();
        } catch {
          return [];
        }
      },
      async setAll() {
        // Read-only client - no cookie modifications
        console.warn('Attempted to set cookies on read-only Supabase client');
      },
    },
    auth: {
      detectSessionInUrl: false,
      persistSession: false, // No persistence needed for read-only
    },
  });
};