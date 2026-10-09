import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { products } from '@/content/products';
import type { Locale } from '@/i18n/config';
import { GridBackdrop } from '@/components/blocks/GridBackdrop';
import { PageIntro } from '@/components/motion/PageIntro';
import { Reveal } from '@/components/motion/Reveal';
import { pageMetadata } from '@/lib/seo';
import { ProductGrid } from './_product/ProductGrid';

export async function generateMetadata(): Promise<Metadata> {
  const tNav = await getTranslations('nav');
  const t = await getTranslations('meta.products');
  return pageMetadata({
    title: tNav('products'),
    description: t('description'),
    path: '/products',
  });
}

export default async function ProductsPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('products');
  const tStatus = await getTranslations('status');

  const statusLabels: Record<string, string> = {
    'in-development': tStatus('in-development'),
    upcoming: tStatus('upcoming'),
    shipped: tStatus('shipped'),
  };

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <GridBackdrop
          className="-z-10 [mask-image:linear-gradient(to_bottom,black_50%,transparent)]"
          glowId="products-hero-grid"
        />
        <div className="mx-auto w-full max-w-[1440px] px-5 pt-14 pb-12 sm:px-8 lg:px-10 lg:pt-20 lg:pb-16">
          <PageIntro>
            <h1 className="max-w-[16ch] text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[1.04] font-extrabold tracking-[-0.045em]">
              <span className="hero-line-mask block overflow-hidden">
                <span data-intro-line className="block">
                  {t('title')}
                </span>
              </span>
            </h1>
            <p
              data-intro-meta
              className="mt-6 max-w-[56ch] text-[17px] leading-[1.65] text-[var(--ink-soft)]"
            >
              {t('subtitle')}
            </p>
          </PageIntro>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <ProductGrid items={products} locale={locale} statusLabels={statusLabels} />

        <Reveal>
          <p className="mt-12 max-w-[60ch] text-[14px] leading-[1.7] text-[var(--ink-faint)]">
            {t('footnote')}
          </p>
        </Reveal>
      </section>
    </>
  );
}
