'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight } from 'phosphor-react';
import { StatCounter } from '@/components/motion/StatCounter';
import { LogoMark } from '@/components/ui/LogoMark';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type StoryMilestone = { date: string; product: string; label: string };
export type StoryStat = { value: number; label: string };

export type StoryCard = {
  id: string;
  period: string;
  title: string;
  body?: string;
  milestones: StoryMilestone[];
  image?: { src: string; alt: string };
  plans?: string[];
  stats?: StoryStat[];
  logo?: boolean;
};

type StoryRailProps = {
  id?: string;
  heading: string;
  lede: string;
  todayLabel: string;
  prevLabel: string;
  nextLabel: string;
  cards: StoryCard[];
};

const formatDate = (date: string) => {
  const [year, month] = date.split('-');
  return `${month}/${year}`;
};

function StoryCardView({ card, todayLabel }: { card: StoryCard; todayLabel: string }) {
  const future = Boolean(card.plans);
  const plain = !card.image && !card.stats && !future;

  return (
    <article
      data-story-card
      className={cn(
        'relative isolate flex w-[84vw] max-w-[420px] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-xl)] p-7 sm:p-8 lg:h-[500px]',
        future ? 'border border-dashed border-[var(--rule)]' : 'panel',
        card.image
          ? 'lg:grid lg:w-[680px] lg:max-w-none lg:grid-cols-[1fr_190px] lg:gap-7'
          : card.stats
            ? 'lg:w-[540px] lg:max-w-none'
            : 'lg:w-[420px]',
      )}
    >
      {plain ? (
        <span
          aria-hidden
          data-story-drift
          className="pointer-events-none absolute -right-6 -bottom-12 -z-10 hidden text-[10rem] leading-none font-extrabold tracking-[-0.06em] text-[var(--ink-ghost)] select-none lg:block"
        >
          {card.period.slice(0, 4)}
        </span>
      ) : null}

      {card.logo ? (
        <LogoMark
          size={48}
          className={cn(
            'absolute top-7 right-7 sm:top-8 sm:right-8',
            card.image && 'lg:right-[calc(190px+3.75rem)]',
          )}
        />
      ) : null}

      <div className="flex min-w-0 flex-col lg:h-full">
        <p className="tabnum text-[clamp(2.1rem,3.2vw,2.9rem)] leading-none font-extrabold tracking-[-0.045em] text-[var(--ink)]">
          {card.period}
        </p>
        <h3 className="display-lg mt-5 max-w-[22ch]">{card.title}</h3>
        {card.body ? (
          <p className="mt-3 text-[15px] leading-[1.7] text-[var(--ink-soft)]">{card.body}</p>
        ) : null}

        {card.plans ? (
          <ul className="mt-6 flex flex-col gap-4">
            {card.plans.map((plan) => (
              <li
                key={plan}
                className="flex gap-3 text-[15px] leading-[1.6] text-[var(--ink-soft)]"
              >
                <ArrowRight
                  aria-hidden
                  size={16}
                  weight="bold"
                  className="mt-1 shrink-0 text-[var(--signal)]"
                />
                {plan}
              </li>
            ))}
          </ul>
        ) : null}

        {card.milestones.length > 0 || card.stats ? (
          <div className="mt-auto pt-6">
            {card.milestones.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {card.milestones.map((m) => (
                  <li
                    key={`${m.date}-${m.product}`}
                    className="flex flex-wrap gap-x-3 text-[13px] leading-[1.5]"
                  >
                    <span className="tabnum font-mono text-[var(--ink-faint)]">
                      {formatDate(m.date)}
                    </span>
                    <span className="font-medium text-[var(--ink)]">{m.product}</span>
                    <span className="text-[var(--ink-faint)]">{m.label}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {card.stats ? (
              <div className="mt-4">
                <p className="data-label">{todayLabel}</p>
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
                  {card.stats.map((stat) => (
                    <p key={stat.label} className="flex items-baseline gap-2">
                      <StatCounter
                        to={stat.value}
                        onView
                        className="text-[2.25rem] leading-none font-extrabold tracking-[-0.04em]"
                      />
                      <span className="text-[14px] text-[var(--ink-soft)]">{stat.label}</span>
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {card.image ? (
        <div className="relative mx-auto mt-6 h-[220px] w-[150px] shrink-0 overflow-hidden rounded-[1.6rem] bg-[var(--ground-sink)] [mask-image:linear-gradient(to_bottom,black_72%,transparent)] ring-1 ring-white/12 lg:mt-0 lg:h-full lg:w-full lg:[mask-image:none]">
          <Image
            src={card.image.src}
            alt={card.image.alt}
            fill
            sizes="200px"
            className="object-cover object-top"
          />
        </div>
      ) : null}
    </article>
  );
}

export function StoryRail({
  id,
  heading,
  lede,
  todayLabel,
  prevLabel,
  nextLabel,
  cards,
}: StoryRailProps) {
  const root = useRef<HTMLElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const prev = useRef<HTMLButtonElement | null>(null);
  const next = useRef<HTMLButtonElement | null>(null);

  const items = () =>
    Array.from(track.current?.querySelectorAll<HTMLElement>('[data-story-card]') ?? []);
  const inset = () =>
    track.current ? parseFloat(getComputedStyle(track.current).scrollPaddingLeft) || 0 : 0;

  const goTo = (index: number) => {
    const el = track.current;
    const list = items();
    const item = list[Math.max(0, Math.min(list.length - 1, index))];
    if (!el || !item) return;
    el.scrollTo({
      left: item.offsetLeft - inset(),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const edge = el.scrollLeft + inset() + 8;
    const current = items().reduce((found, item, i) => (item.offsetLeft <= edge ? i : found), 0);
    goTo(current + dir);
  };

  useGSAP(
    () => {
      const el = track.current;
      const section = root.current;
      if (!el || !section) return;
      const list = gsap.utils.toArray<HTMLElement>('[data-story-card]', el);
      const ticks = gsap.utils.toArray<HTMLElement>('[data-story-tick]', section);
      const fill = section.querySelector<HTMLElement>('[data-story-fill]');
      const setFill = fill ? gsap.quickSetter(fill, 'scaleX') : null;

      const activate = (index: number) =>
        ticks.forEach((tick, i) => tick.setAttribute('data-on', String(i <= index)));
      const edges = (progress: number) => {
        if (prev.current) prev.current.disabled = progress <= 0.01;
        if (next.current) next.current.disabled = progress >= 0.99;
      };

      ScrollTrigger.create({
        scroller: el,
        horizontal: true,
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          setFill?.(self.progress);
          edges(self.progress);
          if (self.progress >= 0.99) activate(list.length - 1);
        },
        onRefresh: (self) => edges(self.progress),
      });

      list.forEach((item, i) => {
        ScrollTrigger.create({
          scroller: el,
          horizontal: true,
          trigger: item,
          start: 'left 30%',
          end: 'right 30%',
          onToggle: (self) => {
            if (self.isActive) activate(i);
          },
        });
      });
      activate(0);
      edges(0);

      if (prefersReducedMotion()) return;

      gsap.fromTo(
        list,
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        },
      );

      list.forEach((item) => {
        gsap.fromTo(
          item,
          { scale: 0.94 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              scroller: el,
              horizontal: true,
              trigger: item,
              start: 'left 100%',
              end: 'left 62%',
              scrub: true,
            },
          },
        );
        const drift = item.querySelector<HTMLElement>('[data-story-drift]');
        if (drift) {
          gsap.fromTo(
            drift,
            { xPercent: 14 },
            {
              xPercent: -14,
              ease: 'none',
              scrollTrigger: {
                scroller: el,
                horizontal: true,
                trigger: item,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          );
        }
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id={id}
      aria-labelledby="story-title"
      className="scroll-mt-28 py-20 lg:py-28"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <h2 id="story-title" className="display-xl max-w-[18ch]">
            {heading}
          </h2>
          <p className="mt-5 max-w-[52ch] text-[16px] leading-[1.7] text-[var(--ink-soft)]">
            {lede}
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            ref={prev}
            type="button"
            aria-label={prevLabel}
            onClick={() => step(-1)}
            className="btn size-12 p-0"
          >
            <ArrowLeft aria-hidden size={18} weight="bold" />
          </button>
          <button
            ref={next}
            type="button"
            aria-label={nextLabel}
            onClick={() => step(1)}
            className="btn size-12 p-0"
          >
            <ArrowRight aria-hidden size={18} weight="bold" />
          </button>
        </div>
      </div>

      <div
        ref={track}
        role="region"
        aria-label={heading}
        data-lenis-prevent-horizontal
        className="relative mt-10 flex snap-x snap-mandatory scroll-px-5 [scrollbar-width:none] items-start gap-5 overflow-x-auto px-5 pb-4 sm:scroll-px-8 sm:px-8 lg:mt-12 lg:scroll-px-[max(2.5rem,calc((100vw_-_1440px)/2_+_2.5rem))] lg:gap-7 lg:px-[max(2.5rem,calc((100vw_-_1440px)/2_+_2.5rem))] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <StoryCardView key={card.id} card={card} todayLabel={todayLabel} />
        ))}
      </div>

      <div className="mx-auto mt-8 w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="relative h-px bg-[var(--rule)]">
          <span
            data-story-fill
            className="absolute inset-0 origin-left scale-x-0 bg-[var(--signal)]"
          />
        </div>
        <ol className="mt-4 hidden justify-between gap-4 sm:flex">
          {cards.map((card, i) => (
            <li key={card.id}>
              <button
                type="button"
                data-story-tick
                data-on={i === 0}
                onClick={() => goTo(i)}
                className="data-label transition-colors duration-500 hover:text-[var(--ink)] data-[on=true]:text-[var(--ink)]"
              >
                {card.period}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
