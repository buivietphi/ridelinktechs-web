import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { inHouseProducts, products } from '@/content/products';
import { about } from '@/content/about';
import type { Locale } from '@/i18n/config';
import { FactsStrip } from '@/components/home/FactsStrip';
import { HeroSection } from '@/components/home/HeroSection';
import { HomeCta } from '@/components/home/HomeCta';
import { ProductTiles } from '@/components/home/ProductTiles';
import { ServicesList } from '@/components/home/ServicesList';
import { TechStack } from '@/components/home/TechStack';
import { WorkSteps } from '@/components/home/WorkSteps';
import { ScrollDial } from '@/components/home/ScrollDial';
import { Magnetic } from '@/components/motion/Magnetic';
import { Reveal } from '@/components/motion/Reveal';
import { ScrollWords } from '@/components/motion/ScrollWords';

const FOUNDED = 2025;
const wrap = 'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10';
const h2 =
  'text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta.home');
  return pageMetadata({
    title: { absolute: t('title') },
    description: t('description'),
    path: '/',
  });
}

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('home');
  const tStatus = await getTranslations('status');

  const facts = [
    { to: inHouseProducts.length, label: t('facts.products') },
    { to: products.filter((p) => p.status === 'shipped').length, label: t('facts.shipped') },
    { to: FOUNDED, from: FOUNDED - 25, label: t('facts.founded') },
  ];

  const groups = about.practice.stack;

  const tiles = products.map((p) => ({
    slug: p.slug,
    name: p.name[locale],
    kind: p.kind[locale],
    icon: p.icon,
    status: p.status,
    statusLabel: tStatus(p.status),
    client: p.category === 'outsource',
  }));

  return (
    <>
      <ScrollDial />
      <HeroSection />

      <FactsStrip facts={facts} />

      <TechStack title={t('stack.title')} groups={groups} locale={locale} />

      <section className={`${wrap} py-16 lg:py-24`}>
        <Reveal className="grid grid-cols-12 items-end gap-x-0 gap-y-6 lg:gap-x-8">
          <h2 className={`${h2} col-span-12 max-w-[14ch] lg:col-span-7`}>
            {t('services.heading')}
          </h2>
          <p className="col-span-12 max-w-[42ch] text-[16px] leading-[1.65] text-[var(--ink-soft)] lg:col-span-4 lg:col-start-9">
            {t('services.lede')}
          </p>
        </Reveal>
        <div className="mt-12 lg:mt-16">
          <ServicesList
            items={t.raw('services.items') as { title: string; body: string; tags: string[] }[]}
          />
        </div>
        <Reveal>
          <div className="mt-10">
            <Magnetic>
              <Link href="/contact?type=build" className="btn btn-primary">
                {t('services.cta')}
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </section>

      <section className={`${wrap} py-16 lg:py-24`}>
        <Reveal className="grid grid-cols-12 items-end gap-x-0 gap-y-6 lg:gap-x-8">
          <h2 className={`${h2} col-span-12 max-w-[14ch] lg:col-span-7`}>
            {t('products.heading')}
          </h2>
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <p className="max-w-[42ch] text-[16px] leading-[1.65] text-[var(--ink-soft)]">
              {t('products.lede')}
            </p>
            <Link href="/products" className="link mt-5 inline-block text-[15px] font-medium">
              {t('products.all')}
            </Link>
          </div>
        </Reveal>
        <div className="mt-12 lg:mt-16">
          <ProductTiles
            items={tiles}
            openLabel={t('products.open')}
            clientLabel={t('products.client')}
          />
        </div>
      </section>

      <section className={`${wrap} py-16 lg:py-24`}>
        <Reveal>
          <h2 className={`${h2} max-w-[16ch]`}>{t('steps.heading')}</h2>
        </Reveal>
        <div className="mt-14 lg:mt-20">
          <WorkSteps items={t.raw('steps.items') as { title: string; body: string }[]} />
        </div>
      </section>

      <section className={`${wrap} py-20 lg:py-32`}>
        <ScrollWords
          text={t('statement')}
          dim={0.5}
          className="max-w-[26ch] text-[clamp(1.9rem,4.6vw,3.9rem)] leading-[1.12] font-bold tracking-[-0.035em] text-balance text-[var(--ink)]"
        />
      </section>

      <section className={`${wrap} pb-14 lg:pb-20`}>
        <HomeCta
          actions={[
            {
              title: t('cta.build.title'),
              lede: t('cta.build.lede'),
              cta: t('cta.build.cta'),
              href: '/contact?type=build',
              primary: true,
            },
            {
              title: t('cta.invest.title'),
              lede: t('cta.invest.lede'),
              cta: t('cta.invest.cta'),
              href: '/contact?type=invest',
            },
          ]}
        />
      </section>
    </>
  );
}
