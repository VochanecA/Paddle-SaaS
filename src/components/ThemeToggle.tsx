// ./src/components/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
  iconSize?: number;
}

export function ThemeToggle({ showLabel = false, className = '', iconSize = 5 }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  const getThemeIcon = () => {
    if (!mounted) {
      return <Monitor className={`w-${iconSize} h-${iconSize}`} />;
    }
    
    if (theme === 'system') {
      return <Monitor className={`w-${iconSize} h-${iconSize}`} />;
    }
    return resolvedTheme === 'dark' ? 
      <Moon className={`w-${iconSize} h-${iconSize}`} /> : 
      <Sun className={`w-${iconSize} h-${iconSize}`} />;
  };

  if (!mounted) {
    return (
      <button className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className={`w-${iconSize} h-${iconSize}`}></div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {showLabel ? (
        <div className="flex items-center gap-2">
          {getThemeIcon()}
          <span className="text-sm">
            {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
          </span>
        </div>
      ) : (
        getThemeIcon()
      )}
    </button>
  );
}