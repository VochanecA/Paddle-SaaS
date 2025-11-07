'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sprječava hydration error
  if (!mounted) {
    return (
      <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
            {/* Skeleton za brand section */}
            <div className="flex flex-col gap-6 max-w-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            
            {/* Skeleton za linkove */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const isLight = resolvedTheme === 'light';

  return (
    <footer
      className={`w-full py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
        isLight
          ? 'bg-gradient-to-b from-gray-50 to-gray-100'
          : 'bg-gradient-to-b from-gray-900 to-gray-950'
      } text-gray-700 dark:text-gray-300`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
          <div className="flex flex-col gap-6 max-w-md">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image
                  src="/favicon.ico"
                  alt="SaaS Starter Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                SaaS Starter
              </span>
            </div>
            <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Build and launch your SaaS faster with our production-ready template.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
                  isLight ? 'bg-white hover:bg-gray-50' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                aria-label="Twitter"
              >
                <TwitterIcon />
              </a>
              <a 
                href="#" 
                className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
                  isLight ? 'bg-white hover:bg-gray-50' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a 
                href="#" 
                className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
                  isLight ? 'bg-white hover:bg-gray-50' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a 
                href="#" 
                className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center ${
                  isLight ? 'bg-white hover:bg-gray-50' : 'bg-gray-800 hover:bg-gray-700'
                }`}
                aria-label="BlueSky"
              >
                <div className="relative w-5 h-5">
                  <Image
                    src="/Bluesky-logo.svg.png"
                    alt="BlueSky"
                    fill
                    className="object-contain"
                  />
                </div>
              </a>
            </div>
          </div>

          {/* Links Grid sa pravim linkovima */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
            {[
              { 
                section: 'Product', 
                links: [
                  { href: '/features', label: 'Features' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/web-app', label: 'Web App' },
                  { href: '/updates', label: 'Updates' }
                ] 
              },
              { 
                section: 'Company', 
                links: [
                  { href: '/about-us', label: 'About' },
                  { href: '/contact', label: 'Contact' },
                  { href: '/careers', label: 'Careers' },
                  { href: '/press', label: 'Press' }
                ] 
              },
              { 
                section: 'Support', 
                links: [
                  { href: '/docs', label: 'Documentation' },
                  { href: '/help', label: 'Help Center' },
                  { href: '/support', label: 'Contact Support' },
                  { href: '/status', label: 'System Status' }
                ] 
              },
              { 
                section: 'Legal', 
                links: [
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Service' },
                  { href: '/refunds', label: 'Refund Policy' },
                  { href: '/cookies', label: 'Cookie Policy' }
                ] 
              }
            ].map((section) => (
              <div key={section.section} className="flex flex-col gap-4">
                <h3
                  className={`font-semibold text-lg ${
                    isLight ? 'text-gray-900' : 'text-white'
                  }`}
                >
                  {section.section}
                </h3>
                <nav className="flex flex-col gap-3">
                  {section.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm ${
                        isLight ? 'text-gray-700' : 'text-gray-300'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h3 className={`font-semibold text-lg mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                Stay updated
              </h3>
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                Subscribe to our newsletter for product updates and industry insights.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <form className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className={`px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px] ${
                    isLight 
                      ? 'bg-white border-gray-300 text-gray-900' 
                      : 'bg-gray-800 border-gray-700 text-white'
                  }`}
                />
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              <p className={`text-xs text-center sm:text-left ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                By subscribing, you agree to our{' '}
                <Link 
                  href="/privacy" 
                  className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 text-center text-xs text-gray-500 dark:text-gray-500">
          <p>© {new Date().getFullYear()} SaaS Starter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// SVG Icon Components (ostaju iste)
function TwitterIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 4.01001C21 4.50001 20.02 4.69901 19 5.00001C17.879 3.73501 16.217 3.66501 14.62 4.26301C13.023 4.86101 11.977 6.32301 12 8.00001V9.00001C8.755 9.08301 5.865 7.60501 4 5.00001C4 5.00001 -0.182 12.433 8 16C6.128 17.247 4.061 18.088 2 18C5.308 19.803 8.913 20.423 12.034 19.517C15.614 18.477 18.556 15.794 19.31 11.775C19.642 9.95701 19.845 8.13701 19.845 6.32701C19.845 6.06201 19.83 5.80001 19.815 5.53901C20.9 4.72301 21.81 3.69401 22 4.00801V4.01001Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-600 dark:text-gray-400"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-600 dark:text-gray-400"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 21.9999 7 21.9999H17C19.7614 21.9999 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-600 dark:text-gray-400"
      />
      <path
        d="M16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5932 15.1514 13.8416 15.5297C13.0901 15.9079 12.2385 16.0396 11.4078 15.9059C10.5771 15.7723 9.80977 15.3801 9.21485 14.7852C8.61993 14.1902 8.22774 13.4229 8.09408 12.5922C7.96042 11.7615 8.09208 10.9099 8.47034 10.1584C8.8486 9.40685 9.45420 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87659 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.1283C15.4785 9.73515 15.8741 10.5211 16 11.37Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-600 dark:text-gray-400"
      />
      <path
        d="M17.5 6.5H17.51"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-600 dark:text-gray-400"
      />
    </svg>
  );
}