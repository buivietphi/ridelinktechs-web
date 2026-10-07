'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { CaretDown } from 'phosphor-react';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { CelestialToggle } from '@/components/theme/CelestialToggle';
import { LogoMark } from '@/components/ui/LogoMark';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/cn';
import { company } from '@/content/company';
import { products } from '@/content/products';
import type { Locale } from '@/i18n/config';

const navKeys = ['home', 'products', 'about', 'contact'] as const;
type NavKey = (typeof navKeys)[number];
const navHref: Record<NavKey, string> = {
  home: '/',
  products: '/products',
  about: '/about',
  contact: '/contact',
};

function isActive(pathname: string, key: NavKey): boolean {
  if (key === 'home') return pathname === '/';
  if (key === 'products') return pathname === '/products' || pathname.startsWith('/products/');
  return pathname === navHref[key];
}

export function Header() {
  const t = useTranslations('nav');
  const tStatus = useTranslations('status');
  const locale = useLocale() as Locale;

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();
  const active = navKeys.find((k) => isActive(pathname, k));

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenuOpen(false), 260);
  };

  const markFor = (status: string) => ({
    'data-state': status === 'upcoming' ? ('upcoming' as const) : undefined,
    style: {
      backgroundColor:
        status === 'shipped'
          ? 'var(--signal)'
          : status === 'upcoming'
            ? 'var(--quiet)'
            : 'transparent',
      border:
        status === 'in-development'
          ? '1.5px solid var(--signal)'
          : status === 'shipped' || status === 'upcoming'
            ? 'none'
            : '1.5px solid var(--quiet)',
    },
  });

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ease-[var(--ease-out-quint)]',
        scrolled || menuOpen
          ? 'border-b border-[var(--rule)] bg-[var(--ground)]/92 backdrop-blur-xl backdrop-saturate-150'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="border-b border-[var(--rule-2)]">
        <div
          className={cn(
            'mx-auto flex w-full max-w-[1560px] items-center justify-between gap-6 px-5 transition-all duration-500 ease-[var(--ease-out-quint)] sm:px-8 lg:px-10',
            scrolled ? 'h-[68px]' : 'h-[92px]',
          )}
        >
          <Link
            href="/"
            aria-label={company.name}
            className="group flex shrink-0 items-center gap-4"
          >
            <LogoMark
              size={scrolled ? 36 : 50}
              priority
              className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:scale-105"
            />
            <span
              className="hidden leading-none font-semibold tracking-[-0.03em] text-[var(--ink)] transition-all duration-500 ease-[var(--ease-out-quint)] sm:block"
              style={{
                fontSize: scrolled ? '18px' : '25px',
                fontVariationSettings: "'opsz' 60, 'wdth' 100, 'wght' 640",
              }}
            >
              {company.name}
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2.5">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <CelestialToggle />
            <Link href="/contact" className="btn btn-primary hidden md:inline-flex">
              {t('brief.label')}
            </Link>
            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden bg-[var(--ground)]/92 backdrop-blur-xl md:block">
        <div className="mx-auto flex w-full max-w-[1560px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
          <nav aria-label="Primary">
            <ul className="flex items-center">
              {navKeys.map((k) => {
                const on = isActive(pathname, k);
                if (k === 'products') {
                  return (
                    <li
                      key={k}
                      onMouseEnter={openMenu}
                      onMouseLeave={scheduleClose}
                      onFocus={openMenu}
                    >
                      <Link
                        href={navHref[k]}
                        aria-expanded={menuOpen}
                        aria-haspopup="true"
                        className={cn(
                          'relative flex items-center gap-1.5 px-5 py-4 text-[15px] leading-none',
                          'border-b-2 transition-colors duration-200',
                          on || menuOpen
                            ? 'border-[var(--signal)] text-[var(--ink)]'
                            : 'border-transparent text-[var(--ink-soft)] hover:border-[var(--rule)] hover:text-[var(--ink)]',
                        )}
                      >
                        {t(k)}
                        <CaretDown
                          aria-hidden
                          size={12}
                          weight="bold"
                          className={cn(
                            'transition-transform duration-300',
                            menuOpen ? 'rotate-180' : 'rotate-0',
                          )}
                        />
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={k}>
                    <Link
                      href={navHref[k]}
                      aria-current={on ? 'page' : undefined}
                      className={cn(
                        'block border-b-2 px-5 py-4 text-[15px] leading-none',
                        'transition-colors duration-200',
                        on
                          ? 'border-[var(--signal)] text-[var(--ink)]'
                          : 'border-transparent text-[var(--ink-soft)] hover:border-[var(--rule)] hover:text-[var(--ink)]',
                      )}
                    >
                      {t(k)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          className={cn(
            'overflow-hidden border-t transition-[max-height,opacity] duration-500 ease-[var(--ease-out-quint)]',
            menuOpen
              ? 'max-h-[420px] border-[var(--rule)] opacity-100'
              : 'max-h-0 border-transparent opacity-0',
          )}
        >
          <div className="mx-auto w-full max-w-[1560px] px-5 py-8 sm:px-8 lg:px-10">
            <p className="eyebrow">{t('menuAll')}</p>
            <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const isOutsource = p.category === 'outsource';
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 transition-colors duration-200 hover:bg-[var(--ground-raise)]"
                    >
                      <span aria-hidden className="status-dot" {...markFor(p.status)} />
                      <span className="flex-1 text-[15px] leading-tight text-[var(--ink)] transition-colors duration-200 group-hover:text-[var(--signal)]">
                        {p.name[locale]}
                      </span>
                      <span className="font-mono text-[11px] leading-none text-[var(--ink-faint)]">
                        {isOutsource ? 'NDA' : tStatus(p.status)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
