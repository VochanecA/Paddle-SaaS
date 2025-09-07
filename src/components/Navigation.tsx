"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import { ThemeToggle } from "./ThemeToggle";
import type { Session } from "@supabase/supabase-js";

export default function Navigation() {
  const [userName, setUserName] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const name =
        (session.user.user_metadata?.full_name as string | undefined) ||
        session.user.email;
      setUserName(name || null);
    } else {
      setUserName(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchUser();
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        if (session?.user) {
          const name =
            (session.user.user_metadata?.full_name as string | undefined) ||
            session.user.email;
          setUserName(name || null);
          router.replace("/account");
          router.refresh();
        } else {
          setUserName(null);
          router.replace("/");
          router.refresh();
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUser, router]);

  if (!mounted) return null;

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              Paddle SaaS
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Link
              href="/"
              className={`${
                pathname === "/"
                  ? "text-primary font-medium"
                  : "text-foreground"
              } hover:text-primary transition-colors`}
            >
              Home
            </Link>
            {userName ? (
              <>
                <Link
                  href="/account"
                  className={`${
                    pathname === "/account"
                      ? "text-primary font-medium"
                      : "text-foreground"
                  } hover:text-primary transition-colors`}
                >
                  Account
                </Link>
                <Link
                  href="/web-app"
                  className={`${
                    pathname === "/web-app"
                      ? "text-primary font-medium"
                      : "text-foreground"
                  } hover:text-primary transition-colors`}
                >
                  Web App
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                  }}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className={`${
                  pathname === "/auth/login"
                    ? "text-primary font-medium"
                    : "text-foreground"
                } hover:text-primary transition-colors`}
              >
                Sign In
              </Link>
            )}
          </div>
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary transition-colors"
            >
              ☰
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <ThemeToggle />
          <Link
            href="/"
            className={`block ${
              pathname === "/" ? "text-primary font-medium" : "text-foreground"
            } hover:text-primary transition-colors`}
          >
            Home
          </Link>
          {userName ? (
            <>
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {userName}
              </div>
              <Link
                href="/account"
                className={`block ${
                  pathname === "/account"
                    ? "text-primary font-medium"
                    : "text-foreground"
                } hover:text-primary transition-colors`}
              >
                Account
              </Link>
              <Link
                href="/web-app"
                className={`block ${
                  pathname === "/web-app"
                    ? "text-primary font-medium"
                    : "text-foreground"
                } hover:text-primary transition-colors`}
              >
                Web App
              </Link>
              <button
                type="button"
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-foreground hover:text-primary transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className={`block ${
                pathname === "/auth/login"
                  ? "text-primary font-medium"
                  : "text-foreground"
              } hover:text-primary transition-colors`}
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
