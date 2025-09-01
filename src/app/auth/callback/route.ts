import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (!code) {
    return redirectToError();
  }

  const supabase = createClient(cookies());

  // Exchange the code for session
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectToError();
  }

  // Determine base URL for redirect
  // Prefer x-forwarded-host header (e.g., for Vercel proxy/load balancer)
  // Fallback to official VERCEL_URL environment variable or request origin
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  let baseUrl: string;

  if (isLocalEnv) {
    baseUrl = request.url.startsWith("http") ? new URL(request.url).origin : "http://localhost:3000";
  } else if (forwardedHost) {
    baseUrl = `https://${forwardedHost}`;
  } else if (vercelUrl) {
    baseUrl = `https://${vercelUrl}`;
  } else {
    baseUrl = new URL(request.url).origin;
  }

  return NextResponse.redirect(`${baseUrl}${next}`);

  // Helper redirect to error page
  function redirectToError() {
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
}
