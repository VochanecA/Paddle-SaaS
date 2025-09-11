// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userToken = request.cookies.get('user-token');

  // If the user doesn't have a token, redirect them to the login page
  if (!userToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If they have a token, allow the request to continue
  return NextResponse.next();
}

// Limit the middleware to specific paths
export const config = {
  matcher: ['/account/:path*'],
};