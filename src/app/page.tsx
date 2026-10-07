import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { products } from '@/content/products';
import { about } from '@/content/about';
import type { Locale } from '@/i18n/config';
import { HomeHero } from '@/components/blocks/HomeHero';
import { ProductRail } from '@/components/blocks/ProductRail';
import { ScrollProgress } from '@/components/blocks/ScrollProgress';
import { Reveal, RevealGroup } from '@/components/motion/Reveal';
import { Magnetic } from '@/components/motion/Magnetic';

const shipped = products.filter((p) => p.status === 'shipped').length;
const inHouse = products.filter((p) => p.category === 'prod').length;

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home');

  const facts = [
    { value: products.length, label: t('facts.products') },
    { value: inHouse, label: t('facts.inHouse') },
    { value: shipped, label: t('facts.shipped') },
  ];

  return (
    <>
      <ScrollProgress />
      <HomeHero />

      <section className="border-y border-[var(--rule)]">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <RevealGroup className="grid grid-cols-1 sm:grid-cols-3" stagger={0.09} y={24}>
            {facts.map((f) => (
              <div
                key={f.label}
                data-reveal-item
                className="flex items-baseline gap-4 border-t border-[var(--rule)] py-7 first:border-t-0 sm:border-t-0 sm:border-l sm:px-8 sm:first:border-l-0 sm:first:pl-0"
              >
                <p className="tabnum text-[clamp(3rem,7vw,5.25rem)] leading-[0.85] font-extrabold tracking-[-0.05em] text-[var(--ink)]">
                  {f.value}
                </p>
                <p className="max-w-[16ch] text-[14px] leading-[1.45] text-[var(--ink-soft)]">
                  {f.label}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <Reveal className="grid grid-cols-12 items-end gap-x-0 gap-y-6 lg:gap-x-8">
            <h2 className="display-xl col-span-12 max-w-[16ch] lg:col-span-7">
              {t('catalogue.heading')}
            </h2>
            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <p className="max-w-[40ch] text-[16px] leading-[1.65] text-[var(--ink-soft)]">
                {t('catalogue.lede')}
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-12 w-full max-w-[1440px] px-5 sm:px-8 lg:mt-16 lg:px-10">
          <ProductRail products={products} locale={locale} />
        </div>

        <Reveal>
          <div className="mx-auto mt-10 w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
            <Link href="/products" className="link text-[15px]">
              {t('catalogue.cta')}
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 32%, rgba(255,255,255,0.03) 68%, transparent 100%)',
          }}
        />
        <div className="relative mx-auto w-full max-w-[1440px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <Reveal className="grid grid-cols-12 items-end gap-x-0 gap-y-6 lg:gap-x-8">
            <h2 className="display-xl col-span-12 max-w-[18ch] lg:col-span-7">
              {t('practice.heading')}
            </h2>
            <p className="col-span-12 max-w-[40ch] text-[16px] leading-[1.65] text-[var(--ink-soft)] lg:col-span-4 lg:col-start-9">
              {t('practice.lede')}
            </p>
          </Reveal>

          <RevealGroup
            className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2"
            stagger={0.07}
            y={24}
          >
            {about.focusAreas.map((f, i) => (
              <div key={f.title.en} data-reveal-item>
                <span aria-hidden className="block font-mono text-[12px] text-[var(--signal)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="display-md mt-4">{f.title[locale]}</h3>
                <p className="mt-3 max-w-[46ch] text-[15px] leading-[1.7] text-[var(--ink-soft)]">
                  {f.description[locale]}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-24 sm:px-8 lg:px-10 lg:pb-32">
        <Reveal className="grid grid-cols-12 items-end gap-x-0 gap-y-8 lg:gap-x-8">
          <h2 className="display-xl col-span-12 max-w-[16ch] lg:col-span-7">
            {t('contact.heading')}
          </h2>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p className="max-w-[40ch] text-[16px] leading-[1.65] text-[var(--ink-soft)]">
              {t('contact.lede')}
            </p>
            <Magnetic className="mt-7">
              <Link href="/contact" className="btn btn-primary">
                {t('contact.cta')}
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </section>
    </>
  );
}
