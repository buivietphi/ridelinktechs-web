'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight } from 'phosphor-react';
import { BrowserFrame, PhoneFrame } from '@/components/ui/Frames';
import { prefersReducedMotion } from '@/lib/animations';
import { cn } from '@/lib/cn';
import { railStep } from '@/lib/rail';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type ScreenShot = { src: string; caption: string; alt: string };

type ScreenCarouselProps = {
  id?: string;
  heading: string;
  shots: ScreenShot[];
  kind: 'phone' | 'web';
  label?: string;
  prevLabel: string;
  nextLabel: string;
};

const ITEM = '[data-screen]';

export function ScreenCarousel({
  id,
  heading,
  shots,
  kind,
  label,
  prevLabel,
  nextLabel,
}: ScreenCarouselProps) {
  const root = useRef<HTMLElement | null>(null);
  const track = useRef<HTMLUListElement | null>(null);
  const controls = useRef<HTMLDivElement | null>(null);
  const prev = useRef<HTMLButtonElement | null>(null);
  const next = useRef<HTMLButtonElement | null>(null);
  const phone = kind === 'phone';
  const scrollable = shots.length > 1;

  useGSAP(
    () => {
      const el = track.current;
      const section = root.current;
      if (!el || !section) return;
      const list = gsap.utils.toArray<HTMLElement>(ITEM, el);
      const fill = section.querySelector<HTMLElement>('[data-screen-fill]');
      const setFill = fill ? gsap.quickSetter(fill, 'scaleX') : null;

      const edges = (progress: number) => {
        const fits = el.scrollWidth <= el.clientWidth + 2;
        if (controls.current) controls.current.style.visibility = fits ? 'hidden' : 'visible';
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
        },
        onRefresh: (self) => edges(self.progress),
      });
      edges(0);

      if (prefersReducedMotion()) return;

      gsap.fromTo(
        list,
        { y: 36, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id={id}
      aria-labelledby={`${id ?? 'screens'}-title`}
      className="scroll-mt-28 py-20 lg:py-28"
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-end justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <h2 id={`${id ?? 'screens'}-title`} className="display-xl">
          {heading}
        </h2>
        {scrollable ? (
          <div ref={controls} className="flex shrink-0 gap-3">
            <button
              ref={prev}
              type="button"
              aria-label={prevLabel}
              onClick={() => railStep(track.current, ITEM, -1)}
              className="btn size-12 p-0"
            >
              <ArrowLeft aria-hidden size={18} weight="bold" />
            </button>
            <button
              ref={next}
              type="button"
              aria-label={nextLabel}
              onClick={() => railStep(track.current, ITEM, 1)}
              className="btn size-12 p-0"
            >
              <ArrowRight aria-hidden size={18} weight="bold" />
            </button>
          </div>
        ) : null}
      </div>

      <ul
        ref={track}
        data-lenis-prevent-horizontal
        className="mt-10 flex snap-x snap-mandatory scroll-px-5 [scrollbar-width:none] items-start gap-6 overflow-x-auto px-5 pb-4 sm:scroll-px-8 sm:px-8 lg:mt-12 lg:scroll-px-[max(2.5rem,calc((100vw_-_1440px)/2_+_2.5rem))] lg:gap-8 lg:px-[max(2.5rem,calc((100vw_-_1440px)/2_+_2.5rem))] [&::-webkit-scrollbar]:hidden"
      >
        {shots.map((shot, i) => (
          <li
            key={shot.src}
            data-screen
            className={cn(
              'shrink-0 snap-start',
              phone ? 'w-[min(236px,64vw)]' : 'w-[min(640px,86vw)]',
            )}
          >
            <figure>
              {phone ? (
                <PhoneFrame
                  src={shot.src}
                  alt={shot.alt}
                  sizes="240px"
                  className="w-full"
                  priority={i === 0}
                />
              ) : (
                <BrowserFrame
                  src={shot.src}
                  alt={shot.alt}
                  sizes="(min-width: 1024px) 640px, 86vw"
                  label={label}
                  className="w-full"
                />
              )}
              <figcaption className="mt-4 text-[14px] leading-[1.5] text-[var(--ink-soft)]">
                {shot.caption}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      {scrollable ? (
        <div aria-hidden className="mx-auto mt-6 w-full max-w-[1440px] px-5 sm:px-8 lg:px-10">
          <div className="relative h-px bg-[var(--rule)]">
            <span
              data-screen-fill
              className="absolute inset-0 origin-left scale-x-0 bg-[var(--signal)]"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
