'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'phosphor-react';
import { RevealGroup } from '@/components/motion/Reveal';
import { TiltCard } from '@/components/motion/TiltCard';
import { ProductGlyph } from '@/components/ui/ProductGlyph';
import { statusMark } from '@/lib/status-mark';
import type { ProductIcon, ProductStatus } from '@/content/products';

type Tile = {
  slug: string;
  name: string;
  kind: string;
  icon?: ProductIcon;
  status: ProductStatus;
  statusLabel: string;
  client: boolean;
};

const glows = [
  'radial-gradient(75% 65% at 100% 0%, color-mix(in oklab, var(--signal-violet) 30%, transparent), transparent 72%)',
  'radial-gradient(75% 65% at 0% 0%, color-mix(in oklab, var(--signal-cyan) 26%, transparent), transparent 72%)',
  'radial-gradient(75% 65% at 100% 100%, color-mix(in oklab, var(--signal) 28%, transparent), transparent 72%)',
  'radial-gradient(75% 65% at 0% 100%, color-mix(in oklab, var(--signal-violet) 26%, transparent), transparent 72%)',
];

type ProductTilesProps = { items: Tile[]; openLabel: string; clientLabel: string };

export function ProductTiles({ items, openLabel, clientLabel }: ProductTilesProps) {
  return (
    <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={0.1}>
      {items.map((item, index) => (
        <div key={item.slug} data-reveal-item>
          <TiltCard max={6} className="h-full" innerClassName="rounded-[1.75rem]">
            <Link
              href={`/products/${item.slug}`}
              className="group panel relative flex min-h-[230px] flex-col justify-between rounded-[1.75rem] border border-[var(--rule)] p-5 sm:min-h-[300px] sm:p-6"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: glows[index % glows.length] }}
              />
              <div className="relative flex items-start justify-between gap-3">
                <span className="grid size-14 place-items-center rounded-2xl border border-[var(--rule)] bg-[var(--ground-sink)] text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--signal)]">
                  <ProductGlyph icon={item.icon} size={28} weight="duotone" />
                </span>
                <span
                  className={
                    item.status === 'in-development'
                      ? 'inline-flex items-center gap-1.5 rounded-full border border-[var(--signal)] px-2.5 py-1 text-[12px] leading-none text-[var(--signal)]'
                      : 'inline-flex items-center gap-1.5 rounded-full border border-[var(--rule)] px-2.5 py-1 text-[12px] leading-none text-[var(--ink-soft)]'
                  }
                >
                  <span aria-hidden className="status-dot" {...statusMark(item.status)} />
                  {item.statusLabel}
                </span>
              </div>

              <div className="relative">
                {item.client ? (
                  <p className="mb-2 text-[12px] font-medium text-[var(--ink-faint)]">
                    {clientLabel}
                  </p>
                ) : null}
                <h3 className="text-[26px] leading-tight font-bold tracking-[-0.03em] text-[var(--ink)]">
                  {item.name}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.5] text-[var(--ink-soft)]">{item.kind}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--signal)]">
                  {openLabel}
                  <ArrowUpRight
                    aria-hidden
                    size={16}
                    weight="bold"
                    className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-1 group-hover:-translate-y-0.5"
                  />
                </span>
              </div>
            </Link>
          </TiltCard>
        </div>
      ))}
    </RevealGroup>
  );
}
