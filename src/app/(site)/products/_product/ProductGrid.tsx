'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'phosphor-react';
import { Reveal } from '@/components/motion/Reveal';
import { Spotlight } from '@/components/motion/Spotlight';
import { Badge } from '@/components/ui/Badge';
import { BrowserFrame, PhoneFrame } from '@/components/ui/Frames';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';
import type { Product } from '@/content/products';
import type { Locale } from '@/i18n/config';

gsap.registerPlugin(Flip, ScrollTrigger);

type Filter = 'all' | 'prod' | 'outsource';

type ProductGridProps = {
  items: Product[];
  locale: Locale;
  statusLabels: Record<string, string>;
};

const lift =
  'transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:-translate-y-2';

function TileVisual({
  product,
  locale,
  wide,
}: {
  product: Product;
  locale: Locale;
  wide: boolean;
}) {
  const shots = product.screens?.length ? product.screens : product.image ? [product.image] : [];
  const name = product.name[locale];
  const alt = (i: number) => {
    const caption = product.screenCaptions?.[i]?.[locale];
    return caption ? `${name}: ${caption}` : name;
  };
  const stage = 'wash relative overflow-hidden rounded-[calc(var(--radius-xl)-8px)]';

  if (product.platform === 'web') {
    const host = product.demoUrl ? new URL(product.demoUrl).host : undefined;
    return (
      <div className={cn(stage, 'h-[300px] sm:h-[360px]', wide && 'lg:h-full lg:min-h-[440px]')}>
        {shots[1] ? (
          <BrowserFrame
            src={shots[1]}
            alt={alt(1)}
            sizes="(min-width: 1024px) 420px, 70vw"
            className={cn('absolute top-[9%] left-[4%] w-[62%] opacity-80', lift)}
          />
        ) : null}
        {shots[0] ? (
          <BrowserFrame
            src={shots[0]}
            alt={alt(0)}
            sizes="(min-width: 1024px) 560px, 90vw"
            label={host}
            className={cn('absolute -right-[3%] -bottom-[6%] w-[84%]', lift)}
          />
        ) : null}
      </div>
    );
  }

  const sides = wide ? [shots[1], shots[2]] : [];
  return (
    <div
      className={cn(
        stage,
        wide ? 'h-[320px] sm:h-[380px] lg:h-full lg:min-h-[440px]' : 'h-[360px]',
      )}
    >
      {sides[0] ? (
        <PhoneFrame
          src={sides[0]}
          alt={alt(1)}
          sizes="200px"
          className={cn(
            'absolute top-[24%] left-[7%] w-[clamp(100px,21%,180px)] -rotate-[7deg]',
            lift,
          )}
        />
      ) : null}
      {sides[1] ? (
        <PhoneFrame
          src={sides[1]}
          alt={alt(2)}
          sizes="200px"
          className={cn(
            'absolute top-[24%] right-[7%] w-[clamp(100px,21%,180px)] rotate-[7deg]',
            lift,
          )}
        />
      ) : null}
      {shots[0] ? (
        <PhoneFrame
          src={shots[0]}
          alt={alt(0)}
          sizes="220px"
          priority={wide}
          className={cn(
            'absolute left-1/2 z-10 -translate-x-1/2',
            wide ? 'top-[11%] w-[clamp(120px,26%,210px)]' : 'top-[8%] w-[clamp(130px,32%,196px)]',
            lift,
          )}
        />
      ) : null}
    </div>
  );
}

export function ProductGrid({ items, locale, statusLabels }: ProductGridProps) {
  const t = useTranslations('products');
  const [filter, setFilter] = useState<Filter>('all');
  const gridRef = useRef<HTMLUListElement | null>(null);

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

  const select = (next: Filter) => {
    const grid = gridRef.current;
    if (!grid || next === filter) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-card]'));
    const state = prefersReducedMotion() ? null : Flip.getState(cards);

    cards.forEach((card) =>
      card.classList.toggle('hidden', next !== 'all' && card.dataset.category !== next),
    );
    setFilter(next);

    if (!state) {
      ScrollTrigger.refresh();
      return;
    }
    Flip.from(state, {
      duration: 0.7,
      ease: 'expo.out',
      absolute: true,
      stagger: 0.05,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', delay: 0.12 },
        ),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, y: -14, duration: 0.3, ease: 'power2.out' }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  };

  return (
    <>
      <div
        role="group"
        aria-label={t('filter.label')}
        className="flex flex-wrap items-center gap-2"
      >
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={active}
              onClick={() => select(tab.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2 text-[14px] leading-none transition-[background-color,border-color,color,box-shadow] duration-[180ms] ease-[var(--ease-out-quint)]',
                active
                  ? 'border-transparent bg-[var(--ink)] text-[var(--ground)] shadow-[var(--shadow-1)]'
                  : 'border-[var(--rule)] text-[var(--ink-soft)] hover:border-[var(--ink-faint)] hover:text-[var(--ink)]',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'tabnum text-[12px]',
                  active ? 'text-[var(--ground)]/60' : 'text-[var(--ink-faint)]',
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      <ul ref={gridRef} className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {items.map((p) => {
          const wide = Boolean(p.featured) || p.platform === 'web';
          const isClient = p.category === 'outsource';
          return (
            <li
              key={p.slug}
              data-card
              data-category={p.category}
              className={wide ? 'lg:col-span-2' : undefined}
            >
              <Reveal className="h-full">
                <Spotlight className="panel h-full overflow-hidden">
                  <Link
                    href={`/products/${p.slug}`}
                    className={cn('group flex h-full flex-col', wide && 'lg:grid lg:grid-cols-12')}
                  >
                    <div className={cn('p-2', wide && 'lg:order-2 lg:col-span-7')}>
                      <TileVisual product={p} locale={locale} wide={wide} />
                    </div>

                    <div
                      className={cn(
                        'flex flex-1 flex-col p-7 sm:p-9',
                        wide && 'lg:col-span-5 lg:justify-center lg:p-12',
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={p.status === 'upcoming' ? 'outline' : 'signal'}
                          className="px-3 py-1 text-[12px]"
                        >
                          {statusLabels[p.status] ?? p.status}
                        </Badge>
                        {isClient ? (
                          <Badge variant="outline" className="px-3 py-1 text-[12px]">
                            {t('category.outsource')}
                          </Badge>
                        ) : null}
                      </div>
                      <h2
                        className={cn(
                          'mt-5 transition-colors duration-300 group-hover:text-[var(--signal)]',
                          wide
                            ? 'text-[clamp(2rem,3.4vw,3rem)] leading-[1.05] font-extrabold tracking-[-0.04em]'
                            : 'display-lg',
                        )}
                      >
                        {p.name[locale]}
                      </h2>
                      <p className="mt-3 max-w-[40ch] text-[15px] leading-[1.7] text-[var(--ink-soft)]">
                        {p.tagline[locale]}
                      </p>
                      <span className="mt-7 inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--signal)]">
                        {t('viewDetail')}
                        <ArrowUpRight
                          aria-hidden
                          size={16}
                          weight="bold"
                          className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </Spotlight>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </>
  );
}
