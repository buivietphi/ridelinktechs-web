'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/content/products';
import type { Locale } from '@/i18n/config';
import { prefersReducedMotion } from '@/lib/animations';

const frameFor: Record<Product['shot'], 'phone' | 'panel' | 'bare'> = {
  ui: 'phone',
  brand: 'panel',
  photo: 'bare',
};

const modeFor = (p: Product) =>
  p.shot === 'ui' ? (p.platform === 'web' ? 'panel' : 'phone') : frameFor[p.shot];

type DeviceFrameProps = {
  product: Product;
  locale: Locale;
  className?: string;
  priority?: boolean;
  caption?: string;
};

export function DeviceFrame({ product, locale, className, priority, caption }: DeviceFrameProps) {
  const [loaded, setLoaded] = useState(false);
  const mode = modeFor(product);
  const alt = `${product.name[locale]} — ${caption ?? 'giao diện sản phẩm'}`;

  const screen = (
    <Image
      src={product.image ?? ''}
      alt={alt}
      fill
      priority={priority}
      sizes="(min-width: 1024px) 380px, (min-width: 640px) 46vw, 86vw"
      onLoad={() => setLoaded(true)}
      className={`object-cover transition-opacity duration-700 ease-[var(--ease-out-quint)] ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );

  if (mode === 'phone') {
    return (
      <div className={`relative ${className ?? ''}`}>
        <div className="relative mx-auto w-[min(280px,72%)] rounded-[2.2rem] bg-[var(--ground-sink)] p-2 shadow-[var(--shadow-device)] ring-1 ring-white/10">
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.7rem] bg-black">
            <div className="absolute inset-x-0 top-0 z-20 flex h-6 items-center justify-center">
              <span className="h-1.5 w-16 rounded-full bg-black/80" />
            </div>
            {product.image ? screen : null}
          </div>
        </div>
        {caption ? (
          <p className="mt-5 text-center font-mono text-[11px] text-[var(--ink-faint)]">
            {caption}
          </p>
        ) : null}
      </div>
    );
  }
  const isBrand = product.shot === 'brand';
  const plate = isBrand ? 'bg-[#F7F7F8]' : 'bg-[var(--ground-sink)]';
  const width = isBrand ? 'w-[min(440px,88%)]' : 'w-full';

  return (
    <div className={`relative ${className ?? ''}`}>
      <div
        className={`relative mx-auto overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-device)] ring-1 ring-white/10 ${width} ${plate}`}
      >
        <div className="relative aspect-[16/10]">{product.image ? screen : null}</div>
      </div>
      {caption ? (
        <p className="mt-4 text-center font-mono text-[11px] text-[var(--ink-faint)]">{caption}</p>
      ) : null}
    </div>
  );
}
