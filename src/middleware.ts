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

// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

// Protected routes matcher
export const config = {
  matcher: ['/dashboard/:path*', '/web-app/:path*'],
};

export function middleware(request: NextRequest) {
  const url = new URL(request.url);

  // ✅ Get Supabase session cookie (default cookie names: `sb-access-token` or custom if you configured)
  const accessToken = request.cookies.get('sb-access-token')?.value;

  // ✅ If no session token → redirect to login
  if (!accessToken) {
    // Prevent infinite redirect loops
    if (url.pathname.startsWith('/auth/login')) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // ✅ Allow request to continue
  return NextResponse.next();
}
