'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/animations';
import type { Product } from '@/content/products';
import type { Locale } from '@/i18n/config';

type Filter = 'all' | 'prod' | 'outsource';

type Props = {
  items: Product[];
  locale: Locale;
  statusLabels: Record<string, string>;
};

export function ProjectFilter({ items, locale, statusLabels }: Props) {
  const t = useTranslations('products');
  const [filter, setFilter] = useState<Filter>('all');
  const gridRef = useRef<HTMLUListElement | null>(null);
  const firstRun = useRef(true);

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filter.all') },
    { key: 'prod', label: t('filter.prod') },
    { key: 'outsource', label: t('filter.outsource') },
  ];

  const counts: Record<Filter, number> = {
    all: items.length,
    prod: items.filter((p) => p.category === 'prod').length,
    outsource: items.filter((p) => p.category === 'outsource').length,
  };

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (prefersReducedMotion()) return;

    const cards = Array.from(grid.querySelectorAll('[data-card]'));
    cards.forEach((card) => {
      const item = card as HTMLElement;
      const cat = item.dataset.category;
      const shown = filter === 'all' || cat === filter;
      gsap.to(item, {
        autoAlpha: shown ? 1 : 0,
        scale: shown ? 1 : 0.94,
        y: shown ? 0 : 14,
        duration: 0.5,
        ease: 'expo.out',
        pointerEvents: shown ? 'auto' : 'none',
      });
    });
  }, [filter]);

  const statusMark = (status: string) => ({
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
    <>
      <div
        role="tablist"
        aria-label={t('filter.label')}
        className="flex flex-wrap items-center gap-2 border-b border-[var(--rule)] pb-5"
      >
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2 text-[14px] leading-none transition-[background-color,border-color,color,box-shadow] duration-[180ms] ease-[var(--ease-out-quint)] ${
                active
                  ? 'border-transparent bg-[var(--ink)] text-[var(--ground)] shadow-[var(--shadow-1)]'
                  : 'border-[var(--rule)] text-[var(--ink-soft)] hover:border-[var(--ink-faint)] hover:text-[var(--ink)]'
              }`}
            >
              {tab.label}
              <span
                className={`tabnum text-[12px] ${active ? 'text-[var(--ground)]/60' : 'text-[var(--ink-faint)]'}`}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <ul ref={gridRef} className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {items.map((p, i) => {
          const wide = i === 0;
          return (
            <li
              key={p.slug}
              data-card
              data-category={p.category}
              className={wide ? 'sm:col-span-2' : ''}
            >
              <Link
                href={`/products/${p.slug}`}
                className="group block h-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--ground-raise)] shadow-[var(--shadow-1)] transition-[transform,box-shadow] duration-[560ms] ease-[var(--ease-out-quint)] hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]"
              >
                <div
                  className={`photo rounded-none shadow-none ${wide ? 'aspect-[16/9]' : 'aspect-[4/3]'}`}
                >
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={`${p.name[locale]} — ảnh minh hoạ`}
                      fill
                      priority={i === 0}
                      sizes={wide ? '100vw' : '(min-width: 640px) 50vw, 100vw'}
                      className="object-cover transition-transform duration-[900ms] ease-[var(--ease-out-quint)] group-hover:scale-[1.05]"
                    />
                  ) : null}
                  <div className="photo-scrim" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 p-5">
                    <span className="flex items-center gap-2.5">
                      <span aria-hidden className="status-dot" {...statusMark(p.status)} />
                      <span className="text-[12px] leading-none text-white/85">
                        {statusLabels[p.status] ?? p.status}
                      </span>
                    </span>
                    <span className="text-[12px] leading-none text-white/70">
                      {p.category === 'outsource'
                        ? t('category.outsource')
                        : t('category.internal')}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <h2 className="display-lg transition-colors duration-200 group-hover:text-[var(--signal)]">
                      {p.name[locale]}
                    </h2>
                    <span className="text-[13px] text-[var(--ink-faint)] transition-colors duration-200 group-hover:text-[var(--signal)]">
                      {p.demoUrl ? t('demo') : t('readMore')}
                    </span>
                  </div>
                  <p
                    className={`mt-3 text-[15px] leading-[1.68] text-[var(--ink-soft)] ${
                      wide ? 'max-w-[62ch]' : 'max-w-[44ch]'
                    }`}
                  >
                    {p.tagline[locale]}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
