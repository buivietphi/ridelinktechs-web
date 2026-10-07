import Image from 'next/image';
import type { Product } from '@/content/products';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/cn';

interface ProductImageProps {
  product: Product;
  locale: Locale;
  caption: string;
  captionLabel?: string;
  photoCredit?: string;
  withFrame?: boolean;
  feature?: boolean;
  aspect?: '4/3' | '16/9' | '1/1' | '3/4';
  className?: string;
  priority?: boolean;
}

export function ProductImage({
  product,
  locale,
  caption,
  captionLabel = 'Visual concept',
  photoCredit,
  withFrame = true,
  feature = false,
  aspect = '16/9',
  className,
  priority = false,
}: ProductImageProps) {
  const aspectClass =
    aspect === '16/9'
      ? 'aspect-[16/9]'
      : aspect === '1/1'
        ? 'aspect-square'
        : aspect === '3/4'
          ? 'aspect-[3/4]'
          : 'aspect-[4/3]';
  const isOutsource = product.category === 'outsource';
  const pillLabel = product.name[locale];
  const altText = `${product.name[locale]} — ${captionLabel.toLowerCase()}`;

  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      <div
        className={cn(
          'relative overflow-hidden border border-[var(--rule)] bg-[var(--ground-sink)]',
          aspectClass,
        )}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={altText}
            fill
            sizes={
              feature
                ? '(min-width: 1024px) 60vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
            }
            priority={priority}
            className="relative z-10 object-cover"
          />
        ) : null}

        {}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-[color:rgba(15,15,18,0.45)] to-transparent"
        />

        {}
        {withFrame ? (
          <>
            <span aria-hidden className="absolute top-3 left-3 z-30 h-3 w-px bg-[var(--ink)]" />
            <span aria-hidden className="absolute top-3 left-3 z-30 h-px w-3 bg-[var(--ink)]" />
            <span aria-hidden className="absolute right-3 bottom-3 z-30 h-3 w-px bg-[var(--ink)]" />
            <span aria-hidden className="absolute right-3 bottom-3 z-30 h-px w-3 bg-[var(--ink)]" />
          </>
        ) : null}

        {}
        <span
          className={cn(
            'absolute bottom-3 left-3 z-30 inline-flex items-center gap-2 px-2 py-1',
            'bg-[var(--ink)] text-[var(--ground)]',
            'font-mono text-[10px] tracking-[0.16em] uppercase',
          )}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-[var(--radius-pill)] bg-[var(--signal)]"
          />
          {pillLabel}
        </span>
      </div>

      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="kicker">{captionLabel}</span>
        <span aria-hidden className="h-px flex-1 bg-[var(--rule)]" />
        <span className="text-[11px] leading-relaxed text-[var(--ink-soft)]">{caption}</span>
        {photoCredit ? <span className="kicker">· {photoCredit}</span> : null}
      </figcaption>
    </figure>
  );
}
