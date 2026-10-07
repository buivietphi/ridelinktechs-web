import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ChapterFrame } from '@/components/ui/ChapterFrame';
import { EditorialHeading } from '@/components/ui/EditorialHeading';
import { Kicker } from '@/components/ui/Kicker';
import { ProductImage } from '@/components/ui/ProductImage';
import { ParallaxFloat } from '@/components/blocks/ParallaxFloat';
import { type Product } from '@/content/products';
import type { Locale } from '@/i18n/config';

interface ProductChapterProps {
  product: Product;
  index: number;
  locale: Locale;
  isFirst?: boolean;
  isLast?: boolean;
}

export async function ProductChapter({
  product,
  index,
  locale,
  isFirst,
  isLast,
}: ProductChapterProps) {
  const tCategory = await getTranslations('products.category');
  const tCard = await getTranslations('products.card');
  const tCaption = await getTranslations('product.caption');

  const isOutsource = product.category === 'outsource';
  const serial = String(index).padStart(2, '0');
  const categoryLabel = isOutsource ? tCategory('outsource') : tCategory('internal');
  const displayName = isOutsource;
  product.name[locale];
  const tagline = product.tagline[locale];
  const description = product.description[locale];
  const excerpt = Array.from(description).slice(0, 280).join('');
  const captionKey = isOutsource ? 'outsource' : product.slug;
  const caption = tCaption(captionKey);
  const photoCredit = product.imageCredit ? `${product.imageCredit.name} / Unsplash` : undefined;

  return (
    <ChapterFrame id={product.slug} noTopRule={isFirst} noBottomRule={isLast}>
      {}
      <div className="grid grid-cols-1 gap-y-8 md:grid-cols-12 md:gap-x-6">
        <div className="md:col-span-2">
          <Kicker>
            {serial} — {categoryLabel}
          </Kicker>
        </div>
        <div className="md:col-span-10">
          <EditorialHeading size="chapter" className="max-w-[20ch]">
            {displayName}
          </EditorialHeading>
          <p className="mt-6 max-w-[64ch] text-[18px] leading-[1.65] text-[var(--ink-soft)]">
            {tagline}
          </p>
          <p className="mt-6 max-w-[64ch] text-[16px] leading-[1.65] text-[var(--ink-soft)]">
            {excerpt}
          </p>
        </div>
      </div>

      {}
      <div className="mt-12 md:mt-16">
        <ParallaxFloat strength={8}>
          <ProductImage
            product={product}
            locale={locale}
            caption={caption}
            photoCredit={photoCredit}
            aspect="16/9"
          />
        </ParallaxFloat>
      </div>

      {}
      <div className="mt-10">
        <Link
          href={`/products/${product.slug}`}
          aria-label={product.name[locale]}
          className="group inline-flex items-baseline gap-2 text-[12px] font-[var(--font-mono)] tracking-[0.18em] text-[var(--ink)] uppercase transition-colors hover:text-[var(--signal)]"
        >
          <span aria-hidden>[</span>
          <span>{tCard('cta')}</span>
          <span
            aria-hidden
            className="text-[var(--signal)] transition-transform group-hover:translate-x-1"
          >
            →
          </span>
          <span aria-hidden>]</span>
        </Link>
      </div>
    </ChapterFrame>
  );
}
