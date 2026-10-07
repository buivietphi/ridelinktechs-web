'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ensureGsapRegistered, gsap, prefersReducedMotion } from '@/lib/animations';

export function ProductRail({
  head,
  children,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
}) {
  const section = useRef<HTMLElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (window.matchMedia('(max-width: 1023px)').matches) return;
      ensureGsapRegistered();

      const trackEl = track.current;
      const sectionEl = section.current;
      if (!trackEl || !sectionEl) return;

      const distance = trackEl.scrollWidth - window.innerWidth;
      if (distance <= 0) return;

      gsap.to(trackEl, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionEl,
          start: 'top top+=96',
          end: () => `+=${distance}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      className="flex min-h-[100dvh] flex-col justify-center border-t border-[var(--rule)] py-20 lg:py-24"
      aria-labelledby="rail-title"
    >
      <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12">{head}</div>

      <div
        ref={track}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 lg:mt-16 lg:shrink-0 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {children}
      </div>
    </section>
  );
}
