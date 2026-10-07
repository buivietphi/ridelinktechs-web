'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations('theme');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const next = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={t('toggle')}
      title={isDark ? t('light') : t('dark')}
      aria-pressed={isDark}
      className={cn(
        'group relative inline-grid h-10 w-10 place-items-center overflow-hidden',
        'border border-[var(--rule)] transition-colors duration-300',
        'hover:border-[var(--ink-faint)] focus-visible:border-[var(--signal)]',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute inset-0 transition-colors duration-500',
          isDark ? 'bg-[var(--signal-soft)]' : 'bg-transparent',
        )}
      />

      <Sun
        aria-hidden
        size={17}
        weight="regular"
        className={cn(
          'col-start-1 row-start-1 transition-all duration-500 ease-[var(--ease-out-quint)]',
          isDark
            ? 'pointer-events-none absolute scale-50 rotate-90 opacity-0'
            : 'relative scale-100 rotate-0 text-[var(--ink)] opacity-100',
        )}
      />

      <Moon
        aria-hidden
        size={17}
        weight="regular"
        className={cn(
          'col-start-1 row-start-1 transition-all duration-500 ease-[var(--ease-out-quint)]',
          isDark
            ? 'relative scale-100 rotate-0 text-[var(--signal)] opacity-100'
            : 'pointer-events-none absolute scale-50 -rotate-90 opacity-0',
        )}
      />
    </button>
  );
}
