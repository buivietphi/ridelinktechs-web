'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/animations';

type PageIntroProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageIntro({ children, className }: PageIntroProps) {
  const scope = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const root = scope.current;
      if (!root) return;
      const q = gsap.utils.selector(root);

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(
        q('[data-intro-mark]'),
        { autoAlpha: 0, scale: 0.86, y: 18 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: 'back.out(1.4)' },
        0,
      )
        .fromTo(
          q('[data-intro-line]'),
          { yPercent: 108 },
          { yPercent: 0, duration: 1.05, stagger: 0.075 },
          0.08,
        )
        .fromTo(
          q('[data-intro-meta]'),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06 },
          0.34,
        )
        .fromTo(
          q('[data-intro-action]'),
          { autoAlpha: 0, y: 12, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.07 },
          0.46,
        );
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
