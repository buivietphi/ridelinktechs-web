'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { company } from '@/content/company';
import { products } from '@/content/products';
import { cn } from '@/lib/cn';

const SECTIONS = ['statement', 'catalogue', 'practice', 'contact'] as const;

export function StudioRail() {
  const t = useTranslations('home');
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const nodes = SECTIONS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => n !== null,
    );
    if (nodes.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const total = products.length;
  const current = Math.min(
    Math.max(SECTIONS.indexOf(active as (typeof SECTIONS)[number]) + 1, 1),
    total,
  );

  const links = [
    { id: SECTIONS[0], label: t('rail.statement') },
    { id: SECTIONS[1], label: t('rail.catalogue') },
    { id: SECTIONS[2], label: t('rail.practice') },
    { id: SECTIONS[3], label: t('rail.contact') },
  ];

  return (
    <aside className="hidden lg:col-span-3 lg:block">
      <div className="sticky top-[100px] flex flex-col gap-8">
        <p className="text-[12px] leading-[1.6] font-[var(--font-mono)] text-[var(--ink-soft)]">
          {company.address.vi}
        </p>

        <nav aria-label={t('rail.label')} className="flex flex-col gap-1">
          {links.map((l) => {
            const isActive = active === l.id;
            return (
              <Link
                key={l.id}
                href={`#${l.id}`}
                className={cn(
                  'group flex items-center gap-2.5 py-1 text-[14px] transition-colors duration-150',
                  isActive
                    ? 'text-[var(--ink)]'
                    : 'text-[var(--ink-faint)] hover:text-[var(--ink-soft)]',
                )}
                aria-current={isActive ? 'true' : undefined}
              >
                <span
                  aria-hidden
                  className={cn(
                    'h-px w-4 shrink-0 transition-colors duration-150',
                    isActive ? 'bg-[var(--signal)]' : 'bg-[var(--ink-ghost)]',
                  )}
                />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1.5 border-t border-[var(--rule)] pt-5 text-[14px]">
          <a href={`mailto:${company.email}`} className="link break-all">
            {company.email}
          </a>
          <a href={`tel:${company.phoneHref}`} className="link w-fit">
            {company.phoneDisplay}
          </a>
        </div>

        <Link href="/contact" className="btn btn-primary w-full">
          {t('briefTeaser.cta')}
        </Link>

        {}
        <div className="flex items-center gap-2.5" aria-hidden>
          <span className="flex gap-1">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'block h-[3px] w-5',
                  i < current ? 'bg-[var(--signal)]' : 'bg-[var(--ink-ghost)]',
                )}
              />
            ))}
          </span>
          <span className="tabnum text-[11px] font-[var(--font-mono)] text-[var(--ink-faint)]">
            {String(current).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </span>
        </div>
      </div>
    </aside>
  );
}
