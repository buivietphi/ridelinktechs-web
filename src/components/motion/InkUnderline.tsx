'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/animations';
import { DURATIONS, EASINGS } from '@/lib/motion-tokens';
import { cn } from '@/lib/cn';

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface InkUnderlineProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  color?: string;
}

export function InkUnderline({
  children,
  className,
  duration = DURATIONS.base,
  color = 'var(--ink)',
}: InkUnderlineProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const bar = barRef.current;
      if (!bar) return;
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration,
          ease: EASINGS.outQuint,
          transformOrigin: 'left center',
          scrollTrigger: { trigger: ref.current, start: 'top 92%', once: true },
        },
      );
    },
    { scope: ref, dependencies: [duration] },
  );

  const initialScale = reduced ? 1 : 0;
  return (
    <span ref={ref} className={cn('relative inline-block', className)}>
      {children}
      <span
        ref={barRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left"
        style={{ transform: `scaleX(${initialScale})`, background: color }}
      />
    </span>
  );
}
