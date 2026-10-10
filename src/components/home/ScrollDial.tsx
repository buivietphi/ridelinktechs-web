'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslations } from 'next-intl';
import { ArrowUp } from 'phosphor-react';
import { prefersReducedMotion, scrollToTop } from '@/lib/animations';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const R = 15;
const C = 2 * Math.PI * R;

export function ScrollDial({ className }: { className?: string }) {
  const t = useTranslations('footer');
  const dial = useRef<HTMLButtonElement | null>(null);
  const arc = useRef<SVGCircleElement | null>(null);

  useGSAP(
    () => {
      const el = dial.current;
      const ring = arc.current;
      if (!el || !ring || prefersReducedMotion()) return;

      gsap.to(ring, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      });

      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          ease: 'power2.out',
          scrollTrigger: {
            start: 160,
            end: 'max',
            toggleActions: 'play none none reverse',
          },
        },
      );
    },
    { scope: dial },
  );

  return (
    <button
      ref={dial}
      type="button"
      onClick={() => scrollToTop()}
      aria-label={t('toTop')}
      className={cn(
        'group fixed right-5 bottom-5 z-40 grid size-11 place-items-center rounded-full',
        'border border-[var(--rule)] bg-[var(--ground-raise)]/80 text-[var(--ink-soft)] opacity-0',
        'shadow-[var(--shadow-2)] backdrop-blur-md transition-colors duration-300',
        'hover:border-[var(--ink-faint)] hover:text-[var(--ink)] motion-reduce:hidden',
        className,
      )}
    >
      <svg viewBox="0 0 36 36" aria-hidden className="absolute size-full -rotate-90">
        <circle cx="18" cy="18" r={R} fill="none" stroke="var(--rule)" strokeWidth="1.4" />
        <circle
          ref={arc}
          cx="18"
          cy="18"
          r={R}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      <ArrowUp aria-hidden size={16} weight="bold" className="relative" />
    </button>
  );
}
