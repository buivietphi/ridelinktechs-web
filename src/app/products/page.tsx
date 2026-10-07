import { getLocale, getTranslations } from 'next-intl/server';
import { products } from '@/content/products';
import type { Locale } from '@/i18n/config';
import { PageIntro } from '@/components/motion/PageIntro';
import { Reveal } from '@/components/motion/Reveal';
import { ProjectFilter } from './_product/ProjectFilter';

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
      <section>
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
          <PageIntro>
            <p
              className="font-mono text-[12px] tracking-[0.04em] text-[var(--ink-faint)]"
              data-intro-meta
            >
              {t('eyebrow')}
            </p>
            <h1 className="display-hero mt-6 max-w-[15ch]">
              <span className="block overflow-hidden pb-[0.08em]">
                <span className="block" data-intro-line>
                  {t('title')}
                </span>
              </span>
            </h1>
            <p
              className="mt-8 max-w-[52ch] text-[17px] leading-[1.62] text-[var(--ink-soft)]"
              data-intro-meta
            >
              {t('subtitle')}
            </p>
          </PageIntro>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <ProjectFilter items={products} locale={locale} statusLabels={statusLabels} />

        <Reveal>
          <p className="mt-14 max-w-[60ch] text-[14px] leading-[1.7] text-[var(--ink-faint)]">
            {t('footnote')}
          </p>
        </Reveal>
      </section>
    </>
  );
}
