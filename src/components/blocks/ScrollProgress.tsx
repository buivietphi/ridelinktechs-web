'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Progress } from '@/components/ui/Progress';
import { prefersReducedMotion } from '@/lib/animations';

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement | null>(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    if (!bar.current) return;
    gsap.fromTo(
      bar.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        transformOrigin: 'left center',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      },
    );
  });

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5" aria-hidden>
      <Progress value={100} className="h-0.5 bg-transparent">
        <div
          ref={bar}
          className="h-full w-full origin-left bg-[var(--signal)]"
          style={{ transform: 'scaleX(0)' }}
        />
      </Progress>
    </div>
  );
}
