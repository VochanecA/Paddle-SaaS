'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

// Interface for the ThemeIcon component's props
interface ThemeIconProps {
  theme: 'light' | 'dark' | 'system';
  currentTheme: 'light' | 'dark' | 'system';
}

const ThemeIcon: React.FC<ThemeIconProps> = ({ theme, currentTheme }) => {
  const isSelected = useMemo(() => theme === currentTheme, [theme, currentTheme]);

  // Define shared and conditional Tailwind classes for the icon
  const commonClasses = 'transition-colors duration-300';
  const selectedClasses = 'text-accent scale-110';
  const unselectedClasses = 'text-gray-400 hover:text-foreground';

  let IconComponent: React.ComponentType<{ className?: string }>;

  if (theme === 'light') {
    IconComponent = Sun;
  } else if (theme === 'dark') {
    IconComponent = Moon;
  } else {
    IconComponent = Monitor;
  }

  return (
    <IconComponent
      className={`w-6 h-6 ${commonClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
    />
  );
};

// Interface for the main Navigation component's props
interface NavigationProps {
  authSection: React.ReactNode;
}

/**
 * The main navigation bar for the application.
 * Manages theme toggle and renders navigation links.
 */
// ... (imports and other code)

export function Navigation({ authSection }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, resolvedTheme } = useTheme(); // Use the resolvedTheme from the hook directly
  const [mounted, setMounted] = useState(false);

  // When the component mounts on the client, set mounted to true
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const selectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show a fallback or nothing on the server
  if (!mounted) {
    return (
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-background dark:bg-background transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-foreground dark:text-foreground">
            SaaS Starter
          </Link>
          <div className="flex items-center gap-6">
            <Link 
              href="/pricing" 
              className="text-gray-600 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground font-medium transition-colors"
            >
              Pricing
            </Link>
            {authSection}
          </div>
        </div>
      </nav>
    );
  }

  // Render the full navigation bar only on the client
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-background dark:bg-background transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-foreground dark:text-foreground">
          SaaS Starter
        </Link>
        <div className="flex items-center gap-6">
          <Link 
            href="/pricing" 
            className="text-gray-600 dark:text-gray-400 hover:text-foreground dark:hover:text-foreground font-medium transition-colors"
          >
            Pricing
          </Link>
          {authSection}
          
          <div className="relative" ref={dropdownRef}>
            <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">
              {/* Use the resolvedTheme from the hook directly */}
              <ThemeIcon theme={resolvedTheme as 'light' | 'dark' | 'system'} currentTheme={resolvedTheme as 'light' | 'dark' | 'system'} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-xl bg-background dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-300 transform origin-top-right z-10">
                <div className="py-1">
                  <button onClick={() => selectTheme('light')} className="flex items-center px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ThemeIcon theme="light" currentTheme={resolvedTheme as 'light' | 'dark' | 'system'} />
                    <span className="ml-2">Light</span>
                  </button>
                  <button onClick={() => selectTheme('dark')} className="flex items-center px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ThemeIcon theme="dark" currentTheme={resolvedTheme as 'light' | 'dark' | 'system'} />
                    <span className="ml-2">Dark</span>
                  </button>
                  <button onClick={() => selectTheme('system')} className="flex items-center px-4 py-2 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <ThemeIcon theme="system" currentTheme={resolvedTheme as 'light' | 'dark' | 'system'} />
                    <span className="ml-2">System</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}