'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { ProductSurface } from '@/components/ui/ProductSurface';
import { prefersReducedMotion } from '@/lib/animations';
import type { Product, ProductStatus } from '@/content/products';
import type { Locale } from '@/i18n/config';

gsap.registerPlugin(ScrollTrigger);

const STATUS_CLASS: Record<ProductStatus, string> = {
  shipped: 'border-[var(--signal)] text-[var(--signal)]',
  'in-development': 'border-[var(--signal)] text-[var(--signal)]',
  upcoming: 'border-[var(--rule)] text-[var(--ink-soft)]',
};

type ProductRailProps = {
  products: Product[];
  locale: Locale;
};

export function ProductRail({ products, locale }: ProductRailProps) {
  const t = useTranslations('home');
  const tStatus = useTranslations('status');
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;
      if (!el) return;
      const tweenIn = gsap.fromTo(
        el.querySelectorAll('[data-rail-card]'),
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        },
      );
      return () => {
        tweenIn.scrollTrigger?.kill();
        tweenIn.kill();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <article key={p.slug} data-rail-card>
          <Link
            href={`/products/${p.slug}`}
            className="group flex h-full flex-col rounded-[var(--radius-xl)] border border-[var(--rule)] bg-[var(--ground-raise)] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge
                variant="outline"
                className={`px-2.5 py-1 text-[11px] ${STATUS_CLASS[p.status]}`}
              >
                {p.category === 'outsource' ? t('catalogue.client') : tStatus(p.status)}
              </Badge>
              <span className="text-[12px] text-[var(--ink-faint)]">{t(`shot.${p.shot}`)}</span>
            </div>

            <div className="mt-4 h-[280px] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--ground-sink)]">
              <ProductSurface product={p} locale={locale} fit="contain" />
            </div>

            <h3 className="display-md mt-5">{p.name[locale]}</h3>
            <p className="mt-2 max-w-[38ch] text-[15px] leading-[1.6] text-[var(--ink-soft)]">
              {p.tagline[locale]}
            </p>

            <span className="link mt-5 inline-block self-start text-[15px] group-hover:text-[var(--signal)]">
              {t('bench.open')}
            </span>
          </Link>
        </article>
      ))}
    </div>
  );
}
