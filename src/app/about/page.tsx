import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { about } from '@/content/about';
import { company } from '@/content/company';
import { products } from '@/content/products';
import type { Locale } from '@/i18n/config';
import { GridBackdrop } from '@/components/blocks/GridBackdrop';
import { ProductRows } from '@/components/blocks/ProductRows';
import { PromiseStage } from '@/components/blocks/PromiseStage';
import { StoryRail } from '@/components/blocks/StoryRail';
import { JumpLink } from '@/components/ui/JumpLink';
import { LogoMark } from '@/components/ui/LogoMark';
import { CardSwap } from '@/components/motion/CardSwap';
import { Magnetic } from '@/components/motion/Magnetic';
import { PageIntro } from '@/components/motion/PageIntro';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal, RevealGroup } from '@/components/motion/Reveal';
import { ScrollWords } from '@/components/motion/ScrollWords';
import { Spotlight } from '@/components/motion/Spotlight';
import { cn } from '@/lib/cn';

const PHONE_RATIO = 1200 / 554;
const wrap = 'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-10';

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;
  return {
    title: about.meta.title[locale],
    description: about.meta.description[locale],
  };
}

export default async function AboutPage() {
  const locale = (await getLocale()) as Locale;
  const tStatus = await getTranslations('status');
  const { hero, intro, story, halves, practice, closing, cta } = about;

  const inHouse = products.filter((p) => p.category === 'prod');
  const clientProject = products.find((p) => p.category === 'outsource');

  const heroShots = inHouse.flatMap((p) =>
    p.image ? [{ slug: p.slug, name: p.name[locale], src: p.image }] : [],
  );

  const rows = inHouse.map((p) => ({
    slug: p.slug,
    name: p.name[locale],
    problem: (p.problem ?? p.tagline)[locale],
    status: p.status,
    statusLabel: tStatus(p.status),
  }));

  const milestones = products
    .flatMap((p) =>
      p.timeline.map((m) => ({ date: m.date, product: p.name[locale], label: m.label[locale] })),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  const today = (['in-development', 'upcoming', 'shipped'] as const)
    .map((status) => ({
      value: products.filter((p) => p.status === status).length,
      label: tStatus(status),
    }))
    .filter((stat) => stat.value > 0);

  const storyCards = story.eras.map((era) => {
    const [from, to] = era.range ?? [];
    return {
      id: era.id,
      period: era.period[locale],
      title: era.title[locale],
      body: era.body?.[locale],
      milestones: from && to ? milestones.filter((m) => m.date >= from && m.date <= to) : [],
      image: era.image
        ? { src: era.image, alt: era.imageAlt?.[locale] ?? era.title[locale] }
        : undefined,
      plans: era.plans?.map((plan) => plan[locale]),
      stats: era.stats ? today : undefined,
      logo: era.logo,
    };
  });

  const chapters = practice.items.map((item, i) => ({
    id: item.id,
    title: item.title[locale],
    body: item.body[locale],
    image: item.image,
    alt: item.imageAlt[locale],
    frame: item.frame,
    extra:
      i === 0 ? (
        <div className="mt-10">
          <p className="display-sm">{practice.stackHeading[locale]}</p>
          <dl className="mt-4 flex flex-col gap-3">
            {practice.stack.map((group) => (
              <div key={group.label.en} className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <dt className="data-label w-24 shrink-0">{group.label[locale]}</dt>
                <dd className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-[var(--radius-pill)] border border-[var(--rule)] px-3 py-1 text-[12.5px] text-[var(--ink-soft)]"
                    >
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : undefined,
  }));

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <GridBackdrop className="-z-10" glowId="about-hero-grid" />
        <div
          className={cn(
            wrap,
            'grid min-h-[calc(100dvh-132px)] grid-cols-1 items-center gap-14 py-12 lg:grid-cols-12 lg:gap-8 lg:py-14',
          )}
        >
          <PageIntro className="lg:col-span-7">
            <p data-intro-meta className="text-[14px] font-medium text-[var(--ink-faint)]">
              {hero.eyebrow[locale]}
            </p>
            <h1 className="mt-6 text-[clamp(2.25rem,4.1vw,3.6rem)] leading-[1.08] font-extrabold tracking-[-0.04em]">
              {hero.titleLines.map((line, i) => (
                <span key={line.en} className="hero-line-mask block overflow-hidden">
                  <span
                    data-intro-line
                    className={cn('block', i === 0 && 'text-[var(--ink-soft)]')}
                  >
                    {line[locale]}
                  </span>
                </span>
              ))}
            </h1>
            <p
              data-intro-meta
              className="mt-7 max-w-[44ch] text-[18px] leading-[1.62] text-[var(--ink-soft)]"
            >
              {hero.lede[locale]}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link data-intro-action href="/contact" className="btn btn-primary">
                  {cta.brief[locale]}
                </Link>
              </Magnetic>
              <JumpLink data-intro-action to="hanh-trinh" className="btn">
                {cta.journey[locale]}
              </JumpLink>
            </div>
          </PageIntro>

          <div className="flex justify-center lg:col-span-5">
            <CardSwap
              ratio={PHONE_RATIO}
              className="[--cw:196px] sm:[--cw:224px] lg:[--cw:clamp(150px,calc((100dvh_-_244px)/2.534),256px)]"
            >
              {heroShots.map((shot) => (
                <div
                  key={shot.slug}
                  className="relative h-full w-full rounded-[2.1rem] bg-[var(--ground-sink)] p-[3px] shadow-[var(--shadow-device)] ring-1 ring-white/12"
                >
                  <div className="relative h-full w-full overflow-hidden rounded-[1.8rem] bg-black">
                    <Image
                      src={shot.src}
                      alt={`${shot.name}: ${hero.shotAlt[locale]}`}
                      fill
                      priority
                      sizes="240px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
              ))}
            </CardSwap>
          </div>
        </div>
      </section>

      <section className={cn(wrap, 'py-20 lg:py-28')}>
        <Reveal>
          <h2 className="display-xl max-w-[22ch]">{intro.heading[locale]}</h2>
        </Reveal>

        <RevealGroup
          className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8"
          stagger={0.12}
        >
          <Spotlight
            data-reveal-item
            className="panel flex min-h-[300px] flex-col items-center justify-center gap-6 overflow-hidden p-8 text-center lg:col-span-5"
          >
            <GridBackdrop className="-z-10" glowId="about-intro-grid" />
            <LogoMark size={148} />
            <div>
              <p className="display-md">{company.name}</p>
              <p className="mt-1.5 text-[14px] text-[var(--ink-faint)]">{intro.place[locale]}</p>
            </div>
          </Spotlight>

          <div data-reveal-item className="flex flex-col justify-center lg:col-span-7">
            {intro.paragraphs.map((paragraph, i) => (
              <p
                key={paragraph.en}
                className={cn(
                  'max-w-[58ch] text-[17px] leading-[1.75] text-[var(--ink-soft)]',
                  i > 0 && 'mt-5',
                )}
              >
                {paragraph[locale]}
              </p>
            ))}
            <p className="mt-8 max-w-[44ch] text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.4] font-semibold tracking-[-0.02em] text-[var(--ink)]">
              {intro.mission[locale]}
            </p>
          </div>
        </RevealGroup>
      </section>

      <StoryRail
        id="hanh-trinh"
        heading={story.heading[locale]}
        lede={story.lede[locale]}
        todayLabel={story.today[locale]}
        prevLabel={story.prev[locale]}
        nextLabel={story.next[locale]}
        cards={storyCards}
      />

      <section className={cn(wrap, 'py-24 lg:py-36')}>
        <ScrollWords
          text={about.statement[locale]}
          className="max-w-[32ch] text-[clamp(1.7rem,3.7vw,3rem)] leading-[1.22] font-semibold tracking-[-0.03em] text-balance"
        />
      </section>

      <section className={cn(wrap, 'py-20 lg:py-28')}>
        <Reveal>
          <h2 className="display-xl max-w-[22ch]">{halves.heading[locale]}</h2>
        </Reveal>

        <RevealGroup className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-12" stagger={0.12}>
          <Spotlight data-reveal-item className="panel p-7 sm:p-9 lg:col-span-7">
            <h3 className="display-lg">{halves.own.title[locale]}</h3>
            <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.7] text-[var(--ink-soft)]">
              {halves.own.lede[locale]}
            </p>
            <ProductRows rows={rows} />
            <p className="mt-6 max-w-[52ch] border-t border-[var(--rule)] pt-6 text-[15px] leading-[1.7] text-[var(--ink-soft)]">
              {halves.own.invest[locale]}
            </p>
          </Spotlight>

          {clientProject ? (
            <Spotlight data-reveal-item className="panel flex flex-col lg:col-span-5">
              <Link href={`/products/${clientProject.slug}`} className="group block p-2.5 pb-0">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[calc(var(--radius-xl)-10px)] bg-[var(--ground-sink)]">
                  <Parallax className="absolute inset-x-0 -top-[8%] h-[116%]">
                    <Image
                      src={clientProject.image ?? ''}
                      alt={clientProject.name[locale]}
                      fill
                      sizes="(min-width: 1024px) 560px, 92vw"
                      className="object-cover object-top transition-transform duration-700 ease-[var(--ease-out-quint)] group-hover:scale-[1.03]"
                    />
                  </Parallax>
                </div>
              </Link>
              <div className="flex flex-1 flex-col p-7 sm:p-9">
                <h3 className="display-lg">{halves.client.title[locale]}</h3>
                <p className="mt-3 max-w-[48ch] text-[16px] leading-[1.7] text-[var(--ink-soft)]">
                  {halves.client.lede[locale]}
                </p>
                <p className="mt-6 text-[15px] leading-[1.65] text-[var(--ink)]">
                  {halves.client.caption[locale]}
                </p>
                <p className="mt-2 text-[14px] leading-[1.65] text-[var(--ink-faint)]">
                  {halves.client.nda[locale]}
                </p>
              </div>
            </Spotlight>
          ) : null}
        </RevealGroup>
      </section>

      <section className={cn(wrap, 'py-20 lg:py-28')}>
        <Reveal>
          <h2 className="display-xl max-w-[22ch]">{practice.heading[locale]}</h2>
        </Reveal>
        <div className="mt-12 lg:mt-16">
          <PromiseStage chapters={chapters} />
        </div>
      </section>

      <section className={cn(wrap, 'pb-8 lg:pb-12')}>
        <Reveal>
          <div className="panel relative isolate overflow-hidden px-7 py-14 sm:px-12 lg:px-16 lg:py-20">
            <GridBackdrop className="-z-10" glowId="about-closing-grid" />
            <h2 className="display-xl max-w-[24ch]">{closing.heading[locale]}</h2>
            <p className="mt-5 max-w-[52ch] text-[17px] leading-[1.7] text-[var(--ink-soft)]">
              {closing.lede[locale]}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Link href="/contact" className="btn btn-primary">
                  {cta.brief[locale]}
                </Link>
              </Magnetic>
              <Link href="/products" className="btn">
                {cta.products[locale]}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
