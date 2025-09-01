'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

interface ThemeIconProps {
  theme: 'light' | 'dark' | 'system';
  currentTheme: 'light' | 'dark' | 'system';
}

const ThemeIcon: React.FC<ThemeIconProps> = ({ theme, currentTheme }) => {
  const isSelected = useMemo(() => theme === currentTheme, [theme, currentTheme]);
  const commonClasses = 'transition-colors duration-300';
  const selectedClasses = 'text-accent scale-110';
  const unselectedClasses = 'text-foreground/50 hover:text-foreground';

  let IconComponent: React.ComponentType<{ className?: string }>;
  if (theme === 'light') IconComponent = Sun;
  else if (theme === 'dark') IconComponent = Moon;
  else IconComponent = Monitor;

  return (
    <IconComponent
      className={`${commonClasses} ${isSelected ? selectedClasses : unselectedClasses} w-6 h-6`}
    />
  );
};

interface NavigationProps {
  authSection: React.ReactNode;
}

export function Navigation({ authSection }: NavigationProps) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleThemeMenu = () => setIsThemeMenuOpen((prev) => !prev);

  const selectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <nav className="border-b border-foreground/20 bg-background transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-foreground">
            SaaS Starter
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-foreground/70 hover:text-foreground font-medium transition-colors"
            >
              Pricing
            </Link>
            {authSection}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-foreground/20 bg-background transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-foreground">
          SaaS Starter
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-foreground/70 hover:text-foreground font-medium transition-colors"
          >
            Pricing
          </Link>
          {authSection}

          {/* Theme Toggle */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={toggleThemeMenu}
              className="p-2 rounded-full hover:bg-foreground/10 transition-colors duration-300"
            >
              <ThemeIcon
                theme={resolvedTheme as 'light' | 'dark' | 'system'}
                currentTheme={resolvedTheme as 'light' | 'dark' | 'system'}
              />
            </button>

            {isThemeMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-44 rounded-lg shadow-lg ring-1 ring-foreground/20 z-50 overflow-hidden 
                ${resolvedTheme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-foreground'}`}
              >
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => selectTheme(theme)}
                    className={`flex items-center px-4 py-2 w-full text-sm hover:${
                      resolvedTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    } transition-colors`}
                  >
                    <ThemeIcon
                      theme={theme}
                      currentTheme={resolvedTheme as 'light' | 'dark' | 'system'}
                    />
                    <span className="ml-2 capitalize">{theme}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
