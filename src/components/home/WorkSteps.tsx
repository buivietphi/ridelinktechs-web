'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChatsCircle, Code, FileText, Key, MagnifyingGlass } from 'phosphor-react';
import { prefersReducedMotion } from '@/lib/animations';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const glyphs = [ChatsCircle, MagnifyingGlass, FileText, Code, Key];
const fallback = ChatsCircle;

export function WorkSteps({ items }: { items: { title: string; body: string }[] }) {
  const root = useRef<HTMLOListElement | null>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      gsap.from(el.querySelectorAll('[data-step]'), {
        autoAlpha: 0,
        y: 30,
        duration: 0.95,
        ease: 'expo.out',
        stagger: 0.14,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      });

      el.querySelectorAll<HTMLElement>('[data-step-line]').forEach((line) => {
        const vertical = line.dataset.stepLine === 'y';
        gsap.fromTo(line, vertical ? { scaleY: 0 } : { scaleX: 0 }, {
          scaleX: 1,
          scaleY: 1,
          ease: 'none',
          transformOrigin: vertical ? 'center top' : 'left center',
          scrollTrigger: {
            trigger: vertical ? line.parentElement : el,
            start: vertical ? 'top 72%' : 'top 72%',
            end: vertical ? 'bottom 58%' : 'bottom 62%',
            scrub: 0.4,
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="relative grid grid-cols-1 gap-0 md:grid-cols-5 md:gap-x-6">
      <span
        aria-hidden
        className="absolute top-[26px] left-[26px] hidden h-px bg-[var(--rule)] md:right-[calc(20%-26px)] md:block"
      />
      <span
        aria-hidden
        data-step-line="x"
        className="absolute top-[26px] left-[26px] hidden h-px origin-left bg-gradient-to-r from-[var(--signal)] via-[var(--signal-violet)] to-[var(--signal-cyan)] md:right-[calc(20%-26px)] md:block"
      />

      {items.map((item, i) => {
        const Glyph = glyphs[i] ?? fallback;
        return (
          <li
            key={item.title}
            data-step
            className="relative flex gap-5 pb-10 last:pb-0 md:block md:pb-0"
          >
            {i < items.length - 1 ? (
              <>
                <span
                  aria-hidden
                  className="absolute top-[52px] bottom-0 left-[26px] w-px bg-[var(--rule)] md:hidden"
                />
                <span
                  aria-hidden
                  data-step-line="y"
                  className="absolute top-[52px] bottom-0 left-[26px] w-px origin-top bg-gradient-to-b from-[var(--signal)] to-[var(--signal-cyan)] md:hidden"
                />
              </>
            ) : null}
            <span className="relative z-10 grid size-[52px] shrink-0 place-items-center rounded-full border border-[var(--rule)] bg-[var(--ground-raise)] text-[var(--signal)] shadow-[var(--shadow-1)]">
              <Glyph aria-hidden size={24} weight="duotone" />
            </span>
            <div className="pt-1.5 md:mt-7 md:pt-0">
              <h3 className="text-[21px] leading-tight font-bold tracking-[-0.02em] text-[var(--ink)]">
                {item.title}
              </h3>
              <p className="mt-2.5 max-w-[34ch] text-[15px] leading-[1.65] text-[var(--ink-soft)]">
                {item.body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
