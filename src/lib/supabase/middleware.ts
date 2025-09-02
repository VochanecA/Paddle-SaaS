import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (request: NextRequest) => {
  const supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, supabaseResponse };
};

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createClient(request);

  // Refresh session to ensure valid tokens
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Middleware session error:", error.message);
    // Clear invalid session cookies if necessary
    supabaseResponse.cookies.delete("sb-access-token");
    supabaseResponse.cookies.delete("sb-refresh-token");
  }

  // If no session, proceed without redirecting (let the page handle it)
  return supabaseResponse;
}

export const config = {
  matcher: ["/auth/:path*", "/account/:path*"],
};