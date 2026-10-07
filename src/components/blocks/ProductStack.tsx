'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from 'next-intl';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { ProductSurface } from '@/components/ui/ProductSurface';
import { prefersReducedMotion } from '@/lib/animations';
import type { Product, ProductStatus } from '@/content/products';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/cn';

gsap.registerPlugin(ScrollTrigger);

const DOT: Record<ProductStatus, { backgroundColor: string; border: string }> = {
  shipped: { backgroundColor: 'var(--signal)', border: 'none' },
  'in-development': { backgroundColor: 'transparent', border: '1.5px solid var(--signal)' },
  upcoming: { backgroundColor: 'var(--quiet)', border: 'none' },
};

type ProductStackProps = {
  products: Product[];
  locale: Locale;
};

export function ProductStack({ products, locale }: ProductStackProps) {
  const t = useTranslations('home');
  const tStatus = useTranslations('status');
  const root = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const texts = q('[data-stack-text]');
        const items = q('[data-stack-item]');
        if (texts.length !== items.length || items.length === 0) return;

        let current = 0;

        const setActive = (index: number) => {
          if (index === current) return;
          current = index;
          texts.forEach((node, i) => {
            gsap.killTweensOf(node);
            if (i === index) {
              gsap.to(node, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'expo.out' });
            } else {
              gsap.to(node, {
                autoAlpha: 0,
                y: i < index ? -22 : 22,
                duration: 0.35,
                ease: 'expo.in',
              });
            }
          });
        };

        gsap.set(texts, { autoAlpha: 0, y: 22 });
        gsap.set(texts[0], { autoAlpha: 1, y: 0 });

        items.forEach((item, i) => {
          ScrollTrigger.create({
            trigger: item,
            start: 'top 58%',
            end: 'bottom 58%',
            onEnter: () => setActive(i),
            onEnterBack: () => setActive(i),
          });

          const visual = item.querySelector('[data-stack-visual]');
          if (visual) {
            gsap.fromTo(
              visual,
              { yPercent: -4 },
              {
                yPercent: 4,
                ease: 'none',
                scrollTrigger: {
                  trigger: item,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.6,
                },
              },
            );
          }
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const statusOf = (p: Product) => (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden className="status-dot" style={DOT[p.status]} />
      <span className="text-[13px] text-[var(--ink-soft)]">
        {p.category === 'outsource' ? t('catalogue.client') : tStatus(p.status)}
      </span>
    </span>
  );

  const captionOf = (p: Product) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex cursor-help items-center gap-1.5 rounded-[var(--radius-sm)] text-[13px] text-[var(--ink-faint)]',
            'underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:text-[var(--ink-soft)]',
          )}
        >
          <span
            aria-hidden
            className="status-dot"
            style={{ backgroundColor: 'var(--ink-faint)' }}
          />
          {t(`shot.${p.shot}`)}
        </button>
      </TooltipTrigger>
      <TooltipContent>{t(`shotTip.${p.shot}`)}</TooltipContent>
    </Tooltip>
  );

  return (
    <div ref={root}>
      <TooltipProvider>
        <div className="lg:hidden">
          {products.map((p, i) => (
            <article key={p.slug} className="border-t border-[var(--rule)] py-12 first:border-t-0">
              {statusOf(p)}
              <h3 className="display-lg mt-4">{p.name[locale]}</h3>
              <p className="mt-3 max-w-[42ch] text-[16px] leading-[1.62] text-[var(--ink-soft)]">
                {p.tagline[locale]}
              </p>
              <div data-stack-visual className="mt-7">
                <ProductSurface product={p} locale={locale} priority={i < 2} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                {captionOf(p)}
                <Link href={`/products/${p.slug}`} className="link text-[15px]">
                  {t('bench.open')}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[152px]">
              <div className="stack-pane">
                {products.map((p) => (
                  <div key={p.slug} data-stack-text className="stack-pane-item">
                    {statusOf(p)}
                    <h3 className="display-lg mt-5">{p.name[locale]}</h3>
                    <p className="mt-4 max-w-[34ch] text-[17px] leading-[1.62] text-[var(--ink-soft)]">
                      {p.tagline[locale]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {products.map((p, i) => (
              <div
                key={p.slug}
                data-stack-item
                className="border-t border-[var(--rule)] py-16 first:border-t-0 lg:py-24"
              >
                <div data-stack-visual>
                  <ProductSurface product={p} locale={locale} priority={i < 2} />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                  {captionOf(p)}
                  <Link href={`/products/${p.slug}`} className="link text-[15px]">
                    {t('bench.open')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
