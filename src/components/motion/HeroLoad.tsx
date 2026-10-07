'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { EASE, ensureGsapRegistered, gsap, prefersReducedMotion } from '@/lib/animations';

export function HeroLoad({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      ensureGsapRegistered();
      const root = scope.current;
      if (!root) return;

      const q = gsap.utils.selector(root);
      const lines = q('[data-hero-line]');
      if (lines.length === 0) return;

      const tl = gsap.timeline({ defaults: { ease: EASE.out } });
      tl.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.72, stagger: 0.08 }, 0.05)
        .fromTo(
          q('[data-hero-lede]'),
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.55 },
          0.24,
        )
        .fromTo(
          q('[data-hero-actions]'),
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.42 },
          0.34,
        )
        .fromTo(
          q('[data-hero-tick]'),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: EASE.inOut },
          0.4,
        )
        .fromTo(q('[data-hero-meter]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0.46);
    },
    { scope },
  );

  return <div ref={scope}>{children}</div>;
}
