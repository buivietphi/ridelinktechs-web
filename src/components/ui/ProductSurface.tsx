'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Product } from '@/content/products';
import type { Locale } from '@/i18n/config';
import { imageRatio } from '@/content/image-ratio';

type ProductSurfaceProps = {
  product: Product;
  locale: Locale;
  priority?: boolean;
  bleed?: boolean;
  fit?: 'intrinsic' | 'contain';
};

export function ProductSurface({
  product,
  locale,
  priority,
  bleed,
  fit = 'intrinsic',
}: ProductSurfaceProps) {
  const [ready, setReady] = useState(false);
  const isWeb = product.platform === 'web';
  const isMobile = product.platform === 'mobile';
  const hasUi = product.shot === 'ui';

  const bleedClass = bleed ? 'lg:-mr-10 xl:-mr-20' : '';
  const contain = fit === 'contain';

  const frame = contain
    ? 'relative h-full w-full'
    : 'relative aspect-[16/10] overflow-hidden bg-[var(--ground-sink)]';
  const plate = contain
    ? 'relative flex h-full w-full items-center justify-center overflow-hidden rounded-[var(--radius-lg)] p-4'
    : 'relative flex justify-center';

  if (isWeb && product.demoUrl && !contain) {
    return (
      <div className={`${contain ? 'h-full w-full' : `relative ${bleedClass}`}`}>
        <div
          className={
            contain
              ? 'relative h-full w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--ground-sink)]'
              : 'relative aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--ground-sink)]'
          }
        >
          <iframe
            src={product.demoUrl}
            title={`${product.name[locale]} — bản chạy thật`}
            loading={priority ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups"
            referrerPolicy="no-referrer"
          />
        </div>
        <p className="mt-3 font-mono text-[11px] text-[var(--ink-faint)]">{product.demoUrl}</p>
      </div>
    );
  }

  if (product.shot === 'brand') {
    return (
      <div
        className={
          contain ? plate : `relative flex justify-center ${bleedClass ? 'lg:justify-start' : ''}`
        }
      >
        <div
          className={
            contain
              ? 'relative h-full w-full overflow-hidden rounded-[var(--radius-lg)] p-6'
              : 'relative w-[min(340px,84%)] overflow-hidden rounded-[var(--radius-lg)] p-8 ring-1 ring-white/12'
          }
          style={{ backgroundColor: '#F5F4F0' }}
        >
          <div className={contain ? 'relative h-full w-full' : 'relative aspect-[4/3]'}>
            {product.image ? (
              <Image
                src={product.image}
                alt={`${product.name[locale]} — brand mark`}
                fill
                priority={priority}
                sizes="(min-width: 1024px) 340px, 84vw"
                onLoad={() => setReady(true)}
                className={`object-contain transition-opacity duration-700 ${
                  ready ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (hasUi && isMobile) {
    return (
      <div className={contain ? plate : `relative ${bleedClass} flex justify-center`}>
        {contain && product.image ? (
          <div
            className="relative h-full overflow-hidden rounded-[1.75rem] bg-[var(--ground-sink)] ring-1 ring-white/12"
            style={{ aspectRatio: imageRatio(product.image) }}
          >
            <div className="absolute inset-[3px] overflow-hidden rounded-[1.4rem] bg-black">
              <Image
                src={product.image}
                alt={`${product.name[locale]} — giao diện thật`}
                fill
                priority={priority}
                sizes="(min-width: 1024px) 240px, 68vw"
                onLoad={() => setReady(true)}
                className={`rounded-[1.2rem] transition-opacity duration-700 ${
                  ready ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="relative w-[min(236px,68%)] overflow-hidden rounded-[1.75rem] bg-[var(--ground-sink)] p-[3px] ring-1 ring-white/12">
            <div className="relative aspect-[9/15] overflow-hidden rounded-[1.4rem] bg-black">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={`${product.name[locale]} — giao diện thật`}
                  fill
                  priority={priority}
                  sizes="(min-width: 1024px) 240px, 68vw"
                  onLoad={() => setReady(true)}
                  className={`object-cover object-top transition-opacity duration-700 ${
                    ready ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={contain ? 'h-full w-full' : `relative ${bleedClass}`}>
      <div
        className={
          contain
            ? 'relative h-full w-full overflow-hidden rounded-[var(--radius-lg)] bg-[var(--ground-sink)]'
            : 'relative aspect-[16/10] overflow-hidden bg-[var(--ground-sink)]'
        }
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={`${product.name[locale]} — ảnh minh hoạ`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 58vw, 100vw"
            onLoad={() => setReady(true)}
            className={`object-cover transition-opacity duration-700 ${
              ready ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}
      </div>
    </div>
  );
}
