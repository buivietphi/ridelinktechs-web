'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ensureGsapRegistered, gsap, prefersReducedMotion } from '@/lib/animations';

export function RouteProgress() {
  const bar = useRef<HTMLDivElement | null>(null);
  const run = useRef<{ start: () => void; done: () => void } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const node = bar.current;
    if (!node) return;
    ensureGsapRegistered();
    if (prefersReducedMotion()) return;

    let active = false;
    let failsafe = 0;
    gsap.set(node, { transformOrigin: 'left center', opacity: 1 });

    const done = () => {
      window.clearTimeout(failsafe);
      gsap.killTweensOf(node);
      if (!active) gsap.set(node, { scaleX: 0 });
      active = false;
      gsap.to(node, { scaleX: 1, duration: 0.3, ease: 'expo.out' });
      gsap.to(node, {
        opacity: 0,
        duration: 0.32,
        delay: 0.26,
        ease: 'power2.in',
        onComplete: () => gsap.set(node, { scaleX: 0, opacity: 1 }),
      });
    };

    const start = () => {
      if (active) return;
      active = true;
      gsap.killTweensOf(node);
      gsap.fromTo(node, { scaleX: 0 }, { scaleX: 0.92, duration: 3.4, ease: 'power2.out' });
      failsafe = window.setTimeout(done, 6000);
    };

    run.current = { start, done };

    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;
      const anchor = (event.target as Element | null)?.closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin) return;
      if (url.pathname + url.search === location.pathname + location.search) return;
      start();
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.clearTimeout(failsafe);
      gsap.killTweensOf(node);
    };
  }, []);

  useEffect(() => {
    run.current?.done();
  }, [pathname]);

  return (
    <div
      ref={bar}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] origin-left bg-[var(--ink)]"
      style={{ transform: 'scaleX(0)' }}
    />
  );
}
