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

interface ChapterRevealProps {
  children: ReactNode;
  childSelector?: string;
  y?: number;
  once?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ChapterReveal({
  children,
  childSelector,
  y = 24,
  once = true,
  disabled,
  className,
}: ChapterRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (disabled || reduced || !ref.current) return;
      const targets = childSelector
        ? Array.from(ref.current.querySelectorAll(childSelector))
        : ref.current.firstElementChild
          ? [ref.current.firstElementChild]
          : [];
      if (targets.length === 0) return;
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: DURATIONS.slow,
        ease: EASINGS.outQuint,
        stagger: 0.06,
        scrollTrigger: { trigger: ref.current, start: 'top 92%', once },
      });
    },
    { scope: ref, dependencies: [childSelector, y, once, disabled] },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
