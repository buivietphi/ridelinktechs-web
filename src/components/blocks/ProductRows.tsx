'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'phosphor-react';
import { Badge } from '@/components/ui/Badge';
import type { ProductStatus } from '@/content/products';

export type ProductRow = {
  slug: string;
  name: string;
  problem: string;
  status: ProductStatus;
  statusLabel: string;
};

export function ProductRows({ rows }: { rows: ProductRow[] }) {
  return (
    <ul className="mt-8 flex flex-col divide-y divide-[var(--rule-2)]">
      {rows.map((row) => (
        <li key={row.slug}>
          <Link
            href={`/products/${row.slug}`}
            className="group flex items-start justify-between gap-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h4 className="display-md">{row.name}</h4>
                <Badge
                  variant={row.status === 'upcoming' ? 'outline' : 'signal'}
                  className="px-2.5 py-1 text-[11px]"
                >
                  {row.statusLabel}
                </Badge>
              </div>
              <p className="mt-2 max-w-[56ch] text-[15px] leading-[1.65] text-[var(--ink-soft)]">
                {row.problem}
              </p>
            </div>
            <ArrowUpRight
              aria-hidden
              size={20}
              weight="bold"
              className="mt-1 shrink-0 text-[var(--ink-faint)] transition-[transform,color] duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--signal)]"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
