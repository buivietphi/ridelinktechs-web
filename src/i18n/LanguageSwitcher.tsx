'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLayoutEffect, useRef, useState, useTransition } from 'react';
import { locales, type Locale } from '@/i18n/config';
import { cn } from '@/lib/cn';

const LABEL: Record<Locale, string> = { vi: 'VI', en: 'EN' };

export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('language');
  const current = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const listRef = useRef<HTMLDivElement | null>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const el = list.querySelector<HTMLElement>('[data-on="true"]');
      setThumb(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [current]);

  const onSelect = (next: Locale) => {
    if (next === current) return;
    document.cookie = `locale=${next};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div
      ref={listRef}
      role="group"
      aria-label={t('toggle')}
      className={cn(
        'relative isolate inline-flex items-center rounded-full border p-[3px]',
        'border-[var(--rule)] transition-colors duration-300',
        'hover:border-[var(--ink-faint)]',
        className,
      )}
    >
      {thumb ? (
        <span
          aria-hidden
          className="lang-thumb absolute inset-y-[3px] -z-10 rounded-full bg-[var(--ink)]"
          style={{ transform: `translateX(${thumb.left}px)`, width: thumb.width }}
        />
      ) : null}

      {locales.map((loc) => {
        const on = loc === current;
        return (
          <button
            key={loc}
            type="button"
            data-on={on}
            onClick={() => onSelect(loc)}
            aria-pressed={on}
            disabled={isPending}
            className={cn(
              'h-8 min-w-[2.75rem] rounded-full px-3 font-mono text-[12px] leading-none font-medium',
              'transition-colors duration-300',
              on ? 'text-[var(--ground)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]',
            )}
          >
            {LABEL[loc]}
          </button>
        );
      })}
    </div>
  );
}
