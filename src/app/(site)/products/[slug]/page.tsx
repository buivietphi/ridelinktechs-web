import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { findProduct, products } from '@/content/products';
import type { Locale } from '@/i18n/config';
import { DeviceStage } from '@/components/blocks/DeviceStage';
import { GridBackdrop } from '@/components/blocks/GridBackdrop';
import { ScreenCarousel } from '@/components/blocks/ScreenCarousel';
import { Magnetic } from '@/components/motion/Magnetic';
import { PageIntro } from '@/components/motion/PageIntro';
import { Reveal, RevealGroup } from '@/components/motion/Reveal';
import { Spotlight } from '@/components/motion/Spotlight';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, ArrowUpRight } from '@/components/ui/Icons';
import { JumpLink } from '@/components/ui/JumpLink';
import { cn } from '@/lib/cn';
import { clip, pageMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumb, faqPage, graph, softwareApplication } from '@/lib/schema';

type Params = { params: Promise<{ slug: string }> };

const wrap = 'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10';

const formatDate = (date: string) => {
  const [year, month] = date.split('-');
  return `${month}/${year}`;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return {};
  const locale = (await getLocale()) as Locale;
  const lead = product.problem?.[locale] ?? product.description[locale];
  return pageMetadata({
    title: product.name[locale],
    description: clip(`${product.tagline[locale]} ${lead}`, 165),
    path: `/products/${product.slug}`,
  });
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const locale = (await getLocale()) as Locale;
  const t = await getTranslations('productDetail');
  const tStatus = await getTranslations('status');
  const tCategory = await getTranslations('products.category');
  const tCrumb = await getTranslations('nav');

  const isClient = product.category === 'outsource';
  const name = product.name[locale];
  const phone = product.platform === 'mobile';
  const host = product.demoUrl ? new URL(product.demoUrl).host : undefined;

  const files = product.screens?.length ? product.screens : product.image ? [product.image] : [];
  const captionOf = (i: number) => product.screenCaptions?.[i]?.[locale] ?? '';
  const altOf = (i: number) => (captionOf(i) ? `${name}: ${captionOf(i)}` : name);
  const stageShots = files.map((src, i) => ({ src, alt: altOf(i) }));
  const carouselShots = files.map((src, i) => ({ src, caption: captionOf(i), alt: altOf(i) }));

  const facts = [
    { label: t('facts.status'), value: tStatus(product.status) },
    { label: t('facts.platform'), value: t(`platform.${product.platform}`) },
    ...product.timeline.map((mark) => ({
      label: mark.label[locale],
      value: formatDate(mark.date),
    })),
  ];
  const factCols = facts.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
  const stepCols =
    product.howItWorks?.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3';
  const briefHref = isClient
    ? '/contact?type=build'
    : `/contact?project=${product.slug}&type=invest`;

  const next = products[(products.indexOf(product) + 1) % products.length];

  return (
    <>
      <JsonLd
        data={graph(
          softwareApplication(product, locale),
          faqPage(product.faq ?? [], locale),
          breadcrumb(
            [
              { name: tCrumb('home'), path: '/' },
              { name: tCrumb('products'), path: '/products' },
              { name, path: `/products/${product.slug}` },
            ],
            locale,
          ),
        )}
      />
      <section className="relative isolate overflow-hidden">
        <GridBackdrop className="-z-10" glowId="product-hero-grid" />
        <div
          className={cn(
            wrap,
            'grid min-h-[calc(100dvh-132px)] grid-cols-1 items-center gap-12 py-10 lg:grid-cols-12 lg:gap-8 lg:py-12',
          )}
        >
          <PageIntro className="lg:col-span-6">
            <nav
              data-intro-meta
              aria-label={t('breadcrumb')}
              className="text-[14px] text-[var(--ink-soft)]"
            >
              <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <li className="flex items-center gap-1.5">
                  <Link href="/products" className="link hit inline-flex items-center gap-2">
                    <ArrowLeft aria-hidden size={14} weight="bold" />
                    {t('back')}
                  </Link>
                  <span aria-hidden className="text-[var(--ink-faint)]">
                    /
                  </span>
                </li>
                <li aria-current="page" className="font-medium text-[var(--ink)]">
                  {name}
                </li>
              </ol>
            </nav>

            <div data-intro-meta className="mt-8 flex flex-wrap items-center gap-2">
              <Badge
                variant={product.status === 'upcoming' ? 'outline' : 'signal'}
                className="px-3 py-1 text-[12px]"
              >
                {tStatus(product.status)}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-[12px]">
                {isClient ? tCategory('outsource') : tCategory('internal')}
              </Badge>
            </div>

            <h1 className="mt-6 text-[clamp(2.6rem,6vw,5rem)] leading-[1.02] font-extrabold tracking-[-0.045em]">
              <span className="hero-line-mask block overflow-hidden">
                <span data-intro-line className="block">
                  {name}
                </span>
              </span>
            </h1>

            <p
              data-intro-meta
              className="mt-6 max-w-[40ch] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.55] text-[var(--ink-soft)]"
            >
              {product.tagline[locale]}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              {product.demoUrl ? (
                <>
                  <Magnetic>
                    <a
                      data-intro-action
                      href={product.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      {t('openDemo')}
                      <ArrowUpRight aria-hidden size={16} weight="bold" />
                    </a>
                  </Magnetic>
                  <Link data-intro-action href={briefHref} className="btn">
                    {t('brief')}
                  </Link>
                </>
              ) : (
                <>
                  <Magnetic>
                    <Link data-intro-action href={briefHref} className="btn btn-primary">
                      {t('brief')}
                    </Link>
                  </Magnetic>
                  {files.length > 0 ? (
                    <JumpLink data-intro-action to="man-hinh" className="btn">
                      {t('seeScreens')}
                    </JumpLink>
                  ) : null}
                </>
              )}
            </div>
          </PageIntro>

          <div className="lg:col-span-6">
            <DeviceStage kind={phone ? 'phone' : 'web'} shots={stageShots} label={host} />
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--rule)]">
        <div className={wrap}>
          <RevealGroup
            className={cn('grid grid-cols-2 gap-x-6 gap-y-8 py-8 lg:gap-0 lg:py-0', factCols)}
            stagger={0.08}
            y={20}
          >
            {facts.map((fact) => (
              <div
                key={fact.label}
                data-reveal-item
                className="lg:border-l lg:border-[var(--rule)] lg:px-8 lg:py-9 lg:first:border-l-0 lg:first:pl-0"
              >
                <p className="data-label">{fact.label}</p>
                <p className="mt-2 text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.2] font-semibold tracking-[-0.02em]">
                  {fact.value}
                </p>
              </div>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className={cn(wrap, 'py-20 lg:py-28')}>
        {product.problem ? (
          <>
            <div className="grid grid-cols-12 gap-x-8 gap-y-12">
              <Reveal className="col-span-12 lg:col-span-7">
                <h2 className="display-md text-[var(--ink-faint)]">{t('problemHeading')}</h2>
                <p className="mt-5 text-[clamp(1.5rem,2.8vw,2.3rem)] leading-[1.25] font-semibold tracking-[-0.03em] text-balance">
                  {product.problem[locale]}
                </p>
              </Reveal>
              {product.targetUser ? (
                <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9">
                  <h2 className="display-md text-[var(--ink-faint)]">{t('audienceHeading')}</h2>
                  <p className="mt-5 text-[16px] leading-[1.75] text-[var(--ink-soft)]">
                    {product.targetUser[locale]}
                  </p>
                </Reveal>
              ) : null}
            </div>
            <Reveal>
              <p className="mt-14 max-w-[68ch] text-[17px] leading-[1.8] text-[var(--ink-soft)]">
                {product.description[locale]}
              </p>
            </Reveal>
          </>
        ) : (
          <Reveal className="max-w-[64ch]">
            <h2 className="display-md text-[var(--ink-faint)]">{t('aboutHeading')}</h2>
            <p className="mt-5 text-[clamp(1.2rem,1.9vw,1.55rem)] leading-[1.6] text-[var(--ink)]">
              {product.description[locale]}
            </p>
          </Reveal>
        )}
      </section>

      <section className={wrap}>
        <Reveal>
          <h2 className="display-xl">{t('featuresHeading')}</h2>
        </Reveal>
        <RevealGroup
          className="mt-10 grid grid-cols-1 gap-x-12 border-b border-[var(--rule)] md:grid-cols-2"
          stagger={0.07}
        >
          {product.features[locale].map((feature) => (
            <div
              key={feature}
              data-reveal-item
              className="flex items-baseline gap-4 border-t border-[var(--rule)] py-5 text-[17px] leading-[1.5]"
            >
              <span
                aria-hidden
                className="h-px w-5 shrink-0 -translate-y-[0.3em] bg-[var(--signal)]"
              />
              {feature}
            </div>
          ))}
        </RevealGroup>
      </section>

      {product.howItWorks?.length ? (
        <section className={cn(wrap, 'pt-20 lg:pt-28')}>
          <Reveal>
            <h2 className="display-xl">{t('howHeading')}</h2>
          </Reveal>
          <RevealGroup
            className={cn('mt-12 grid grid-cols-1 gap-x-10 gap-y-12', stepCols)}
            stagger={0.1}
          >
            {product.howItWorks.map((step) => (
              <div
                key={step.title.en}
                data-reveal-item
                className="relative border-t border-[var(--rule)] pt-7"
              >
                <span
                  aria-hidden
                  className="absolute top-0 left-0 size-2.5 -translate-y-1/2 rounded-full bg-[var(--signal)]"
                />
                <h3 className="text-[20px] leading-[1.3] font-semibold tracking-[-0.02em]">
                  {step.title[locale]}
                </h3>
                <p className="mt-3 max-w-[36ch] text-[15px] leading-[1.7] text-[var(--ink-soft)]">
                  {step.body[locale]}
                </p>
              </div>
            ))}
          </RevealGroup>
        </section>
      ) : null}

      {carouselShots.length > 0 ? (
        <ScreenCarousel
          id="man-hinh"
          heading={t('screensHeading')}
          shots={carouselShots}
          kind={phone ? 'phone' : 'web'}
          label={host}
          prevLabel={t('carouselPrev')}
          nextLabel={t('carouselNext')}
        />
      ) : null}

      {product.faq?.length ? (
        <section className={cn(wrap, 'py-20 lg:py-28')}>
          <Reveal className="grid grid-cols-12 items-start gap-x-0 gap-y-10 lg:gap-x-8">
            <div className="col-span-12 lg:col-span-4">
              <h2 className="display-xl max-w-[12ch]">{t('faqHeading')}</h2>
            </div>
            <div className="col-span-12 lg:col-span-7 lg:col-start-6">
              <Accordion type="single" collapsible defaultValue="item-0">
                {product.faq.map((item, i) => (
                  <AccordionItem key={item.q.en} value={`item-${i}`}>
                    <AccordionTrigger>{item.q[locale]}</AccordionTrigger>
                    <AccordionContent>{item.a[locale]}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Reveal>
        </section>
      ) : null}

      <section className={cn(wrap, 'pb-8 lg:pb-12')}>
        <Reveal>
          <div className="panel relative isolate overflow-hidden px-7 py-14 sm:px-12 lg:px-16 lg:py-20">
            <GridBackdrop className="-z-10" glowId="product-cta-grid" />
            <h2 className="display-xl max-w-[24ch]">
              {isClient ? t('ctaClient', { name }) : t('ctaInHouse', { name })}
            </h2>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-[1.7] text-[var(--ink-soft)]">
              {isClient ? t('ctaClientLede') : t('ctaInHouseLede')}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link href={briefHref} className="btn btn-primary">
                  {t('brief')}
                </Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </section>

      <section className={cn(wrap, 'pb-4')}>
        <Reveal>
          <Spotlight className="panel">
            <Link
              href={`/products/${next.slug}`}
              className="group flex items-center justify-between gap-6 p-7 sm:p-9"
            >
              <div>
                <p className="data-label">{t('next')}</p>
                <p className="display-lg mt-3 transition-colors duration-300 group-hover:text-[var(--signal)]">
                  {next.name[locale]}
                </p>
                <p className="mt-2 max-w-[48ch] text-[15px] leading-[1.65] text-[var(--ink-soft)]">
                  {next.tagline[locale]}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden
                size={28}
                weight="bold"
                className="shrink-0 text-[var(--ink-faint)] transition-[transform,color] duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--signal)]"
              />
            </Link>
          </Spotlight>
        </Reveal>
      </section>
    </>
  );
}
