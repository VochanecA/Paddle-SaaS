// ./src/components/ThemeToggle.tsx
'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

// Renamed iconSize to iconClass for better clarity
interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
  iconClass?: string;
}

// Updated the function signature to use iconClass
export function ThemeToggle({ showLabel = false, className = '', iconClass = "w-5 h-5" }: ThemeToggleProps) {
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
      return <Monitor className={iconClass} />;
    }
    
    if (theme === 'system') {
      return <Monitor className={iconClass} />;
    }
    
    // Apply different text colors based on the theme
    return resolvedTheme === 'dark' ? 
      <Moon className={`${iconClass} text-indigo-400`} /> : 
      <Sun className={`${iconClass} text-orange-500`} />;
  };

  if (!mounted) {
    return (
      <button className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className={iconClass}></div>
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