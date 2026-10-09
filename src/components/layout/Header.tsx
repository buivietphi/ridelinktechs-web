'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CaretDown, Car, Cube, Megaphone, PawPrint, Sparkle } from 'phosphor-react';
import type { Icon } from 'phosphor-react';
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher';
import { CelestialToggle } from '@/components/theme/CelestialToggle';
import { LogoMark } from '@/components/ui/LogoMark';
import { MobileNav } from './MobileNav';
import { cn } from '@/lib/cn';
import { company } from '@/content/company';
import { products } from '@/content/products';
import type { ProductIcon } from '@/content/products';
import type { Locale } from '@/i18n/config';

const productIcons: Record<ProductIcon, Icon> = {
  car: Car,
  sparkle: Sparkle,
  paw: PawPrint,
  megaphone: Megaphone,
};

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
              size={scrolled ? 46 : 62}
              priority
              className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:scale-105"
            />
            <span
              className="hidden leading-none font-semibold tracking-[-0.03em] text-[var(--ink)] transition-all duration-500 ease-[var(--ease-out-quint)] sm:block"
              style={{
                fontSize: scrolled ? '20px' : '28px',
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

      <div className="relative hidden bg-[var(--ground)]/92 backdrop-blur-xl md:block">
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
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                          scheduleClose();
                        }
                      }}
                    >
                      <Link
                        href={navHref[k]}
                        aria-expanded={menuOpen}
                        aria-controls="products-menu"
                        className={cn(
                          'relative flex items-center gap-1.5 px-5 py-4 text-[15px] leading-none',
                          'border-b-2 transition-colors duration-200',
                          on
                            ? 'border-[var(--signal)] text-[var(--ink)]'
                            : menuOpen
                              ? 'border-[var(--rule)] text-[var(--ink)]'
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

                      <div
                        id="products-menu"
                        className={cn(
                          'absolute inset-x-0 top-full z-10 border-b border-[var(--rule)] bg-[var(--ground-raise)] shadow-[var(--shadow-2)] transition-[clip-path,visibility] duration-300 ease-[var(--ease-out-quint)]',
                          menuOpen
                            ? 'visible [clip-path:inset(0_0_-64px_0)]'
                            : 'pointer-events-none invisible [clip-path:inset(0_0_100%_0)]',
                        )}
                      >
                        <div className="mx-auto w-full max-w-[1560px] px-5 py-7 sm:px-8 lg:px-10">
                          <div className="flex items-baseline justify-between gap-6 border-b border-[var(--rule)] pb-4">
                            <p className="text-[14px] font-medium text-[var(--ink-soft)]">
                              {t('menuAll')}
                            </p>
                            <Link
                              href="/products"
                              onClick={() => setMenuOpen(false)}
                              className="link inline-flex shrink-0 items-center gap-2 text-[15px] font-medium"
                            >
                              {t('menuViewAll')}
                              <ArrowRight aria-hidden size={14} weight="bold" />
                            </Link>
                          </div>
                          <ul className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((p) => {
                              const current = pathname === `/products/${p.slug}`;
                              const ProductGlyph = (p.icon && productIcons[p.icon]) || Cube;
                              return (
                                <li key={p.slug} className="border-b border-[var(--rule)] py-1">
                                  <Link
                                    href={`/products/${p.slug}`}
                                    aria-current={current ? 'page' : undefined}
                                    onClick={() => setMenuOpen(false)}
                                    className="group grid grid-cols-[2.75rem_1fr] items-center gap-x-4 gap-y-2.5 rounded-[var(--radius-lg)] px-3.5 py-3 transition-colors duration-200 hover:bg-[var(--ground-lift)] focus-visible:bg-[var(--ground-lift)] xl:grid-cols-[2.75rem_1fr_auto]"
                                  >
                                    <span
                                      aria-hidden
                                      className={cn(
                                        'grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--rule)] bg-[var(--ground-sink)] transition-colors duration-200 group-hover:text-[var(--signal)]',
                                        current ? 'text-[var(--signal)]' : 'text-[var(--ink)]',
                                      )}
                                    >
                                      <ProductGlyph size={22} weight="duotone" />
                                    </span>
                                    <span className="min-w-0">
                                      <span
                                        className={cn(
                                          'block text-[17px] leading-tight font-medium transition-colors duration-200 group-hover:text-[var(--signal)]',
                                          current ? 'text-[var(--signal)]' : 'text-[var(--ink)]',
                                        )}
                                      >
                                        {p.name[locale]}
                                      </span>
                                      <span className="mt-1 block truncate text-[13px] leading-tight text-[var(--ink-soft)]">
                                        {p.kind[locale]}
                                      </span>
                                    </span>
                                    <span
                                      className={cn(
                                        'col-start-2 inline-flex items-center gap-1.5 justify-self-start rounded-full border px-2.5 py-1 text-[12px] leading-none xl:col-start-3 xl:row-start-1 xl:justify-self-end',
                                        p.status === 'in-development'
                                          ? 'border-[var(--signal)] text-[var(--signal)]'
                                          : 'border-[var(--rule)] text-[var(--ink-soft)]',
                                      )}
                                    >
                                      <span
                                        aria-hidden
                                        className="status-dot"
                                        {...markFor(p.status)}
                                      />
                                      {p.category === 'outsource' ? 'NDA' : tStatus(p.status)}
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
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
      </div>
    </header>
  );
}
