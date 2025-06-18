'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-md border border-gray-300 dark:border-gray-700" />
    );
  }

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' },
  ];

  const currentTheme = themes.find(t => t.name === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <div className="relative">
      <button
        onClick={() => {
          const currentIndex = themes.findIndex(t => t.name === theme);
          const nextIndex = (currentIndex + 1) % themes.length;
          setTheme(themes[nextIndex].name);
        }}
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
        aria-label={`Switch to ${themes[(themes.findIndex(t => t.name === theme) + 1) % themes.length].label} theme`}
        title={`Current: ${currentTheme?.label || 'System'}. Click to switch.`}
      >
        <CurrentIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ThemeDropdown() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-md border border-gray-300 dark:border-gray-700" />
    );
  }

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' },
  ];

  const currentTheme = themes.find(t => t.name === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
        aria-label="Theme selector"
        aria-expanded={isOpen}
      >
        <CurrentIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:border-gray-700 dark:bg-gray-800 z-50">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isActive = theme === themeOption.name;
              
              return (
                <button
                  key={themeOption.name}
                  onClick={() => {
                    setTheme(themeOption.name);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {themeOption.label}
                  {isActive && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
