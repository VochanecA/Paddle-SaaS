import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check Supabase session
  const { data: { session } } = await supabase.auth.getSession();

  // Protect /web-app and /dashboard routes
  if (req.nextUrl.pathname.startsWith('/web-app') || req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/web-app/:path*', '/api/:path*','/dashboard/:path*'],
};