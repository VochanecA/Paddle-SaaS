// // src/middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const userToken = request.cookies.get('user-token');

//   // If the user doesn't have a token, redirect them to the login page
//   if (!userToken) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   // If they have a token, allow the request to continue
//   return NextResponse.next();
// }

// // Limit the middleware to specific paths
// export const config = {
//   matcher: ['/dashboard/:path*'],
// };

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

// Types for session caching
interface CachedSession {
  session: Session | null;
  timestamp: number;
}

interface SessionResult {
  data: { session: Session | null };
  error: Error | null;
}

// Cache for session validation to reduce database calls
const SESSION_CACHE_TTL = 30000; // 30 seconds
const sessionCache = new Map<string, CachedSession>();

// Constants for configuration
const MAX_CACHE_SIZE = 100;
const SAFE_RETURN_PATHS = ['/web-app', '/dashboard'] as const;
const PROTECTED_PATHS = ['/web-app', '/dashboard', '/api'] as const;

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const requestStart = Date.now();
  const res = NextResponse.next();
  
  try {
    const supabase = createMiddlewareClient({ req, res });
    const pathname = req.nextUrl.pathname;
    
    // Define protected paths efficiently
    const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));

    if (!isProtectedPath) {
      return res;
    }

    // Get session with caching for performance
    const { data: { session }, error } = await getSessionWithCache(supabase, req);
    
    if (error) {
      console.error('Session error:', error.message);
      return handleUnauthorized(req, pathname);
    }

    if (!session) {
      return handleUnauthorized(req, pathname);
    }

    // Add security headers
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-XSS-Protection', '1; mode=block');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Performance logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - requestStart;
      console.log(`Middleware: ${pathname} - ${duration}ms`);
    }

    return res;

  } catch (error) {
    // Log error but don't expose internal details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Middleware error:', errorMessage);
    
    // Return appropriate error response
    if (req.nextUrl.pathname.startsWith('/api')) {
      return new NextResponse(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store'
          } 
        }
      );
    }
    
    // For web routes, redirect to error page
    return NextResponse.redirect(new URL('/error', req.url));
  }
}

async function getSessionWithCache(
  supabase: SupabaseClient, 
  req: NextRequest
): Promise<SessionResult> {
  // Create cache key from relevant cookies
  const authCookies = req.cookies.getAll()
    .filter(cookie => cookie.name.includes('supabase'))
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('|');
  
  const cacheKey = `session_${hashString(authCookies)}`;
  const now = Date.now();
  
  // Check cache first
  const cached = sessionCache.get(cacheKey);
  if (cached && (now - cached.timestamp) < SESSION_CACHE_TTL) {
    return { data: { session: cached.session }, error: null };
  }

  // Get fresh session
  const result = await supabase.auth.getSession();
  
  // Cache the result if successful
  if (result.data?.session && !result.error) {
    sessionCache.set(cacheKey, {
      session: result.data.session,
      timestamp: now
    });
    
    // Clean old cache entries to prevent memory leaks
    cleanCache();
  }
  
  return {
    data: { session: result.data?.session || null },
    error: result.error || null
  };
}

function handleUnauthorized(req: NextRequest, pathname: string): NextResponse {
  if (pathname.startsWith('/api')) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized' }),
      { 
        status: 401, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'WWW-Authenticate': 'Bearer'
        } 
      }
    );
  }
  
  // Create login redirect with return path
  const loginUrl = new URL('/auth/login', req.url);
  
  // Only add return URL for safe paths (prevent open redirects)
  if (isSafeReturnPath(pathname)) {
    loginUrl.searchParams.set('redirectTo', pathname);
  }
  
  return NextResponse.redirect(loginUrl);
}

function isSafeReturnPath(path: string): boolean {
  // Only allow relative paths from our app
  return SAFE_RETURN_PATHS.some(safePath => path.startsWith(safePath));
}

function hashString(str: string): string {
  // Simple hash function for cache keys
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString();
}

function cleanCache(): void {
  const now = Date.now();
  
  // Remove expired entries
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp > SESSION_CACHE_TTL) {
      sessionCache.delete(key);
    }
  }
  
  // If still too large, remove oldest entries
  if (sessionCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(sessionCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toDelete = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => sessionCache.delete(key));
  }
}

// Optimized matcher - only runs on specific paths
export const config = {
  matcher: [
    // '/web-app/:path*',
    '/dashboard/:path*', 
    '/api/:path*'
  ],
};